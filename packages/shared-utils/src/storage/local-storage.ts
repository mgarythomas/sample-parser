/**
 * Safely get an item from localStorage with JSON parsing
 */
export function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

/**
 * Safely set an item in localStorage with JSON stringification
 */
export function setItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove an item from localStorage
 */
export function removeItem(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all items from localStorage
 */
export function clear(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.clear();
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a key exists in localStorage
 */
export function hasItem(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem(key) !== null;
}
