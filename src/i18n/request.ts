import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from '@/lib/locale';
import type { Locale } from '@/lib/locale-config';

// Import all language files
import frMessages from '../../messages/fr.json';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';
import ptMessages from '../../messages/pt.json';
import deMessages from '../../messages/de.json';
import itMessages from '../../messages/it.json';
import nlMessages from '../../messages/nl.json';
import plMessages from '../../messages/pl.json';
import trMessages from '../../messages/tr.json';

const messages: Record<Locale, typeof frMessages> = {
  fr: frMessages,
  en: enMessages,
  es: esMessages,
  pt: ptMessages,
  de: deMessages,
  it: itMessages,
  nl: nlMessages,
  pl: plMessages,
  tr: trMessages,
  // Languages without translations yet - fallback to English
  ru: enMessages,
  uk: enMessages,
  ar: enMessages,
  zh: enMessages,
  ja: enMessages,
  ko: enMessages,
  hi: enMessages,
  vi: enMessages,
  th: enMessages,
  id: enMessages,
  ms: enMessages,
};

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: messages[locale],
  };
});
