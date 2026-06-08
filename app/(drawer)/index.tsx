import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../../components/SearchBar';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../constants/theme';
import { isValidEnglishWord } from '../../utils/validation';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const handleSearch = (word: string) => {
    if (!isValidEnglishWord(word)) {
      return;
    }
    router.push({ pathname: '/word', params: { q: word.trim() } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md, backgroundColor: colors.background }]}>
      <View style={styles.hero}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
          <Ionicons name="book-outline" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>LexiTech Dictionary</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Search for English words to find definitions, pronunciations, and examples.
        </Text>
      </View>

      <SearchBar onSearch={handleSearch} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.title,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
});
