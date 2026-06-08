import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { DictionaryEntry } from '../types/dictionary';
import { colors, spacing, typography } from '../constants/theme';
import { PronunciationButton } from './PronunciationButton';

interface WordDetailsProps {
  entries: DictionaryEntry[];
  audioUrls: string[];
  phoneticText: string;
}

export function WordDetails({ entries, audioUrls, phoneticText }: WordDetailsProps) {
  const mainWord = entries[0]?.word ?? '';

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.word} accessibilityRole="header">
          {mainWord}
        </Text>
        <PronunciationButton audioUrls={audioUrls} phoneticText={phoneticText} />
      </View>

      {entries.map((entry, entryIndex) => (
        <View key={`${entry.word}-${entryIndex}`}>
          {(entry.meanings ?? []).map((meaning, meaningIndex) => (
            <View
              key={`${meaning.partOfSpeech}-${meaningIndex}`}
              style={styles.meaningBlock}
            >
              <View style={styles.partOfSpeechBadge}>
                <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
              </View>

              {(meaning.definitions ?? []).map((def, defIndex) => (
                <View key={defIndex} style={styles.definitionBlock}>
                  <Text style={styles.definitionNumber}>{defIndex + 1}.</Text>
                  <View style={styles.definitionContent}>
                    <Text style={styles.definition}>{def.definition}</Text>
                    <Text style={styles.example}>
                      {def.example?.trim()
                        ? `"${def.example.trim()}"`
                        : 'No example available'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  word: {
    fontSize: typography.title,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  meaningBlock: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  partOfSpeechBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  partOfSpeech: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'capitalize',
  },
  definitionBlock: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  definitionNumber: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.primary,
    minWidth: 24,
  },
  definitionContent: {
    flex: 1,
    gap: spacing.xs,
  },
  definition: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  example: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
