import type { Session } from '@remix-run/node';
import { createCookieSessionStorage, redirect } from '@remix-run/node';
import axios from 'axios';
import type { JwtPayload } from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';

type RedirectStrategy<Roles extends string> = Partial<
  Record<`${Roles}_${Roles}` | `${Roles}_*` | `*_${Roles}` | '*_*', string>
>;

type Params<Roles extends string, User, RawDecodedJwtToken = any, DecodedJwtToken = any> = {
  cookieName: string;
  cookieSecrets?: string[];
  rawTokenMapper?: (raw: RawDecodedJwtToken) => DecodedJwtToken;
  extractUserRole: (data: { request: Request; token?: string | null; data?: DecodedJwtToken | null }) => Promise<Roles>;
  getUserFromApi: (request: Request, data: { token: string; data: DecodedJwtToken }) => Promise<User>;
  redirectStrategy: RedirectStrategy<Roles> | ((request: Request) => RedirectStrategy<Roles>);
};

export type SessionData = {
  accessToken: string;
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
  getUserFromApi,
  redirectStrategy,
}: Params<Roles, User, RawDecodedJwtToken, DecodedJwtToken>) {
  const storage = createCookieSessionStorage<SD>({
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

  const createUserSession = async (data: SessionData, redirectTo: string) => {
    const session = await storage.getSession();
    session.set('accessToken', data.accessToken);
    session.set('refreshToken', data.refreshToken);
    const newCookies = await storage.commitSession(session);
    return redirect(redirectTo, { headers: { 'Set-Cookie': newCookies } });
  };

  const destroyUserSession = async (request: Request, redirectTo = '/') => {
    const cookies = request.headers.get('Cookie');
    const session = await storage.getSession(cookies);
    const newCookies = await storage.destroySession(session);
    return redirect(redirectTo, { headers: { 'Set-Cookie': newCookies } });
  };

  const getUserSession = async (request: Request): Promise<Session<SD>> => {
    const cookies = request.headers.get('Cookie');
    return await storage.getSession(cookies);
  };

  const getToken = async (
    request?: Request | null,
    type: 'accessToken' | 'refreshToken' = 'accessToken',
  ): Promise<string | null> => {
    if (!request) {
      return null;
    }

    const cookies = request.headers.get('Cookie');
    const session = await storage.getSession(cookies);
    const token = session.get(type) || null;

    if (!token) {
      return null;
    }

    // if (isTokenExpired(token)) {
    //   return null;
    // }

    return token;
  };

  const getRefreshToken = async (request?: Request | null): Promise<string | null> => {
    return getToken(request, 'refreshToken');
  };

  const decodeToken = async (requestOrToken?: Request | null | string) => {
    const token = typeof requestOrToken === 'string' ? requestOrToken : await getToken(requestOrToken);

    if (!token) {
      return null;
    }

    try {
      const decodedJwt = jwtDecode<RawDecodedJwtToken>(token);
      return rawTokenMapper ? rawTokenMapper(decodedJwt) : null;
    } catch {
      return null;
    }
  };

  const getUser = async (request?: Request | null) => {
    const token = await getToken(request);
    const decoded = await decodeToken(request);

    if (!token || !request || !decoded) {
      return null;
    }

    return await getUserFromApi(request, { token, data: decoded });
  };

  const ensureRole = async (request: Request, expectedRoles: Roles[]) => {
    const token = await getToken(request);
    const decoded = await decodeToken(request);
    const role = await extractUserRole({ request, token, data: decoded });

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

  const refreshAccessToken = async (request: Request, userData: object) => {
    const refreshToken = await getRefreshToken(request);

    if (!refreshToken || isTokenExpired(refreshToken)) {
      return {
        accessToken: null,
        refreshToken: null,
      };
    }

    const { url } = jwtDecode(refreshToken) as JwtPayload & { url: string };

    try {
      const client = axios.create({
        baseURL: url,
      });

      const response = await client.post<{ accessToken: string }>('/refresh', {
        refreshToken,
        userData: userData,
      });

      return {
        accessToken: response.data.accessToken as string,
        refreshToken,
      };
    } catch (error) {
      console.error('Error refreshing access token');
      console.error(error);

      return {
        accessToken: null,
        refreshToken: null,
      };
    }
  };

  const getOrRefreshAccessToken = async (request: Request) => {
    const accessToken = await getToken(request);

    if (accessToken && !isTokenExpired(accessToken)) {
      return accessToken;
    } else {
      const newTokens = await refreshAccessToken(request, {});
      return newTokens.accessToken;
    }
  };

  const handleForceRefreshToken = async (request: Request, userData: object, redirect?: string) => {
    const { accessToken, refreshToken } = await refreshAccessToken(request, userData);

    if (!accessToken || !refreshToken) {
      return await destroyUserSession(request);
    } else {
      return await createUserSession({ accessToken, refreshToken }, redirect || new URL(request.url).pathname);
    }
  };

  const handleCheckTokens = async (request: Request, userData: object) => {
    const currentAccessToken = await getToken(request);
    const currentRefreshToken = await getRefreshToken(request);

    if (currentAccessToken && !isTokenExpired(currentAccessToken)) {
      return null;
    }

    if (!currentRefreshToken || isTokenExpired(currentRefreshToken)) {
      return null;
    }

    const { accessToken, refreshToken } = await refreshAccessToken(request, userData);

    if (!accessToken || !refreshToken) {
      return await destroyUserSession(request);
    } else {
      return await createUserSession({ accessToken, refreshToken }, new URL(request.url).pathname);
    }
  };

  return {
    storage,
    createUserSession,
    destroyUserSession,
    getUserSession,
    getToken,
    getRefreshToken,
    decodeToken,
    getUser,
    ensureRole,
    refreshAccessToken,
    getOrRefreshAccessToken,
    handleForceRefreshToken,
    handleCheckTokens,
  };
}

export function isTokenExpired(token: string) {
  const { exp } = jwtDecode(token) as JwtPayload;
  return exp! * 1000 < Date.now();
}
