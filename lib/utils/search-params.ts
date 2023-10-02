export type JsonPrimitive = string | number | boolean | null;

export function mapValueToString(value: JsonPrimitive): string {
  if (value === null) {
    return '';
  }

  if (typeof value === 'number') {
    return `${value}`;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return value;
}

export function mapObjectToSearchParams(filters: Record<string, JsonPrimitive | JsonPrimitive[]>): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => {
        params.append(key, mapValueToString(v));
      });
    } else {
      params.set(key, mapValueToString(value));
    }
  });

  return params;
}
