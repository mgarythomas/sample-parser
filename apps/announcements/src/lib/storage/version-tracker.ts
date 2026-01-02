/**
 * Version tracking system for form submissions
 * 
 * Provides functions to manage form versions, calculate deltas between versions,
 * and maintain version history for audit trails.
 */

import { FormDelta } from '../types/forms';

/**
 * Represents a stored version of form data
 */
export interface FormVersion<T = Record<string, unknown>> {
  /** Unique version identifier */
  versionId: string;
  
  /** Version number (incremental) */
  versionNumber: number;
  
  /** ISO 8601 timestamp when this version was created */
  timestamp: string;
  
  /** User identifier who created this version (optional) */
  userId?: string;
  
  /** Complete form data at this version */
  data: T;
  
  /** Delta from previous version (undefined for version 1) */
  delta?: FormDelta;
  
  /** Reference to previous version ID */
  previousVersionId?: string;
}

/**
 * Version history for a form
 */
export interface FormVersionHistory<T = Record<string, unknown>> {
  /** Form type identifier */
  formType: string;
  
  /** Current version number */
  currentVersion: number;
  
  /** All versions in chronological order */
  versions: FormVersion<T>[];
}

/**
 * Storage key prefix for version history
 */
const VERSION_HISTORY_KEY_PREFIX = 'form-version-history-';

/**
 * Generates the storage key for version history
 */
const getVersionHistoryKey = (formType: string, formId: string): string => {
  return `${VERSION_HISTORY_KEY_PREFIX}${formType}-${formId}`;
};

/**
 * Checks if localStorage is available
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
 * Generates a simple unique ID (UUID v4 alternative)
 */
const generateVersionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Deep comparison to check if two values are equal
 */
const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => deepEqual(objA[key], objB[key]));
};

/**
 * Calculates the delta (differences) between two form versions
 * 
 * @param previous - Previous version of form data
 * @param current - Current version of form data
 * @returns FormDelta object with added, modified, and removed fields
 */
export const calculateDelta = (
  previous: Record<string, unknown>,
  current: Record<string, unknown>
): FormDelta => {
  const delta: FormDelta = {
    added: {},
    modified: {},
    removed: {},
  };

  // Find added and modified fields
  for (const key in current) {
    if (!(key in previous)) {
      // Field was added
      delta.added[key] = current[key];
    } else if (!deepEqual(previous[key], current[key])) {
      // Field was modified
      delta.modified[key] = {
        old: previous[key],
        new: current[key],
      };
    }
  }

  // Find removed fields
  for (const key in previous) {
    if (!(key in current)) {
      delta.removed[key] = previous[key];
    }
  }

  return delta;
};

/**
 * Creates a new version entry for form data
 * 
 * @param formType - Type of form
 * @param formId - Unique identifier for the form instance
 * @param data - Current form data
 * @param userId - Optional user identifier
 * @returns The created FormVersion
 */
export const createVersion = <T = Record<string, unknown>>(
  formType: string,
  formId: string,
  data: T,
  userId?: string
): FormVersion<T> => {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available');
  }

  const history = getVersionHistory<T>(formType, formId);
  const previousVersion = history.versions[history.versions.length - 1];
  
  const versionNumber = history.currentVersion + 1;
  const versionId = generateVersionId();
  
  const newVersion: FormVersion<T> = {
    versionId,
    versionNumber,
    timestamp: new Date().toISOString(),
    userId,
    data,
  };

  // Calculate delta if there's a previous version
  if (previousVersion) {
    newVersion.delta = calculateDelta(
      previousVersion.data as Record<string, unknown>,
      data as Record<string, unknown>
    );
    newVersion.previousVersionId = previousVersion.versionId;
  }

  // Update history
  history.versions.push(newVersion);
  history.currentVersion = versionNumber;

  // Save to storage
  saveVersionHistory(formType, formId, history);

  return newVersion;
};

/**
 * Retrieves the version history for a form
 * 
 * @param formType - Type of form
 * @param formId - Unique identifier for the form instance
 * @returns FormVersionHistory object
 */
export const getVersionHistory = <T = Record<string, unknown>>(
  formType: string,
  formId: string
): FormVersionHistory<T> => {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available');
  }

  const key = getVersionHistoryKey(formType, formId);
  const stored = localStorage.getItem(key);

  if (!stored) {
    // Return empty history
    return {
      formType,
      currentVersion: 0,
      versions: [],
    };
  }

  try {
    const history = JSON.parse(stored) as FormVersionHistory<T>;
    return history;
  } catch (error) {
    console.error('Error parsing version history:', error);
    // Return empty history if corrupted
    return {
      formType,
      currentVersion: 0,
      versions: [],
    };
  }
};

/**
 * Saves version history to local storage
 * 
 * @param formType - Type of form
 * @param formId - Unique identifier for the form instance
 * @param history - Version history to save
 */
export const saveVersionHistory = <T = Record<string, unknown>>(
  formType: string,
  formId: string,
  history: FormVersionHistory<T>
): void => {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available');
  }

  const key = getVersionHistoryKey(formType, formId);
  
  try {
    localStorage.setItem(key, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving version history:', error);
    throw error;
  }
};

/**
 * Retrieves a specific version by version number
 * 
 * @param formType - Type of form
 * @param formId - Unique identifier for the form instance
 * @param versionNumber - Version number to retrieve
 * @returns The FormVersion or undefined if not found
 */
export const getVersion = <T = Record<string, unknown>>(
  formType: string,
  formId: string,
  versionNumber: number
): FormVersion<T> | undefined => {
  const history = getVersionHistory<T>(formType, formId);
  return history.versions.find(v => v.versionNumber === versionNumber);
};

/**
 * Retrieves the latest version
 * 
 * @param formType - Type of form
 * @param formId - Unique identifier for the form instance
 * @returns The latest FormVersion or undefined if no versions exist
 */
export const getLatestVersion = <T = Record<string, unknown>>(
  formType: string,
  formId: string
): FormVersion<T> | undefined => {
  const history = getVersionHistory<T>(formType, formId);
  return history.versions[history.versions.length - 1];
};

/**
 * Clears all version history for a form
 * 
 * @param formType - Type of form
 * @param formId - Unique identifier for the form instance
 */
export const clearVersionHistory = (formType: string, formId: string): void => {
  if (!isLocalStorageAvailable()) {
    return;
  }

  const key = getVersionHistoryKey(formType, formId);
  localStorage.removeItem(key);
};

/**
 * Gets all version histories from local storage
 * 
 * @returns Array of all stored version histories
 */
export const getAllVersionHistories = (): FormVersionHistory[] => {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  const histories: FormVersionHistory[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith(VERSION_HISTORY_KEY_PREFIX)) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const history = JSON.parse(stored) as FormVersionHistory;
          histories.push(history);
        }
      } catch (error) {
        console.error(`Error parsing version history for key ${key}:`, error);
      }
    }
  }

  return histories;
};

/**
 * Compares two versions and returns the delta
 * 
 * @param formType - Type of form
 * @param formId - Unique identifier for the form instance
 * @param fromVersion - Starting version number
 * @param toVersion - Ending version number
 * @returns FormDelta between the two versions, or undefined if versions not found
 */
export const compareVersions = (
  formType: string,
  formId: string,
  fromVersion: number,
  toVersion: number
): FormDelta | undefined => {
  const from = getVersion(formType, formId, fromVersion);
  const to = getVersion(formType, formId, toVersion);

  if (!from || !to) {
    return undefined;
  }

  return calculateDelta(
    from.data as Record<string, unknown>,
    to.data as Record<string, unknown>
  );
};
