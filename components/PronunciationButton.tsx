import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';
import { playPronunciation } from '../services/audioService';

interface PronunciationButtonProps {
  audioUrls: string[];
  phoneticText?: string;
}

export function PronunciationButton({ audioUrls, phoneticText }: PronunciationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasAudio = audioUrls.length > 0;

  const handlePlay = async () => {
    if (!hasAudio || loading) {
      return;
    }

    const url = audioUrls[currentIndex % audioUrls.length];
    setLoading(true);
    setError(null);

    try {
      await playPronunciation(url);
      if (audioUrls.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % audioUrls.length);
      }
    } catch {
      setError('Pronunciation unavailable.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasAudio && !phoneticText) {
    return null;
  }

  return (
    <View style={styles.container}>
      {phoneticText ? <Text style={styles.phonetic}>{phoneticText}</Text> : null}
      {hasAudio ? (
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handlePlay}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Play pronunciation"
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="volume-high" size={24} color={colors.primary} />
          )}
        </Pressable>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  phonetic: {
    fontSize: typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#DBEAFE',
  },
  error: {
    fontSize: typography.small,
    color: colors.error,
  },
});
