import { createCookie } from '@remix-run/node';
import type { EntryContext } from '@remix-run/server-runtime';
import i18next, { createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import FsBackend from 'i18next-fs-backend';
import HttpBackend from 'i18next-http-backend';
import { resolve } from 'path';
import { initReactI18next } from 'react-i18next';
import { getInitialNamespaces, RemixI18Next } from 'remix-i18next';
import { makeZodI18nMap } from 'zod-i18n-map';
import { z } from './zod';

export function createRemixI18n(supportedLngs: string[], prefix = '') {
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
      backend: { loadPath: resolve(`./public${prefix}/locales/{{lng}}/{{ns}}.json`) },
    },
    plugins: [FsBackend],
  });

  const setZodI18n = async (request: Request) => {
    const t = await i18nRemix.getFixedT(request, ['zod', 'common']);
    z.setErrorMap(makeZodI18nMap({ t, ns: ['zod', 'common'] }));
  };

  return { i18nCookie, i18nRemix, setZodI18n };
}

export async function createI18nServerInstance(
  remixI18next: RemixI18Next,
  request: Request,
  remixContext: EntryContext,
  prefix = '',
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
        loadPath: resolve(`./public${prefix}/locales/{{lng}}/{{ns}}.json`),
        addPath: resolve(`./public${prefix}/locales/{{lng}}/{{ns}}.missing.json`),
      },
    });

  // instance.addResources('pl', 'zod', zodPl);
  // instance.addResources('en', 'zod', zodEn);
  // instance.addResources('pl', 'mantine-console-components', translationsPl);
  // instance.addResources('en', 'mantine-console-components', translationsEn);

  return instance;
}

export async function createI18nClientInstance(prefix = '') {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(HttpBackend)
    .init({
      fallbackLng: false,
      defaultNS: 'common',
      react: { useSuspense: false },
      ns: getInitialNamespaces(),
      backend: { loadPath: `${prefix}/locales/{{lng}}/{{ns}}.json` },
      detection: { order: ['htmlTag'], caches: [] },
    });

  // i18next.addResources('pl', 'zod', zodPl);
  // i18next.addResources('en', 'zod', zodEn);
  // i18next.addResources('pl', 'mantine-console-components', translationsPl);
  // i18next.addResources('en', 'mantine-console-components', translationsEn);
}
