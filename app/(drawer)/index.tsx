import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../../components/SearchBar';
import { colors, spacing, typography } from '../../constants/theme';
import { isValidEnglishWord } from '../../utils/validation';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSearch = (word: string) => {
    if (!isValidEnglishWord(word)) {
      return;
    }
    router.push({ pathname: '/word', params: { q: word.trim() } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Ionicons name="book-outline" size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>LexiTech Dictionary</Text>
        <Text style={styles.subtitle}>
          Search for English words to find definitions, pronunciations, and examples.
        </Text>
      </View>

      <SearchBar onSearch={handleSearch} />

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Tips</Text>
        <Text style={styles.tip}>• Open the menu to view your search history</Text>
        <Text style={styles.tip}>• Tap the speaker icon to hear pronunciation</Text>
        <Text style={styles.tip}>• Only English alphabetic characters are allowed</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.title,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  tips: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  tipsTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  tip: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
