# Forms Components

This directory contains reusable form components for the announcements application.

## Components

### BuyBackForm

The main form component for buy-back announcements (Appendix 3C).

```tsx
import { BuyBackForm } from './components/forms/buy-back-form';

<BuyBackForm
  initialData={savedDraft}
  onSubmit={handleSubmit}
  onSaveDraft={handleSaveDraft}
  onSubmitSuccess={(id) => console.log('Submitted:', id)}
  onSubmitError={(error) => console.error('Error:', error)}
/>
```

### FormReview

Displays completed form data in read-only format for user review before submission.

```tsx
import { FormReview } from './components/forms/form-review';

<FormReview
  data={formData}
  onEdit={() => setShowReview(false)}
  onConfirm={handleConfirmSubmission}
  isSubmitting={isSubmitting}
/>
```

**Features:**
- Displays all form data organized by sections
- Highlights active conditional sections based on buy-back type
- Shows only relevant conditional section data
- Provides Edit and Confirm buttons
- Disables buttons during submission

**Props:**
- `data`: Complete form data (BuyBackFormData)
- `onEdit`: Callback when user clicks Edit button
- `onConfirm`: Callback when user clicks Confirm button
- `isSubmitting`: Optional boolean to disable buttons during submission

### FormFieldWrapper

A reusable wrapper for form fields that handles labels, errors, and help text.

```tsx
import { FormFieldWrapper } from './components/forms/form-field-wrapper';

<FormFieldWrapper
  label="Entity Name"
  name="entityName"
  required
  helpText="Full legal name of the entity"
  error={errors.entityName}
>
  <Input {...field} />
</FormFieldWrapper>
```

### FormSection

Groups related form fields with visual separation and optional conditional rendering.

```tsx
import { FormSection } from './components/forms/form-section';

<FormSection
  title="Entity Information"
  description="Provide details about the entity"
  visible={true}
>
  {/* Form fields */}
</FormSection>
```

### ComplianceSection

Renders compliance statements and signature fields.

```tsx
import { ComplianceSection } from './components/forms/compliance-section';

<ComplianceSection
  control={control}
  errors={errors}
  isTrust={isTrust}
/>
```

## Usage Example

Here's a complete example of using the form with review:

```tsx
import { useState } from 'react';
import { BuyBackForm } from './components/forms/buy-back-form';
import { FormReview } from './components/forms/form-review';
import { BuyBackFormData } from './lib/schemas/buy-back.schema';

export default function BuyBackPage() {
  const [showReview, setShowReview] = useState(false);
  const [formData, setFormData] = useState<BuyBackFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data: BuyBackFormData) => {
    // Store data and show review
    setFormData(data);
    setShowReview(true);
  };

  const handleConfirmSubmission = async () => {
    if (!formData) return;
    
    setIsSubmitting(true);
    try {
      // Submit to API
      await submitForm(formData);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showReview && formData) {
    return (
      <FormReview
        data={formData}
        onEdit={() => setShowReview(false)}
        onConfirm={handleConfirmSubmission}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <BuyBackForm
      onSubmit={handleFormSubmit}
    />
  );
}
```
