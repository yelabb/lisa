'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LanguageSelectProps {
  onSelect: (language: string) => void;
}

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
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
      className="min-h-screen bg-white flex flex-col items-center justify-center p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">
          {t('chooseLanguage')}
        </h2>
      </motion.div>

      {/* Language options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 w-full max-w-sm mb-12"
      >
        {LANGUAGES.map((lang, index) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleSelect(lang.code)}
            className={`relative flex items-center justify-between p-5 rounded-xl border transition-all ${
              selectedLanguage === lang.code
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-lg font-medium text-gray-900">
                {lang.label}
              </span>
            </div>
            
            {/* Checkmark */}
            {selectedLanguage === lang.code && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center"
              >
                <Check size={14} className="text-white" strokeWidth={3} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={selectedLanguage ? { scale: 1.02 } : {}}
        whileTap={selectedLanguage ? { scale: 0.98 } : {}}
        onClick={handleContinue}
        disabled={!selectedLanguage}
        className={`group flex items-center gap-3 px-8 py-4 rounded-full text-lg font-medium transition-all ${
          selectedLanguage
            ? 'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {tCommon('continue')}
        <ArrowRight size={20} className={selectedLanguage ? 'group-hover:translate-x-1 transition-transform' : ''} />
      </motion.button>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex gap-1.5">
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-8 h-1 bg-gray-900 rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
        </div>
      </motion.div>
    </motion.div>
  );
}
