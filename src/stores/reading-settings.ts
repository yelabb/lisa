'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ReadingTheme = 'light' | 'sepia' | 'dark';
export type FontFamily = 'literata' | 'merriweather' | 'system';

interface ReadingSettings {
  // Thème de lecture
  theme: ReadingTheme;
  // Police de lecture
  fontFamily: FontFamily;
  // Taille de police (en rem, base 1.5)
  fontSize: number;
  // Hauteur de ligne (en em)
  lineHeight: number;
  // Largeur de lecture (en px, max-width)
  readingWidth: number;
  // Luminosité (0-100)
  brightness: number;
  // Progression automatique activée
  autoProgress: boolean;
  // Vitesse de lecture (mots par minute)
  readingSpeed: number;
  // Text-to-speech activé
  textToSpeech: boolean;
}

interface ReadingSettingsStore extends ReadingSettings {
  setTheme: (theme: ReadingTheme) => void;
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setReadingWidth: (width: number) => void;
  setBrightness: (brightness: number) => void;
  setAutoProgress: (enabled: boolean) => void;
  setReadingSpeed: (speed: number) => void;
  setTextToSpeech: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: ReadingSettings = {
  theme: 'sepia',
  fontFamily: 'literata',
  fontSize: 1.75, // Plus grand pour confort
  lineHeight: 1.9, // Espacement généreux
  readingWidth: 650, // Largeur optimale pour lecture
  brightness: 100,
  autoProgress: true,
  readingSpeed: 100, // mots par minute (enfants - réduit pour lecture confortable)
  textToSpeech: false, // TTS désactivé par défaut
};

export const useReadingSettingsStore = create<ReadingSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setTheme: (theme) => set({ theme }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize: Math.max(1.25, Math.min(3, fontSize)) }),
      setLineHeight: (lineHeight) => set({ lineHeight: Math.max(1.4, Math.min(2.5, lineHeight)) }),
      setReadingWidth: (readingWidth) => set({ readingWidth: Math.max(400, Math.min(900, readingWidth)) }),
      setBrightness: (brightness) => set({ brightness: Math.max(50, Math.min(100, brightness)) }),
      setAutoProgress: (autoProgress) => set({ autoProgress }),
      setReadingSpeed: (readingSpeed) => set({ readingSpeed: Math.max(80, Math.min(300, readingSpeed)) }),
      setTextToSpeech: (textToSpeech) => set({ textToSpeech }),
      resetToDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'lisa-reading-settings',
    }
  )
);

// Utilitaires pour les styles de thème
export const getThemeStyles = (theme: ReadingTheme) => {
  switch (theme) {
    case 'light':
      return {
        background: 'bg-white',
        backgroundGradient: 'bg-gradient-to-b from-white to-gray-50/30',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        textMuted: 'text-gray-400',
        border: 'border-gray-200',
        accent: 'bg-purple-500',
        accentLight: 'bg-purple-50',
        cardBg: 'bg-white',
        hoverBg: 'hover:bg-gray-50',
        overlayBg: 'bg-white/95',
      };
    case 'sepia':
      return {
        background: 'bg-[#faf6ef]',
        backgroundGradient: 'bg-gradient-to-b from-[#faf6ef] to-[#f5ede0]',
        text: 'text-[#5c4b37]',
        textSecondary: 'text-[#7a6553]',
        textMuted: 'text-[#a69580]',
        border: 'border-[#e8dcc8]',
        accent: 'bg-amber-600',
        accentLight: 'bg-amber-50',
        cardBg: 'bg-[#fdfaf5]',
        hoverBg: 'hover:bg-[#f5ede0]',
        overlayBg: 'bg-[#faf6ef]/95',
      };
    case 'dark':
      return {
        background: 'bg-[#1a1a1a]',
        backgroundGradient: 'bg-gradient-to-b from-[#1a1a1a] to-[#242424]',
        text: 'text-[#e0e0e0]',
        textSecondary: 'text-[#b0b0b0]',
        textMuted: 'text-[#707070]',
        border: 'border-[#333]',
        accent: 'bg-purple-400',
        accentLight: 'bg-purple-900/30',
        cardBg: 'bg-[#242424]',
        hoverBg: 'hover:bg-[#2a2a2a]',
        overlayBg: 'bg-[#1a1a1a]/95',
      };
  }
};

export const getFontClass = (fontFamily: FontFamily) => {
  switch (fontFamily) {
    case 'literata':
      return 'font-[family-name:var(--font-literata)]';
    case 'merriweather':
      return 'font-[family-name:var(--font-merriweather)]';
    case 'system':
      return 'font-sans';
  }
};
