import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';
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
  return (
    <Pressable
      style={({ pressed }) => [
        styles.controlButton,
        disabled && styles.controlButtonDisabled,
        pressed && !disabled && styles.controlButtonPressed,
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
      <Text style={[styles.controlLabel, disabled && styles.controlLabelDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

function PronunciationRow({ item }: { item: PronunciationItem }) {
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
      <View style={styles.row}>
        <View style={styles.rowHeader}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.phonetic}>{item.phoneticText}</Text>
        </View>
        <Text style={styles.unavailableText}>Pronunciation not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <View style={styles.labelBadge}>
          <Text style={styles.label}>{item.label}</Text>
        </View>
        <Text style={styles.phonetic}>{item.phoneticText}</Text>
      </View>

      <View style={styles.statusRow}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View
            style={[
              styles.statusDot,
              isPlaying && styles.statusDotPlaying,
              isPaused && styles.statusDotPaused,
              playback.error && isActive && styles.statusDotError,
            ]}
          />
        )}
        <Text
          style={[
            styles.statusText,
            playback.error && isActive && styles.statusTextError,
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
  const hasPlayable = hasPlayablePronunciations(pronunciations);

  if (pronunciations.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pronunciations</Text>
        <Text style={styles.unavailableText}>Pronunciation not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Pronunciations</Text>

      {!hasPlayable && (
        <Text style={styles.unavailableBanner}>Pronunciation not available</Text>
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
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unavailableBanner: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  rowHeader: {
    gap: spacing.xs,
  },
  labelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  label: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  phonetic: {
    fontSize: typography.body,
    color: colors.text,
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
    backgroundColor: colors.textSecondary,
  },
  statusDotPlaying: {
    backgroundColor: colors.success,
  },
  statusDotPaused: {
    backgroundColor: '#F59E0B',
  },
  statusDotError: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusTextError: {
    color: colors.error,
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
    backgroundColor: '#EFF6FF',
    minHeight: 40,
    minWidth: 88,
    justifyContent: 'center',
  },
  controlButtonPressed: {
    backgroundColor: '#DBEAFE',
  },
  controlButtonDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.7,
  },
  controlLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: colors.primary,
  },
  controlLabelDisabled: {
    color: colors.textSecondary,
  },
  unavailableText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
