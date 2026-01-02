# Form Configuration

This directory contains the centralized configuration for all announcement forms in the system.

## Overview

The `forms.ts` file provides a registry-based approach to managing form metadata, settings, and routing. This enables:

- **Extensibility**: Easy addition of new forms following a consistent pattern
- **Type Safety**: TypeScript types for all form configurations
- **Centralized Management**: Single source of truth for form settings
- **Reusability**: Shared configuration across the application

## Key Components

### Form Type Constants

```typescript
import { FORM_TYPES } from '@/config/forms';

// Access form types
const buyBackType = FORM_TYPES.BUY_BACK;
```

### Form Registry

The `FORM_REGISTRY` contains metadata for all forms:

```typescript
import { FORM_REGISTRY } from '@/config/forms';

const buyBackForm = FORM_REGISTRY[FORM_TYPES.BUY_BACK];
console.log(buyBackForm.displayName); // "Buy-Back Announcement"
console.log(buyBackForm.routes.form); // "/forms/buy-back"
```

### Form Settings

Each form has configurable settings:

- `autoSaveInterval`: Auto-save debounce interval (milliseconds)
- `validationMode`: When to validate form fields
- `reValidateMode`: When to revalidate after initial validation
- `showProgress`: Whether to show progress indicator
- `enableDraftRestoration`: Whether to restore drafts from local storage
- `enableVersionTracking`: Whether to track version history
- `maxVersionHistory`: Maximum versions to keep

### Helper Functions

#### Get Form Metadata

```typescript
import { getFormMetadata, FORM_TYPES } from '@/config/forms';

const metadata = getFormMetadata(FORM_TYPES.BUY_BACK);
if (metadata) {
  console.log(metadata.displayName);
  console.log(metadata.estimatedTime);
}
```

#### Get Form Routes

```typescript
import { getFormRoute, FORM_TYPES } from '@/config/forms';

const formRoute = getFormRoute(FORM_TYPES.BUY_BACK, 'form');
const reviewRoute = getFormRoute(FORM_TYPES.BUY_BACK, 'review');
```

#### Get Form Settings

```typescript
import { getFormSettings, FORM_TYPES } from '@/config/forms';

const settings = getFormSettings(FORM_TYPES.BUY_BACK);
console.log(settings.autoSaveInterval); // 2000
```

#### Validate Form Type

```typescript
import { isValidFormType } from '@/config/forms';

if (isValidFormType(formType)) {
  // Type is valid and registered
}
```

#### Get Storage Keys

```typescript
import { getFormDraftKey, getFormVersionKey, FORM_TYPES } from '@/config/forms';

const draftKey = getFormDraftKey(FORM_TYPES.BUY_BACK);
// "form-draft-buy-back"

const versionKey = getFormVersionKey(FORM_TYPES.BUY_BACK);
// "form-versions-buy-back"
```

## Adding a New Form

To add a new form to the system:

1. **Add Form Type Constant**

```typescript
export const FORM_TYPES = {
  BUY_BACK: 'buy-back',
  NEW_FORM: 'new-form', // Add here
} as const;
```

2. **Create Form Schema**

Create a Zod schema in `src/lib/schemas/new-form.schema.ts`:

```typescript
import { z } from 'zod';

export const newFormSchema = z.object({
  // Define your schema
});

export type NewFormData = z.infer<typeof newFormSchema>;
```

3. **Add to Form Registry**

```typescript
import { newFormSchema } from '@/lib/schemas/new-form.schema';

export const FORM_REGISTRY: Record<FormType, FormMetadata> = {
  // ... existing forms
  [FORM_TYPES.NEW_FORM]: {
    type: FORM_TYPES.NEW_FORM,
    displayName: 'New Form Name',
    description: 'Description of the form',
    sourceDocument: 'Appendix XX',
    version: '1.0.0',
    schema: newFormSchema,
    settings: {
      ...DEFAULT_FORM_SETTINGS,
      // Override settings if needed
    },
    routes: {
      form: '/forms/new-form',
      review: '/forms/new-form/review',
      success: '/forms/success',
    },
    apiEndpoint: '/api/forms/new-form',
    estimatedTime: 15,
    tags: ['tag1', 'tag2'],
  },
};
```

4. **Create Form Component**

Use the buy-back form as a template and access configuration:

```typescript
import { getFormMetadata, FORM_TYPES } from '@/config/forms';

const metadata = getFormMetadata(FORM_TYPES.NEW_FORM);
const settings = metadata?.settings;
```

## Usage in Components

### In Form Components

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getFormMetadata, FORM_TYPES } from '@/config/forms';

export function NewForm() {
  const metadata = getFormMetadata(FORM_TYPES.NEW_FORM);
  
  const form = useForm({
    resolver: zodResolver(metadata!.schema),
    mode: metadata!.settings.validationMode,
    reValidateMode: metadata!.settings.reValidateMode,
  });
  
  // Use auto-save interval
  const autoSaveInterval = metadata!.settings.autoSaveInterval;
  
  // ...
}
```

### In Storage Utilities

```typescript
import { getFormDraftKey, FORM_TYPES } from '@/config/forms';

function saveDraft(formType: FormType, data: any) {
  const key = getFormDraftKey(formType);
  localStorage.setItem(key, JSON.stringify(data));
}
```

### In Routing

```typescript
import { useRouter } from 'next/navigation';
import { getFormRoute, FORM_TYPES } from '@/config/forms';

function navigateToReview() {
  const router = useRouter();
  const reviewRoute = getFormRoute(FORM_TYPES.BUY_BACK, 'review');
  if (reviewRoute) {
    router.push(reviewRoute);
  }
}
```

## Benefits

1. **Single Source of Truth**: All form configuration in one place
2. **Type Safety**: TypeScript ensures correct usage
3. **Consistency**: All forms follow the same pattern
4. **Maintainability**: Easy to update settings across all forms
5. **Discoverability**: Developers can see all available forms
6. **Extensibility**: Simple pattern for adding new forms

## Related Files

- `src/lib/schemas/` - Form validation schemas
- `src/components/forms/` - Form components
- `src/lib/storage/` - Storage utilities using form keys
- `src/app/forms/` - Form pages and routes
