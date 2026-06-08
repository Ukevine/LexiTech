export interface Phonetic {
  text?: string;
  audio?: string;
}

export interface Definition {
  definition?: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech?: string;
  definitions?: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: Phonetic[];
  meanings?: Meaning[];
  sourceUrls?: string[];
}

export type SearchErrorType =
  | 'validation'
  | 'not_found'
  | 'network'
  | 'timeout'
  | 'server'
  | 'invalid_response'
  | 'unknown';

export interface SearchError {
  type: SearchErrorType;
  message: string;
}

export interface SearchResult {
  entries: DictionaryEntry[];
  audioUrls: string[];
  phoneticText: string;
}
