import { Definition, DictionaryEntry, GroupedMeaning } from '../types/dictionary';

export function groupMeaningsByPartOfSpeech(entries: DictionaryEntry[]): GroupedMeaning[] {
  const groups = new Map<string, Definition[]>();

  for (const entry of entries) {
    for (const meaning of entry.meanings ?? []) {
      const partOfSpeech = meaning.partOfSpeech?.trim() || 'unknown';
      const existing = groups.get(partOfSpeech) ?? [];
      const validDefinitions = (meaning.definitions ?? []).filter(
        (def) => typeof def.definition === 'string' && def.definition.trim().length > 0
      );
      groups.set(partOfSpeech, [...existing, ...validDefinitions]);
    }
  }

  return Array.from(groups.entries()).map(([partOfSpeech, definitions]) => ({
    partOfSpeech,
    definitions,
  }));
}
