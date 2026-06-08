import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';
import { isValidEnglishWord, VALIDATION_MESSAGE } from '../utils/validation';

interface SearchBarProps {
  initialValue?: string;
  loading?: boolean;
  onSearch: (word: string) => void;
}

export function SearchBar({ initialValue = '', loading = false, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSearch = () => {
    if (loading) {
      return;
    }

    if (!isValidEnglishWord(query)) {
      setValidationError(VALIDATION_MESSAGE);
      return;
    }

    setValidationError(null);
    onSearch(query.trim());
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
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
        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            (loading || pressed) && styles.searchButtonDisabled,
          ]}
          onPress={handleSearch}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Search"
          accessibilityState={{ disabled: loading }}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.surface} />
        </Pressable>
      </View>
      {validationError && (
        <Text style={styles.errorText} accessibilityRole="alert">
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
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    paddingVertical: spacing.md,
  },
  searchButton: {
    backgroundColor: colors.primary,
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
    color: colors.error,
    fontSize: typography.caption,
    marginLeft: spacing.xs,
  },
});
