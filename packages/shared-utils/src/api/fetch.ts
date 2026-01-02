/**
 * Fetch with authentication headers
 */
export async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get authentication token from storage
 * This is a placeholder - actual implementation would depend on auth strategy
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('auth_token');
}

/**
 * Set authentication token in storage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('auth_token', token);
}

/**
 * Remove authentication token from storage
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('auth_token');
}
