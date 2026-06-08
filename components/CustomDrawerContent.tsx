import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSearchHistory } from '../context/SearchHistoryContext';
import { colors, spacing, typography } from '../constants/theme';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { history, clearHistory } = useSearchHistory();

  const handleHistoryPress = (word: string) => {
    props.navigation.closeDrawer();
    router.push({ pathname: '/word', params: { q: word } });
  };

  const handleHomePress = () => {
    props.navigation.closeDrawer();
    router.push('/');
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.md }]}
    >
      <View style={styles.header}>
        <Ionicons name="book" size={28} color={colors.primary} />
        <Text style={styles.appTitle}>LexiTech Dictionary</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
        onPress={handleHomePress}
        accessibilityRole="button"
        accessibilityLabel="Go to search"
      >
        <Ionicons name="search" size={20} color={colors.text} />
        <Text style={styles.navItemText}>Search</Text>
      </Pressable>

      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Search History</Text>
          {history.length > 0 && (
            <Pressable
              onPress={clearHistory}
              accessibilityRole="button"
              accessibilityLabel="Clear search history"
            >
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          )}
        </View>

        {history.length === 0 ? (
          <Text style={styles.emptyHistory}>No search history yet</Text>
        ) : (
          <ScrollView style={styles.historyList} nestedScrollEnabled>
            {history.map((word) => (
              <Pressable
                key={word}
                style={({ pressed }) => [
                  styles.historyItem,
                  pressed && styles.historyItemPressed,
                ]}
                onPress={() => handleHistoryPress(word)}
                accessibilityRole="button"
                accessibilityLabel={`Search for ${word}`}
              >
                <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.historyWord}>{word}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </DrawerContentScrollView>
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
    borderBottomColor: colors.border,
  },
  appTitle: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.text,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.md,
    minHeight: 48,
  },
  navItemPressed: {
    backgroundColor: colors.border,
  },
  navItemText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  historySection: {
    flex: 1,
    marginTop: spacing.sm,
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
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyHistory: {
    fontSize: typography.caption,
    color: colors.textSecondary,
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
  historyItemPressed: {
    backgroundColor: '#EFF6FF',
  },
  historyWord: {
    fontSize: typography.body,
    color: colors.text,
  },
});
