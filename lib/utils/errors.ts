import { badRequest } from './responses.js';
import { i18n } from 'i18next';
import { RouterContextProvider } from 'react-router';
import { getContext } from './session-context.js';

export class CodeError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

export function getRawErrorCode(error: unknown) {
  if (error instanceof CodeError) {
    return error.code;
  } else if (error instanceof Error && 'gqlErrors' in error) {
    // @ts-ignore
    return (error.gqlErrors?.[0]?.extensions?.code as string) || 'INTERNAL_ERROR';
  } else if (typeof error === 'string') {
    return error;
  } else {
    return 'INTERNAL_ERROR';
  }
}

export function getRawErrorMessage(error: unknown) {
  if (error instanceof CodeError) {
    return error.message;
  } else if (error instanceof Error && 'gqlErrors' in error) {
    // @ts-ignore
    return (error.gqlErrors?.[0]?.message as string) || error.message;
  } else if (typeof error === 'string') {
    return error;
  } else {
    return JSON.stringify(error);
  }
}

export function handleErrorFactory(
  getI18nInstance: (context: Readonly<RouterContextProvider>) => i18n,
  constraints: { key: string; field: string | null }[],
) {
  return (error: unknown, action?: string) => {
    const context = getContext();
    const { t } = getI18nInstance(context);
    const code = getRawErrorCode(error);
    const message = getRawErrorMessage(error);
    const constraint = constraints.find(({ key }) => message.includes(key));

    console.error({ code, message });
    console.error(error);

    const translatedMessage = constraint
      ? t(`common:errors.${code}.${constraint?.key}`, { defaultValue: message })
      : t(`common:errors.${code}.${action}`, { defaultValue: '' }) ||
        t(`common:errors.${code}.default`, { defaultValue: '' }) ||
        t(`common:errors.${code}`, { defaultValue: message });

    if (constraint?.field) {
      return badRequest({ fieldErrors: { [constraint.field]: translatedMessage } });
    } else {
      return badRequest({ error: translatedMessage });
    }
  };
}
