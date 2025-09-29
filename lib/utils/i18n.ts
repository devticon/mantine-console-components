import type { LoaderFunctionArgs } from 'react-router';
import { createCookie } from 'react-router';
import type { Resource } from 'i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import zodPl from 'zod-i18n-map/locales/pl/zod.json';
import zodEn from 'zod-i18n-map/locales/en/zod.json';
import mantineEn from '../translations/en/mantine-console-components.json';
import mantinePl from '../translations/pl/mantine-console-components.json';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import Fetch from 'i18next-fetch-backend';
import { badRequest } from './responses';
// @ts-ignore
import { createI18nextMiddleware } from 'remix-i18next/middleware';

export type I18nLibConfig = {
  supportedLngs: string[];
  fallbackLng: string;
  defaultNS?: string;
  resources: Resource;
};

export function createRemixI18n(config: I18nLibConfig) {
  const i18nCookie = createCookie('lang', {
    maxAge: 2_592_000, // 30 days
  });

  if (config.resources.pl) {
    config.resources.pl.zod = zodPl;
    config.resources.pl['mantine-console-components'] = mantinePl;
  }

  if (config.resources.en) {
    config.resources.en.zod = zodEn;
    config.resources.en['mantine-console-components'] = mantineEn;
  }

  const [i18nextMiddleware, getLocale, getInstance] = createI18nextMiddleware({
    detection: { supportedLanguages: ['en', 'pl'], fallbackLanguage: 'en', cookie: i18nCookie },
    i18next: { resources: config.resources, defaultNS: 'common' },
    plugins: [initReactI18next],
  });

  const setZodI18n = async (request: Request) => {
    // const t = await i18nRemix.getFixedT(request, ['zod', 'common']);
    // z.setErrorMap(makeZodI18nMap({ t, ns: ['zod', 'common'] }));
  };

  const createI18nClientInstance = async () => {
    await i18next
      .use(initReactI18next)
      .use(Fetch)
      .use(I18nextBrowserLanguageDetector)
      .init({
        defaultNS: config.defaultNS || 'common',
        fallbackLng: config.fallbackLng,
        supportedLngs: config.supportedLngs,
        detection: { order: ['htmlTag'], caches: [] },
        backend: { loadPath: '/api/locales?lng={{lng}}&ns={{ns}}' },
      });
  };

  const localeLoader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const lng = url.searchParams.get('lng');
    const ns = url.searchParams.get('ns');

    if (!lng || !ns) {
      return badRequest({ error: '"lng" and "ns" query params are required' });
    } else {
      return config.resources?.[lng]?.[ns] || {};
    }
  };

  return {
    i18nextMiddleware,
    getLocale,
    getInstance,
    i18nCookie,
    setZodI18n,
    createI18nClientInstance,
    localeLoader,
  };
}
