import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormFieldWrapper } from '../form-field-wrapper';
import { FormSection } from '../form-section';
import { FormProgress } from '../../ui/form-progress';
import { Input } from '@repo/ui';

describe('Form Components', () => {
  describe('FormFieldWrapper', () => {
    it('renders label and children', () => {
      render(
        <FormFieldWrapper label="Test Field" name="testField">
          <Input placeholder="Test input" />
        </FormFieldWrapper>
      );

      expect(screen.getByText('Test Field')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
    });

    it('displays required indicator when required is true', () => {
      render(
        <FormFieldWrapper label="Required Field" name="requiredField" required>
          <Input />
        </FormFieldWrapper>
      );

      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('displays help text when provided', () => {
      render(
        <FormFieldWrapper
          label="Field with Help"
          name="fieldWithHelp"
          helpText="This is helpful information"
        >
          <Input />
        </FormFieldWrapper>
      );

      expect(screen.getByText('This is helpful information')).toBeInTheDocument();
    });

    it('displays error message when error is provided', () => {
      const error = { type: 'required', message: 'This field is required' };
      
      render(
        <FormFieldWrapper
          label="Field with Error"
          name="fieldWithError"
          error={error as any}
        >
          <Input />
        </FormFieldWrapper>
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('hides help text when error is present', () => {
      const error = { type: 'required', message: 'Error message' };
      
      render(
        <FormFieldWrapper
          label="Field"
          name="field"
          helpText="Help text"
          error={error as any}
        >
          <Input />
        </FormFieldWrapper>
      );

      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('FormSection', () => {
    it('renders title, description, and children when visible', () => {
      render(
        <FormSection
          title="Test Section"
          description="Section description"
          visible={true}
        >
          <div>Section content</div>
        </FormSection>
      );

      expect(screen.getByText('Test Section')).toBeInTheDocument();
      expect(screen.getByText('Section description')).toBeInTheDocument();
      expect(screen.getByText('Section content')).toBeInTheDocument();
    });

    it('does not render when visible is false', () => {
      render(
        <FormSection title="Hidden Section" visible={false}>
          <div>Hidden content</div>
        </FormSection>
      );

      expect(screen.queryByText('Hidden Section')).not.toBeInTheDocument();
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('renders without description', () => {
      render(
        <FormSection title="Section Without Description">
          <div>Content</div>
        </FormSection>
      );

      expect(screen.getByText('Section Without Description')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('FormProgress', () => {
    const mockSteps = [
      { id: 'step1', label: 'Step 1', completed: true },
      { id: 'step2', label: 'Step 2', completed: false },
      { id: 'step3', label: 'Step 3', completed: false },
    ];

    it('renders all steps', () => {
      render(<FormProgress steps={mockSteps} currentStep={1} />);

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
    });

    it('marks completed steps with checkmark', () => {
      const { container } = render(<FormProgress steps={mockSteps} currentStep={1} />);

      // First step should have a checkmark (completed)
      const checkmarks = container.querySelectorAll('svg');
      expect(checkmarks.length).toBeGreaterThan(0);
    });

    it('displays step numbers for incomplete steps', () => {
      render(<FormProgress steps={mockSteps} currentStep={1} />);

      // Step 2 and 3 should show numbers
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('marks current step with aria-current', () => {
      const { container } = render(<FormProgress steps={mockSteps} currentStep={1} />);

      const currentStepIndicator = container.querySelector('[aria-current="step"]');
      expect(currentStepIndicator).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(<FormProgress steps={mockSteps} currentStep={0} />);

      expect(screen.getByLabelText('Form progress')).toBeInTheDocument();
    });
  });
});
