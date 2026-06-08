import { DictionaryEntry, PronunciationItem } from '../types/dictionary';

function isValidAudioUrl(url: string | undefined | null): boolean {
  if (!url?.trim()) {
    return false;
  }

  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function inferLabel(audioUrl: string | null, index: number): string {
  if (audioUrl) {
    const lower = audioUrl.toLowerCase();
    if (lower.includes('-uk') || lower.includes('_uk')) {
      return 'UK';
    }
    if (lower.includes('-us') || lower.includes('_us')) {
      return 'US';
    }
    if (lower.includes('-au') || lower.includes('_au')) {
      return 'Australian';
    }
  }

  return `Pronunciation ${index + 1}`;
}

function formatPhoneticText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed.startsWith('/') && trimmed.endsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}/`;
}

export function extractPronunciations(entries: DictionaryEntry[]): PronunciationItem[] {
  const items: PronunciationItem[] = [];
  const seenAudio = new Set<string>();
  const seenPhonetic = new Set<string>();
  let index = 0;

  for (const entry of entries) {
    const phonetics = entry.phonetics ?? [];

    if (phonetics.length === 0 && entry.phonetic?.trim()) {
      phonetics.push({ text: entry.phonetic.trim() });
    }

    for (const phonetic of phonetics) {
      const phoneticText = formatPhoneticText(phonetic.text ?? entry.phonetic ?? '');
      const audioUrl = isValidAudioUrl(phonetic.audio) ? phonetic.audio!.trim() : null;

      const dedupeKey = audioUrl ?? phoneticText.toLowerCase();
      if (!dedupeKey || seenPhonetic.has(dedupeKey)) {
        continue;
      }

      if (audioUrl) {
        if (seenAudio.has(audioUrl)) {
          continue;
        }
        seenAudio.add(audioUrl);
      }

      seenPhonetic.add(dedupeKey);

      items.push({
        id: `pronunciation-${index}`,
        label: inferLabel(audioUrl, index),
        phoneticText: phoneticText || '—',
        audioUrl,
        hasPlayableAudio: audioUrl !== null,
      });
      index += 1;
    }
  }

  return items;
}

export function hasPlayablePronunciations(pronunciations: PronunciationItem[]): boolean {
  return pronunciations.some((item) => item.hasPlayableAudio);
}
