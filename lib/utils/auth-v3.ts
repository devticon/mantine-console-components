import { Challenge, createAuthticon, Session } from '@authticon/client';
import { createContext, MiddlewareFunction, redirect } from 'react-router';
import { getContext, getRequest } from './session-context.js';

type RedirectStrategy<Roles extends string> = Partial<
  Record<`${Roles}_${Roles}` | `${Roles}_*` | `*_${Roles}` | '*_*', string>
>;

type Params<Roles extends string, User extends Record<string, unknown>> = {
  instance: ReturnType<typeof createAuthticon<User>>;
  extractUserRole: (data: { token?: string | null; data?: User | null }) => Promise<Roles>;
  redirectStrategy: RedirectStrategy<Roles> | ((request: Request) => RedirectStrategy<Roles>);
  extractUserData?: (data: { token?: string; data?: User | null }) => object;
  challenges: { [key in Challenge]: string };
};

export function createAuthV3Storage<Roles extends string, User extends Record<string, unknown>>({
  instance: authticon,
  extractUserRole,
  redirectStrategy,
  challenges,
}: Params<Roles, User>) {
  // eslint-disable-next-line @eslint-react/naming-convention/context-name
  const authContext = createContext<{ session: Session<User> }>();

  const authMiddleware: MiddlewareFunction<Response> = async ({ request, context }, next) => {
    try {
      const session = await authticon.session({ request });
      context.set(authContext, { session });

      if (session.isLoggedIn()) {
        const firstChallenge = session.getFirstChallenge();

        if (firstChallenge) {
          const currentUrl = new URL(request.url);
          const challengeRedirect = challenges[firstChallenge];
          if (challengeRedirect && challengeRedirect !== currentUrl.pathname) {
            return redirect(challengeRedirect);
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
      const params = new URLSearchParams({ redirectTo });
      throw redirect(`${firstRedirect || '/'}?${params.toString()}`);
    }
  };

  return {
    getAccessToken,
    getRefreshToken,
    getUser,
    ensureRole,
    authContext,
    authMiddleware,
    getSession,
  };
}
