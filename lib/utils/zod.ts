import type { JSONSchema7 } from 'json-schema';
import type { output, ZodNumber, ZodString, ZodType } from 'zod';
import { enum as nativeEnum, number, preprocess, string } from 'zod';
import { checkbox, formData, numeric, text } from 'zod-form-data';

export { z, number, coerce, string, enum as nativeEnum, array, boolean, object, preprocess } from 'zod';
export { formData, numeric, text, file, repeatable, repeatableOfType, checkbox, json } from 'zod-form-data';

export type ValidateResult<T> = {
  data: T | undefined;
  fieldErrors: Record<string, string> | undefined;
};

export function validate<T extends ZodType>(
  value: URLSearchParams | FormData | any,
  schema: T,
): ValidateResult<output<T>> {
  const result = schema.safeParse(value);

  if (result.success) {
    return {
      data: result.data,
      fieldErrors: undefined,
    };
  } else {
    return {
      data: undefined,
      fieldErrors: Object.fromEntries(result.error.issues.map(error => [error.path.join('.'), error.message])),
    };
  }
}

export async function getFormData<T extends ZodType>(request: Pick<Request, 'formData'> | FormData, schema: T) {
  const value = request instanceof FormData ? request : await request.formData();
  return validate(value, schema);
}

export async function getJSON<T extends ZodType>(request: Pick<Request, 'json'>, schema: T) {
  const value = await request.json();
  return validate(value, schema);
}

export async function getSearchParams<T extends ZodType>(request: Pick<Request, 'url'>, schema: T) {
  const value = new URL(request.url).searchParams;
  return validate(value, schema);
}

export function transformPrice(value?: number) {
  return value ? Math.round(value * 100) : 0;
}

export function preprocessNumberInput<T extends ZodType = ZodType<number>>(
  schema?: T,
  params?: { prefix?: string; suffix?: string },
) {
  return preprocess(value => {
    if (typeof value === 'string') {
      return value
        .replace(',', '.')
        .replace(params?.suffix || '', '')
        .replace(params?.prefix || '', '');
    } else {
      return value;
    }
  }, schema || numeric());
}

export function preprocessPatternInput<T extends ZodType>(schema?: T) {
  return preprocess(value => {
    if (typeof value === 'string') {
      return value.replace(/-/g, '').replace(/_/g, '').replace(/\s/g, '');
    } else {
      return value;
    }
  }, schema || text());
}

export function preprocessJSONInput<I extends ZodType>(schema: I) {
  return preprocess(value => {
    try {
      return JSON.parse(value as string);
    } catch {
      return undefined;
    }
  }, schema);
}

export function nullableText(schema: ZodString = string()) {
  return text(schema.nullish()).transform(v => v || null);
}

export function nullableNumeric(schema: ZodNumber = number()) {
  return numeric(schema.nullish()).transform(v => v ?? null);
}

export function nullableNativeEnum<T extends Record<string, string>>(values: T) {
  return nativeEnum(values)
    .nullish()
    .transform(v => v ?? null);
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

export const validatePlTaxNumber = (value: string) => {
  if (value?.length !== 10) {
    return false;
  }

  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const checksum = parseInt(value.slice(-1), 10);
  const sum = value
    .split('')
    .splice(0, 9)
    .map(digit => parseInt(digit, 10))
    .reduce((acc, digit, index) => acc + digit * weights[index], 0);

  return sum % 11 === checksum;
};

export function textPlTaxNumber(schema: ZodString = string()) {
  return text(schema.refine(validatePlTaxNumber, { message: 'invalid_tax_number' }));
}
