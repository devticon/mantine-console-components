import type { RemixI18Next } from 'remix-i18next';
import type { z, ZodSchema, ZodType } from 'zod';
import { preprocess, setErrorMap, string } from 'zod';
import { numeric, text } from 'zod-form-data';
import { makeZodI18nMap } from 'zod-i18n-map';

export { z, number, coerce, string, nativeEnum, array, boolean, object, preprocess } from 'zod';
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

export async function getJSON<T extends ZodType<any, any, any>>(request: Pick<Request, 'json'>, schema: T) {
  const value = await request.json();
  return validate(value, schema);
}

export async function getSearchParams<T extends ZodType<any, any, any>>(request: Pick<Request, 'url'>, schema: T) {
  const value = new URL(request.url).searchParams;
  return validate(value, schema);
}

export function transformPrice(value: number) {
  return Math.round(value * 100);
}

export function preprocessNumberInput(schema: ZodSchema = numeric(), params?: { prefix?: string; suffix?: string }) {
  return preprocess(value => {
    if (typeof value === 'string') {
      return value
        .replace(',', '.')
        .replace(params?.suffix || '', '')
        .replace(params?.prefix || '', '');
    } else {
      return value;
    }
  }, schema);
}

export function preprocessPatternInput(schema: ZodSchema = text()) {
  return preprocess(value => {
    if (typeof value === 'string') {
      return value.replace('-', '').replace(' ', '');
    } else {
      return value;
    }
  }, schema);
}

export function nullableText() {
  return text(string().nullish()).transform(v => v || null);
}

export async function setZodI18n(request: Request, i18nRemix: RemixI18Next) {
  const t = await i18nRemix.getFixedT(request, ['zod', 'common']);
  setErrorMap(makeZodI18nMap({ t, ns: ['zod', 'common'] }));
}
