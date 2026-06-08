import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GroupedMeaning, PronunciationItem } from '../types/dictionary';
import { colors, spacing, typography } from '../constants/theme';
import { PronunciationList } from './PronunciationList';

interface WordDetailsProps {
  word: string;
  pronunciations: PronunciationItem[];
  groupedMeanings: GroupedMeaning[];
}

export function WordDetails({ word, pronunciations, groupedMeanings }: WordDetailsProps) {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.word} accessibilityRole="header">
        {word}
      </Text>

      <PronunciationList pronunciations={pronunciations} />

      <View style={styles.meaningsSection}>
        <Text style={styles.sectionTitle}>Meanings</Text>

        {groupedMeanings.length === 0 ? (
          <Text style={styles.emptyText}>No meanings available.</Text>
        ) : (
          groupedMeanings.map((group) => (
            <View
              key={group.partOfSpeech}
              style={styles.meaningBlock}
              accessibilityLabel={`${group.partOfSpeech} meanings`}
            >
              <View style={styles.partOfSpeechBadge}>
                <Text style={styles.partOfSpeech}>{group.partOfSpeech}</Text>
              </View>

              {group.definitions.map((def, defIndex) => (
                <View key={`${group.partOfSpeech}-${defIndex}`} style={styles.definitionBlock}>
                  <Text style={styles.definitionNumber}>{defIndex + 1}.</Text>
                  <View style={styles.definitionContent}>
                    <Text style={styles.definition}>{def.definition}</Text>
                    <Text style={styles.exampleLabel}>Example</Text>
                    <Text style={styles.example}>
                      {def.example?.trim()
                        ? `"${def.example.trim()}"`
                        : 'No example available'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </View>
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
  word: {
    fontSize: typography.title,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
  },
  meaningsSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  meaningBlock: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
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
  exampleLabel: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.xs,
  },
  example: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
