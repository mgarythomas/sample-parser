/**
 * Core form type definitions for the announcement forms system
 */

/**
 * Represents a delta (difference) between two form versions
 */
export interface FormDelta {
  added: Record<string, unknown>;
  modified: Record<string, { old: unknown; new: unknown }>;
  removed: Record<string, unknown>;
}

/**
 * Represents a complete form submission with metadata
 */
export interface FormSubmission<T = Record<string, unknown>> {
  /** Unique identifier for this submission (UUID) */
  submissionId: string;
  
  /** Type of form being submitted (e.g., 'buy-back', 'appendix-3a') */
  formType: string;
  
  /** Schema version for backward compatibility (e.g., '1.0.0') */
  formVersion: string;
  
  /** ISO 8601 timestamp of submission */
  submittedAt: string;
  
  /** The validated form data */
  data: T;
  
  /** Reference to previous submission ID if this is an update */
  previousVersion?: string;
  
  /** Incremental version number */
  versionNumber: number;
  
  /** Changes from previous version (if applicable) */
  delta?: FormDelta;
}

/**
 * Represents a form draft stored in local storage
 */
export interface StoredFormDraft {
  /** Type of form (e.g., 'buy-back') */
  formType: string;
  
  /** ISO 8601 timestamp of last save */
  lastSaved: string;
  
  /** Partial form data (may be incomplete) */
  data: Record<string, unknown>;
  
  /** Draft version number */
  version: number;
}
