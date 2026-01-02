/**
 * Form helper utilities
 * 
 * Provides utility functions for form handling including:
 * - UUID generation for submission IDs
 * - Date formatting utilities
 * - Form data transformation helpers
 */

import type { FormSubmission } from '../types/forms';

/**
 * Generate a UUID v4 for submission IDs
 * Uses crypto.randomUUID() when available, falls back to a polyfill
 * 
 * @returns A UUID v4 string
 */
export function generateUUID(): string {
  // Use native crypto.randomUUID if available (modern browsers and Node 19+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format a Date object to ISO 8601 string
 * 
 * @param date - The date to format
 * @returns ISO 8601 formatted string (e.g., "2024-10-20T14:30:00.000Z")
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString();
}

/**
 * Format a Date object to a human-readable date string
 * 
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: 'en-AU')
 * @returns Formatted date string (e.g., "20 October 2025")
 */
export function formatDateToDisplay(date: Date, locale: string = 'en-AU'): string {
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format a Date object to a short date string
 * 
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: 'en-AU')
 * @returns Short formatted date string (e.g., "20/10/2025")
 */
export function formatDateToShort(date: Date, locale: string = 'en-AU'): string {
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Parse an ISO 8601 date string to a Date object
 * 
 * @param isoString - ISO 8601 formatted date string
 * @returns Date object or null if invalid
 */
export function parseISODate(isoString: string): Date | null {
  try {
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Create a form submission document with metadata
 * 
 * @param formType - Type of form (e.g., 'buy-back')
 * @param formVersion - Schema version (e.g., '1.0.0')
 * @param data - The validated form data
 * @param options - Optional parameters for version tracking
 * @returns Complete form submission document
 */
export function createFormSubmission<T>(
  formType: string,
  formVersion: string,
  data: T,
  options?: {
    previousVersion?: string;
    versionNumber?: number;
    delta?: FormSubmission['delta'];
  }
): FormSubmission<T> {
  return {
    submissionId: generateUUID(),
    formType,
    formVersion,
    submittedAt: formatDateToISO(new Date()),
    data,
    versionNumber: options?.versionNumber ?? 1,
    ...(options?.previousVersion && { previousVersion: options.previousVersion }),
    ...(options?.delta && { delta: options.delta }),
  };
}

/**
 * Transform form data by converting Date objects to ISO strings
 * This is useful for preparing data for JSON serialization
 * 
 * @param data - Form data that may contain Date objects
 * @returns Transformed data with dates as ISO strings
 */
export function transformDatesForSubmission(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle Date objects
  if (data instanceof Date) {
    return formatDateToISO(data);
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => transformDatesForSubmission(item));
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const transformed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      transformed[key] = transformDatesForSubmission(value);
    }
    return transformed;
  }
  
  // Return primitive values as-is
  return data;
}

/**
 * Transform form data by converting ISO date strings to Date objects
 * This is useful for restoring form data from storage
 * 
 * @param data - Form data that may contain ISO date strings
 * @param dateFields - Array of field paths that should be converted to dates
 * @returns Transformed data with Date objects
 */
export function transformDatesFromStorage(
  data: unknown,
  dateFields: string[] = []
): unknown {
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => transformDatesFromStorage(item, dateFields));
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const transformed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Check if this field should be converted to a Date
      const shouldConvertToDate = dateFields.some(field => {
        // Support nested field paths like 'compliance.signatureDate'
        const fieldParts = field.split('.');
        return fieldParts[fieldParts.length - 1] === key;
      });
      
      if (shouldConvertToDate && typeof value === 'string') {
        const date = parseISODate(value);
        transformed[key] = date ?? value;
      } else {
        transformed[key] = transformDatesFromStorage(value, dateFields);
      }
    }
    return transformed;
  }
  
  // Return primitive values as-is
  return data;
}

/**
 * Remove undefined and null values from an object
 * Useful for cleaning up form data before submission
 * 
 * @param obj - Object to clean
 * @param removeNull - Whether to also remove null values (default: false)
 * @returns Cleaned object
 */
export function removeEmptyFields(
  obj: Record<string, unknown>,
  removeNull: boolean = false
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip undefined values
    if (value === undefined) {
      continue;
    }
    
    // Skip null values if requested
    if (removeNull && value === null) {
      continue;
    }
    
    // Recursively clean nested objects
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      const cleanedNested = removeEmptyFields(value as Record<string, unknown>, removeNull);
      if (Object.keys(cleanedNested).length > 0) {
        cleaned[key] = cleanedNested;
      }
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

/**
 * Deep clone an object
 * Useful for creating independent copies of form data
 * 
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  const cloned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    cloned[key] = deepClone(value);
  }
  
  return cloned as T;
}

/**
 * Check if two values are deeply equal
 * Useful for comparing form data versions
 * 
 * @param a - First value
 * @param b - Second value
 * @returns True if values are deeply equal
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  // Handle primitive types and null
  if (a === b) {
    return true;
  }
  
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  
  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  
  // Handle objects
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  return keysA.every(key => deepEqual(objA[key], objB[key]));
}
