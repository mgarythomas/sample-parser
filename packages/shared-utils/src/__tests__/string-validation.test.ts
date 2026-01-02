import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidUrl, isEmpty } from '../string/validation';

describe('isValidEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user@example.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user@example')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
  });

  it('should trim whitespace before validation', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });

  it('should return false for emails with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
    expect(isValidEmail('user@ example.com')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('should return true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path')).toBe(true);
    expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(isValidUrl('invalid')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('//example.com')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isValidUrl(null as any)).toBe(false);
    expect(isValidUrl(undefined as any)).toBe(false);
  });

  it('should handle URLs with ports', () => {
    expect(isValidUrl('http://localhost:3000')).toBe(true);
  });
});

describe('isEmpty', () => {
  it('should return true for empty string', () => {
    expect(isEmpty('')).toBe(true);
  });

  it('should return true for whitespace-only string', () => {
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty('\t\n')).toBe(true);
  });

  it('should return false for non-empty string', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty('  hello  ')).toBe(false);
  });

  it('should return true for null or undefined', () => {
    expect(isEmpty(null as any)).toBe(true);
    expect(isEmpty(undefined as any)).toBe(true);
  });
});
