import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../constants/theme';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { audioPlaybackService, getStatusLabel } from '../services/audioService';
import { PronunciationItem } from '../types/dictionary';
import { hasPlayablePronunciations } from '../utils/pronunciation';

interface PronunciationListProps {
  pronunciations: PronunciationItem[];
}

interface ControlButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
}

function ControlButton({
  label,
  icon,
  onPress,
  disabled = false,
  accessibilityLabel,
}: ControlButtonProps) {
  const { colors, isDark } = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.controlButton,
        {
          backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
        },
        disabled && {
          backgroundColor: isDark ? '#111827' : '#F1F5F9',
          opacity: 0.7,
        },
        pressed && !disabled && {
          backgroundColor: isDark ? '#334155' : '#DBEAFE',
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <Ionicons
        name={icon}
        size={16}
        color={disabled ? colors.textSecondary : colors.primary}
      />
      <Text style={[
        styles.controlLabel,
        { color: colors.primary },
        disabled && { color: colors.textSecondary }
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

function PronunciationRow({ item }: { item: PronunciationItem }) {
  const { colors, isDark } = useTheme();
  const playback = useAudioPlayback();
  const isActive = playback.activeId === item.id;
  const status = isActive ? playback.status : 'stopped';
  const statusLabel = isActive && playback.error ? playback.error : getStatusLabel(status);

  const isLoading = isActive && status === 'loading';
  const isPlaying = isActive && status === 'playing';
  const isPaused = isActive && status === 'paused';
  const isStopped = !isActive || status === 'stopped' || status === 'error';

  const handlePlay = async () => {
    if (!item.audioUrl || isLoading) {
      return;
    }

    try {
      if (isPaused) {
        await audioPlaybackService.play(item.id, item.audioUrl);
        return;
      }
      await audioPlaybackService.play(item.id, item.audioUrl);
    } catch (error) {
      console.error('Failed to play pronunciation:', error);
    }
  };

  const handlePause = async () => {
    try {
      await audioPlaybackService.pause(item.id);
    } catch (error) {
      console.error('Failed to pause pronunciation:', error);
    }
  };

  const handleStop = async () => {
    try {
      await audioPlaybackService.stop(item.id);
    } catch (error) {
      console.error('Failed to stop pronunciation:', error);
    }
  };

  if (!item.hasPlayableAudio) {
    return (
      <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.rowHeader}>
          <Text style={[styles.label, { color: colors.primary }]}>{item.label}</Text>
          <Text style={[styles.phonetic, { color: colors.text }]}>{item.phoneticText}</Text>
        </View>
        <Text style={[styles.unavailableText, { color: colors.textSecondary }]}>Pronunciation not available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.rowHeader}>
        <View style={[styles.labelBadge, { backgroundColor: isDark ? '#1D2A47' : '#EFF6FF' }]}>
          <Text style={[styles.label, { color: colors.primary }]}>{item.label}</Text>
        </View>
        <Text style={[styles.phonetic, { color: colors.text }]}>{item.phoneticText}</Text>
      </View>

      <View style={styles.statusRow}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View
            style={[
              styles.statusDot,
              { backgroundColor: colors.textSecondary },
              isPlaying && { backgroundColor: colors.success },
              isPaused && { backgroundColor: '#F59E0B' },
              playback.error && isActive && { backgroundColor: colors.error },
            ]}
          />
        )}
        <Text
          style={[
            styles.statusText,
            { color: colors.textSecondary },
            playback.error && isActive && { color: colors.error },
          ]}
          accessibilityLiveRegion="polite"
        >
          {statusLabel}
        </Text>
      </View>

      <View style={styles.controls}>
        <ControlButton
          label="Play"
          icon="play"
          onPress={handlePlay}
          disabled={!item.audioUrl || isLoading || isPlaying}
          accessibilityLabel={`Play ${item.label} pronunciation`}
        />
        <ControlButton
          label="Pause"
          icon="pause"
          onPress={handlePause}
          disabled={!isPlaying}
          accessibilityLabel={`Pause ${item.label} pronunciation`}
        />
        <ControlButton
          label="Stop"
          icon="stop"
          onPress={handleStop}
          disabled={isStopped || isLoading}
          accessibilityLabel={`Stop ${item.label} pronunciation`}
        />
      </View>
    </View>
  );
}

export function PronunciationList({ pronunciations }: PronunciationListProps) {
  const { colors } = useTheme();
  const hasPlayable = hasPlayablePronunciations(pronunciations);

  if (pronunciations.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Pronunciations</Text>
        <Text style={[styles.unavailableText, { color: colors.textSecondary }]}>Pronunciation not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Pronunciations</Text>

      {!hasPlayable && (
        <Text style={[styles.unavailableBanner, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.textSecondary }]}>
          Pronunciation not available
        </Text>
      )}

      <View style={styles.list}>
        {pronunciations.map((item) => (
          <PronunciationRow key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unavailableBanner: {
    fontSize: typography.caption,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    fontStyle: 'italic',
  },
  list: {
    gap: spacing.md,
  },
  row: {
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  rowHeader: {
    gap: spacing.xs,
  },
  labelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  label: {
    fontSize: typography.small,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  phonetic: {
    fontSize: typography.body,
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    minHeight: 40,
    minWidth: 88,
    justifyContent: 'center',
  },
  controlLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  unavailableText: {
    fontSize: typography.caption,
    fontStyle: 'italic',
  },
});
