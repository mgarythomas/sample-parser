/**
 * API-related type definitions
 */

/**
 * Represents an error response from the API
 */
export interface ApiError {
  /** Error code for programmatic handling */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Optional field name for field-specific errors */
  field?: string;
  
  /** Additional error details */
  details?: Record<string, unknown>;
}
