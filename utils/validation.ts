const ENGLISH_WORD_PATTERN = /^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/;

export const VALIDATION_MESSAGE = 'Please enter a valid English word';

export function sanitizeSearchInput(input: string | null | undefined): string {
  if (input == null) {
    return '';
  }
  return input.trim();
}

export function isValidEnglishWord(input: string | null | undefined): boolean {
  const trimmed = sanitizeSearchInput(input);
  if (!trimmed) {
    return false;
  }
  return ENGLISH_WORD_PATTERN.test(trimmed);
}

export function normalizeWordForHistory(word: string): string {
  return sanitizeSearchInput(word).toLowerCase();
}

export function encodeWordForApi(word: string): string {
  return encodeURIComponent(sanitizeSearchInput(word));
}
