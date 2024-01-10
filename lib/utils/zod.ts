import type { JSONSchema7 } from 'json-schema';
import type { z, ZodSchema, ZodType } from 'zod';
import { number, preprocess, string } from 'zod';
import { checkbox, formData, numeric, text } from 'zod-form-data';
import type { ZodString } from 'zod/lib/types';

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

export function nullableText(schema: ZodString = string()) {
  return text(schema.nullish()).transform(v => v || null);
}

export function jsonSchemaToZod(schema: JSONSchema7) {
  return formData(
    Object.fromEntries(
      Object.entries(schema.properties || {}).map(([name, options]) => {
        if (typeof options === 'boolean') {
          throw new Error('not_supported');
        } else if (options.type === 'string') {
          return [name, text()];
        } else if (options.type === 'integer' || options.type === 'number') {
          return [name, numeric(number())];
        } else if (options.type === 'boolean') {
          return [name, checkbox()];
        } else {
          throw new Error('not_supported');
        }
      }),
    ),
  );
}
