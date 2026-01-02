import { describe, it, expect } from 'vitest';
import { sanitizeInput, truncate, toKebabCase, capitalize } from '../string/transform';

describe('sanitizeInput', () => {
  it('should remove < and > characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  it('should remove javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")');
    expect(sanitizeInput('JavaScript:alert("xss")')).toBe('alert("xss")');
  });

  it('should remove event handlers', () => {
    expect(sanitizeInput('onclick=alert("xss")')).toBe('alert("xss")');
    expect(sanitizeInput('onload=malicious()')).toBe('malicious()');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello world  ')).toBe('hello world');
  });

  it('should return empty string for empty input', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should return empty string for non-string values', () => {
    expect(sanitizeInput(null as any)).toBe('');
    expect(sanitizeInput(undefined as any)).toBe('');
  });

  it('should handle normal text without changes', () => {
    expect(sanitizeInput('Hello, World!')).toBe('Hello, World!');
  });
});

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('This is a very long string', 10)).toBe('This is...');
  });

  it('should not truncate short strings', () => {
    expect(truncate('Short', 10)).toBe('Short');
  });

  it('should handle exact length strings', () => {
    expect(truncate('Exactly10!', 10)).toBe('Exactly10!');
  });

  it('should handle empty strings', () => {
    expect(truncate('', 10)).toBe('');
  });

  it('should handle very short max length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
    expect(truncate('Hello World', 5)).toBe('He...');
  });
});

describe('toKebabCase', () => {
  it('should convert camelCase to kebab-case', () => {
    expect(toKebabCase('camelCase')).toBe('camel-case');
    expect(toKebabCase('myVariableName')).toBe('my-variable-name');
  });

  it('should convert PascalCase to kebab-case', () => {
    expect(toKebabCase('PascalCase')).toBe('pascal-case');
  });

  it('should convert spaces to hyphens', () => {
    expect(toKebabCase('hello world')).toBe('hello-world');
  });

  it('should convert underscores to hyphens', () => {
    expect(toKebabCase('snake_case')).toBe('snake-case');
  });

  it('should handle already kebab-case strings', () => {
    expect(toKebabCase('kebab-case')).toBe('kebab-case');
  });

  it('should convert to lowercase', () => {
    expect(toKebabCase('UPPERCASE')).toBe('uppercase');
  });

  it('should handle mixed formats', () => {
    expect(toKebabCase('My Variable_Name')).toBe('my-variable-name');
  });
});

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should not change already capitalized strings', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('should only capitalize first letter', () => {
    expect(capitalize('hello world')).toBe('Hello world');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A');
  });

  it('should handle uppercase strings', () => {
    expect(capitalize('HELLO')).toBe('HELLO');
  });
});
