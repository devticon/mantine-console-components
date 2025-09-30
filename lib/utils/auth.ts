import { createContext, createCookieSessionStorage, MiddlewareFunction, redirect, Session } from 'react-router';
import axios from 'axios';
import type { JwtPayload } from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';
import { getContext, getRequest } from './session-context.js';

type RedirectStrategy<Roles extends string> = Partial<
  Record<`${Roles}_${Roles}` | `${Roles}_*` | `*_${Roles}` | '*_*', string>
>;

type Params<Roles extends string, User, RawDecodedJwtToken = any> = {
  cookieName: string;
  cookieSecrets?: string[];
  rawTokenMapper?: (raw: RawDecodedJwtToken) => User;
  extractUserRole: (data: { token?: string | null; data?: User | null }) => Promise<Roles>;
  redirectStrategy: RedirectStrategy<Roles> | ((request: Request) => RedirectStrategy<Roles>);
  extractUserData?: (data: { token?: string; data?: User | null }) => object;
};

export type SessionData = {
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any;
};

export function createAuthStorage<
  Roles extends string,
  User,
  RawDecodedJwtToken = any,
  DecodedJwtToken = any,
  SD extends SessionData = SessionData,
>({
  cookieName,
  cookieSecrets,
  rawTokenMapper,
  extractUserRole,
  redirectStrategy,
  extractUserData,
}: Params<Roles, User, RawDecodedJwtToken>) {
  const storage = createCookieSessionStorage<SessionData>({
    cookie: {
      name: cookieName,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      secrets: cookieSecrets,
    },
  });

  // const createUserSession = async (data: SessionData, redirectTo?: string) => {
  //   const session = await storage.getSession();
  //   session.set('accessToken', data.accessToken);
  //   session.set('refreshToken', data.refreshToken);
  //   const newCookies = await storage.commitSession(session);
  //
  //   if (redirectTo) {
  //     return redirect(redirectTo, { headers: { 'Set-Cookie': newCookies } });
  //   } else {
  //     return rrData({}, { headers: { 'Set-Cookie': newCookies } });
  //   }
  // };

  // const destroyUserSession = async (request: Request, redirectTo = '/') => {
  //   const cookies = request.headers.get('Cookie');
  //   const session = await storage.getSession(cookies);
  //   const newCookies = await storage.destroySession(session);
  //   return redirect(redirectTo, { headers: { 'Set-Cookie': newCookies } });
  // };

  // const getUserSession = async (request: Request): Promise<Session<SessionData>> => {
  //   const cookies = request.headers.get('Cookie');
  //   return await storage.getSession(cookies);
  // };

  // const getToken = async (
  //   request?: Request | null,
  //   type: 'accessToken' | 'refreshToken' = 'accessToken',
  // ): Promise<string | null> => {
  //   if (!request) {
  //     return null;
  //   }
  //
  //   const cookies = request.headers.get('Cookie');
  //   const session = await storage.getSession(cookies);
  //   const token = session.get(type) || null;
  //
  //   if (!token) {
  //     return null;
  //   }
  //
  //   // if (isTokenExpired(token)) {
  //   //   return null;
  //   // }
  //
  //   return token;
  // };

  // const getRefreshToken = async (request?: Request | null): Promise<string | null> => {
  //   return getToken(request, 'refreshToken');
  // };

  // const decodeToken = async (requestOrToken?: Request | null | string) => {
  //   const token = typeof requestOrToken === 'string' ? requestOrToken : await getToken(requestOrToken);
  //
  //   if (!token) {
  //     return null;
  //   }
  //
  //   try {
  //     const decodedJwt = jwtDecode<RawDecodedJwtToken>(token);
  //     return rawTokenMapper ? rawTokenMapper(decodedJwt) : null;
  //   } catch {
  //     return null;
  //   }
  // };

  // const getUser = async (request?: Request | null) => {
  //   const token = await getToken(request);
  //   const decoded = await decodeToken(request);
  //
  //   if (!token || !request || !decoded) {
  //     return null;
  //   }
  //
  //   return await getUserFromApi(request, { token, data: decoded });
  // };

  // const ensureRole = async (request: Request, expectedRoles: Roles[]) => {
  //   const token = await getToken(request);
  //   const decoded = await decodeToken(request);
  //   const role = await extractUserRole({ request, token, data: decoded });
  //
  //   if (!expectedRoles.includes(role)) {
  //     const strategy = typeof redirectStrategy === 'function' ? redirectStrategy(request) : redirectStrategy;
  //
  //     const redirects = [
  //       ...expectedRoles.map(expectedRole => strategy[`${role}_${expectedRole}`]),
  //       strategy[`${role}_*`],
  //       ...expectedRoles.map(expectedRole => strategy[`*_${expectedRole}`]),
  //       strategy['*_*'],
  //     ];
  //
  //     const redirectTo = request.url.includes('http://localhost')
  //       ? request.url
  //       : request.url.replace('http://', 'https://');
  //
  //     const firstRedirect = redirects.find(Boolean);
  //     const params = new URLSearchParams({ redirectTo });
  //     throw redirect(`${firstRedirect || '/'}?${params.toString()}`);
  //   }
  // };

  // const refreshAccessToken = async (request: Request, userData: object) => {
  //   const refreshToken = await getRefreshToken(request);
  //
  //   if (!refreshToken || isTokenExpired(refreshToken)) {
  //     return {
  //       accessToken: null,
  //       refreshToken: null,
  //     };
  //   }
  //
  //   const { url } = jwtDecode(refreshToken) as JwtPayload & { url: string };
  //
  //   try {
  //     const client = axios.create({
  //       baseURL: url,
  //     });
  //
  //     const response = await client.post<{ accessToken: string }>('/refresh', {
  //       refreshToken,
  //       userData: userData,
  //     });
  //
  //     return {
  //       accessToken: response.data.accessToken as string,
  //       refreshToken,
  //     };
  //   } catch (error) {
  //     console.error('Error refreshing access token');
  //     console.error(error);
  //
  //     return {
  //       accessToken: null,
  //       refreshToken: null,
  //     };
  //   }
  // };

  // const getOrRefreshAccessToken = async (request: Request, userData: object = {}) => {
  //   const accessToken = await getToken(request);
  //
  //   if (accessToken && !isTokenExpired(accessToken)) {
  //     return accessToken;
  //   } else {
  //     const newTokens = await refreshAccessToken(request, userData);
  //     return newTokens.accessToken;
  //   }
  // };

  // const handleForceRefreshToken = async (request: Request, userData: object, redirect?: string) => {
  //   const { accessToken, refreshToken } = await refreshAccessToken(request, userData);
  //
  //   if (!accessToken || !refreshToken) {
  //     return await destroyUserSession(request);
  //   } else {
  //     return await createUserSession({ accessToken, refreshToken }, redirect);
  //   }
  // };

  // const handleCheckTokens = async (request: Request, userData: object = {}) => {
  //   const currentAccessToken = await getToken(request);
  //   const currentRefreshToken = await getRefreshToken(request);
  //
  //   if (currentAccessToken && !isTokenExpired(currentAccessToken)) {
  //     return null;
  //   }
  //
  //   if (!currentRefreshToken) {
  //     return null;
  //   }
  //
  //   const { accessToken, refreshToken } = await refreshAccessToken(request, userData);
  //
  //   if (!accessToken || !refreshToken) {
  //     return await destroyUserSession(request);
  //   } else {
  //     return await createUserSession({ accessToken, refreshToken });
  //   }
  // };

  const authContext = createContext<{
    session: Session<SessionData>;
    user: User | null;
  }>();

  const authMiddleware: MiddlewareFunction<Response> = async ({ request, context }, next) => {
    const cookies = request.headers.get('Cookie');
    const session = await storage.getSession(cookies);
    let accessToken = session.get('accessToken');
    let refreshToken = session.get('refreshToken');

    let user: User | null = null;

    if (accessToken) {
      try {
        const decodedJwt = jwtDecode<RawDecodedJwtToken>(accessToken);
        user = rawTokenMapper?.(decodedJwt) || null;
      } catch (error) {
        console.error(error);
      }
    }

    if (accessToken && refreshToken) {
      if (isTokenExpired(accessToken)) {
        if (isTokenExpired(refreshToken)) {
          accessToken = '';
          refreshToken = '';
        } else {
          const { url } = jwtDecode(refreshToken) as JwtPayload & { url: string };

          try {
            const client = axios.create({
              baseURL: url,
            });

            const response = await client.post<{ accessToken: string }>('/refresh', {
              refreshToken,
              userData: extractUserData?.({ token: accessToken, data: user }) || {},
            });

            accessToken = response.data.accessToken;
          } catch (error) {
            console.error('Error refreshing access token');
            console.error(error);
            accessToken = '';
            refreshToken = '';
          }
        }
      }
    }

    if (accessToken) {
      try {
        const decodedJwt = jwtDecode<RawDecodedJwtToken>(accessToken);
        user = rawTokenMapper?.(decodedJwt) || null;
      } catch (error) {
        console.error(error);
      }
    }

    session.set('accessToken', accessToken);
    session.set('refreshToken', refreshToken);

    context.set(authContext, {
      session,
      user,
    });

    const response = await next();

    accessToken = session.get('accessToken');
    let newCookie = '';

    if (accessToken) {
      newCookie = await storage.commitSession(session);
    } else {
      newCookie = await storage.destroySession(session);
    }

    response.headers.set('Set-Cookie', newCookie);

    return response;
  };

  const getUser = () => {
    const context = getContext();
    return context.get(authContext)?.user;
  };

  const getSession = () => {
    const context = getContext();
    const session = context.get(authContext)?.session;

    if (session) {
      return session;
    } else {
      throw new Error('Session is not available in the context. Make sure to use authMiddleware.');
    }
  };

  const getToken = (type: 'accessToken' | 'refreshToken' = 'accessToken') => {
    return getSession().get(type) || null;
  };

  const getAccessToken = () => {
    return getToken('accessToken');
  };

  const getRefreshToken = () => {
    return getToken('refreshToken');
  };

  const ensureRole = async (expectedRoles: Roles[]) => {
    const request = getRequest();
    const token = getAccessToken();
    const user = getUser();
    const role = await extractUserRole({ token, data: user });

    if (!expectedRoles.includes(role)) {
      const strategy = typeof redirectStrategy === 'function' ? redirectStrategy(request) : redirectStrategy;

      const redirects = [
        ...expectedRoles.map(expectedRole => strategy[`${role}_${expectedRole}`]),
        strategy[`${role}_*`],
        ...expectedRoles.map(expectedRole => strategy[`*_${expectedRole}`]),
        strategy['*_*'],
      ];

      const redirectTo = request.url.includes('http://localhost')
        ? request.url
        : request.url.replace('http://', 'https://');

      const firstRedirect = redirects.find(Boolean);
      const params = new URLSearchParams({ redirectTo });
      throw redirect(`${firstRedirect || '/'}?${params.toString()}`);
    }
  };

  return {
    storage,
    // createUserSession,
    // destroyUserSession,
    getUserSession: getSession,
    getSession,
    getToken,
    getAccessToken,
    getRefreshToken,
    // decodeToken,
    getUser,
    ensureRole,
    // refreshAccessToken,
    // getOrRefreshAccessToken,
    // handleForceRefreshToken,
    // handleCheckTokens,
    authContext,
    authMiddleware,
  };
}

export function isTokenExpired(token: string) {
  const { exp } = jwtDecode(token) as JwtPayload;
  return exp! * 1000 < Date.now();
}
