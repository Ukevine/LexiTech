import { useCallback, useEffect } from 'react';
import { audioPlaybackService } from '../../services/audioService';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/SearchBar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorView } from '../../components/ErrorView';
import { WordDetails } from '../../components/WordDetails';
import { useWordSearch } from '../../hooks/useWordSearch';
import { colors, spacing } from '../../constants/theme';
import { sanitizeSearchInput } from '../../utils/validation';

export default function WordScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { loading, result, error, searchWord } = useWordSearch();

  const word = sanitizeSearchInput(q);

  const performSearch = useCallback(() => {
    if (word) {
      searchWord(word);
    }
  }, [word, searchWord]);

  useEffect(() => {
    if (word) {
      navigation.setOptions({ title: word });
      performSearch();
    }
  }, [word, navigation, performSearch]);

  useEffect(() => {
    audioPlaybackService.stopAll();
  }, [word]);

  useEffect(() => {
    return () => {
      audioPlaybackService.stopAll();
    };
  }, []);

  const handleSearch = (newWord: string) => {
    const trimmed = newWord.trim();
    router.setParams({ q: trimmed });
    navigation.setOptions({ title: trimmed });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.searchSection}>
        <SearchBar initialValue={word} loading={loading} onSearch={handleSearch} />
      </View>

      <View style={styles.content}>
        {loading && <LoadingSpinner />}

        {!loading && error && (
          <ErrorView
            title={error.type === 'not_found' ? 'Word Not Found' : 'Something Went Wrong'}
            message={error.message}
            onRetry={performSearch}
          />
        )}

        {!loading && !error && result && (
          <WordDetails
            word={result.entries[0]?.word ?? word}
            pronunciations={result.pronunciations}
            groupedMeanings={result.groupedMeanings}
          />
        )}

        {!loading && !error && !result && !word && (
          <ErrorView
            title="No Word Selected"
            message="Enter a word to search for its definition."
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
