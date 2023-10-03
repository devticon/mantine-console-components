import type { z, ZodType } from 'zod';

export { z, number, coerce, string, nativeEnum, array, boolean, object } from 'zod';
export { formData, numeric, text, file, repeatable, repeatableOfType, checkbox, json } from 'zod-form-data';

export function validate<T extends ZodType<any, any, any>>(value: URLSearchParams | FormData | any, schema: T) {
  const result = schema.safeParse(value);

  if (result.success) {
    return {
      data: result.data as z.infer<T>,
      fieldErrors: undefined,
    };
  } else {
    return {
      data: undefined,
      fieldErrors: Object.fromEntries(result.error.errors.map(error => [error.path.join('.'), error.message])),
    };
  }
}

export async function getFormData<T extends ZodType<any, any, any>>(request: Pick<Request, 'formData'>, schema: T) {
  const value = await request.formData();
  return validate(value, schema);
}

export async function getSearchParams<T extends ZodType<any, any, any>>(request: Pick<Request, 'url'>, schema: T) {
  const value = new URL(request.url).searchParams;
  return validate(value, schema);
}

export function transformPrice(value: number) {
  return Math.round(value * 100);
}
