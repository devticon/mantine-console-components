import { createCookie } from 'react-router';

export const redirectToCookie = createCookie('redirect_to', {
  maxAge: 60 * 10,
});

export async function setRedirectToCookie(redirectTo: string) {
  return redirectToCookie.serialize(redirectTo);
}

export async function getRedirectToCookie(request: Request) {
  return (await redirectToCookie.parse(request.headers.get('Cookie'))) as string | null;
}

export async function clearRedirectToCookie() {
  return redirectToCookie.serialize('', { maxAge: 0 });
}
