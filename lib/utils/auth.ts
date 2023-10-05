import { createCookieSessionStorage, redirect } from '@remix-run/node';
import jwt_decode from 'jwt-decode';

type Params<Roles extends string, RawDecodedJwtToken, DecodedJwtToken, User> = {
  cookieName: string;
  cookieSecrets?: string[];
  rawTokenMapper: (raw: RawDecodedJwtToken) => DecodedJwtToken;
  extractUserRole: (request: Request, data?: DecodedJwtToken | null) => Promise<Roles>;
  getUserFromApi: (request: Request) => Promise<User>;
  redirectStrategy: Partial<Record<`${Roles}_${Roles}` | `${Roles}_*` | `*_${Roles}` | '*_*', string>>;
};

export function createAuthStorage<Roles extends string, RawDecodedJwtToken, DecodedJwtToken, User>({
  cookieName,
  cookieSecrets,
  rawTokenMapper,
  extractUserRole,
  getUserFromApi,
  redirectStrategy,
}: Params<Roles, RawDecodedJwtToken, DecodedJwtToken, User>) {
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

  const decodeToken = async (request?: Request | null) => {
    const token = await getToken(request);

    if (!token) {
      return null;
    }

    try {
      const decodedJwt = jwt_decode(token) as RawDecodedJwtToken;
      return rawTokenMapper(decodedJwt);
    } catch {
      return null;
    }
  };

  const getUser = async (request?: Request | null) => {
    const token = await getToken(request);

    if (!token || !request) {
      return null;
    }

    try {
      return await getUserFromApi(request);
    } catch (error) {
      return null;
    }
  };

  const ensureRole = async (request: Request, expectedRoles: Roles[]) => {
    const decoded = await decodeToken(request);
    const role = await extractUserRole(request, decoded);

    if (!expectedRoles.includes(role)) {
      const redirects = [
        ...expectedRoles.map(expectedRole => redirectStrategy[`${role}_${expectedRole}`]),
        redirectStrategy[`${role}_*`],
        ...expectedRoles.map(expectedRole => redirectStrategy[`*_${expectedRole}`]),
        redirectStrategy['*_*'],
      ];

      const firstRedirect = redirects.find(Boolean);
      throw redirect(firstRedirect || '/');
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
