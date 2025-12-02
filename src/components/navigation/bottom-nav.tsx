'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, BarChart3, Library } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useReadingSettingsStore, useReadingSessionStore, getThemeStyles } from '@/stores';

export function BottomNav() {
  const pathname = usePathname();
  const tNav = useTranslations('navigation');
  const { theme: readingTheme } = useReadingSettingsStore();
  const themeStyles = getThemeStyles(readingTheme);
  const { story, lisaState } = useReadingSessionStore();

  // Hide on learn page when story is active and not completed
  // Show menu when story is completed (lisaState is 'celebration' or 'success')
  const isOnLearnPage = pathname === '/learn';
  const isOnSettingsPage = pathname === '/settings';
  const isStoryCompleted = lisaState === 'celebration' || lisaState === 'success';
  const shouldHide = isOnSettingsPage || (isOnLearnPage && story && !isStoryCompleted);

  const navItems = [
    {
      href: '/learn',
      label: tNav('read'),
      icon: BookOpen,
    },
    {
      href: '/stats',
      label: tNav('stats'),
      icon: BarChart3,
    },
    {
      href: '/bookshelf',
      label: tNav('bookshelf'),
      icon: Library,
    },
  ];

  return (
    <AnimatePresence>
      {!shouldHide && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`fixed bottom-0 left-0 right-0 z-50 ${themeStyles.cardBg} border-t ${themeStyles.border} backdrop-blur-sm bg-opacity-95`}
        >
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center gap-8 py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-colors min-w-[80px]"
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-purple-500/10 rounded-xl"
                        transition={{ type: 'spring', duration: 0.5 }}
                      />
                    )}

                    {/* Icon */}
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="relative z-10"
                    >
                      <Icon
                        size={24}
                        className={`${
                          isActive
                            ? 'text-purple-600 dark:text-purple-400'
                            : themeStyles.textMuted
                        }`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </motion.div>

                    {/* Label */}
                    <span
                      className={`text-xs mt-1 font-medium relative z-10 ${
                        isActive
                          ? 'text-purple-600 dark:text-purple-400'
                          : themeStyles.textMuted
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
