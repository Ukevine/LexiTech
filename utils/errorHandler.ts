import { AxiosError } from 'axios';
import { SearchError, SearchErrorType } from '../types/dictionary';

const ERROR_MESSAGES: Record<SearchErrorType, string> = {
  validation: 'Please enter a valid English word',
  not_found: 'Word not found.',
  network: 'No internet connection.',
  timeout: 'Request timed out. Please try again.',
  server: 'Unable to fetch data. Please try again later.',
  invalid_response: 'Unable to fetch data. Please try again later.',
  unknown: 'Something went wrong.',
};

export function getErrorMessage(type: SearchErrorType): string {
  return ERROR_MESSAGES[type];
}

export function parseApiError(error: unknown): SearchError {
  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED') {
      return { type: 'timeout', message: getErrorMessage('timeout') };
    }

    if (!error.response) {
      return { type: 'network', message: getErrorMessage('network') };
    }

    const status = error.response.status;
    if (status === 404) {
      return { type: 'not_found', message: getErrorMessage('not_found') };
    }

    if (status >= 500) {
      return { type: 'server', message: getErrorMessage('server') };
    }

    return { type: 'unknown', message: getErrorMessage('unknown') };
  }

  return { type: 'unknown', message: getErrorMessage('unknown') };
}
