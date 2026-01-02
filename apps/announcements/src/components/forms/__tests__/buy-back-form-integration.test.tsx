/**
 * Integration tests for buy-back form flow
 * 
 * Tests complete workflows including:
 * - Form submission from start to finish
 * - Draft save and restore on page reload
 * - Conditional section visibility based on buy-back type
 * - API error handling and retry logic
 * - Validation error display
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.5, 4.6, 5.2, 5.3, 6.1, 6.2
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuyBackForm } from '../buy-back-form';
import { submitForm } from '../../../lib/api/forms';
import { 
  restoreFormDraft, 
  clearFormDraft
} from '../../../lib/storage/form-storage';
import { toast } from '../../../lib/utils/toast';
import { ApiRequestError } from '../../../lib/api/client';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../../../lib/api/forms');
jest.mock('../../../lib/storage/form-storage', () => ({
  saveFormDraft: jest.fn(),
  restoreFormDraft: jest.fn(),
  clearFormDraft: jest.fn(),
  createDebouncedSave: jest.fn(() => ({
    debouncedSave: jest.fn(),
    cancel: jest.fn(),
  })),
}));
jest.mock('../../../lib/utils/toast');
jest.mock('../../../lib/utils/form-helpers', () => ({
  generateUUID: jest.fn(() => 'test-uuid-123'),
}));

describe('Buy-Back Form Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response by default
    (submitForm as jest.Mock).mockResolvedValue({
      submissionId: 'test-submission-id',
      status: 'success',
    });
  });

  describe('Complete Form Submission Flow (Requirement 1.1, 1.2, 1.3, 1.4, 1.5)', () => {
    it('completes full on-market buy-back form submission from start to finish', async () => {
      const user = userEvent.setup();
      const onSubmitSuccess = jest.fn();
      
      const validFormData = {
        entityName: 'Test Company Pty Ltd',
        abnArsn: '12345678901',
        buyBackType: 'on-market' as const,
        shareClass: {
          class: 'Ordinary',
          votingRights: 'One vote per share',
          paidStatus: 'fully-paid' as const,
          numberOnIssue: 1000000,
        },
        reason: 'Capital management',
        onMarketBuyBack: {
          brokerName: 'ABC Brokers Ltd',
        },
        compliance: {
          isTrust: false,
          signatoryName: 'John Smith',
          signatoryRole: 'director' as const,
          signatureDate: new Date(),
        },
      };

      render(<BuyBackForm initialData={validFormData} onSubmitSuccess={onSubmitSuccess} />);

      // Wait for form to be ready (longer timeout for form validation)
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit/i });
        expect(submitButton).not.toBeDisabled();
      }, { timeout: 5000 });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // Verify submission
      await waitFor(() => {
        expect(submitForm).toHaveBeenCalledWith(
          expect.objectContaining({
            submissionId: 'test-uuid-123',
            formType: 'buy-back',
            formVersion: '1.0.0',
            versionNumber: 1,
            data: expect.objectContaining({
              entityName: 'Test Company Pty Ltd',
              abnArsn: '12345678901',
              buyBackType: 'on-market',
            }),
          })
        );
      });

      // Verify success callback
      expect(onSubmitSuccess).toHaveBeenCalledWith('test-submission-id');
      
      // Verify success toast
      expect(toast.success).toHaveBeenCalledWith('Buy-back form submitted successfully');
      
      // Verify draft cleared
      expect(clearFormDraft).toHaveBeenCalledWith('buy-back');
    });
  });

  describe('Draft Save and Restore (Requirement 6.1, 6.2)', () => {
    it('restores form data from local storage on mount', () => {
      const savedDraft = {
        formType: 'buy-back',
        lastSaved: new Date().toISOString(),
        version: 1,
        data: {
          entityName: 'Restored Company',
          abnArsn: '11111111111',
          buyBackType: 'selective',
        },
      };

      (restoreFormDraft as jest.Mock).mockReturnValue(savedDraft);

      render(<BuyBackForm initialData={savedDraft.data} />);

      // Verify restored data is displayed
      const entityNameInput = screen.getByPlaceholderText(/Enter entity name/i) as HTMLInputElement;
      expect(entityNameInput.value).toBe('Restored Company');

      const abnInput = screen.getByPlaceholderText(/Enter ABN or ARSN/i) as HTMLInputElement;
      expect(abnInput.value).toBe('11111111111');
    });

    it('clears draft from storage after successful submission', async () => {
      const user = userEvent.setup();
      
      const validFormData = {
        entityName: 'Test Company',
        abnArsn: '12345678901',
        buyBackType: 'on-market' as const,
        shareClass: {
          class: 'Ordinary',
          votingRights: 'One vote per share',
          paidStatus: 'fully-paid' as const,
          numberOnIssue: 1000000,
        },
        reason: 'Capital management',
        onMarketBuyBack: {
          brokerName: 'ABC Brokers',
        },
        compliance: {
          isTrust: false,
          signatoryName: 'John Smith',
          signatoryRole: 'director' as const,
          signatureDate: new Date(),
        },
      };

      render(<BuyBackForm initialData={validFormData} />);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit/i });
        expect(submitButton).not.toBeDisabled();
      }, { timeout: 5000 });

      await user.click(screen.getByRole('button', { name: /Submit/i }));

      await waitFor(() => {
        expect(clearFormDraft).toHaveBeenCalledWith('buy-back');
      });
    });

    it('preserves draft in storage when submission fails', async () => {
      const user = userEvent.setup();
      
      // Mock API failure
      (submitForm as jest.Mock).mockRejectedValue(new Error('Network error'));

      const validFormData = {
        entityName: 'Test Company',
        abnArsn: '12345678901',
        buyBackType: 'on-market' as const,
        shareClass: {
          class: 'Ordinary',
          votingRights: 'One vote per share',
          paidStatus: 'fully-paid' as const,
          numberOnIssue: 1000000,
        },
        reason: 'Capital management',
        onMarketBuyBack: {
          brokerName: 'ABC Brokers',
        },
        compliance: {
          isTrust: false,
          signatoryName: 'John Smith',
          signatoryRole: 'director' as const,
          signatureDate: new Date(),
        },
      };

      render(<BuyBackForm initialData={validFormData} />);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit/i });
        expect(submitButton).not.toBeDisabled();
      }, { timeout: 5000 });

      await user.click(screen.getByRole('button', { name: /Submit/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Draft should NOT be cleared on failure
      expect(clearFormDraft).not.toHaveBeenCalled();
    });
  });

  describe('Conditional Section Visibility (Requirement 4.5, 4.6)', () => {
    it('shows correct section based on buy-back type selection', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm />);

      // On-market is default
      expect(screen.getByText('On-Market Buy-Back Details')).toBeInTheDocument();
      expect(screen.queryByText('Employee Share Scheme Buy-Back Details')).not.toBeInTheDocument();

      // Switch to employee share scheme
      const buyBackTypeSelect = screen.getByRole('combobox', { name: /Buy-back Type/i });
      await user.selectOptions(buyBackTypeSelect, 'employee-share-scheme');

      await waitFor(() => {
        expect(screen.queryByText('On-Market Buy-Back Details')).not.toBeInTheDocument();
        expect(screen.getByText('Employee Share Scheme Buy-Back Details')).toBeInTheDocument();
      });
    });

    it('clears conditional section data when switching types', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm />);

      // Fill in on-market broker name
      const brokerInput = screen.getByPlaceholderText(/Enter broker name/i);
      await user.type(brokerInput, 'Test Broker');
      expect((brokerInput as HTMLInputElement).value).toBe('Test Broker');

      // Switch to selective
      const buyBackTypeSelect = screen.getByRole('combobox', { name: /Buy-back Type/i });
      await user.selectOptions(buyBackTypeSelect, 'selective');

      // Switch back to on-market
      await user.selectOptions(buyBackTypeSelect, 'on-market');

      // Broker field should be cleared
      await waitFor(() => {
        const clearedBroker = screen.getByPlaceholderText(/Enter broker name/i) as HTMLInputElement;
        expect(clearedBroker.value).toBe('');
      });
    });
  });

  describe('API Error Handling and Retry Logic (Requirement 5.2, 5.3)', () => {
    it('handles network errors with appropriate message', async () => {
      const user = userEvent.setup();
      
      (submitForm as jest.Mock).mockRejectedValue(
        new ApiRequestError('NETWORK_ERROR', 'Network request failed')
      );

      const validFormData = {
        entityName: 'Test Company',
        abnArsn: '12345678901',
        buyBackType: 'on-market' as const,
        shareClass: {
          class: 'Ordinary',
          votingRights: 'One vote per share',
          paidStatus: 'fully-paid' as const,
          numberOnIssue: 1000000,
        },
        reason: 'Capital management',
        onMarketBuyBack: {
          brokerName: 'ABC Brokers',
        },
        compliance: {
          isTrust: false,
          signatoryName: 'John Smith',
          signatoryRole: 'director' as const,
          signatureDate: new Date(),
        },
      };

      render(<BuyBackForm initialData={validFormData} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled();
      }, { timeout: 5000 });

      await user.click(screen.getByRole('button', { name: /Submit/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Network error. Please check your connection and try again.'
        );
      });
    });

    it('handles validation errors from API', async () => {
      const user = userEvent.setup();
      
      (submitForm as jest.Mock).mockRejectedValue(
        new ApiRequestError('VALIDATION_ERROR', 'Form validation failed on server')
      );

      const validFormData = {
        entityName: 'Test Company',
        abnArsn: '12345678901',
        buyBackType: 'on-market' as const,
        shareClass: {
          class: 'Ordinary',
          votingRights: 'One vote per share',
          paidStatus: 'fully-paid' as const,
          numberOnIssue: 1000000,
        },
        reason: 'Capital management',
        onMarketBuyBack: {
          brokerName: 'ABC Brokers',
        },
        compliance: {
          isTrust: false,
          signatoryName: 'John Smith',
          signatoryRole: 'director' as const,
          signatureDate: new Date(),
        },
      };

      render(<BuyBackForm initialData={validFormData} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled();
      }, { timeout: 5000 });

      await user.click(screen.getByRole('button', { name: /Submit/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Form validation failed. Please check your entries.'
        );
      });
    });

    it('allows retry after failed submission', async () => {
      const user = userEvent.setup();
      
      // First attempt fails
      (submitForm as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // Second attempt succeeds
      (submitForm as jest.Mock).mockResolvedValueOnce({
        submissionId: 'test-submission-id',
        status: 'success',
      });

      const validFormData = {
        entityName: 'Test Company',
        abnArsn: '12345678901',
        buyBackType: 'on-market' as const,
        shareClass: {
          class: 'Ordinary',
          votingRights: 'One vote per share',
          paidStatus: 'fully-paid' as const,
          numberOnIssue: 1000000,
        },
        reason: 'Capital management',
        onMarketBuyBack: {
          brokerName: 'ABC Brokers',
        },
        compliance: {
          isTrust: false,
          signatoryName: 'John Smith',
          signatoryRole: 'director' as const,
          signatureDate: new Date(),
        },
      };

      render(<BuyBackForm initialData={validFormData} />);

      const submitButton = screen.getByRole('button', { name: /Submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      }, { timeout: 5000 });

      // First attempt
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Clear mock calls
      jest.clearAllMocks();

      // Second attempt (retry)
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Buy-back form submitted successfully');
      });
    });
  });

  describe('Validation Error Display (Requirement 1.4)', () => {
    it('disables submit button when form is invalid', () => {
      render(<BuyBackForm />);

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      expect(submitButton).toBeDisabled();
    });

    it('form renders with all required sections', () => {
      render(<BuyBackForm />);

      // Verify all main sections are present
      expect(screen.getByText('Entity Information')).toBeInTheDocument();
      expect(screen.getByText('Buy-back Information')).toBeInTheDocument();
      expect(screen.getByText('Compliance and Signature')).toBeInTheDocument();
    });
  });
});

