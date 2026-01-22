import { createCookie, data, LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import type { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { badRequest } from './responses.js';
import { createI18nextMiddleware } from 'remix-i18next/middleware';
import { z } from 'zod';
import { pl } from '../translations/pl.js';
import { en } from '../translations/en.js';
import crypto from 'crypto';

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
    i18next: { resources: config.resources, defaultNS: config.defaultNS, ns: config.defaultNS },
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

  const localeLoader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const lng = url.searchParams.get('lng');
    const ns = url.searchParams.get('ns');

    if (!lng || !ns) {
      return badRequest({ error: '"lng" and "ns" query params are required' });
    }

    const localeData = config.resources?.[lng]?.[ns] || {};
    const content = JSON.stringify(localeData);
    const etag = `"${crypto.createHash('md5').update(content).digest('hex')}"`;
    const ifNoneMatch = request.headers.get('If-None-Match');

    if (ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: { 'Cache-Control': 'no-cache', ETag: etag },
      });
    }

    return new Response(content, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
        ETag: etag,
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
    localeLoader,
    setLocaleLoader,
  };
}
