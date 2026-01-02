import { describe, it, expect, beforeEach } from 'vitest';
import { getItem, setItem, removeItem, clear, hasItem } from '../storage/local-storage';

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

describe('getItem', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should get and parse JSON item', () => {
    const data = { name: 'John', age: 30 };
    localStorageMock.setItem('user', JSON.stringify(data));

    const result = getItem<typeof data>('user');
    expect(result).toEqual(data);
  });

  it('should return null for non-existent key', () => {
    const result = getItem('nonexistent');
    expect(result).toBeNull();
  });

  it('should return null for invalid JSON', () => {
    localStorageMock.setItem('invalid', 'not valid json{');
    const result = getItem('invalid');
    expect(result).toBeNull();
  });
});

describe('setItem', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should set and stringify item', () => {
    const data = { name: 'John', age: 30 };
    const result = setItem('user', data);

    expect(result).toBe(true);
    expect(localStorageMock.getItem('user')).toBe(JSON.stringify(data));
  });

  it('should handle primitive values', () => {
    setItem('string', 'hello');
    setItem('number', 42);
    setItem('boolean', true);

    expect(getItem('string')).toBe('hello');
    expect(getItem('number')).toBe(42);
    expect(getItem('boolean')).toBe(true);
  });

  it('should overwrite existing values', () => {
    setItem('key', 'old');
    setItem('key', 'new');

    expect(getItem('key')).toBe('new');
  });
});

describe('removeItem', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should remove item from storage', () => {
    setItem('key', 'value');
    const result = removeItem('key');

    expect(result).toBe(true);
    expect(getItem('key')).toBeNull();
  });

  it('should return true even if key does not exist', () => {
    const result = removeItem('nonexistent');
    expect(result).toBe(true);
  });
});

describe('clear', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should clear all items', () => {
    setItem('key1', 'value1');
    setItem('key2', 'value2');
    setItem('key3', 'value3');

    const result = clear();

    expect(result).toBe(true);
    expect(getItem('key1')).toBeNull();
    expect(getItem('key2')).toBeNull();
    expect(getItem('key3')).toBeNull();
  });
});

describe('hasItem', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should return true for existing keys', () => {
    setItem('key', 'value');
    expect(hasItem('key')).toBe(true);
  });

  it('should return false for non-existent keys', () => {
    expect(hasItem('nonexistent')).toBe(false);
  });

  it('should return false after removing item', () => {
    setItem('key', 'value');
    removeItem('key');
    expect(hasItem('key')).toBe(false);
  });
});
