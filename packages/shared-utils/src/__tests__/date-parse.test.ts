import { describe, it, expect } from 'vitest';
import { parseISODate, isValidDate } from '../date/parse';

describe('parseISODate', () => {
  it('should parse valid ISO date string', () => {
    const result = parseISODate('2024-03-15T10:30:45.000Z');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2024);
  });

  it('should parse simple date string', () => {
    const result = parseISODate('2024-03-15');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2024);
  });

  it('should return null for invalid date string', () => {
    const result = parseISODate('invalid-date');
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = parseISODate('');
    expect(result).toBeNull();
  });

  it('should handle date with timezone', () => {
    const result = parseISODate('2024-03-15T10:30:45+05:30');
    expect(result).toBeInstanceOf(Date);
  });
});

describe('isValidDate', () => {
  it('should return true for valid ISO date', () => {
    expect(isValidDate('2024-03-15T10:30:45.000Z')).toBe(true);
  });

  it('should return true for simple date string', () => {
    expect(isValidDate('2024-03-15')).toBe(true);
  });

  it('should return false for invalid date string', () => {
    expect(isValidDate('invalid-date')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidDate('')).toBe(false);
  });

  it('should return true for timestamp', () => {
    expect(isValidDate('1710497445000')).toBe(true);
  });
});
