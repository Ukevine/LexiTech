import axios, { AxiosInstance } from 'axios';
import {
  DictionaryEntry,
  Meaning,
  Phonetic,
  SearchResult,
} from '../types/dictionary';
import { encodeWordForApi } from '../utils/validation';
import { parseApiError } from '../utils/errorHandler';

const BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const REQUEST_TIMEOUT_MS = 15000;

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function extractAudioUrls(phonetics: Phonetic[] | undefined, entryPhonetic?: string): string[] {
  const urls = new Set<string>();

  phonetics?.forEach((phonetic) => {
    const audio = phonetic.audio?.trim();
    if (audio && isValidUrl(audio)) {
      urls.add(audio);
    }
  });

  return Array.from(urls);
}

function extractPhoneticText(entry: DictionaryEntry): string {
  if (entry.phonetic?.trim()) {
    return entry.phonetic.trim();
  }

  const fromPhonetics = entry.phonetics?.find((p) => p.text?.trim())?.text?.trim();
  return fromPhonetics ?? '';
}

function isValidEntry(entry: unknown): entry is DictionaryEntry {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const candidate = entry as DictionaryEntry;
  return typeof candidate.word === 'string' && candidate.word.trim().length > 0;
}

function sanitizeMeanings(meanings: Meaning[] | undefined): Meaning[] {
  if (!Array.isArray(meanings) || meanings.length === 0) {
    return [];
  }

  return meanings
    .map((meaning) => {
      const definitions = (meaning.definitions ?? []).filter(
        (def) => typeof def.definition === 'string' && def.definition.trim().length > 0
      );

      if (definitions.length === 0) {
        return null;
      }

      return {
        ...meaning,
        partOfSpeech: meaning.partOfSpeech?.trim() || 'unknown',
        definitions,
      };
    })
    .filter((meaning): meaning is Meaning => meaning !== null);
}

function parseEntries(data: unknown): DictionaryEntry[] {
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format');
  }

  const entries = data.filter(isValidEntry).map((entry) => ({
    ...entry,
    word: entry.word.trim(),
    meanings: sanitizeMeanings(entry.meanings),
  }));

  if (entries.length === 0 || entries.every((e) => (e.meanings?.length ?? 0) === 0)) {
    throw new Error('No valid definitions in response');
  }

  return entries;
}

export async function fetchWordDefinition(word: string): Promise<SearchResult> {
  const encodedWord = encodeWordForApi(word);

  try {
    const response = await apiClient.get<unknown>(`/${encodedWord}`);
    const entries = parseEntries(response.data);

    const audioUrls = entries.flatMap((entry) =>
      extractAudioUrls(entry.phonetics, entry.phonetic)
    );
    const uniqueAudioUrls = Array.from(new Set(audioUrls));

    const phoneticText =
      entries.map(extractPhoneticText).find((text) => text.length > 0) ?? '';

    return {
      entries,
      audioUrls: uniqueAudioUrls,
      phoneticText,
    };
  } catch (error) {
    throw parseApiError(error);
  }
}
