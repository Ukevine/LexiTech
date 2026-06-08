const ENGLISH_WORD_PATTERN = /^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/;

export const VALIDATION_MESSAGE = 'Please enter a valid English word';

export function sanitizeSearchInput(input: string | null | undefined): string {
  if (input == null) {
    return '';
  }
  return input.trim();
}

export function getValidationError(input: string | null | undefined): string | null {
  const trimmed = sanitizeSearchInput(input);
  
  if (trimmed.length === 0) {
    return 'Please enter a word to search.';
  }
  
  if (/\s+/.test(trimmed)) {
    return 'Please search for one word, not a sentence.';
  }
  
  if (/\d/.test(trimmed)) {
    return 'Please search for a word instead of numbers.';
  }
  
  if (/[^a-zA-Z-']/.test(trimmed)) {
    return 'Please search for a word instead of numbers.';
  }
  
  if (!ENGLISH_WORD_PATTERN.test(trimmed)) {
    return VALIDATION_MESSAGE;
  }
  
  return null;
}

export function isValidEnglishWord(input: string | null | undefined): boolean {
  return getValidationError(input) === null;
}

export function normalizeWordForHistory(word: string): string {
  return sanitizeSearchInput(word).toLowerCase();
}

export function encodeWordForApi(word: string): string {
  return encodeURIComponent(sanitizeSearchInput(word));
}

