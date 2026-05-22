// ============================================
// Bottom Navigation (Mobile PWA Style)
// ============================================

import { Home, Map, Plus, BarChart3, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/App';
import type { Page } from '@/types';

interface NavItem {
  page: Page;
  icon: typeof Home;
  label: string;
  isCenter?: boolean;
}

const navItems: NavItem[] = [
  { page: 'home', icon: Home, label: 'Home' },
  { page: 'map', icon: Map, label: 'Map' },
  { page: 'record', icon: Plus, label: '', isCenter: true },
  { page: 'stats', icon: BarChart3, label: 'Stats' },
  { page: 'profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const { state, navigate } = useApp();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/60"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = state.currentPage === item.page;

          if (item.isCenter) {
            return (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                className="relative -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-strava-orange flex items-center justify-center shadow-lg shadow-orange-200"
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </motion.div>
              </button>
            );
          }

          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[60px]"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px w-8 h-0.5 bg-strava-orange rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-strava-orange' : 'text-gray-400'
                }`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-strava-orange' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
