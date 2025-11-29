'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BookOpen, TrendingUp, Settings, Sparkles } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: BookOpen, label: 'Stories', href: '/stories' },
  { icon: TrendingUp, label: 'Progress', href: '/progress' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-2 border-purple-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-2xl">📚</span>
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Lisa
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors
                        ${isActive 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-purple-100'
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <motion.div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full border-2 border-yellow-300"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles size={16} className="text-yellow-600" />
                <span className="text-sm font-bold text-gray-700">Level 3</span>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t-2 border-purple-200 z-40">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`
                    flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                    ${isActive ? 'text-purple-600' : 'text-gray-500'}
                  `}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={24} />
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="w-1 h-1 bg-purple-600 rounded-full"
                      layoutId="activeTab"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
