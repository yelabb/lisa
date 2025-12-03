'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LANGUAGES, type LanguageInfo } from '@/lib/locale-config';

interface LanguageSelectProps {
  onSelect: (language: string) => void;
}

export function LanguageSelect({ onSelect }: LanguageSelectProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');

  // Separate available and coming soon languages
  const availableLanguages = LANGUAGES.filter(l => l.available);
  const comingSoonLanguages = LANGUAGES.filter(l => !l.available);

  const handleSelect = (lang: LanguageInfo) => {
    if (lang.available) {
      setSelectedLanguage(lang.code);
    }
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
      className="min-h-screen bg-white flex flex-col items-center p-6 pt-12 pb-32"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">
          {t('chooseLanguage')}
        </h2>
      </motion.div>

      {/* Available languages - big buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 w-full max-w-sm mb-8"
      >
        {availableLanguages.map((lang, index) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleSelect(lang)}
            className={`relative flex items-center justify-between p-5 rounded-xl border transition-all ${
              selectedLanguage === lang.code
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{lang.flag}</span>
              <div className="text-left">
                <span className="text-lg font-medium text-gray-900 block">
                  {lang.nativeLabel}
                </span>
              </div>
            </div>
            
            {selectedLanguage === lang.code && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <Check size={14} className="text-white" strokeWidth={3} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Coming soon languages - compact grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm"
      >
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 text-center">
          {t('comingSoon')}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {comingSoonLanguages.map((lang, index) => (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + index * 0.02 }}
              className="relative flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50 border border-gray-100 opacity-50"
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-[10px] text-gray-400 font-medium truncate w-full text-center">
                {lang.nativeLabel}
              </span>
              <Lock size={8} className="absolute top-1 right-1 text-gray-300" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-white border-t border-gray-100 z-50">
        <div className="max-w-sm mx-auto">
          {/* Progress indicator */}
          <div className="flex justify-center mb-4">
            <div className="flex gap-1.5">
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="w-8 h-1 bg-purple-500 rounded-full" />
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
          
          <motion.button
            whileHover={selectedLanguage ? { scale: 1.02 } : {}}
            whileTap={selectedLanguage ? { scale: 0.98 } : {}}
            onClick={handleContinue}
            disabled={!selectedLanguage}
            className={`w-full group flex items-center justify-center gap-3 px-8 py-4 rounded-full text-lg font-medium transition-all ${
              selectedLanguage
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/25 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {tCommon('continue')}
            <ArrowRight size={20} className={selectedLanguage ? 'group-hover:translate-x-1 transition-transform' : ''} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
