export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * Handle API errors and convert them to a standard format
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    // Check if it's a fetch error with status
    const statusMatch = error.message.match(/status: (\d+)/);
    const status = statusMatch ? parseInt(statusMatch[1], 10) : undefined;

    return {
      message: error.message,
      status,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    return {
      message: String(err.message || 'An unknown error occurred'),
      status: typeof err.status === 'number' ? err.status : undefined,
      code: typeof err.code === 'string' ? err.code : undefined,
      details: err.details,
    };
  }

  return {
    message: 'An unknown error occurred',
  };
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.name === 'NetworkError'
    );
  }
  return false;
}

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  const apiError = handleApiError(error);
  return apiError.status === 401 || apiError.status === 403;
}
