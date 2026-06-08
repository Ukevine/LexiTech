import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../constants/theme';
import { getValidationError } from '../utils/validation';

interface SearchBarProps {
  initialValue?: string;
  loading?: boolean;
  onSearch: (word: string) => void;
}

export function SearchBar({ initialValue = '', loading = false, onSearch }: SearchBarProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSearch = () => {
    if (loading) {
      return;
    }

    const error = getValidationError(query);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    onSearch(query.trim());
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (validationError) {
              setValidationError(null);
            }
          }}
          placeholder="Search for a word..."
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          editable={!loading}
          accessibilityLabel="Search for a word"
          accessibilityHint="Enter an English word to look up its definition"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery('');
              setValidationError(null);
            }}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search text"
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            { backgroundColor: colors.primary },
            (loading || pressed) && styles.searchButtonDisabled,
          ]}
          onPress={handleSearch}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Search"
          accessibilityState={{ disabled: loading }}
        >
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
      {validationError && (
        <Text style={[styles.errorText, { color: colors.error }]} accessibilityRole="alert">
          {validationError}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    minHeight: 52,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.body,
    paddingVertical: spacing.md,
  },
  clearButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    borderRadius: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: typography.caption,
    marginLeft: spacing.xs,
  },
});
