import { createCookie } from 'react-router';
import { getRequest } from './session-context.js';

export async function getCookieFilters<T extends object>(filters: T, key: string) {
  const cookie = createCookie('filters');
  const request = getRequest();
  const cookieHeader = request.headers.get('Cookie');
  const savedFilters: Record<string, object> = (await cookie.parse(cookieHeader)) || {};
  const searchParams = new URL(request.url).searchParams;
  const hasSearchParams = Array.from(searchParams.keys()).length > 0;

  if (hasSearchParams || !savedFilters[key]) {
    savedFilters[key] = filters;
  }

  return {
    activeFilters: savedFilters[key] as T,
    headers: { 'Set-Cookie': await cookie.serialize(savedFilters) },
  };
}
