/**
 * Local storage utilities for form draft persistence
 * 
 * Provides functions to save, restore, and clear form drafts with
 * auto-save debouncing and error handling for storage quota issues.
 */

import { StoredFormDraft } from '../types/forms';

/**
 * Storage key prefix for form drafts
 */
const STORAGE_KEY_PREFIX = 'form-draft-';

/**
 * Error thrown when storage quota is exceeded
 */
export class StorageQuotaExceededError extends Error {
  constructor(message: string = 'Storage quota exceeded') {
    super(message);
    this.name = 'StorageQuotaExceededError';
  }
}

/**
 * Generates the storage key for a specific form type
 */
const getStorageKey = (formType: string): string => {
  return `${STORAGE_KEY_PREFIX}${formType}`;
};

/**
 * Checks if localStorage is available in the current environment
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Saves a form draft to local storage
 * 
 * @param formType - The type of form being saved
 * @param data - Partial form data to save
 * @param version - Optional version number (defaults to 1)
 * @throws {StorageQuotaExceededError} When storage quota is exceeded
 * @throws {Error} When localStorage is not available
 */
export const saveFormDraft = (
  formType: string,
  data: Record<string, unknown>,
  version: number = 1
): void => {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available');
  }

  const draft: StoredFormDraft = {
    formType,
    lastSaved: new Date().toISOString(),
    data,
    version,
  };

  const key = getStorageKey(formType);

  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (error) {
    // Check if it's a quota exceeded error
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      throw new StorageQuotaExceededError(
        'Unable to save form draft: storage quota exceeded. Please clear some browser data and try again.'
      );
    }
    throw error;
  }
};

/**
 * Restores a form draft from local storage
 * 
 * @param formType - The type of form to restore
 * @returns The stored form draft, or null if not found
 * @throws {Error} When localStorage is not available or data is corrupted
 */
export const restoreFormDraft = (formType: string): StoredFormDraft | null => {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available');
  }

  const key = getStorageKey(formType);

  try {
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return null;
    }

    const draft = JSON.parse(stored) as StoredFormDraft;
    
    // Validate the structure
    if (
      !draft.formType ||
      !draft.lastSaved ||
      !draft.data ||
      typeof draft.version !== 'number'
    ) {
      console.warn('Invalid draft structure found, clearing corrupted data');
      clearFormDraft(formType);
      return null;
    }

    return draft;
  } catch (error) {
    console.error('Error restoring form draft:', error);
    // Clear corrupted data
    clearFormDraft(formType);
    return null;
  }
};

/**
 * Clears a form draft from local storage
 * 
 * @param formType - The type of form to clear
 */
export const clearFormDraft = (formType: string): void => {
  if (!isLocalStorageAvailable()) {
    return;
  }

  const key = getStorageKey(formType);
  localStorage.removeItem(key);
};

/**
 * Checks if a draft exists for a specific form type
 * 
 * @param formType - The type of form to check
 * @returns True if a draft exists, false otherwise
 */
export const hasDraft = (formType: string): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  const key = getStorageKey(formType);
  return localStorage.getItem(key) !== null;
};

/**
 * Gets all form drafts from local storage
 * 
 * @returns Array of all stored form drafts
 */
export const getAllDrafts = (): StoredFormDraft[] => {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  const drafts: StoredFormDraft[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      const formType = key.replace(STORAGE_KEY_PREFIX, '');
      const draft = restoreFormDraft(formType);
      
      if (draft) {
        drafts.push(draft);
      }
    }
  }

  return drafts;
};

/**
 * Clears all form drafts from local storage
 */
export const clearAllDrafts = (): void => {
  if (!isLocalStorageAvailable()) {
    return;
  }

  const keys: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      keys.push(key);
    }
  }

  keys.forEach(key => localStorage.removeItem(key));
};

/**
 * Creates a debounced version of the saveFormDraft function
 * 
 * @param delay - Delay in milliseconds (default: 1000ms)
 * @returns Debounced save function and a cancel function
 */
export const createDebouncedSave = (delay: number = 1000) => {
  let timeoutId: NodeJS.Timeout | null = null;

  const debouncedSave = (
    formType: string,
    data: Record<string, unknown>,
    version?: number
  ): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      try {
        saveFormDraft(formType, data, version);
      } catch (error) {
        console.error('Error saving form draft:', error);
        // You might want to emit an event or call a callback here
        // to notify the UI about the error
      }
      timeoutId = null;
    }, delay);
  };

  const cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { debouncedSave, cancel };
};

/**
 * Hook-friendly debounced save function factory
 * Returns a function that can be used in React components
 * 
 * @param formType - The type of form
 * @param delay - Delay in milliseconds (default: 1000ms)
 * @returns Object with save and cancel functions
 */
export const useDebouncedFormSave = (formType: string, delay: number = 1000) => {
  const { debouncedSave, cancel } = createDebouncedSave(delay);

  const save = (data: Record<string, unknown>, version?: number) => {
    debouncedSave(formType, data, version);
  };

  return { save, cancel };
};
