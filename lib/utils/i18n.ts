import { createCookie } from '@remix-run/node';
import type { EntryContext } from '@remix-run/server-runtime';
import i18next, { createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import FsBackend from 'i18next-fs-backend';
import HttpBackend from 'i18next-http-backend';
import { resolve } from 'node:path';
import { initReactI18next } from 'react-i18next';
import { getInitialNamespaces, RemixI18Next } from 'remix-i18next';

export function createRemixI18n(supportedLngs: string[]) {
  const i18nCookie = createCookie('lang', {
    maxAge: 2_592_000, // 30 days
  });

  const i18nRemix = new RemixI18Next({
    detection: {
      supportedLanguages: supportedLngs,
      fallbackLanguage: supportedLngs[0],
      cookie: i18nCookie,
    },
    i18next: {
      supportedLngs: supportedLngs,
      fallbackLng: supportedLngs[0],
      defaultNS: 'common',
      backend: { loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json') },
    },
    plugins: [FsBackend],
  });

  return { i18nCookie, i18nRemix };
}

export async function createI18nServerInstance(
  remixI18next: RemixI18Next,
  request: Request,
  remixContext: EntryContext,
) {
  const instance = createInstance();

  await instance
    .use(initReactI18next)
    .use(FsBackend)
    .init({
      fallbackLng: false,
      defaultNS: 'common',
      react: { useSuspense: false },
      lng: await remixI18next.getLocale(request),
      ns: remixI18next.getRouteNamespaces(remixContext),
      saveMissing: true,
      backend: {
        loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json'),
        addPath: resolve('./public/locales/{{lng}}/{{ns}}.missing.json'),
      },
    });

  return instance;
}

export async function createI18nClientInstance() {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(HttpBackend)
    .init({
      fallbackLng: false,
      defaultNS: 'common',
      react: { useSuspense: false },
      ns: getInitialNamespaces(),
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      detection: { order: ['htmlTag'], caches: [] },
    });
}