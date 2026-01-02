/**
 * Format a date according to the specified format string
 * Supports basic format tokens: YYYY, MM, DD, HH, mm, ss
 */
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Get a human-readable relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const isPast = diffMs > 0;
  const suffix = isPast ? 'ago' : 'from now';
  const prefix = isPast ? '' : 'in ';

  if (diffSeconds < 60) {
    return isPast ? 'just now' : 'in a few seconds';
  } else if (diffMinutes < 60) {
    const unit = diffMinutes === 1 ? 'minute' : 'minutes';
    return isPast ? `${diffMinutes} ${unit} ${suffix}` : `${prefix}${diffMinutes} ${unit}`;
  } else if (diffHours < 24) {
    const unit = diffHours === 1 ? 'hour' : 'hours';
    return isPast ? `${diffHours} ${unit} ${suffix}` : `${prefix}${diffHours} ${unit}`;
  } else if (diffDays < 7) {
    const unit = diffDays === 1 ? 'day' : 'days';
    return isPast ? `${diffDays} ${unit} ${suffix}` : `${prefix}${diffDays} ${unit}`;
  } else if (diffWeeks < 4) {
    const unit = diffWeeks === 1 ? 'week' : 'weeks';
    return isPast ? `${diffWeeks} ${unit} ${suffix}` : `${prefix}${diffWeeks} ${unit}`;
  } else if (diffMonths < 12) {
    const unit = diffMonths === 1 ? 'month' : 'months';
    return isPast ? `${diffMonths} ${unit} ${suffix}` : `${prefix}${diffMonths} ${unit}`;
  } else {
    const unit = diffYears === 1 ? 'year' : 'years';
    return isPast ? `${diffYears} ${unit} ${suffix}` : `${prefix}${diffYears} ${unit}`;
  }
}
