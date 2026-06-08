import { useCallback, useRef, useState } from 'react';
import { fetchWordDefinition } from '../services/dictionaryApi';
import { SearchError, SearchResult } from '../types/dictionary';
import { isValidEnglishWord } from '../utils/validation';
import { getErrorMessage } from '../utils/errorHandler';
import { useSearchHistory } from '../context/SearchHistoryContext';

export function useWordSearch() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<SearchError | null>(null);
  const requestInFlight = useRef(false);
  const { addToHistory } = useSearchHistory();

  const searchWord = useCallback(
    async (word: string) => {
      if (requestInFlight.current) {
        return;
      }

      if (!isValidEnglishWord(word)) {
        setError({
          type: 'validation',
          message: getErrorMessage('validation'),
        });
        setResult(null);
        return;
      }

      requestInFlight.current = true;
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const data = await fetchWordDefinition(word);
        setResult(data);
        await addToHistory(word);
      } catch (err) {
        const searchError = err as SearchError;
        setError(searchError);
        setResult(null);
      } finally {
        setLoading(false);
        requestInFlight.current = false;
      }
    },
    [addToHistory]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { loading, result, error, searchWord, reset };
}
