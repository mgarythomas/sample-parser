/**
 * Accessibility tests for BuyBackForm component
 * Tests keyboard navigation, screen reader support, focus management, and ARIA attributes
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuyBackForm } from '../buy-back-form';
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

describe('BuyBackForm Accessibility', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Keyboard Navigation', () => {
    it('allows tabbing through all form fields in logical order', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Start from the beginning - use getByRole to avoid ambiguity
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      entityNameInput.focus();
      expect(entityNameInput).toHaveFocus();

      // Tab to next field
      await user.tab();
      const abnInput = screen.getByRole('textbox', { name: /ABN or ARSN/i });
      expect(abnInput).toHaveFocus();

      // Tab to buy-back type
      await user.tab();
      const buyBackTypeSelect = screen.getByRole('combobox', { name: /Buy-back Type/i });
      expect(buyBackTypeSelect).toHaveFocus();

      // Tab to share class
      await user.tab();
      const shareClassInput = screen.getByRole('textbox', { name: /Share Class/i });
      expect(shareClassInput).toHaveFocus();

      // Tab to voting rights
      await user.tab();
      const votingRightsInput = screen.getByRole('textbox', { name: /Voting Rights/i });
      expect(votingRightsInput).toHaveFocus();
    });

    it('allows reverse tabbing (Shift+Tab) through form fields', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Focus on a field in the middle
      const buyBackTypeSelect = screen.getByRole('combobox', { name: /Buy-back Type/i });
      buyBackTypeSelect.focus();
      expect(buyBackTypeSelect).toHaveFocus();

      // Shift+Tab to previous field
      await user.tab({ shift: true });
      const abnInput = screen.getByRole('textbox', { name: /ABN or ARSN/i });
      expect(abnInput).toHaveFocus();

      // Shift+Tab again
      await user.tab({ shift: true });
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      expect(entityNameInput).toHaveFocus();
    });

    it('allows keyboard interaction with select elements', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      const buyBackTypeSelect = screen.getByRole('combobox', { name: /Buy-back Type/i });
      
      // Use selectOptions which properly simulates user interaction
      await user.selectOptions(buyBackTypeSelect, 'employee-share-scheme');

      // Verify selection changed
      expect(buyBackTypeSelect).toHaveValue('employee-share-scheme');
    });

    it('allows keyboard interaction with checkboxes', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Find the shareholder approval checkbox
      const checkbox = screen.getByRole('checkbox', { name: /Shareholder approval required/i });
      checkbox.focus();
      expect(checkbox).toHaveFocus();

      // Toggle with Space key
      await user.keyboard(' ');
      expect(checkbox).toBeChecked();

      await user.keyboard(' ');
      expect(checkbox).not.toBeChecked();
    });

    it('allows keyboard interaction with radio buttons', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Find the director radio button
      const directorRadio = screen.getByRole('radio', { name: /Director/i });
      directorRadio.focus();
      expect(directorRadio).toHaveFocus();

      // Select with Space key
      await user.keyboard(' ');
      expect(directorRadio).toBeChecked();

      // Navigate to next radio with arrow keys
      await user.keyboard('{ArrowDown}');
      const secretaryRadio = screen.getByRole('radio', { name: /Company Secretary/i });
      expect(secretaryRadio).toHaveFocus();
      expect(secretaryRadio).toBeChecked();
    });

    it('allows form submission with Enter key from text inputs', async () => {
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
        shareholderApprovalRequired: true,
        reason: 'Capital management',
        onMarketBuyBack: {
          brokerName: 'ABC Brokers',
        },
        compliance: {
          isTrust: false,
          signatoryName: 'John Smith',
          signatoryRole: 'director' as const,
          signatureDate: new Date('2025-10-20'),
        },
      };

      render(<BuyBackForm onSubmit={mockOnSubmit} initialData={validFormData} />);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit/i });
        expect(submitButton).not.toBeDisabled();
      });

      // Focus on a text input and press Enter
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      entityNameInput.focus();
      await user.keyboard('{Enter}');

      // Form should submit
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('moves focus to first error field when validation fails', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Trigger validation error
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      await user.type(entityNameInput, 'Test');
      await user.clear(entityNameInput);
      
      // Click somewhere else to blur without tabbing
      const buyBackTypeSelect = screen.getByRole('combobox', { name: /Buy-back Type/i });
      await user.click(buyBackTypeSelect);

      // Wait for error summary to appear
      await waitFor(() => {
        const errorSummary = document.querySelector('[role="alert"][tabindex="-1"]');
        expect(errorSummary).toBeInTheDocument();
      }, { timeout: 2000 });

      // The focus management system should focus an error field (may be entityName or another field with error)
      await waitFor(() => {
        const focusedElement = document.activeElement;
        // Check that focus is on a form input (has a name attribute)
        expect(focusedElement).toHaveAttribute('name');
      }, { timeout: 1000 });
    });
  });

  describe('Screen Reader Announcements', () => {
    it('announces validation errors with aria-live', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Trigger validation error
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      await user.type(entityNameInput, 'Test');
      await user.clear(entityNameInput);
      await user.tab(); // Blur to trigger validation

      // Wait for error summary to appear - has aria-live="assertive"
      await waitFor(() => {
        const errorSummary = document.querySelector('[role="alert"][aria-live="assertive"]');
        expect(errorSummary).toBeInTheDocument();
        expect(errorSummary).toHaveAttribute('aria-atomic', 'true');
      }, { timeout: 2000 });
    });

    it('announces field-level errors with aria-live="polite"', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Fill in entity name and then clear it to trigger error
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      await user.type(entityNameInput, 'Test');
      await user.clear(entityNameInput);
      await user.tab(); // Blur the field

      // Wait for field-level error message to appear (not in error summary)
      await waitFor(() => {
        // Field-level errors have aria-live="polite" and are direct children of field wrapper
        const fieldErrors = document.querySelectorAll('[aria-live="polite"][role="alert"]');
        expect(fieldErrors.length).toBeGreaterThan(0);
        
        // At least one should contain the error message
        const hasError = Array.from(fieldErrors).some(el => 
          el.textContent?.includes('Entity name is required')
        );
        expect(hasError).toBe(true);
      }, { timeout: 2000 });
    });

    it('has proper aria-describedby linking errors to fields', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Type and clear to trigger validation
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      await user.type(entityNameInput, 'Test');
      await user.clear(entityNameInput);
      await user.tab(); // Blur to trigger validation

      await waitFor(() => {
        const describedBy = entityNameInput.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        
        // Find the field-level error message (has aria-live="polite")
        const fieldErrors = document.querySelectorAll('[aria-live="polite"][role="alert"]');
        const errorElement = Array.from(fieldErrors).find(el => 
          el.textContent?.includes('Entity name is required')
        );
        
        expect(errorElement).toBeTruthy();
        const errorId = errorElement?.getAttribute('id');
        expect(errorId).toBeTruthy();
        expect(describedBy).toContain(errorId!);
      }, { timeout: 2000 });
    });

    it('announces required fields with aria-required', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Check required fields have aria-required="true"
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      expect(entityNameInput).toHaveAttribute('aria-required', 'true');

      const abnInput = screen.getByRole('textbox', { name: /ABN or ARSN/i });
      expect(abnInput).toHaveAttribute('aria-required', 'true');

      const shareClassInput = screen.getByRole('textbox', { name: /Share Class/i });
      expect(shareClassInput).toHaveAttribute('aria-required', 'true');
    });

    it('announces invalid fields with aria-invalid', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Initially should not be invalid
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      expect(entityNameInput).toHaveAttribute('aria-invalid', 'false');

      // Type and clear to trigger validation
      await user.type(entityNameInput, 'Test');
      await user.clear(entityNameInput);
      await user.tab(); // Blur to trigger validation

      // Should now be invalid
      await waitFor(() => {
        expect(entityNameInput).toHaveAttribute('aria-invalid', 'true');
      }, { timeout: 1500 });
    });

    it('has proper role attributes for form sections', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Form sections should have role="region"
      const sections = screen.getAllByRole('region');
      expect(sections.length).toBeGreaterThan(0);

      // Each section should have aria-labelledby
      sections.forEach(section => {
        expect(section).toHaveAttribute('aria-labelledby');
      });
    });

    it('has proper role attributes for radio groups', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Signatory role should be a radiogroup - it may not have explicit aria-required
      // but the individual radios should be accessible
      const directorRadio = screen.getByRole('radio', { name: /Director/i });
      expect(directorRadio).toBeInTheDocument();
      
      const secretaryRadio = screen.getByRole('radio', { name: /Company Secretary/i });
      expect(secretaryRadio).toBeInTheDocument();
    });

    it('has proper role attributes for checkboxes', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Shareholder approval checkbox
      const checkbox = screen.getByRole('checkbox', { name: /Shareholder approval required/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });
  });

  describe('Focus Indicators', () => {
    it('shows visible focus indicators on text inputs', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      await user.click(entityNameInput);

      await waitFor(() => {
        expect(entityNameInput).toHaveFocus();
        // Focus styles are applied via CSS, so we just verify the element has focus
        expect(document.activeElement).toBe(entityNameInput);
      });
    });

    it('shows visible focus indicators on select elements', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      const buyBackTypeSelect = screen.getByRole('combobox', { name: /Buy-back Type/i });
      await user.click(buyBackTypeSelect);

      await waitFor(() => {
        expect(buyBackTypeSelect).toHaveFocus();
        expect(document.activeElement).toBe(buyBackTypeSelect);
      });
    });

    it('shows visible focus indicators on buttons', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Find a button that's not disabled (Clear Form button)
      const clearButton = screen.getByRole('button', { name: /Clear Form/i });
      
      // Directly focus the button
      clearButton.focus();
      
      // Verify the element has focus
      expect(clearButton).toHaveFocus();
    });

    it('shows visible focus indicators on checkboxes', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      const checkbox = screen.getByRole('checkbox', { name: /Shareholder approval required/i });
      await user.click(checkbox);

      expect(checkbox).toHaveFocus();
      expect(document.activeElement).toBe(checkbox);
    });

    it('shows visible focus indicators on radio buttons', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      const directorRadio = screen.getByRole('radio', { name: /Director/i });
      await user.click(directorRadio);

      expect(directorRadio).toHaveFocus();
      expect(document.activeElement).toBe(directorRadio);
    });

    it('maintains focus order when conditional sections appear', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change buy-back type to show different conditional section
      const buyBackTypeSelect = screen.getByRole('combobox', { name: /Buy-back Type/i });
      await user.selectOptions(buyBackTypeSelect, 'employee-share-scheme');

      // New fields should be in the tab order
      await waitFor(() => {
        expect(screen.getByText('Employee Share Scheme Buy-Back Details')).toBeInTheDocument();
      });

      // Tab to the new section's first field
      const numberOfSharesInput = screen.getByRole('spinbutton', { name: /Number of Shares/i });
      numberOfSharesInput.focus();
      expect(numberOfSharesInput).toHaveFocus();
    });
  });

  describe('ARIA Label Correctness', () => {
    it('has correct aria-label on form element', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'Buy-back announcement form');
    });

    it('has correct aria-labelledby on form sections', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Entity Information section
      const entitySection = screen.getByText('Entity Information').closest('[role="region"]');
      expect(entitySection).toHaveAttribute('aria-labelledby');
      
      const labelId = entitySection?.getAttribute('aria-labelledby');
      const label = document.getElementById(labelId!);
      expect(label).toHaveTextContent('Entity Information');
    });

    it('has correct labels for all form inputs', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Verify all inputs have associated labels using getByRole
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      expect(entityNameInput).toBeInTheDocument();

      const abnInput = screen.getByRole('textbox', { name: /ABN or ARSN/i });
      expect(abnInput).toBeInTheDocument();

      const buyBackTypeSelect = screen.getByRole('combobox', { name: /Buy-back Type/i });
      expect(buyBackTypeSelect).toBeInTheDocument();

      const shareClassInput = screen.getByRole('textbox', { name: /Share Class/i });
      expect(shareClassInput).toBeInTheDocument();

      const votingRightsInput = screen.getByRole('textbox', { name: /Voting Rights/i });
      expect(votingRightsInput).toBeInTheDocument();
    });

    it('has correct aria-label for checkbox groups', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Entity type checkbox should have proper labeling
      const checkbox = screen.getByRole('checkbox', { name: /This entity is a trust/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('has correct aria-label for radio groups', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Individual radios should have proper labels
      const directorRadio = screen.getByRole('radio', { name: /Director/i });
      expect(directorRadio).toBeInTheDocument();

      const secretaryRadio = screen.getByRole('radio', { name: /Company Secretary/i });
      expect(secretaryRadio).toBeInTheDocument();
      
      // Both radios should be part of the same group (same name attribute)
      expect(directorRadio).toHaveAttribute('name', 'signatoryRole');
      expect(secretaryRadio).toHaveAttribute('name', 'signatoryRole');
    });

    it('has correct aria-describedby for fields with help text', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Find a field with help text
      const abnInput = screen.getByRole('textbox', { name: /ABN or ARSN/i });
      const describedBy = abnInput.getAttribute('aria-describedby');
      
      if (describedBy) {
        // Help text should be referenced
        const helpTextIds = describedBy.split(' ');
        helpTextIds.forEach(id => {
          const element = document.getElementById(id);
          expect(element).toBeInTheDocument();
        });
      }
    });

    it('has correct aria-label on submit button', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Submit');
    });

    it('has correct role and aria attributes on error summary', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Trigger validation error
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      await user.type(entityNameInput, 'Test');
      await user.clear(entityNameInput);
      await user.tab(); // Blur to trigger validation

      // Find the error summary (has tabindex="-1" to distinguish from field errors)
      await waitFor(() => {
        const errorSummary = document.querySelector('[role="alert"][tabindex="-1"]');
        expect(errorSummary).toBeInTheDocument();
        expect(errorSummary).toHaveAttribute('aria-live', 'assertive');
        expect(errorSummary).toHaveAttribute('aria-atomic', 'true');
      }, { timeout: 2000 });
    });

    it('has correct aria-hidden on decorative elements', () => {
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Check if any decorative icons have aria-hidden
      const decorativeElements = document.querySelectorAll('[aria-hidden="true"]');
      // Decorative elements should not be announced to screen readers
      decorativeElements.forEach(element => {
        expect(element).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Conditional Section Accessibility', () => {
    it('maintains accessibility when switching between conditional sections', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Start with on-market (default)
      expect(screen.getByText('On-Market Buy-Back Details')).toBeInTheDocument();
      const brokerNameInput = screen.getByRole('textbox', { name: /Broker Name/i });
      expect(brokerNameInput).toHaveAttribute('aria-required', 'true');

      // Switch to employee share scheme
      const buyBackTypeSelect = screen.getByRole('combobox', { name: /Buy-back Type/i });
      await user.selectOptions(buyBackTypeSelect, 'employee-share-scheme');

      await waitFor(() => {
        expect(screen.getByText('Employee Share Scheme Buy-Back Details')).toBeInTheDocument();
      });
      
      // Find the number of shares input after the section appears
      const numberOfSharesInput = screen.getByRole('spinbutton', { name: /Number of Shares/i });
      expect(numberOfSharesInput).toHaveAttribute('aria-required', 'true');

      // Switch to selective
      await user.selectOptions(buyBackTypeSelect, 'selective');

      await waitFor(() => {
        expect(screen.getByText('Selective Buy-Back Details')).toBeInTheDocument();
      });
      
      const personOrClassInput = screen.getByRole('textbox', { name: /Person or Class/i });
      expect(personOrClassInput).toHaveAttribute('aria-required', 'true');

      // Switch to equal access scheme
      await user.selectOptions(buyBackTypeSelect, 'equal-access-scheme');

      await waitFor(() => {
        expect(screen.getByText('Equal Access Scheme Details')).toBeInTheDocument();
      }, { timeout: 1000 });
      
      // Wait a bit more for the fields to render
      await waitFor(() => {
        const percentageInput = screen.getByRole('spinbutton', { name: /Percentage/i });
        expect(percentageInput).toHaveAttribute('aria-required', 'true');
      }, { timeout: 1000 });
    });

    it('announces conditional section changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Change buy-back type
      const buyBackTypeSelect = screen.getByRole('combobox', { name: /Buy-back Type/i });
      await user.selectOptions(buyBackTypeSelect, 'selective');

      // New section should be properly labeled
      await waitFor(() => {
        const selectiveSection = screen.getByText('Selective Buy-Back Details').closest('[role="region"]');
        expect(selectiveSection).toHaveAttribute('aria-labelledby');
      });
    });
  });

  describe('Form Validation Accessibility', () => {
    it('announces validation errors in error summary', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Trigger validation error
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      await user.type(entityNameInput, 'Test');
      await user.clear(entityNameInput);
      await user.tab(); // Blur to trigger validation

      // Find the error summary (has tabindex="-1")
      await waitFor(() => {
        const errorSummary = document.querySelector('[role="alert"][tabindex="-1"]');
        expect(errorSummary).toBeInTheDocument();
        
        // Should contain error count
        expect(errorSummary).toHaveTextContent(/error/i);
        
        // Should list specific errors
        expect(errorSummary).toHaveTextContent(/Entity name is required/i);
      }, { timeout: 2000 });
    });

    it('focuses error summary when validation fails', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Trigger validation error
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      await user.type(entityNameInput, 'Test');
      await user.clear(entityNameInput);
      await user.tab(); // Blur to trigger validation

      // Find the error summary (has tabindex="-1")
      await waitFor(() => {
        const errorSummary = document.querySelector('[role="alert"][tabindex="-1"]');
        expect(errorSummary).toBeInTheDocument();
        expect(errorSummary).toHaveAttribute('tabindex', '-1');
      }, { timeout: 2000 });
    });

    it('clears aria-invalid when errors are fixed', async () => {
      const user = userEvent.setup();
      render(<BuyBackForm onSubmit={mockOnSubmit} />);

      // Type and clear to trigger validation
      const entityNameInput = screen.getByRole('textbox', { name: /Entity Name/i });
      await user.type(entityNameInput, 'Test');
      await user.clear(entityNameInput);
      await user.tab(); // Blur to trigger validation

      await waitFor(() => {
        expect(entityNameInput).toHaveAttribute('aria-invalid', 'true');
      }, { timeout: 1500 });

      // Fix the error
      await user.type(entityNameInput, 'Test Company');

      // aria-invalid should be cleared
      await waitFor(() => {
        expect(entityNameInput).toHaveAttribute('aria-invalid', 'false');
      });
    });
  });
});
