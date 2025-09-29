import type { Cookie, EntryContext, LoaderFunctionArgs } from 'react-router';
import { createCookie } from 'react-router';
import type { i18n, Resource } from 'i18next';
import i18next, { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { RemixI18Next } from 'remix-i18next/server';
import { makeZodI18nMap } from 'zod-i18n-map';
import { z } from './zod';
import zodPl from 'zod-i18n-map/locales/pl/zod.json';
import zodEn from 'zod-i18n-map/locales/en/zod.json';
import mantineEn from '../translations/en/mantine-console-components.json';
import mantinePl from '../translations/pl/mantine-console-components.json';
import { getInitialNamespaces } from 'remix-i18next/client';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import Fetch from 'i18next-fetch-backend';
import { badRequest } from './responses';

export type I18nLibConfig = {
  supportedLngs: string[];
  fallbackLng: string;
  defaultNS?: string;
  resources: Resource;
};

export type xx = {
  i18nCookie: Cookie;
  i18nRemix: RemixI18Next;
  setZodI18n: (request: Request) => Promise<void>;
  createI18nServerInstance: (remixI18next: RemixI18Next, request: Request, remixContext: EntryContext) => Promise<i18n>;
  createI18nClientInstance: () => Promise<void>;
  localeLoader: (args: LoaderFunctionArgs) => Promise<any>;
};

export function createRemixI18n(config: I18nLibConfig): xx {
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

  const i18nRemix = new RemixI18Next({
    detection: {
      supportedLanguages: config.supportedLngs,
      fallbackLanguage: config.fallbackLng,
      cookie: i18nCookie,
    },
    i18next: {
      supportedLngs: config.supportedLngs,
      fallbackLng: config.fallbackLng,
      defaultNS: config.defaultNS || 'common',
      resources: config.resources,
    },
  });

  const setZodI18n = async (request: Request) => {
    const t = await i18nRemix.getFixedT(request, ['zod', 'common']);
    z.setErrorMap(makeZodI18nMap({ t, ns: ['zod', 'common'] }));
  };

  const createI18nServerInstance = async (remixI18next: RemixI18Next, request: Request, remixContext: EntryContext) => {
    const instance = createInstance();

    await instance.use(initReactI18next).init({
      supportedLngs: config.supportedLngs,
      fallbackLng: config.fallbackLng,
      defaultNS: config.defaultNS || 'common',
      resources: config.resources,
      lng: await remixI18next.getLocale(request),
      ns: remixI18next.getRouteNamespaces(remixContext),
    });

    return instance;
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
        ns: getInitialNamespaces(),
        resources: config.resources,
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
    i18nCookie,
    i18nRemix,
    setZodI18n,
    createI18nServerInstance,
    createI18nClientInstance,
    localeLoader,
  };
}
