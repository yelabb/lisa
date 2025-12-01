// Supported locales - separate file to avoid "use server" restrictions
export type Locale = 'en' | 'fr';

export const LOCALES: Locale[] = ['en', 'fr'];
export const DEFAULT_LOCALE: Locale = 'fr';

export const LOCALE_COOKIE_NAME = 'LISA_LOCALE';
