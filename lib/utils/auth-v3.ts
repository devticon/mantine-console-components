import { Challenge, createAuthticon, Session, TokenStorageOptions } from '@authticon/client';
import { createContext, MiddlewareFunction, redirect } from 'react-router';
import { getContext, getRequest } from './session-context.js';
import { clearRedirectToCookie, getRedirectToCookie, setRedirectToCookie } from './redirect.js';

type RedirectStrategy<Roles extends string> = Partial<
  Record<`${Roles}_${Roles}` | `${Roles}_*` | `*_${Roles}` | '*_*', string>
>;

type Params<Roles extends string, User extends Record<string, unknown>> = {
  instance: ReturnType<typeof createAuthticon<User>> | (() => ReturnType<typeof createAuthticon<User>>);
  extractUserRole: (data: { token?: string | null; data?: User | null }) => Promise<Roles>;
  redirectStrategy: RedirectStrategy<Roles> | ((request: Request) => RedirectStrategy<Roles>);
  extractUserData?: (data: { token?: string; data?: User | null }) => object;
  challenges: { [key in Challenge]: string };
  tokenStorageOptions?: TokenStorageOptions;
};

export function createAuthV3Storage<Roles extends string, User extends Record<string, unknown>>({
  instance,
  extractUserRole,
  redirectStrategy,
  challenges,
  tokenStorageOptions,
}: Params<Roles, User>) {
  // eslint-disable-next-line @eslint-react/naming-convention/context-name
  const authContext = createContext<{ session: Session<User> }>();

  const getAuthticon = () => {
    return typeof instance === 'function' ? instance() : instance;
  };

  const authMiddleware: MiddlewareFunction<Response> = async ({ request, context }, next) => {
    try {
      const authticon = getAuthticon();

      const session = await authticon.session({
        request,
        tokenStorage: tokenStorageOptions,
      });

      context.set(authContext, {
        session,
      });

      if (session.isLoggedIn()) {
        const firstChallenge = session.getFirstChallenge();

        if (firstChallenge) {
          const currentUrl = new URL(request.url);
          const challengeRedirect = challenges[firstChallenge];

          if (challengeRedirect && challengeRedirect !== currentUrl.pathname) {
            console.log(`required challenge: ${firstChallenge}, redirecting to: ${challengeRedirect}`);
            return redirect(challengeRedirect);
          }
        } else {
          const destination = await getRedirectToCookie(request);

          if (destination) {
            return redirect(destination, { headers: { 'Set-Cookie': await clearRedirectToCookie() } });
          }
        }
      }

      const response = await next();
      session.cookies.applyToResponse(response);

      return response;
    } catch (error) {
      console.error({ err: error }, 'Error in auth middleware');
      return new Response('Internal server error', { status: 500 });
    }
  };

  const getSession = () => {
    const context = getContext();
    return context.get(authContext).session;
  };

  const getAccessToken = () => {
    return getSession().tokens.getAccessToken() ?? null;
  };

  const getRefreshToken = () => {
    return getSession().tokens.getRefreshToken() ?? null;
  };

  const getUser = <T extends boolean>(ensureUser: T = false as T): T extends true ? User : User | null => {
    const user = getSession().getUser()?.raw;

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
      console.log(`user role: ${role}, redirect to: ${firstRedirect || '/'}`);

      const headers: HeadersInit = (await getRedirectToCookie(request))
        ? {}
        : { 'Set-Cookie': await setRedirectToCookie(redirectTo) };

      throw redirect(firstRedirect || '/', { headers });
    }
  };

  return {
    getAuthticon,
    getAccessToken,
    getRefreshToken,
    getUser,
    ensureRole,
    authContext,
    authMiddleware,
    getSession,
  };
}
