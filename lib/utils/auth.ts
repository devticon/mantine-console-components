import { createCookieSessionStorage, redirect } from '@remix-run/node';
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

export function createAuthStorage<Roles extends string, User, RawDecodedJwtToken = any, DecodedJwtToken = any>({
  cookieName,
  cookieSecrets,
  rawTokenMapper,
  extractUserRole,
  getUserFromApi,
  redirectStrategy,
}: Params<Roles, User, RawDecodedJwtToken, DecodedJwtToken>) {
  const storage = createCookieSessionStorage({
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

  const createUserSession = async (token: string, redirectTo: string) => {
    const session = await storage.getSession();
    session.set('token', token);
    const newCookies = await storage.commitSession(session);
    return redirect(redirectTo, { headers: { 'Set-Cookie': newCookies } });
  };

  const destroyUserSession = async (request: Request, redirectTo = '/') => {
    const cookies = request.headers.get('Cookie');
    const session = await storage.getSession(cookies);
    const newCookies = await storage.destroySession(session);
    return redirect(redirectTo, { headers: { 'Set-Cookie': newCookies } });
  };

  const getToken = async (request?: Request | null): Promise<string | null> => {
    if (!request) {
      return null;
    }

    const cookies = request.headers.get('Cookie');
    const session = await storage.getSession(cookies);
    return session.get('token');
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

      const firstRedirect = redirects.find(Boolean);
      const params = new URLSearchParams({ redirectTo: request.url.replace('http://', 'https://') });
      throw redirect(`${firstRedirect || '/'}?${params.toString()}`);
    }
  };

  return {
    storage,
    createUserSession,
    destroyUserSession,
    getToken,
    decodeToken,
    getUser,
    ensureRole,
  };
}
