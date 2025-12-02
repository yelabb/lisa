'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LanguageSelectProps {
  onSelect: (language: string) => void;
}

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', greeting: 'Bonjour!' },
  { code: 'en', label: 'English', flag: '🇬🇧', greeting: 'Hello!' },
];

export function LanguageSelect({ onSelect }: LanguageSelectProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');

  const handleSelect = (code: string) => {
    setSelectedLanguage(code);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      onSelect(selectedLanguage);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-linear-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="text-5xl mb-4">🌍</div>
        <h2 className="text-2xl font-light text-gray-800 mb-2">
          {t('chooseLanguage')}
        </h2>
        <p className="text-gray-500 font-light">
          Choose your language
        </p>
      </motion.div>

      {/* Language options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-4 w-full max-w-sm mb-12"
      >
        {LANGUAGES.map((lang, index) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(lang.code)}
            className={`relative flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
              selectedLanguage === lang.code
                ? 'border-purple-400 bg-purple-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <span className="text-4xl">{lang.flag}</span>
            <div className="text-left">
              <div className="text-xl font-medium text-gray-800">
                {lang.label}
              </div>
              <div className="text-sm text-gray-500 font-light">
                {lang.greeting}
              </div>
            </div>
            
            {/* Checkmark */}
            {selectedLanguage === lang.code && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <Check size={18} className="text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: selectedLanguage ? 1 : 0.5 }}
        whileHover={selectedLanguage ? { scale: 1.05 } : {}}
        whileTap={selectedLanguage ? { scale: 0.95 } : {}}
        onClick={handleContinue}
        disabled={!selectedLanguage}
        className={`px-10 py-4 rounded-full text-lg font-medium transition-all ${
          selectedLanguage
            ? 'bg-purple-500 text-white shadow-lg hover:shadow-xl cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {tCommon('continue')} →
      </motion.button>
    </motion.div>
  );
}
