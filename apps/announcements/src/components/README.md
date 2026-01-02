# Form Components

This directory contains reusable form UI components for the announcements application.

## Components

### FormFieldWrapper

A wrapper component that provides consistent field rendering with labels, errors, and help text. It handles accessibility attributes automatically.

**Props:**
- `label` (string, required): The field label text
- `name` (string, required): The field name for identification
- `required` (boolean, optional): Whether the field is required (shows asterisk)
- `helpText` (string, optional): Help text displayed below the field
- `error` (FieldError, optional): Error object from react-hook-form
- `children` (ReactNode, required): The input component to wrap
- `className` (string, optional): Additional CSS classes

**Example:**
```tsx
import { FormFieldWrapper } from '@/components/forms';
import { Input } from '@repo/ui';
import { useForm } from 'react-hook-form';

function MyForm() {
  const { register, formState: { errors } } = useForm();
  
  return (
    <FormFieldWrapper
      label="Entity Name"
      name="entityName"
      required
      helpText="Enter the full legal name of the entity"
      error={errors.entityName}
    >
      <Input {...register('entityName')} />
    </FormFieldWrapper>
  );
}
```

### FormSection

Groups related form fields with visual separation and optional conditional rendering.

**Props:**
- `title` (string, required): The section title
- `description` (string, optional): Section description text
- `children` (ReactNode, required): The form fields to group
- `visible` (boolean, optional, default: true): Whether the section is visible
- `className` (string, optional): Additional CSS classes

**Example:**
```tsx
import { FormSection, FormFieldWrapper } from '@/components/forms';
import { Input } from '@repo/ui';

function MyForm() {
  const buyBackType = watch('buyBackType');
  
  return (
    <FormSection
      title="Entity Information"
      description="Provide details about the entity"
      visible={true}
    >
      <FormFieldWrapper label="Name" name="name">
        <Input {...register('name')} />
      </FormFieldWrapper>
      
      <FormFieldWrapper label="ABN/ARSN" name="abn">
        <Input {...register('abn')} />
      </FormFieldWrapper>
    </FormSection>
  );
}
```

### FormProgress

Provides visual progress indication for multi-step forms with step indicators and labels.

**Props:**
- `steps` (FormProgressStep[], required): Array of step objects
- `currentStep` (number, required): Index of the current step (0-based)
- `className` (string, optional): Additional CSS classes

**FormProgressStep interface:**
- `id` (string): Unique identifier for the step
- `label` (string): Display label for the step
- `completed` (boolean): Whether the step is completed

**Example:**
```tsx
import { FormProgress } from '@/components/ui';

function MyForm() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { id: 'entity', label: 'Entity Info', completed: currentStep > 0 },
    { id: 'buyback', label: 'Buy-Back Details', completed: currentStep > 1 },
    { id: 'compliance', label: 'Compliance', completed: currentStep > 2 },
  ];
  
  return (
    <FormProgress steps={steps} currentStep={currentStep} />
  );
}
```

### ComplianceSection

Renders compliance statements and signature fields with conditional display based on entity type (trust vs company).

**Props:**
- `control` (Control<BuyBackFormData>, required): react-hook-form control object
- `errors` (FieldErrors<BuyBackFormData>, required): Form validation errors
- `isTrust` (boolean, required): Whether the entity is a trust (determines which compliance statements to show)

**Features:**
- Conditional compliance statements for trust vs company entities
- Trust/company toggle checkbox
- Signatory name input field
- Signatory role selection (Director or Company Secretary)
- Signature date picker with calendar component
- Full validation and error display
- Accessibility compliant with proper ARIA attributes

**Example:**
```tsx
import { ComplianceSection } from '@/components/forms';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buyBackFormSchema } from '@/lib/schemas/buy-back.schema';

function BuyBackForm() {
  const { control, watch, formState: { errors } } = useForm({
    resolver: zodResolver(buyBackFormSchema),
  });
  
  const isTrust = watch('compliance.isTrust');
  
  return (
    <ComplianceSection
      control={control}
      errors={errors}
      isTrust={isTrust}
    />
  );
}
```

**Requirements Satisfied:**
- 9.1: Displays required compliance statements from source document
- 9.2: Conditional display of trust vs company compliance statements
- 9.3: Captures signatory name, role (Director/Company Secretary), and date
- 9.4: Validates all required signature fields

## Accessibility

All components follow WCAG 2.1 AA accessibility guidelines:

- **FormFieldWrapper**: Automatically adds proper ARIA attributes (`aria-describedby`, `aria-invalid`, `aria-label`)
- **FormSection**: Uses semantic HTML with proper heading hierarchy
- **FormProgress**: Includes `aria-current` for the active step and proper navigation semantics

## Styling

Components use Tailwind CSS classes and are styled to match the design system. They integrate with the `@repo/ui` component library for consistent styling across the application.
