import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchWithAuth, setAuthToken, clearAuthToken } from '../api/fetch';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('fetchWithAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should make fetch request with auth token', async () => {
    setAuthToken('test-token');

    const mockResponse = { data: 'test' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchWithAuth('/api/test');

    expect(global.fetch).toHaveBeenCalledWith('/api/test', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
    });
    expect(result).toEqual(mockResponse);
  });

  it('should make fetch request without auth token when not set', async () => {
    const mockResponse = { data: 'test' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchWithAuth('/api/test');

    expect(global.fetch).toHaveBeenCalledWith('/api/test', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(result).toEqual(mockResponse);
  });

  it('should merge custom headers', async () => {
    setAuthToken('test-token');

    const mockResponse = { data: 'test' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await fetchWithAuth('/api/test', {
      headers: {
        'X-Custom-Header': 'custom-value',
      },
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/test', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
        'X-Custom-Header': 'custom-value',
      },
    });
  });

  it('should throw error for non-ok response', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchWithAuth('/api/test')).rejects.toThrow('HTTP error! status: 404');
  });

  it('should pass through request options', async () => {
    const mockResponse = { data: 'test' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await fetchWithAuth('/api/test', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' }),
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });
});

describe('setAuthToken', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should store token in localStorage', () => {
    setAuthToken('test-token');
    expect(localStorageMock.getItem('auth_token')).toBe('test-token');
  });

  it('should overwrite existing token', () => {
    setAuthToken('old-token');
    setAuthToken('new-token');
    expect(localStorageMock.getItem('auth_token')).toBe('new-token');
  });
});

describe('clearAuthToken', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should remove token from localStorage', () => {
    setAuthToken('test-token');
    clearAuthToken();
    expect(localStorageMock.getItem('auth_token')).toBeNull();
  });

  it('should not throw error if token does not exist', () => {
    expect(() => clearAuthToken()).not.toThrow();
  });
});
