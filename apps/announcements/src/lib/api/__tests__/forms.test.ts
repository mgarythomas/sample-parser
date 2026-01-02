/**
 * Tests for form submission functions
 */

import {
  submitForm,
  updateFormSubmission,
  getFormSubmission,
  deleteFormSubmission,
  listFormSubmissions,
} from '../forms';
import { ApiClient, ApiRequestError } from '../client';
import { FormSubmission } from '../../types/forms';

describe('Form submission functions', () => {
  let mockClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any;
  });

  describe('submitForm', () => {
    it('should submit form successfully', async () => {
      const submission: FormSubmission = {
        submissionId: 'test-123',
        formType: 'buy-back',
        formVersion: '1.0.0',
        submittedAt: '2025-10-19T10:00:00Z',
        data: { entityName: 'Test Corp' },
        versionNumber: 1,
      };

      const mockResponse = {
        submissionId: 'test-123',
        status: 'success' as const,
        message: 'Form submitted successfully',
      };

      mockClient.post.mockResolvedValueOnce(mockResponse);

      const result = await submitForm(submission, { client: mockClient });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/forms/submit',
        expect.objectContaining({
          submissionId: 'test-123',
          formType: 'buy-back',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should use custom endpoint when provided', async () => {
      const submission: FormSubmission = {
        submissionId: 'test-123',
        formType: 'buy-back',
        formVersion: '1.0.0',
        submittedAt: '2025-10-19T10:00:00Z',
        data: {},
        versionNumber: 1,
      };

      mockClient.post.mockResolvedValueOnce({
        submissionId: 'test-123',
        status: 'success' as const,
      });

      await submitForm(submission, {
        client: mockClient,
        endpoint: '/custom/endpoint',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/custom/endpoint',
        expect.any(Object)
      );
    });

    it('should include additional metadata when provided', async () => {
      const submission: FormSubmission = {
        submissionId: 'test-123',
        formType: 'buy-back',
        formVersion: '1.0.0',
        submittedAt: '2025-10-19T10:00:00Z',
        data: { entityName: 'Test' },
        versionNumber: 1,
      };

      const metadata = { userId: 'user-456', source: 'web' };

      mockClient.post.mockResolvedValueOnce({
        submissionId: 'test-123',
        status: 'success' as const,
      });

      await submitForm(submission, {
        client: mockClient,
        metadata,
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          metadata: expect.objectContaining(metadata),
        })
      );
    });

    it('should throw ApiRequestError on failure', async () => {
      const submission: FormSubmission = {
        submissionId: 'test-123',
        formType: 'buy-back',
        formVersion: '1.0.0',
        submittedAt: '2025-10-19T10:00:00Z',
        data: {},
        versionNumber: 1,
      };

      const error = new ApiRequestError(
        'VALIDATION_ERROR',
        'Invalid form data',
        'entityName'
      );

      mockClient.post.mockRejectedValueOnce(error);

      await expect(submitForm(submission, { client: mockClient })).rejects.toThrow(
        ApiRequestError
      );
      await expect(submitForm(submission, { client: mockClient })).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        field: 'entityName',
      });
    });

    it('should wrap unknown errors', async () => {
      const submission: FormSubmission = {
        submissionId: 'test-123',
        formType: 'buy-back',
        formVersion: '1.0.0',
        submittedAt: '2025-10-19T10:00:00Z',
        data: {},
        versionNumber: 1,
      };

      mockClient.post.mockRejectedValueOnce(new Error('Unknown error'));

      await expect(submitForm(submission, { client: mockClient })).rejects.toThrow(
        ApiRequestError
      );
      await expect(submitForm(submission, { client: mockClient })).rejects.toMatchObject({
        code: 'SUBMISSION_ERROR',
      });
    });
  });

  describe('updateFormSubmission', () => {
    it('should update form successfully', async () => {
      const submission: FormSubmission = {
        submissionId: 'test-123',
        formType: 'buy-back',
        formVersion: '1.0.0',
        submittedAt: '2025-10-19T10:00:00Z',
        data: { entityName: 'Updated Corp' },
        previousVersion: 'test-122',
        versionNumber: 2,
        delta: {
          added: {},
          modified: { entityName: { old: 'Test Corp', new: 'Updated Corp' } },
          removed: {},
        },
      };

      const mockResponse = {
        submissionId: 'test-123',
        status: 'success' as const,
      };

      mockClient.put.mockResolvedValueOnce(mockResponse);

      const result = await updateFormSubmission(submission, { client: mockClient });

      expect(mockClient.put).toHaveBeenCalledWith(
        '/forms/test-123',
        expect.objectContaining({
          submissionId: 'test-123',
          previousVersion: 'test-122',
          versionNumber: 2,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error if previousVersion is missing', async () => {
      const submission: FormSubmission = {
        submissionId: 'test-123',
        formType: 'buy-back',
        formVersion: '1.0.0',
        submittedAt: '2025-10-19T10:00:00Z',
        data: {},
        versionNumber: 1,
        // Missing previousVersion
      };

      await expect(
        updateFormSubmission(submission, { client: mockClient })
      ).rejects.toThrow(ApiRequestError);
      await expect(
        updateFormSubmission(submission, { client: mockClient })
      ).rejects.toMatchObject({
        code: 'INVALID_UPDATE',
        field: 'previousVersion',
      });
    });

    it('should handle update errors', async () => {
      const submission: FormSubmission = {
        submissionId: 'test-123',
        formType: 'buy-back',
        formVersion: '1.0.0',
        submittedAt: '2025-10-19T10:00:00Z',
        data: {},
        previousVersion: 'test-122',
        versionNumber: 2,
      };

      mockClient.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        updateFormSubmission(submission, { client: mockClient })
      ).rejects.toThrow(ApiRequestError);
      await expect(
        updateFormSubmission(submission, { client: mockClient })
      ).rejects.toMatchObject({
        code: 'UPDATE_ERROR',
      });
    });
  });

  describe('getFormSubmission', () => {
    it('should retrieve form successfully', async () => {
      const mockSubmission: FormSubmission = {
        submissionId: 'test-123',
        formType: 'buy-back',
        formVersion: '1.0.0',
        submittedAt: '2025-10-19T10:00:00Z',
        data: { entityName: 'Test Corp' },
        versionNumber: 1,
      };

      mockClient.get.mockResolvedValueOnce(mockSubmission);

      const result = await getFormSubmission('test-123', { client: mockClient });

      expect(mockClient.get).toHaveBeenCalledWith('/forms/test-123');
      expect(result).toEqual(mockSubmission);
    });

    it('should handle retrieval errors', async () => {
      mockClient.get.mockRejectedValueOnce(
        new ApiRequestError('NOT_FOUND', 'Form not found', undefined, undefined, 404)
      );

      await expect(getFormSubmission('test-123', { client: mockClient })).rejects.toThrow(
        ApiRequestError
      );
      await expect(
        getFormSubmission('test-123', { client: mockClient })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('deleteFormSubmission', () => {
    it('should delete form successfully', async () => {
      mockClient.delete.mockResolvedValueOnce(undefined);

      await deleteFormSubmission('test-123', { client: mockClient });

      expect(mockClient.delete).toHaveBeenCalledWith('/forms/test-123');
    });

    it('should handle deletion errors', async () => {
      mockClient.delete.mockRejectedValueOnce(new Error('Deletion failed'));

      await expect(
        deleteFormSubmission('test-123', { client: mockClient })
      ).rejects.toThrow(ApiRequestError);
      await expect(
        deleteFormSubmission('test-123', { client: mockClient })
      ).rejects.toMatchObject({
        code: 'DELETION_ERROR',
      });
    });
  });

  describe('listFormSubmissions', () => {
    it('should list forms without filters', async () => {
      const mockSubmissions: FormSubmission[] = [
        {
          submissionId: 'test-123',
          formType: 'buy-back',
          formVersion: '1.0.0',
          submittedAt: '2025-10-19T10:00:00Z',
          data: {},
          versionNumber: 1,
        },
        {
          submissionId: 'test-124',
          formType: 'buy-back',
          formVersion: '1.0.0',
          submittedAt: '2025-10-19T11:00:00Z',
          data: {},
          versionNumber: 1,
        },
      ];

      mockClient.get.mockResolvedValueOnce(mockSubmissions);

      const result = await listFormSubmissions(undefined, { client: mockClient });

      expect(mockClient.get).toHaveBeenCalledWith('/forms');
      expect(result).toEqual(mockSubmissions);
    });

    it('should list forms with filters', async () => {
      const mockSubmissions: FormSubmission[] = [];

      mockClient.get.mockResolvedValueOnce(mockSubmissions);

      await listFormSubmissions(
        {
          formType: 'buy-back',
          startDate: '2025-10-01',
          endDate: '2025-10-31',
          limit: 10,
          offset: 0,
        },
        { client: mockClient }
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('formType=buy-back')
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2025-10-01')
      );
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('limit=10'));
    });

    it('should handle listing errors', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('List failed'));

      await expect(listFormSubmissions(undefined, { client: mockClient })).rejects.toThrow(
        ApiRequestError
      );
      await expect(
        listFormSubmissions(undefined, { client: mockClient })
      ).rejects.toMatchObject({
        code: 'LIST_ERROR',
      });
    });
  });
});
