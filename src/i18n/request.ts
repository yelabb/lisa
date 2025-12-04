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
import ruMessages from '../../messages/ru.json';
import ukMessages from '../../messages/uk.json';
import arMessages from '../../messages/ar.json';
import zhMessages from '../../messages/zh.json';
import jaMessages from '../../messages/ja.json';
import koMessages from '../../messages/ko.json';
import hiMessages from '../../messages/hi.json';
import viMessages from '../../messages/vi.json';
import thMessages from '../../messages/th.json';
import idMessages from '../../messages/id.json';
import msMessages from '../../messages/ms.json';

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
  ru: ruMessages,
  uk: ukMessages,
  ar: arMessages,
  zh: zhMessages,
  ja: jaMessages,
  ko: koMessages,
  hi: hiMessages,
  vi: viMessages,
  th: thMessages,
  id: idMessages,
  ms: msMessages,
};

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: messages[locale],
  };
});
