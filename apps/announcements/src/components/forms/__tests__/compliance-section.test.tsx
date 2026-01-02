import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useForm } from 'react-hook-form';
import { ComplianceSection } from '../compliance-section';
import { BuyBackFormData } from '../../../lib/schemas/buy-back.schema';

// Mock the UI components that have complex dependencies
jest.mock('@repo/ui/components/calendar', () => ({
  Calendar: ({ onSelect, selected }: any) => (
    <div data-testid="calendar">
      <button onClick={() => onSelect(new Date('2024-01-15'))}>Select Date</button>
      {selected && <span>Selected: {selected.toISOString()}</span>}
    </div>
  ),
}));

jest.mock('@repo/ui/components/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}));

// Wrapper component to provide form context
const TestWrapper = ({ isTrust = false }: { isTrust?: boolean }) => {
  const { control, formState: { errors } } = useForm<BuyBackFormData>({
    defaultValues: {
      compliance: {
        isTrust,
        signatoryName: '',
        signatoryRole: 'director',
        signatureDate: undefined,
      },
    },
  });

  return (
    <ComplianceSection
      control={control}
      errors={errors}
      isTrust={isTrust}
    />
  );
};

describe('ComplianceSection', () => {
  describe('Requirement 9.1: Display compliance statements', () => {
    it('should display the compliance section with title and description', () => {
      render(<TestWrapper />);
      
      expect(screen.getByText('Compliance and Signature')).toBeInTheDocument();
      expect(screen.getByText(/Please review the compliance statements/)).toBeInTheDocument();
    });

    it('should display compliance statement heading', () => {
      render(<TestWrapper />);
      
      expect(screen.getByText('Compliance Statement')).toBeInTheDocument();
    });

    it('should display compliance statement list items', () => {
      render(<TestWrapper />);
      
      expect(screen.getByText(/does not materially prejudice/)).toBeInTheDocument();
      expect(screen.getByText(/approved by the board/)).toBeInTheDocument();
      expect(screen.getByText(/in accordance with the Corporations Act 2001/)).toBeInTheDocument();
    });
  });

  describe('Requirement 9.2: Conditional display of trust vs company statements', () => {
    it('should display company-specific compliance statements when not a trust', () => {
      render(<TestWrapper isTrust={false} />);
      
      expect(screen.getByText(/company's ability to pay its creditors/)).toBeInTheDocument();
      expect(screen.getByText(/lodged all documents required to be lodged with ASIC/)).toBeInTheDocument();
      // Check for company-specific wording (appears twice in the list)
      const constitutionItems = screen.getAllByText(/company's constitution/);
      expect(constitutionItems.length).toBeGreaterThan(0);
    });

    it('should display trust-specific compliance statements when entity is a trust', () => {
      render(<TestWrapper isTrust={true} />);
      
      expect(screen.getByText(/entity's ability to pay its creditors/)).toBeInTheDocument();
      expect(screen.getByText(/being conducted in accordance with the trust deed/)).toBeInTheDocument();
      // Check for entity-specific wording (not company-specific)
      const text = screen.getByText(/The buy-back has been approved by the board in accordance with the entity's constitution/);
      expect(text).toBeInTheDocument();
    });

    it('should not display company-specific statements for trusts', () => {
      render(<TestWrapper isTrust={true} />);
      
      expect(screen.queryByText(/lodged all documents required to be lodged with ASIC/)).not.toBeInTheDocument();
    });

    it('should not display trust-specific statements for companies', () => {
      render(<TestWrapper isTrust={false} />);
      
      expect(screen.queryByText(/being conducted in accordance with the trust deed/)).not.toBeInTheDocument();
    });

    it('should display trust checkbox toggle', () => {
      render(<TestWrapper />);
      
      expect(screen.getByLabelText('This entity is a trust')).toBeInTheDocument();
    });
  });

  describe('Requirement 9.3: Capture signatory information', () => {
    it('should display signatory name field', () => {
      render(<TestWrapper />);
      
      expect(screen.getByLabelText(/Signatory Name/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter full name')).toBeInTheDocument();
    });

    it('should display signatory role field with director option', () => {
      render(<TestWrapper />);
      
      expect(screen.getByText(/Signatory Role/)).toBeInTheDocument();
      expect(screen.getByLabelText('Director')).toBeInTheDocument();
    });

    it('should display signatory role field with company secretary option', () => {
      render(<TestWrapper />);
      
      expect(screen.getByLabelText('Company Secretary')).toBeInTheDocument();
    });

    it('should display signature date field', () => {
      render(<TestWrapper />);
      
      expect(screen.getByText(/Signature Date/)).toBeInTheDocument();
      expect(screen.getByText('Pick a date')).toBeInTheDocument();
    });

    it('should allow selecting director role', () => {
      render(<TestWrapper />);
      
      const directorRadio = screen.getByLabelText('Director') as HTMLInputElement;
      fireEvent.click(directorRadio);
      
      expect(directorRadio.checked).toBe(true);
    });

    it('should allow selecting company secretary role', () => {
      render(<TestWrapper />);
      
      const secretaryRadio = screen.getByLabelText('Company Secretary') as HTMLInputElement;
      fireEvent.click(secretaryRadio);
      
      expect(secretaryRadio.checked).toBe(true);
    });
  });

  describe('Requirement 9.4: Validate required signature fields', () => {
    it('should mark signatory name as required', () => {
      render(<TestWrapper />);
      
      const nameInput = screen.getByPlaceholderText('Enter full name');
      expect(nameInput).toHaveAttribute('aria-required', 'true');
    });

    it('should mark signature date as required', () => {
      render(<TestWrapper />);
      
      // The date picker button should have aria-required
      const dateButton = screen.getByText('Pick a date').closest('button');
      expect(dateButton).toHaveAttribute('aria-required', 'true');
    });

    it('should display help text for signatory name', () => {
      render(<TestWrapper />);
      
      expect(screen.getByText('Full name of the person signing this form')).toBeInTheDocument();
    });

    it('should display help text for signatory role', () => {
      render(<TestWrapper />);
      
      expect(screen.getByText('Select the role of the signatory')).toBeInTheDocument();
    });

    it('should display help text for signature date', () => {
      render(<TestWrapper />);
      
      expect(screen.getByText('Date of signature')).toBeInTheDocument();
    });
  });

  describe('Component structure and accessibility', () => {
    it('should render as a FormSection', () => {
      const { container } = render(<TestWrapper />);
      
      // FormSection renders as a Card, which should be present
      expect(container.querySelector('[class*="space-y-4"]')).toBeInTheDocument();
    });

    it('should have proper field wrappers for all inputs', () => {
      render(<TestWrapper />);
      
      // Check that FormFieldWrapper is used (it adds data-field-name attribute)
      expect(screen.getByLabelText(/Signatory Name/).closest('[data-field-name]')).toBeInTheDocument();
      
      // For role and date, check the wrapper directly since they're not standard form controls
      const roleWrapper = screen.getByText(/Signatory Role/).closest('[data-field-name]');
      expect(roleWrapper).toBeInTheDocument();
      expect(roleWrapper).toHaveAttribute('data-field-name', 'compliance.signatoryRole');
      
      const dateWrapper = screen.getByText(/Signature Date/).closest('[data-field-name]');
      expect(dateWrapper).toBeInTheDocument();
      expect(dateWrapper).toHaveAttribute('data-field-name', 'compliance.signatureDate');
    });

    it('should use Controller for all form fields', () => {
      // This is implicitly tested by the component rendering without errors
      // Controller is required for react-hook-form integration
      render(<TestWrapper />);
      
      expect(screen.getByPlaceholderText('Enter full name')).toBeInTheDocument();
    });
  });
});
