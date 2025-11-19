import { createContext, createCookieSessionStorage, MiddlewareFunction, redirect, Session } from 'react-router';
import axios from 'axios';
import type { JwtPayload } from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';
import { getContext, getRequest } from './session-context.js';

type RedirectStrategy<Roles extends string> = Partial<
  Record<`${Roles}_${Roles}` | `${Roles}_*` | `*_${Roles}` | '*_*', string>
>;

type Params<Roles extends string, User, RawDecodedJwtToken = any> = {
  cookieName: string | ((request: Request) => string);
  cookieIncludeSubDomains?: boolean;
  cookieSecrets?: string[];
  rawTokenMapper?: (raw: RawDecodedJwtToken) => User;
  extractUserRole: (data: { token?: string | null; data?: User | null }) => Promise<Roles>;
  redirectStrategy: RedirectStrategy<Roles> | ((request: Request) => RedirectStrategy<Roles>);
  extractUserData?: (data: { token?: string; data?: User | null }) => object;
};

export type SessionData = {
  accessToken?: string | null;
  refreshToken?: string | null;
  [key: string]: any;
};

export function createAuthStorage<
  Roles extends string,
  User,
  RawDecodedJwtToken = any,
  SD extends SessionData = SessionData,
>({
  cookieName,
  cookieIncludeSubDomains,
  cookieSecrets,
  rawTokenMapper,
  extractUserRole,
  redirectStrategy,
  extractUserData,
}: Params<Roles, User, RawDecodedJwtToken>) {
  const getStorage = (request: Request) => {
    const url = new URL(request.url);
    const domain = url.hostname.split('.').slice(-2).join('.');

    return createCookieSessionStorage<SD>({
      cookie: {
        name: typeof cookieName === 'string' ? cookieName : cookieName(request),
        secure: process.env.NODE_ENV === 'production',
        priority: 'high',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secrets: cookieSecrets,
        domain: cookieIncludeSubDomains ? `.${domain}` : undefined,
      },
    });
  };

  const handleForceRefreshToken = async (userData: object) => {
    const refreshToken = getRefreshToken();
    const session = getSession();
    const accessToken = await refreshAccessToken(refreshToken, userData);
    session.set('accessToken', accessToken);
  };

  const refreshAccessToken = async (refreshToken?: string | null, userData?: object) => {
    if (!refreshToken || isTokenExpired(refreshToken)) {
      return null;
    }

    try {
      const { url } = jwtDecode(refreshToken) as JwtPayload & { url: string };
      const client = axios.create({ baseURL: url });
      const body = { refreshToken, userData: userData || {} };
      const response = await client.post<{ accessToken: string }>('/refresh', body);
      return response.data.accessToken;
    } catch (error) {
      console.error('Error refreshing access token');
      console.error(error);
      return null;
    }
  };

  const authContext = createContext<{
    session: Session<SD>;
    user: User | null;
  }>();

  const authMiddleware: MiddlewareFunction<Response> = async ({ request, context }, next) => {
    const cookies = request.headers.get('Cookie');
    const storage = getStorage(request);
    const session = await storage.getSession(cookies);
    let accessToken = session.get('accessToken') as string | null;
    let refreshToken = session.get('refreshToken');
    const initialAccessToken = accessToken;

    let user: User | null = null;

    if (accessToken) {
      try {
        const decodedJwt = jwtDecode<RawDecodedJwtToken>(accessToken);
        user = rawTokenMapper?.(decodedJwt) || null;
      } catch (error) {
        console.error(error);
      }
    }

    if (accessToken && isTokenExpired(accessToken)) {
      const userData = extractUserData?.({ token: accessToken, data: user });
      accessToken = await refreshAccessToken(refreshToken, userData);
    }

    if (!accessToken && refreshToken) {
      accessToken = await refreshAccessToken(refreshToken);
    }

    if (accessToken) {
      try {
        const decodedJwt = jwtDecode<RawDecodedJwtToken>(accessToken);
        user = rawTokenMapper?.(decodedJwt) || null;
      } catch (error) {
        console.error(error);
      }
    } else {
      user = null;
    }

    session.set('accessToken', accessToken);
    session.set('refreshToken', refreshToken);

    context.set(authContext, {
      session,
      user,
    });

    const response = await next();
    accessToken = session.get('accessToken') as string | null;

    if (initialAccessToken !== accessToken) {
      let newCookie: string;

      if (accessToken) {
        newCookie = await storage.commitSession(session);
      } else {
        newCookie = await storage.destroySession(session);
      }

      response.headers.set('Set-Cookie', newCookie);
    }

    return response;
  };

  const getUser = <T extends boolean>(ensureUser: T = false as T): T extends true ? User : User | null => {
    const context = getContext();
    const user = context.get(authContext)?.user;

    if (ensureUser) {
      if (user) {
        return user;
      } else {
        throw new Error('missing user');
      }
    } else {
      return user!;
    }
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

  const getCookieValue = () => {
    const request = getRequest();

    return request.headers
      .get('cookie')
      ?.split('; ')
      .find(x => x.startsWith(`${cookieName}=`))
      ?.split('=')[1];
  };

  return {
    getStorage,
    cookieName,
    getCookieValue,
    getSession,
    getToken,
    getAccessToken,
    getRefreshToken,
    getUser,
    ensureRole,
    handleForceRefreshToken,
    authContext,
    authMiddleware,
  };
}

export function isTokenExpired(token: string) {
  const { exp } = jwtDecode(token) as JwtPayload;
  return exp! * 1000 < Date.now();
}
