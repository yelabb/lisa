// Supported locales - separate file to avoid "use server" restrictions
export type Locale = 'en' | 'fr' | 'es' | 'pt' | 'de' | 'it' | 'nl' | 'pl' | 'ru' | 'uk' | 'tr' | 'ar' | 'zh' | 'ja' | 'ko' | 'hi' | 'vi' | 'th' | 'id' | 'ms';

// Active locales (with translations available)
export const ACTIVE_LOCALES: Locale[] = ['fr', 'en'];

// All supported locales for future expansion
export const LOCALES: Locale[] = ['en', 'fr', 'es', 'pt', 'de', 'it', 'nl', 'pl', 'ru', 'uk', 'tr', 'ar', 'zh', 'ja', 'ko', 'hi', 'vi', 'th', 'id', 'ms'];

export const DEFAULT_LOCALE: Locale = 'fr';

export const LOCALE_COOKIE_NAME = 'LISA_LOCALE';

// Language metadata - ordered by popularity (like Duolingo)
export interface LanguageInfo {
  code: Locale;
  label: string;
  nativeLabel: string;
  flag: string;
  available: boolean;
}

export const LANGUAGES: LanguageInfo[] = [
  // Most popular - always at top
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷', available: true },
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧', available: true },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸', available: false },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇧🇷', available: false },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪', available: false },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', flag: '🇮🇹', available: false },
  
  // European languages
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', flag: '🇳🇱', available: false },
  { code: 'pl', label: 'Polish', nativeLabel: 'Polski', flag: '🇵🇱', available: false },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', flag: '🇷🇺', available: false },
  { code: 'uk', label: 'Ukrainian', nativeLabel: 'Українська', flag: '🇺🇦', available: false },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', flag: '🇹🇷', available: false },
  
  // Asian languages
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', flag: '🇨🇳', available: false },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵', available: false },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', flag: '🇰🇷', available: false },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳', available: false },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt', flag: '🇻🇳', available: false },
  { code: 'th', label: 'Thai', nativeLabel: 'ไทย', flag: '🇹🇭', available: false },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia', flag: '🇮🇩', available: false },
  { code: 'ms', label: 'Malay', nativeLabel: 'Bahasa Melayu', flag: '🇲🇾', available: false },
  
  // Middle East
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦', available: false },
];
