/**
 * Authenticated API client with retry logic and error handling
 */

import { ApiError } from '../types/api';

/**
 * Configuration for API client
 */
interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<ApiClientConfig> = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second base delay
};

/**
 * Custom error class for API errors
 */
export class ApiRequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public field?: string,
    public details?: Record<string, unknown>,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }

  /**
   * Create ApiRequestError from ApiError response
   */
  static fromApiError(error: ApiError, statusCode?: number): ApiRequestError {
    return new ApiRequestError(
      error.code,
      error.message,
      error.field,
      error.details,
      statusCode
    );
  }
}

/**
 * Get authentication token from storage or session
 */
function getAuthToken(): string | null {
  // TODO: Implement actual token retrieval logic
  // This could be from localStorage, sessionStorage, or a cookie
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Get CSRF token for request protection
 */
function getCsrfToken(): string | null {
  // TODO: Implement actual CSRF token retrieval
  if (typeof window !== 'undefined') {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
  }
  return null;
}

/**
 * Check if error is retryable (network or server errors)
 */
function isRetryableError(_error: unknown, statusCode?: number): boolean {
  // Network errors (no response)
  if (!statusCode) {
    return true;
  }
  
  // Server errors (5xx)
  if (statusCode >= 500 && statusCode < 600) {
    return true;
  }
  
  // Rate limiting (429)
  if (statusCode === 429) {
    return true;
  }
  
  return false;
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(attempt: number, baseDelay: number): number {
  // Exponential backoff: baseDelay * 2^attempt with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // Add up to 30% jitter
  return exponentialDelay + jitter;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Authenticated API client
 */
export class ApiClient {
  private config: Required<ApiClientConfig>;

  constructor(config?: Partial<ApiClientConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Build headers for API request
   */
  private buildHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const authToken = getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
  }

  /**
   * Make HTTP request with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiRequestError(
          'TIMEOUT',
          `Request timeout after ${this.config.timeout}ms`,
          undefined,
          undefined,
          408
        );
      }
      throw error;
    }
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(response: Response): Promise<ApiRequestError> {
    try {
      const errorData: ApiError = await response.json();
      return ApiRequestError.fromApiError(errorData, response.status);
    } catch {
      // If response is not JSON, create generic error
      return new ApiRequestError(
        'HTTP_ERROR',
        `HTTP ${response.status}: ${response.statusText}`,
        undefined,
        undefined,
        response.status
      );
    }
  }

  /**
   * Make API request with retry logic
   */
  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit,
    attempt: number = 0
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;

    try {
      const response = await this.fetchWithTimeout(url, options);

      // Success response
      if (response.ok) {
        return await response.json();
      }

      // Parse error response
      const error = await this.parseErrorResponse(response);

      // Check if we should retry
      if (
        isRetryableError(error, response.status) &&
        attempt < this.config.maxRetries
      ) {
        const delay = calculateBackoffDelay(attempt, this.config.retryDelay);
        await sleep(delay);
        return this.requestWithRetry<T>(endpoint, options, attempt + 1);
      }

      // No retry, throw error
      throw error;
    } catch (error) {
      // Network error or timeout
      if (error instanceof ApiRequestError) {
        // Already an ApiRequestError, check if retryable
        if (
          isRetryableError(error, error.statusCode) &&
          attempt < this.config.maxRetries
        ) {
          const delay = calculateBackoffDelay(attempt, this.config.retryDelay);
          await sleep(delay);
          return this.requestWithRetry<T>(endpoint, options, attempt + 1);
        }
        throw error;
      }

      // Unknown error (network failure)
      if (attempt < this.config.maxRetries) {
        const delay = calculateBackoffDelay(attempt, this.config.retryDelay);
        await sleep(delay);
        return this.requestWithRetry<T>(endpoint, options, attempt + 1);
      }

      // Max retries exceeded
      throw new ApiRequestError(
        'NETWORK_ERROR',
        error instanceof Error ? error.message : 'Network request failed',
        undefined,
        { originalError: error }
      );
    }
  }

  /**
   * Make GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'GET',
      headers: this.buildHeaders(),
    });
  }

  /**
   * Make POST request
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(data),
    });
  }

  /**
   * Make PUT request
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(data),
    });
  }

  /**
   * Make DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'DELETE',
      headers: this.buildHeaders(),
    });
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient();
