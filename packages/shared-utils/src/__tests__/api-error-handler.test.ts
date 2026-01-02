import { describe, it, expect } from 'vitest';
import { handleApiError, isNetworkError, isAuthError } from '../api/error-handler';

describe('handleApiError', () => {
  it('should handle Error instances', () => {
    const error = new Error('Test error');
    const result = handleApiError(error);

    expect(result).toEqual({
      message: 'Test error',
      status: undefined,
    });
  });

  it('should extract status from error message', () => {
    const error = new Error('HTTP error! status: 404');
    const result = handleApiError(error);

    expect(result).toEqual({
      message: 'HTTP error! status: 404',
      status: 404,
    });
  });

  it('should handle object errors with message', () => {
    const error = {
      message: 'Custom error',
      status: 500,
      code: 'INTERNAL_ERROR',
    };
    const result = handleApiError(error);

    expect(result).toEqual({
      message: 'Custom error',
      status: 500,
      code: 'INTERNAL_ERROR',
      details: undefined,
    });
  });

  it('should handle object errors with details', () => {
    const error = {
      message: 'Validation error',
      details: { field: 'email', reason: 'invalid' },
    };
    const result = handleApiError(error);

    expect(result).toEqual({
      message: 'Validation error',
      status: undefined,
      code: undefined,
      details: { field: 'email', reason: 'invalid' },
    });
  });

  it('should handle unknown error types', () => {
    const result = handleApiError('string error');

    expect(result).toEqual({
      message: 'An unknown error occurred',
    });
  });

  it('should handle null error', () => {
    const result = handleApiError(null);

    expect(result).toEqual({
      message: 'An unknown error occurred',
    });
  });

  it('should handle undefined error', () => {
    const result = handleApiError(undefined);

    expect(result).toEqual({
      message: 'An unknown error occurred',
    });
  });
});

describe('isNetworkError', () => {
  it('should return true for network-related errors', () => {
    expect(isNetworkError(new Error('network error occurred'))).toBe(true);
    expect(isNetworkError(new Error('fetch failed'))).toBe(true);
  });

  it('should return true for NetworkError', () => {
    const error = new Error('Connection failed');
    error.name = 'NetworkError';
    expect(isNetworkError(error)).toBe(true);
  });

  it('should return false for non-network errors', () => {
    expect(isNetworkError(new Error('validation error'))).toBe(false);
    expect(isNetworkError(new Error('HTTP error! status: 404'))).toBe(false);
  });

  it('should return false for non-Error types', () => {
    expect(isNetworkError('error string')).toBe(false);
    expect(isNetworkError({ message: 'network error' })).toBe(false);
  });
});

describe('isAuthError', () => {
  it('should return true for 401 status', () => {
    const error = new Error('HTTP error! status: 401');
    expect(isAuthError(error)).toBe(true);
  });

  it('should return true for 403 status', () => {
    const error = new Error('HTTP error! status: 403');
    expect(isAuthError(error)).toBe(true);
  });

  it('should return true for object with 401 status', () => {
    const error = { message: 'Unauthorized', status: 401 };
    expect(isAuthError(error)).toBe(true);
  });

  it('should return true for object with 403 status', () => {
    const error = { message: 'Forbidden', status: 403 };
    expect(isAuthError(error)).toBe(true);
  });

  it('should return false for other status codes', () => {
    const error = new Error('HTTP error! status: 404');
    expect(isAuthError(error)).toBe(false);
  });

  it('should return false for errors without status', () => {
    const error = new Error('Generic error');
    expect(isAuthError(error)).toBe(false);
  });
});
