import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../constants/theme';

interface ErrorViewProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ title, message, onRetry }: ErrorViewProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: colors.primary },
            pressed && { backgroundColor: colors.primaryDark },
          ]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry search"
        >
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
    minHeight: 48,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '600',
  },
});
