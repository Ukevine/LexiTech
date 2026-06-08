import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../constants/theme';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Searching...' }: LoadingSpinnerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  message: {
    fontSize: typography.body,
  },
});
