import { data, LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import { createCookie } from 'react-router';
import type { Resource } from 'i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import Fetch from 'i18next-fetch-backend';
import { badRequest } from './responses.js';
import { createI18nextMiddleware } from 'remix-i18next/middleware';
import { z } from 'zod';
import { pl } from '../translations/pl.js';
import { en } from '../translations/en.js';

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
    config.resources.pl['mantine-console-components'] = pl;
  }

  if (config.resources.en) {
    config.resources.en['mantine-console-components'] = en;
  }

  const [i18nextMiddleware, getLocale, getInstance] = createI18nextMiddleware({
    detection: { supportedLanguages: ['en', 'pl'], fallbackLanguage: 'en', cookie: i18nCookie },
    i18next: { resources: config.resources, defaultNS: config.defaultNS || 'common' },
    plugins: [initReactI18next],
  });

  const setZodI18n = async (context: Readonly<RouterContextProvider>) => {
    const { language } = getInstance(context);

    if (language === 'pl') {
      z.config(z.locales.pl());
    } else {
      z.config(z.locales.en());
    }
  };

  const createI18nClientInstance = async (prefix = '') => {
    await i18next
      .use(initReactI18next)
      .use(Fetch)
      .use(I18nextBrowserLanguageDetector)
      .init({
        defaultNS: config.defaultNS || 'common',
        fallbackLng: config.fallbackLng,
        supportedLngs: config.supportedLngs,
        detection: { order: ['htmlTag'], caches: [] },
        backend: { loadPath: `${prefix}/api/locales?lng={{lng}}&ns={{ns}}` },
      });
  };

  const localeLoader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const lng = url.searchParams.get('lng');
    const ns = url.searchParams.get('ns');

    if (!lng || !ns) {
      return badRequest({ error: '"lng" and "ns" query params are required' });
    }

    return data(config.resources?.[lng]?.[ns] || {}, {
      headers: {
        'Cache-Control': 'max-age=86400, stale-while-revalidate=604800',
      },
    });
  };

  const setLocaleLoader = async ({ params }: LoaderFunctionArgs) => {
    return data('/', { headers: { 'Set-Cookie': await i18nCookie.serialize(params.locale) } });
  };

  return {
    i18nextMiddleware,
    getLocale,
    getInstance,
    i18nCookie,
    setZodI18n,
    createI18nClientInstance,
    localeLoader,
    setLocaleLoader,
  };
}
