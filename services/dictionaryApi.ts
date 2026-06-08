import axios, { AxiosInstance } from 'axios';
import {
  DictionaryEntry,
  Meaning,
  SearchResult,
} from '../types/dictionary';
import { groupMeaningsByPartOfSpeech } from '../utils/meanings';
import { extractPronunciations } from '../utils/pronunciation';
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

  const sanitized: Meaning[] = [];

  for (const meaning of meanings) {
    const definitions = (meaning.definitions ?? []).filter(
      (def) => typeof def.definition === 'string' && def.definition.trim().length > 0
    );

    if (definitions.length === 0) {
      continue;
    }

    sanitized.push({
      ...meaning,
      partOfSpeech: meaning.partOfSpeech?.trim() || 'unknown',
      definitions,
    });
  }

  return sanitized;
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

    return {
      entries,
      pronunciations: extractPronunciations(entries),
      groupedMeanings: groupMeaningsByPartOfSpeech(entries),
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
      throw error;
    }

    if (error instanceof Error && error.message.includes('Invalid')) {
      throw {
        type: 'invalid_response' as const,
        message: parseApiError(error).message,
      };
    }

    throw parseApiError(error);
  }
}
