# Utility Functions

This directory contains utility functions used throughout the announcements application.

## form-helpers.ts

Form helper utilities for handling form submissions, date formatting, and data transformations.

### UUID Generation

```typescript
import { generateUUID } from './form-helpers';

const submissionId = generateUUID();
// Returns: "550e8400-e29b-41d4-a716-446655440000"
```

### Date Formatting

```typescript
import { 
  formatDateToISO, 
  formatDateToDisplay, 
  formatDateToShort,
  parseISODate 
} from './form-helpers';

const date = new Date('2025-10-20T14:30:00.000Z');

// ISO 8601 format for API submission
const iso = formatDateToISO(date);
// Returns: "2025-10-20T14:30:00.000Z"

// Human-readable format for display
const display = formatDateToDisplay(date);
// Returns: "20 October 2025"

// Short format for compact display
const short = formatDateToShort(date);
// Returns: "20/10/2025"

// Parse ISO string back to Date
const parsed = parseISODate("2025-10-20T14:30:00.000Z");
// Returns: Date object
```

### Form Submission Creation

```typescript
import { createFormSubmission } from './form-helpers';

const formData = {
  entityName: 'Example Corp',
  abnArsn: '12345678901',
  // ... other form fields
};

// Create a new submission
const submission = createFormSubmission('buy-back', '1.0.0', formData);

// Create an updated submission with version tracking
const updatedSubmission = createFormSubmission('buy-back', '1.0.0', formData, {
  previousVersion: 'prev-uuid',
  versionNumber: 2,
  delta: {
    added: {},
    modified: { entityName: { old: 'Old Corp', new: 'Example Corp' } },
    removed: {},
  },
});
```

### Date Transformation

```typescript
import { 
  transformDatesForSubmission, 
  transformDatesFromStorage 
} from './form-helpers';

// Convert Date objects to ISO strings for API submission
const formData = {
  compliance: {
    signatureDate: new Date('2025-10-20'),
    signatoryName: 'John Doe',
  },
};

const transformed = transformDatesForSubmission(formData);
// Returns: { compliance: { signatureDate: "2025-10-20T00:00:00.000Z", signatoryName: "John Doe" } }

// Convert ISO strings back to Date objects when restoring from storage
const stored = {
  compliance: {
    signatureDate: "2025-10-20T00:00:00.000Z",
    signatoryName: 'John Doe',
  },
};

const restored = transformDatesFromStorage(stored, ['signatureDate']);
// Returns: { compliance: { signatureDate: Date, signatoryName: "John Doe" } }
```

### Data Cleaning

```typescript
import { removeEmptyFields } from './form-helpers';

const formData = {
  entityName: 'Example Corp',
  optionalField: undefined,
  nullField: null,
  nested: {
    value: 42,
    empty: undefined,
  },
};

// Remove undefined fields
const cleaned = removeEmptyFields(formData);
// Returns: { entityName: 'Example Corp', nullField: null, nested: { value: 42 } }

// Remove both undefined and null fields
const cleanedStrict = removeEmptyFields(formData, true);
// Returns: { entityName: 'Example Corp', nested: { value: 42 } }
```

### Deep Operations

```typescript
import { deepClone, deepEqual } from './form-helpers';

const original = {
  name: 'Test',
  nested: { value: 42 },
  date: new Date('2025-10-20'),
};

// Create an independent copy
const cloned = deepClone(original);
cloned.nested.value = 100;
// original.nested.value is still 42

// Compare two objects deeply
const obj1 = { name: 'Test', nested: { value: 42 } };
const obj2 = { name: 'Test', nested: { value: 42 } };
const obj3 = { name: 'Test', nested: { value: 43 } };

deepEqual(obj1, obj2); // true
deepEqual(obj1, obj3); // false
```

## toast.ts

Toast notification system for displaying user feedback messages.

See [toast.test.ts](./__tests__/toast.test.ts) for usage examples.
