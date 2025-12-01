import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from '@/lib/locale';
import frMessages from '../../messages/fr.json';
import enMessages from '../../messages/en.json';

const messages = {
  fr: frMessages,
  en: enMessages,
};

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: messages[locale],
  };
});
