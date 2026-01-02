/**
 * Form submission API functions
 */

import { apiClient, ApiClient, ApiRequestError } from './client';
import { FormSubmission } from '../types/forms';

/**
 * Response from form submission
 */
export interface FormSubmissionResponse {
  /** Submission ID returned by server */
  submissionId: string;
  
  /** Status of submission */
  status: 'success' | 'pending' | 'failed';
  
  /** Optional message from server */
  message?: string;
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Options for form submission
 */
export interface SubmitFormOptions {
  /** Custom API client instance */
  client?: ApiClient;
  
  /** Custom endpoint (overrides default) */
  endpoint?: string;
  
  /** Additional metadata to include */
  metadata?: Record<string, unknown>;
}

/**
 * Submit a form to the API
 * 
 * @param submission - The form submission data
 * @param options - Optional configuration
 * @returns Promise resolving to submission response
 * @throws ApiRequestError on failure
 * 
 * @example
 * ```typescript
 * const submission: FormSubmission<BuyBackFormData> = {
 *   submissionId: generateUUID(),
 *   formType: 'buy-back',
 *   formVersion: '1.0.0',
 *   submittedAt: new Date().toISOString(),
 *   data: formData,
 *   versionNumber: 1,
 * };
 * 
 * try {
 *   const response = await submitForm(submission);
 *   console.log('Submitted:', response.submissionId);
 * } catch (error) {
 *   if (error instanceof ApiRequestError) {
 *     console.error('Submission failed:', error.message);
 *   }
 * }
 * ```
 */
export async function submitForm<T = Record<string, unknown>>(
  submission: FormSubmission<T>,
  options: SubmitFormOptions = {}
): Promise<FormSubmissionResponse> {
  const client = options.client || apiClient;
  const endpoint = options.endpoint || '/forms/submit';

  // Prepare submission payload
  const payload = {
    ...submission,
    metadata: {
      ...submission.data,
      ...options.metadata,
    },
  };

  try {
    const response = await client.post<FormSubmissionResponse>(endpoint, payload);
    return response;
  } catch (error) {
    // Re-throw ApiRequestError as-is
    if (error instanceof ApiRequestError) {
      throw error;
    }

    // Wrap unknown errors
    throw new ApiRequestError(
      'SUBMISSION_ERROR',
      error instanceof Error ? error.message : 'Form submission failed',
      undefined,
      { originalError: error }
    );
  }
}

/**
 * Update an existing form submission
 * 
 * @param submission - The updated form submission data
 * @param options - Optional configuration
 * @returns Promise resolving to submission response
 * @throws ApiRequestError on failure
 */
export async function updateFormSubmission<T = Record<string, unknown>>(
  submission: FormSubmission<T>,
  options: SubmitFormOptions = {}
): Promise<FormSubmissionResponse> {
  const client = options.client || apiClient;
  const endpoint = options.endpoint || `/forms/${submission.submissionId}`;

  // Ensure this is an update (has previousVersion)
  if (!submission.previousVersion) {
    throw new ApiRequestError(
      'INVALID_UPDATE',
      'Update requires previousVersion to be set',
      'previousVersion'
    );
  }

  const payload = {
    ...submission,
    metadata: options.metadata,
  };

  try {
    const response = await client.put<FormSubmissionResponse>(endpoint, payload);
    return response;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    throw new ApiRequestError(
      'UPDATE_ERROR',
      error instanceof Error ? error.message : 'Form update failed',
      undefined,
      { originalError: error }
    );
  }
}

/**
 * Retrieve a form submission by ID
 * 
 * @param submissionId - The submission ID to retrieve
 * @param options - Optional configuration
 * @returns Promise resolving to form submission
 * @throws ApiRequestError on failure
 */
export async function getFormSubmission<T = Record<string, unknown>>(
  submissionId: string,
  options: Pick<SubmitFormOptions, 'client' | 'endpoint'> = {}
): Promise<FormSubmission<T>> {
  const client = options.client || apiClient;
  const endpoint = options.endpoint || `/forms/${submissionId}`;

  try {
    const response = await client.get<FormSubmission<T>>(endpoint);
    return response;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    throw new ApiRequestError(
      'RETRIEVAL_ERROR',
      error instanceof Error ? error.message : 'Form retrieval failed',
      undefined,
      { originalError: error }
    );
  }
}

/**
 * Delete a form submission
 * 
 * @param submissionId - The submission ID to delete
 * @param options - Optional configuration
 * @returns Promise resolving when deletion is complete
 * @throws ApiRequestError on failure
 */
export async function deleteFormSubmission(
  submissionId: string,
  options: Pick<SubmitFormOptions, 'client' | 'endpoint'> = {}
): Promise<void> {
  const client = options.client || apiClient;
  const endpoint = options.endpoint || `/forms/${submissionId}`;

  try {
    await client.delete<void>(endpoint);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    throw new ApiRequestError(
      'DELETION_ERROR',
      error instanceof Error ? error.message : 'Form deletion failed',
      undefined,
      { originalError: error }
    );
  }
}

/**
 * List form submissions with optional filtering
 * 
 * @param filters - Optional filters for the query
 * @param options - Optional configuration
 * @returns Promise resolving to array of submissions
 * @throws ApiRequestError on failure
 */
export async function listFormSubmissions<T = Record<string, unknown>>(
  filters?: {
    formType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  },
  options: Pick<SubmitFormOptions, 'client' | 'endpoint'> = {}
): Promise<FormSubmission<T>[]> {
  const client = options.client || apiClient;
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (filters?.formType) queryParams.append('formType', filters.formType);
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.offset) queryParams.append('offset', filters.offset.toString());
  
  const queryString = queryParams.toString();
  const endpoint = options.endpoint || `/forms${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await client.get<FormSubmission<T>[]>(endpoint);
    return response;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    throw new ApiRequestError(
      'LIST_ERROR',
      error instanceof Error ? error.message : 'Form listing failed',
      undefined,
      { originalError: error }
    );
  }
}
