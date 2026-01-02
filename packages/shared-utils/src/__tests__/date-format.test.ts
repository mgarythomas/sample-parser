import { describe, it, expect } from 'vitest';
import { formatDate, getRelativeTime } from '../date/format';

describe('formatDate', () => {
  it('should format date with YYYY-MM-DD pattern', () => {
    const date = new Date('2024-03-15T10:30:45');
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-03-15');
  });

  it('should format date with full datetime pattern', () => {
    const date = new Date('2024-03-15T10:30:45');
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-03-15 10:30:45');
  });

  it('should format date with custom separators', () => {
    const date = new Date('2024-03-15T10:30:45');
    expect(formatDate(date, 'DD/MM/YYYY')).toBe('15/03/2024');
  });

  it('should pad single digit months and days', () => {
    const date = new Date('2024-01-05T08:05:03');
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-01-05 08:05:03');
  });

  it('should handle time-only format', () => {
    const date = new Date('2024-03-15T14:25:30');
    expect(formatDate(date, 'HH:mm:ss')).toBe('14:25:30');
  });
});

describe('getRelativeTime', () => {
  it('should return "just now" for very recent dates', () => {
    const date = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    expect(getRelativeTime(date)).toBe('just now');
  });

  it('should return minutes ago for recent dates', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    expect(getRelativeTime(date)).toBe('5 minutes ago');
  });

  it('should return singular minute for 1 minute ago', () => {
    const date = new Date(Date.now() - 1 * 60 * 1000); // 1 minute ago
    expect(getRelativeTime(date)).toBe('1 minute ago');
  });

  it('should return hours ago for dates within 24 hours', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    expect(getRelativeTime(date)).toBe('3 hours ago');
  });

  it('should return singular hour for 1 hour ago', () => {
    const date = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    expect(getRelativeTime(date)).toBe('1 hour ago');
  });

  it('should return days ago for dates within a week', () => {
    const date = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000); // 4 days ago
    expect(getRelativeTime(date)).toBe('4 days ago');
  });

  it('should return weeks ago for dates within a month', () => {
    const date = new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000); // 2 weeks ago
    expect(getRelativeTime(date)).toBe('2 weeks ago');
  });

  it('should return months ago for dates within a year', () => {
    const date = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000); // ~6 months ago
    expect(getRelativeTime(date)).toBe('6 months ago');
  });

  it('should return years ago for old dates', () => {
    const date = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000); // ~2 years ago
    expect(getRelativeTime(date)).toBe('2 years ago');
  });

  it('should handle future dates with "in" prefix', () => {
    const date = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    expect(getRelativeTime(date)).toBe('in 5 minutes');
  });

  it('should return "in a few seconds" for near future dates', () => {
    const date = new Date(Date.now() + 30 * 1000); // 30 seconds from now
    expect(getRelativeTime(date)).toBe('in a few seconds');
  });

  it('should handle future hours', () => {
    const date = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now
    expect(getRelativeTime(date)).toBe('in 3 hours');
  });

  it('should handle future days', () => {
    const date = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
    expect(getRelativeTime(date)).toBe('in 5 days');
  });
});
