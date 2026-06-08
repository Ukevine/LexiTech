import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../constants/theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeType;
  isDark: boolean;
  colors: typeof lightColors;
  toggleTheme: () => void;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = '@lexitech_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const storedTheme = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedTheme === 'dark' || storedTheme === 'light') {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsReady(true);
      }
    }
    loadTheme();
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, nextTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [theme]);

  const value = useMemo(() => {
    const activeColors = theme === 'light' ? lightColors : darkColors;
    return {
      theme,
      isDark: theme === 'dark',
      colors: activeColors,
      toggleTheme,
      isReady,
    };
  }, [theme, toggleTheme, isReady]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
