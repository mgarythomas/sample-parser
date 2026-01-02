# @repo/shared-utils

Shared utility functions and helpers used across the monorepo.

## Purpose

This package provides common utility functions that can be reused across all micro frontends and shared packages. It includes utilities for date formatting, string manipulation, API calls, storage, and more.

## Features

- ✅ Date formatting and parsing utilities
- ✅ String validation and transformation
- ✅ API fetch utilities with authentication
- ✅ Local storage helpers
- ✅ Fully tested with Vitest
- ✅ Type-safe TypeScript implementations

## Installation

This package is automatically available in the monorepo:

```typescript
import { formatDate, isValidEmail, fetchWithAuth } from '@repo/shared-utils';
```

## Available Utilities

### Date Utilities

#### `formatDate(date: Date, format?: string): string`

Format a date object into a string.

```typescript
import { formatDate } from '@repo/shared-utils';

const date = new Date('2024-01-15');
const formatted = formatDate(date, 'YYYY-MM-DD'); // "2024-01-15"
const readable = formatDate(date, 'MMM DD, YYYY'); // "Jan 15, 2024"
```

#### `getRelativeTime(date: Date): string`

Get a human-readable relative time string.

```typescript
import { getRelativeTime } from '@repo/shared-utils';

const date = new Date(Date.now() - 3600000); // 1 hour ago
const relative = getRelativeTime(date); // "1 hour ago"
```

#### `parseDate(dateString: string): Date | null`

Parse a date string into a Date object.

```typescript
import { parseDate } from '@repo/shared-utils';

const date = parseDate('2024-01-15'); // Date object
const invalid = parseDate('invalid'); // null
```

### String Utilities

#### `isValidEmail(email: string): boolean`

Validate an email address.

```typescript
import { isValidEmail } from '@repo/shared-utils';

isValidEmail('user@example.com'); // true
isValidEmail('invalid-email'); // false
```

#### `sanitizeInput(input: string): string`

Sanitize user input by removing potentially dangerous characters.

```typescript
import { sanitizeInput } from '@repo/shared-utils';

const clean = sanitizeInput('<script>alert("xss")</script>');
// Returns sanitized string
```

#### `truncate(text: string, maxLength: number): string`

Truncate text to a maximum length.

```typescript
import { truncate } from '@repo/shared-utils';

const text = 'This is a very long text';
const short = truncate(text, 10); // "This is a..."
```

#### `capitalize(text: string): string`

Capitalize the first letter of a string.

```typescript
import { capitalize } from '@repo/shared-utils';

capitalize('hello world'); // "Hello world"
```

#### `slugify(text: string): string`

Convert text to a URL-friendly slug.

```typescript
import { slugify } from '@repo/shared-utils';

slugify('Hello World!'); // "hello-world"
```

### API Utilities

#### `fetchWithAuth<T>(url: string, options?: RequestInit): Promise<T>`

Fetch data with automatic authentication header injection.

```typescript
import { fetchWithAuth } from '@repo/shared-utils';
import { User } from '@repo/shared-types';

const user = await fetchWithAuth<User>('/api/user/123');
```

#### `handleApiError(error: unknown): ApiError`

Standardize API error handling.

```typescript
import { handleApiError } from '@repo/shared-utils';

try {
  await fetchWithAuth('/api/data');
} catch (error) {
  const apiError = handleApiError(error);
  console.error(apiError.message);
}
```

### Storage Utilities

#### `setItem(key: string, value: unknown): void`

Store data in localStorage with JSON serialization.

```typescript
import { setItem } from '@repo/shared-utils';

setItem('user', { id: '123', name: 'John' });
```

#### `getItem<T>(key: string): T | null`

Retrieve and parse data from localStorage.

```typescript
import { getItem } from '@repo/shared-utils';
import { User } from '@repo/shared-types';

const user = getItem<User>('user');
```

#### `removeItem(key: string): void`

Remove an item from localStorage.

```typescript
import { removeItem } from '@repo/shared-utils';

removeItem('user');
```

#### `clear(): void`

Clear all items from localStorage.

```typescript
import { clear } from '@repo/shared-utils';

clear();
```

## Adding New Utilities

1. Create a new file in the appropriate directory:
   - `src/date/` for date utilities
   - `src/string/` for string utilities
   - `src/api/` for API utilities
   - `src/storage/` for storage utilities

2. Implement your utility:

```typescript
// src/string/case-convert.ts
export function toKebabCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function toCamelCase(text: string): string {
  return text.toLowerCase().replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''));
}
```

3. Export from the category index:

```typescript
// src/string/index.ts
export * from './validation';
export * from './transform';
export * from './case-convert';
```

4. Write tests:

```typescript
// src/__tests__/case-convert.test.ts
import { describe, it, expect } from 'vitest';
import { toKebabCase, toCamelCase } from '../string/case-convert';

describe('toKebabCase', () => {
  it('should convert text to kebab case', () => {
    expect(toKebabCase('Hello World')).toBe('hello-world');
  });
});
```

5. The utilities are now available:

```typescript
import { toKebabCase, toCamelCase } from '@repo/shared-utils';
```

## Development

### Run Tests

```bash
pnpm test
```

### Watch Mode

```bash
pnpm test:watch
```

### Build

```bash
pnpm build
```

## Best Practices

### Keep Functions Pure

```typescript
// ✅ Good - Pure function
export function formatDate(date: Date): string {
  return date.toISOString();
}

// ❌ Avoid - Side effects
let lastDate: Date;
export function formatDate(date: Date): string {
  lastDate = date; // Side effect
  return date.toISOString();
}
```

### Handle Edge Cases

```typescript
// ✅ Good - Handles null/undefined
export function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toISOString();
}

// ❌ Avoid - Will crash on null
export function formatDate(date: Date): string {
  return date.toISOString();
}
```

### Document Complex Functions

```typescript
/**
 * Formats a date according to the specified format string
 * @param date - The date to format
 * @param format - Format string (e.g., 'YYYY-MM-DD')
 * @returns Formatted date string
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD') // "2024-01-15"
 */
export function formatDate(date: Date, format: string): string {
  // implementation
}
```

### Write Tests

Every utility function should have corresponding tests covering:

- Happy path
- Edge cases
- Error conditions

## Dependencies

- No runtime dependencies (utilities are self-contained)
- `vitest` for testing
- `@repo/shared-types` for type definitions
