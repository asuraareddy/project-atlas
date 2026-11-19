'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Check local storage or system preference
    const saved = localStorage.getItem('atlas_theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial: Theme = prefersDark ? 'light' : 'light'; // Default to Devin Minimal Pro light
      setThemeState(initial);
      applyTheme(initial);
    }
    setMounted(true);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('atlas_theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Mobile-friendly and Desktop Theme Toggle Button
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-full bg-[rgba(128,128,128,0.15)] ${className}`} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all select-none border active:scale-95 ${
        isDark
          ? 'bg-[#1A1A1C] text-[#F2F2F2] border-white/15 hover:border-[#317CFF] shadow-sm'
          : 'bg-white text-[#191919] border-[rgba(0,0,0,0.12)] hover:bg-[#F8F8F8] shadow-sm'
      } ${className}`}
      title={isDark ? 'Dark Mode (Click for White Mode)' : 'White Mode (Click for Dark Mode)'}
      aria-label={isDark ? 'Dark Mode (Click for White Mode)' : 'White Mode (Click for Dark Mode)'}
    >
      {isDark ? (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12 text-[#F2F2F2]" />
      ) : (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45 text-[#191919]" />
      )}
    </button>
  );
}
