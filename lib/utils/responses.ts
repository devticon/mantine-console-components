import { json, redirect } from '@remix-run/node';

export function created<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json(data, { ...init, status: 201 });
}

export function redirectBack(request: Request, { fallback, ...init }: ResponseInit & { fallback: string }): Response {
  return redirect(request.headers.get('Referer') ?? fallback, init);
}

export function badRequest<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json<Data>(data, { ...init, status: 400 });
}

export function unauthorized<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json<Data>(data, { ...init, status: 401 });
}

export function forbidden<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json<Data>(data, { ...init, status: 403 });
}

export function notFound<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json<Data>(data, { ...init, status: 404 });
}

export function unprocessableEntity<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json<Data>(data, { ...init, status: 422 });
}

export function serverError<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json<Data>(data, { ...init, status: 500 });
}

export function notModified(init?: Omit<ResponseInit, 'status'>) {
  return new Response('', { ...init, status: 304 });
}
