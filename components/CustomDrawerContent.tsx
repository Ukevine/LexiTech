import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../constants/theme';

interface CustomDrawerContentProps {
  navigation: {
    closeDrawer: () => void;
  };
  [key: string]: unknown;
}

export function CustomDrawerContent(props: CustomDrawerContentProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { history, clearHistory } = useSearchHistory();
  const { colors, toggleTheme, isDark } = useTheme();

  const handleHistoryPress = (word: string) => {
    props.navigation.closeDrawer();
    router.push({ pathname: '/word', params: { q: word } });
  };

  const handleHomePress = () => {
    props.navigation.closeDrawer();
    router.push('/');
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + spacing.md,
          backgroundColor: colors.background,
        },
      ]}
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Ionicons name="book" size={28} color={colors.primary} />
        <Text style={[styles.appTitle, { color: colors.text }]}>LexiTech</Text>
      </View>

      {/* Search Nav Item */}
      <Pressable
        style={({ pressed }) => [
          styles.navItem,
          pressed && { backgroundColor: colors.surfaceLight },
        ]}
        onPress={handleHomePress}
        accessibilityRole="button"
        accessibilityLabel="Go to search"
      >
        <Ionicons name="search" size={20} color={colors.text} />
        <Text style={[styles.navItemText, { color: colors.text }]}>Search</Text>
      </Pressable>

      {/* Theme Toggle Nav Item */}
      <Pressable
        style={({ pressed }) => [
          styles.navItem,
          pressed && { backgroundColor: colors.surfaceLight },
        ]}
        onPress={toggleTheme}
        accessibilityRole="button"
        accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.text} />
        <Text style={[styles.navItemText, { color: colors.text }]}>
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </Text>
      </Pressable>

      {/* History Section */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>Search History</Text>
          {history.length > 0 && (
            <Pressable
              onPress={clearHistory}
              accessibilityRole="button"
              accessibilityLabel="Clear search history"
            >
              <Text style={[styles.clearText, { color: colors.primary }]}>Clear</Text>
            </Pressable>
          )}
        </View>

        {history.length === 0 ? (
          <Text style={[styles.emptyHistory, { color: colors.textSecondary }]}>No search history yet</Text>
        ) : (
          <ScrollView style={styles.historyList} nestedScrollEnabled>
            {history.map((word) => (
              <Pressable
                key={word}
                style={({ pressed }) => [
                  styles.historyItem,
                  pressed && { backgroundColor: colors.surfaceLight },
                ]}
                onPress={() => handleHistoryPress(word)}
                accessibilityRole="button"
                accessibilityLabel={`Search for ${word}`}
              >
                <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.historyWord, { color: colors.text }]}>{word}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  appTitle: {
    fontSize: typography.heading,
    fontWeight: '700',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.sm,
    minHeight: 48,
  },
  navItemText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  historySection: {
    flex: 1,
    marginTop: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  historyTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  emptyHistory: {
    fontSize: typography.caption,
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
  historyList: {
    maxHeight: 400,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    minHeight: 48,
  },
  historyWord: {
    fontSize: typography.body,
  },
});
