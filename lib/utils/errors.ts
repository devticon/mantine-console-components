import { json } from '@remix-run/node';
import type { RemixI18Next } from 'remix-i18next';

export function getRawErrorCode(error: unknown) {
  if (error instanceof Error) {
    // @ts-ignore
    return (error.gqlErrors?.[0]?.extensions?.code as string) || 'INTERNAL_ERROR';
  } else if (typeof error === 'string') {
    return error;
  } else {
    return 'INTERNAL_ERROR';
  }
}

export function getRawErrorMessage(error: unknown) {
  if (error instanceof Error) {
    // @ts-ignore
    return (error.gqlErrors?.[0]?.message as string) || error.message;
  } else if (typeof error === 'string') {
    return error;
  } else {
    return JSON.stringify(error);
  }
}

export function handleErrorFactory(i18nRemix: RemixI18Next, constraints: { key: string; field: string | null }[]) {
  return async (request: Request, error: unknown, action?: string) => {
    const t = await i18nRemix.getFixedT(request);
    const code = getRawErrorCode(error);
    const message = getRawErrorMessage(error);
    const constraint = constraints.find(({ key }) => message.includes(key));

    console.error({ code, message });
    console.error(error);

    const translatedMessage =
      t(`common:errors.${code}.${constraint?.key}`, { defaultValue: '' }) ||
      t(`common:errors.${code}.${action}`, { defaultValue: '' }) ||
      t(`common:errors.${code}.default`, { defaultValue: '' }) ||
      t(`common:errors.${code}`, { defaultValue: message });

    if (constraint?.field) {
      return json({ fieldErrors: { [constraint.field]: translatedMessage } }, { status: 400 });
    } else {
      return json({ error: translatedMessage }, { status: 400 });
    }
  };
}
