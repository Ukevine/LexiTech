import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeWordForHistory, sanitizeSearchInput } from '../utils/validation';

const STORAGE_KEY = '@lexitech_search_history';
const MAX_HISTORY_SIZE = 50;

interface SearchHistoryContextValue {
  history: string[];
  addToHistory: (word: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  isReady: boolean;
}

const SearchHistoryContext = createContext<SearchHistoryContextValue | null>(null);

export function SearchHistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(
              (item): item is string => typeof item === 'string' && item.trim().length > 0
            );
            setHistory(valid);
          }
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
      } finally {
        setIsReady(true);
      }
    }

    loadHistory();
  }, []);

  const persistHistory = useCallback(async (items: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, []);

  const addToHistory = useCallback(
    async (word: string) => {
      const trimmed = sanitizeSearchInput(word);
      if (!trimmed) {
        return;
      }

      const normalized = normalizeWordForHistory(trimmed);
      const displayWord = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();

      setHistory((prev) => {
        const filtered = prev.filter(
          (item) => normalizeWordForHistory(item) !== normalized
        );
        const updated = [displayWord, ...filtered].slice(0, MAX_HISTORY_SIZE);
        persistHistory(updated);
        return updated;
      });
    },
    [persistHistory]
  );

  const clearHistory = useCallback(async () => {
    setHistory([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  const value = useMemo(
    () => ({ history, addToHistory, clearHistory, isReady }),
    [history, addToHistory, clearHistory, isReady]
  );

  return (
    <SearchHistoryContext.Provider value={value}>
      {children}
    </SearchHistoryContext.Provider>
  );
}

export function useSearchHistory(): SearchHistoryContextValue {
  const context = useContext(SearchHistoryContext);
  if (!context) {
    throw new Error('useSearchHistory must be used within SearchHistoryProvider');
  }
  return context;
}
