/**
 * Tests for BuyBackForm component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuyBackForm } from '../buy-back-form';
import { submitForm } from '../../../lib/api/forms';
import { clearFormDraft } from '../../../lib/storage/form-storage';
import { toast } from '../../../lib/utils/toast';
import { generateUUID as _generateUUID } from '../../../lib/utils/form-helpers';
import { ApiRequestError } from '../../../lib/api/client';
import '@testing-library/jest-dom';

// Mock the storage utilities
jest.mock('../../../lib/storage/form-storage', () => ({
  createDebouncedSave: () => ({
    debouncedSave: jest.fn(),
    cancel: jest.fn(),
  }),
  clearFormDraft: jest.fn(),
}));

// Mock the API client
jest.mock('../../../lib/api/forms', () => ({
  submitForm: jest.fn(),
}));

// Mock the toast utility
jest.mock('../../../lib/utils/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock UUID generation
jest.mock('../../../lib/utils/form-helpers', () => ({
  generateUUID: jest.fn(() => 'test-uuid-123'),
}));

describe('BuyBackForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnSaveDraft = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all required sections', () => {
    render(<BuyBackForm onSubmit={mockOnSubmit} />);

    // Check for main sections
    expect(screen.getByText('Entity Information')).toBeInTheDocument();
    expect(screen.getByText('Buy-back Information')).toBeInTheDocument();
    expect(screen.getByText('Share Class Information')).toBeInTheDocument();
    expect(screen.getByText('Compliance and Signature')).toBeInTheDocument();
  });

  it('renders entity information fields', () => {
    render(<BuyBackForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Entity Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ABN or ARSN/i)).toBeInTheDocument();
  });

  it('renders buy-back information fields', () => {
    render(<BuyBackForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Buy-back Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Share Class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Voting Rights/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Paid Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number on Issue/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason for Buy-back/i)).toBeInTheDocument();
  });

  it('renders buy-back type options', () => {
    render(<BuyBackForm onSubmit={mockOnSubmit} />);

    const select = screen.getByLabelText(/Buy-back Type/i) as HTMLSelectElement;
    const options = Array.from(select.options).map(option => option.value);

    expect(options).toContain('on-market');
    expect(options).toContain('employee-share-scheme');
    expect(options).toContain('selective');
    expect(options).toContain('equal-access-scheme');
  });

  it('shows paid details field when partly-paid is selected', async () => {
    const user = userEvent.setup();
    render(<BuyBackForm onSubmit={mockOnSubmit} />);

    const paidStatusSelect = screen.getByLabelText(/Paid Status/i);
    
    // Initially should not show paid details
    expect(screen.queryByLabelText(/Paid Details/i)).not.toBeInTheDocument();

    // Select partly-paid
    await user.selectOptions(paidStatusSelect, 'partly-paid');

    // Should now show paid details
    await waitFor(() => {
      expect(screen.getByLabelText(/Paid Details/i)).toBeInTheDocument();
    });
  });

  it('renders compliance section', () => {
    render(<BuyBackForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Compliance and Signature')).toBeInTheDocument();
    expect(screen.getByLabelText(/Signatory Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Director/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Secretary/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<BuyBackForm onSubmit={mockOnSubmit} />);

    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  it('initializes with provided initial data', () => {
    const initialData = {
      entityName: 'Test Company',
      abnArsn: '12345678901',
    };

    render(<BuyBackForm onSubmit={mockOnSubmit} initialData={initialData} />);

    const entityNameInput = screen.getByLabelText(/Entity Name/i) as HTMLInputElement;
    const abnInput = screen.getByLabelText(/ABN or ARSN/i) as HTMLInputElement;

    expect(entityNameInput.value).toBe('Test Company');
    expect(abnInput.value).toBe('12345678901');
  });

  it('disables submit button when form is invalid', () => {
    render(<BuyBackForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    expect(submitButton).toBeDisabled();
  });

  it('calls onSaveDraft when provided', async () => {
    const user = userEvent.setup();
    render(<BuyBackForm onSubmit={mockOnSubmit} onSaveDraft={mockOnSaveDraft} />);

    const entityNameInput = screen.getByLabelText(/Entity Name/i);
    await user.type(entityNameInput, 'Test');

    // Wait for debounced save
    await waitFor(() => {
      expect(mockOnSaveDraft).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  describe('On-Market Buy-Back Conditional Section', () => {
    it('shows on-market buy-back section when on-market type is selected', async () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // On-market is the default, so section should be visible
      expect(screen.getByText('On-Market Buy-Back Details')).toBeInTheDocument();
      expect(screen.getByLabelText(/Broker Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Maximum Number of Shares/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Time Period/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Conditions/i)).toBeInTheDocument();
    });

    it('hides on-market buy-back section when different type is selected', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Initially on-market section should be visible
      expect(screen.getByText('On-Market Buy-Back Details')).toBeInTheDocument();

      // Change to employee share scheme
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'employee-share-scheme');

      // On-market section should be hidden
      await waitFor(() => {
        expect(screen.queryByText('On-Market Buy-Back Details')).not.toBeInTheDocument();
      });
    });

    it('clears on-market buy-back data when type changes', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Fill in on-market fields
      const brokerNameInput = screen.getByLabelText(/Broker Name/i);
      await user.type(brokerNameInput, 'Test Broker');

      // Change buy-back type
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'selective');

      // Change back to on-market
      await user.selectOptions(buyBackTypeSelect, 'on-market');

      // Field should be cleared
      await waitFor(() => {
        const clearedInput = screen.getByLabelText(/Broker Name/i) as HTMLInputElement;
        expect(clearedInput.value).toBe('');
      });
    });

    it('renders all on-market buy-back fields with correct attributes', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Broker name (required)
      const brokerNameInput = screen.getByLabelText(/Broker Name/i);
      expect(brokerNameInput).toHaveAttribute('aria-required', 'true');

      // Maximum shares (optional)
      const maxSharesInput = screen.getByLabelText(/Maximum Number of Shares/i);
      expect(maxSharesInput).toHaveAttribute('type', 'number');

      // Time period (optional)
      const timePeriodInput = screen.getByLabelText(/Time Period/i);
      expect(timePeriodInput).toBeInTheDocument();

      // Conditions (optional)
      const conditionsTextarea = screen.getByLabelText(/Conditions/i);
      expect(conditionsTextarea.tagName).toBe('TEXTAREA');
    });

    it('accepts valid input in on-market buy-back fields', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Fill in broker name
      const brokerNameInput = screen.getByLabelText(/Broker Name/i);
      await user.type(brokerNameInput, 'ABC Brokers Ltd');
      expect((brokerNameInput as HTMLInputElement).value).toBe('ABC Brokers Ltd');

      // Fill in maximum shares
      const maxSharesInput = screen.getByLabelText(/Maximum Number of Shares/i);
      await user.type(maxSharesInput, '1000000');
      expect((maxSharesInput as HTMLInputElement).value).toBe('1000000');

      // Fill in time period
      const timePeriodInput = screen.getByLabelText(/Time Period/i);
      await user.type(timePeriodInput, '12 months');
      expect((timePeriodInput as HTMLInputElement).value).toBe('12 months');

      // Fill in conditions
      const conditionsTextarea = screen.getByLabelText(/Conditions/i);
      await user.type(conditionsTextarea, 'Subject to market conditions');
      expect((conditionsTextarea as HTMLTextAreaElement).value).toBe('Subject to market conditions');
    });
  });

  describe('Employee Share Scheme Buy-Back Conditional Section', () => {
    it('shows employee share scheme section when employee-share-scheme type is selected', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to employee share scheme
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'employee-share-scheme');

      // Employee share scheme section should be visible
      await waitFor(() => {
        expect(screen.getByText('Employee Share Scheme Buy-Back Details')).toBeInTheDocument();
        expect(screen.getByLabelText(/Number of Shares/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Price per Share/i)).toBeInTheDocument();
      });
    });

    it('hides employee share scheme section when different type is selected', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to employee share scheme
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'employee-share-scheme');

      // Section should be visible
      await waitFor(() => {
        expect(screen.getByText('Employee Share Scheme Buy-Back Details')).toBeInTheDocument();
      });

      // Change to on-market
      await user.selectOptions(buyBackTypeSelect, 'on-market');

      // Employee share scheme section should be hidden
      await waitFor(() => {
        expect(screen.queryByText('Employee Share Scheme Buy-Back Details')).not.toBeInTheDocument();
      });
    });

    it('clears employee share scheme data when type changes', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to employee share scheme
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'employee-share-scheme');

      // Fill in employee share scheme fields
      await waitFor(() => {
        expect(screen.getByLabelText(/Number of Shares/i)).toBeInTheDocument();
      });

      const numberOfSharesInput = screen.getByLabelText(/Number of Shares/i);
      await user.type(numberOfSharesInput, '50000');

      // Change buy-back type
      await user.selectOptions(buyBackTypeSelect, 'selective');

      // Change back to employee share scheme
      await user.selectOptions(buyBackTypeSelect, 'employee-share-scheme');

      // Field should be cleared
      await waitFor(() => {
        const clearedInput = screen.getByLabelText(/Number of Shares/i) as HTMLInputElement;
        expect(clearedInput.value).toBe('');
      });
    });

    it('renders all employee share scheme fields with correct attributes', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to employee share scheme
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'employee-share-scheme');

      await waitFor(() => {
        // Number of shares (required)
        const numberOfSharesInput = screen.getByLabelText(/Number of Shares/i);
        expect(numberOfSharesInput).toHaveAttribute('aria-required', 'true');
        expect(numberOfSharesInput).toHaveAttribute('type', 'number');

        // Price per share (required)
        const priceInput = screen.getByLabelText(/Price per Share/i);
        expect(priceInput).toHaveAttribute('aria-required', 'true');
        expect(priceInput).toHaveAttribute('type', 'number');
        expect(priceInput).toHaveAttribute('step', '0.01');
      });
    });

    it('accepts valid input in employee share scheme fields', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to employee share scheme
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'employee-share-scheme');

      await waitFor(() => {
        expect(screen.getByLabelText(/Number of Shares/i)).toBeInTheDocument();
      });

      // Fill in number of shares
      const numberOfSharesInput = screen.getByLabelText(/Number of Shares/i);
      await user.type(numberOfSharesInput, '50000');
      expect((numberOfSharesInput as HTMLInputElement).value).toBe('50000');

      // Fill in price per share
      const priceInput = screen.getByLabelText(/Price per Share/i);
      await user.type(priceInput, '2.50');
      expect((priceInput as HTMLInputElement).value).toBe('2.5');
    });
  });

  describe('Selective Buy-Back Conditional Section', () => {
    it('shows selective buy-back section when selective type is selected', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to selective
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'selective');

      // Selective buy-back section should be visible
      await waitFor(() => {
        expect(screen.getByText('Selective Buy-Back Details')).toBeInTheDocument();
        expect(screen.getByLabelText(/Person or Class/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Number of Shares/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Price per Share/i)).toBeInTheDocument();
      });
    });

    it('hides selective buy-back section when different type is selected', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to selective
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'selective');

      // Section should be visible
      await waitFor(() => {
        expect(screen.getByText('Selective Buy-Back Details')).toBeInTheDocument();
      });

      // Change to on-market
      await user.selectOptions(buyBackTypeSelect, 'on-market');

      // Selective buy-back section should be hidden
      await waitFor(() => {
        expect(screen.queryByText('Selective Buy-Back Details')).not.toBeInTheDocument();
      });
    });

    it('clears selective buy-back data when type changes', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to selective
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'selective');

      // Fill in selective buy-back fields
      await waitFor(() => {
        expect(screen.getByLabelText(/Person or Class/i)).toBeInTheDocument();
      });

      const personOrClassInput = screen.getByLabelText(/Person or Class/i);
      await user.type(personOrClassInput, 'Major Shareholder A');

      // Change buy-back type
      await user.selectOptions(buyBackTypeSelect, 'on-market');

      // Change back to selective
      await user.selectOptions(buyBackTypeSelect, 'selective');

      // Field should be cleared
      await waitFor(() => {
        const clearedInput = screen.getByLabelText(/Person or Class/i) as HTMLInputElement;
        expect(clearedInput.value).toBe('');
      });
    });

    it('renders all selective buy-back fields with correct attributes', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to selective
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'selective');

      await waitFor(() => {
        // Person or class (required)
        const personOrClassInput = screen.getByLabelText(/Person or Class/i);
        expect(personOrClassInput).toHaveAttribute('aria-required', 'true');

        // Number of shares (required)
        const numberOfSharesInput = screen.getByLabelText(/Number of Shares/i);
        expect(numberOfSharesInput).toHaveAttribute('aria-required', 'true');
        expect(numberOfSharesInput).toHaveAttribute('type', 'number');

        // Price per share (required)
        const priceInput = screen.getByLabelText(/Price per Share/i);
        expect(priceInput).toHaveAttribute('aria-required', 'true');
        expect(priceInput).toHaveAttribute('type', 'number');
        expect(priceInput).toHaveAttribute('step', '0.01');
      });
    });

    it('accepts valid input in selective buy-back fields', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to selective
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'selective');

      await waitFor(() => {
        expect(screen.getByLabelText(/Person or Class/i)).toBeInTheDocument();
      });

      // Fill in person or class
      const personOrClassInput = screen.getByLabelText(/Person or Class/i);
      await user.type(personOrClassInput, 'Major Shareholder A');
      expect((personOrClassInput as HTMLInputElement).value).toBe('Major Shareholder A');

      // Fill in number of shares
      const numberOfSharesInput = screen.getByLabelText(/Number of Shares/i);
      await user.type(numberOfSharesInput, '100000');
      expect((numberOfSharesInput as HTMLInputElement).value).toBe('100000');

      // Fill in price per share
      const priceInput = screen.getByLabelText(/Price per Share/i);
      await user.type(priceInput, '3.75');
      expect((priceInput as HTMLInputElement).value).toBe('3.75');
    });
  });

  describe('Equal Access Scheme Conditional Section', () => {
    it('shows equal access scheme section when equal-access-scheme type is selected', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to equal access scheme
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'equal-access-scheme');

      // Equal access scheme section should be visible
      await waitFor(() => {
        expect(screen.getByText('Equal Access Scheme Details')).toBeInTheDocument();
        expect(screen.getByLabelText(/^Percentage$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Total Shares/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Price per Share/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Record Date/i)).toBeInTheDocument();
      });
    });

    it('hides equal access scheme section when different type is selected', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to equal access scheme
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'equal-access-scheme');

      // Section should be visible
      await waitFor(() => {
        expect(screen.getByText('Equal Access Scheme Details')).toBeInTheDocument();
      });

      // Change to on-market
      await user.selectOptions(buyBackTypeSelect, 'on-market');

      // Equal access scheme section should be hidden
      await waitFor(() => {
        expect(screen.queryByText('Equal Access Scheme Details')).not.toBeInTheDocument();
      });
    });

    it('clears equal access scheme data when type changes', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to equal access scheme
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'equal-access-scheme');

      // Fill in equal access scheme fields
      await waitFor(() => {
        expect(screen.getByLabelText(/^Percentage$/i)).toBeInTheDocument();
      });

      const percentageInput = screen.getByLabelText(/^Percentage$/i);
      await user.type(percentageInput, '10');

      // Change buy-back type
      await user.selectOptions(buyBackTypeSelect, 'on-market');

      // Change back to equal access scheme
      await user.selectOptions(buyBackTypeSelect, 'equal-access-scheme');

      // Field should be cleared
      await waitFor(() => {
        const clearedInput = screen.getByLabelText(/^Percentage$/i) as HTMLInputElement;
        expect(clearedInput.value).toBe('');
      });
    });

    it('renders all equal access scheme fields with correct attributes', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to equal access scheme
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'equal-access-scheme');

      await waitFor(() => {
        // Percentage (required)
        const percentageInput = screen.getByLabelText(/^Percentage$/i);
        expect(percentageInput).toHaveAttribute('aria-required', 'true');
        expect(percentageInput).toHaveAttribute('type', 'number');
        expect(percentageInput).toHaveAttribute('min', '0');
        expect(percentageInput).toHaveAttribute('max', '100');

        // Total shares (required)
        const totalSharesInput = screen.getByLabelText(/Total Shares/i);
        expect(totalSharesInput).toHaveAttribute('aria-required', 'true');
        expect(totalSharesInput).toHaveAttribute('type', 'number');

        // Price per share (required)
        const priceInput = screen.getByLabelText(/Price per Share/i);
        expect(priceInput).toHaveAttribute('aria-required', 'true');
        expect(priceInput).toHaveAttribute('type', 'number');
        expect(priceInput).toHaveAttribute('step', '0.01');

        // Record date (required)
        const recordDateLabel = screen.getByLabelText(/Record Date/i);
        expect(recordDateLabel).toBeInTheDocument();
      });
    });

    it('accepts valid input in equal access scheme fields', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change to equal access scheme
      const buyBackTypeSelect = screen.getByLabelText(/Buy-back Type/i);
      await user.selectOptions(buyBackTypeSelect, 'equal-access-scheme');

      await waitFor(() => {
        expect(screen.getByLabelText(/^Percentage$/i)).toBeInTheDocument();
      });

      // Fill in percentage
      const percentageInput = screen.getByLabelText(/^Percentage$/i);
      await user.type(percentageInput, '10.5');
      expect((percentageInput as HTMLInputElement).value).toBe('10.5');

      // Fill in total shares
      const totalSharesInput = screen.getByLabelText(/Total Shares/i);
      await user.type(totalSharesInput, '500000');
      expect((totalSharesInput as HTMLInputElement).value).toBe('500000');

      // Fill in price per share
      const priceInput = screen.getByLabelText(/Price per Share/i);
      await user.type(priceInput, '4.25');
      expect((priceInput as HTMLInputElement).value).toBe('4.25');
    });
  });

  describe('Form Submission', () => {
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
      shareholderApprovalRequired: true,
      reason: 'Capital management',
      onMarketBuyBack: {
        brokerName: 'ABC Brokers Ltd',
        maximumShares: 100000,
        timePeriod: '12 months',
        conditions: 'Subject to market conditions',
      },
      compliance: {
        isTrust: false,
        signatoryName: 'John Smith',
        signatoryRole: 'director' as const,
        signatureDate: new Date('2025-10-20'),
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (submitForm as jest.Mock).mockResolvedValue({
        submissionId: 'test-submission-id',
        status: 'success',
      });
    });

    it('submits form with valid data using default submission handler', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm initialData={validFormData} />);

      // Wait for form to be ready
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit/i });
        expect(submitButton).not.toBeDisabled();
      });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // Wait for submission
      await waitFor(() => {
        expect(submitForm).toHaveBeenCalled();
      }, { timeout: 3000 });

      expect(submitForm).toHaveBeenCalledWith(
        expect.objectContaining({
          submissionId: 'test-uuid-123',
          formType: 'buy-back',
          formVersion: '1.0.0',
          versionNumber: 1,
        })
      );
    });

    it('calls custom onSubmit handler when provided', async () => {
      const customOnSubmit = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      
      // Provide initial valid data to avoid validation issues
      const initialData = validFormData;
      render(<BuyBackForm onSubmit={customOnSubmit} initialData={initialData} />);

      // Wait for form to be ready
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit/i });
        expect(submitButton).not.toBeDisabled();
      });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // Wait for submission
      await waitFor(() => {
        expect(customOnSubmit).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Default submitForm should not be called
      expect(submitForm).not.toHaveBeenCalled();
    });

    it('clears local storage draft on successful submission', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm initialData={validFormData} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(clearFormDraft).toHaveBeenCalledWith('buy-back');
      }, { timeout: 3000 });
    });

    it('shows success toast on successful submission', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm initialData={validFormData} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Buy-back form submitted successfully');
      }, { timeout: 3000 });
    });

    it('calls onSubmitSuccess callback on successful submission', async () => {
      const onSubmitSuccess = jest.fn();
      const user = userEvent.setup();
      render(<BuyBackForm initialData={validFormData} onSubmitSuccess={onSubmitSuccess} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmitSuccess).toHaveBeenCalledWith('test-submission-id');
      }, { timeout: 3000 });
    });

    it('shows error toast on submission failure', async () => {
      (submitForm as jest.Mock).mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();
      render(<BuyBackForm initialData={validFormData} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      }, { timeout: 3000 });
    });

    it('handles API request errors with specific error messages', async () => {
      const apiError = new ApiRequestError('NETWORK_ERROR', 'Connection failed');
      (submitForm as jest.Mock).mockRejectedValue(apiError);
      const user = userEvent.setup();
      render(<BuyBackForm initialData={validFormData} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection and try again.');
      }, { timeout: 3000 });
    });

    it('calls onSubmitError callback on submission failure', async () => {
      const onSubmitError = jest.fn();
      const error = new Error('Submission failed');
      (submitForm as jest.Mock).mockRejectedValue(error);
      const user = userEvent.setup();
      render(<BuyBackForm initialData={validFormData} onSubmitError={onSubmitError} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmitError).toHaveBeenCalledWith(error);
      }, { timeout: 3000 });
    });

    it('disables submit button while submitting', async () => {
      // Make submission take some time
      (submitForm as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<BuyBackForm initialData={validFormData} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // Button should be disabled and show "Submitting..."
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent('Submitting...');
      }, { timeout: 3000 });
    });

    it('generates submission document with correct metadata', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm initialData={validFormData} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitForm).toHaveBeenCalled();
      }, { timeout: 3000 });

      expect(submitForm).toHaveBeenCalledWith(
        expect.objectContaining({
          submissionId: expect.any(String),
          formType: 'buy-back',
          formVersion: '1.0.0',
          submittedAt: expect.any(String),
          versionNumber: 1,
          data: expect.any(Object),
        })
      );
    });

    it('clears form on Clear Form button click', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm />);

      // Fill in a field
      const entityNameInput = screen.getByLabelText(/Entity Name/i) as HTMLInputElement;
      await user.type(entityNameInput, 'Test Company');
      expect(entityNameInput.value).toBe('Test Company');

      // Click Clear Form button
      const clearButton = screen.getByRole('button', { name: /Clear Form/i });
      await user.click(clearButton);

      // Field should be cleared
      await waitFor(() => {
        expect(entityNameInput.value).toBe('');
      });

      // Should clear local storage
      expect(clearFormDraft).toHaveBeenCalledWith('buy-back');

      // Should show info toast
      expect(toast.info).toHaveBeenCalledWith('Form cleared');
    });
  });
});
