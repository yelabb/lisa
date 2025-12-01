'use server';

import { cookies } from 'next/headers';
import { type Locale, LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from './locale-config';

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  
  if (locale && LOCALES.includes(locale as Locale)) {
    return locale as Locale;
  }
  
  return DEFAULT_LOCALE;
}

export async function setUserLocale(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });
}
