# Form Storage Utilities

This module provides utilities for persisting form drafts to browser localStorage with auto-save functionality and error handling.

## Features

- Save and restore form drafts
- Auto-save with debouncing
- Storage quota error handling
- Multiple form type support
- Corrupted data recovery

## Usage

### Basic Save and Restore

```typescript
import { saveFormDraft, restoreFormDraft, clearFormDraft } from '@/lib/storage/form-storage';

// Save a draft
saveFormDraft('buy-back', { entityName: 'Company Name' });

// Restore a draft
const draft = restoreFormDraft('buy-back');
if (draft) {
  console.log(draft.data); // { entityName: 'Company Name' }
}

// Clear a draft
clearFormDraft('buy-back');
```

### Auto-Save with Debouncing

```typescript
import { createDebouncedSave } from '@/lib/storage/form-storage';

const { debouncedSave, cancel } = createDebouncedSave(1000); // 1 second delay

// These calls will be debounced
debouncedSave('buy-back', { entityName: 'Company 1' });
debouncedSave('buy-back', { entityName: 'Company 2' });
debouncedSave('buy-back', { entityName: 'Company 3' });

// Only the last call will be saved after 1 second

// Cancel pending save if needed
cancel();
```

### React Hook Usage

```typescript
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDebouncedFormSave, restoreFormDraft } from '@/lib/storage/form-storage';

function MyForm() {
  const { watch, reset } = useForm();
  const { save, cancel } = useDebouncedFormSave('buy-back', 1000);
  
  // Restore draft on mount
  useEffect(() => {
    const draft = restoreFormDraft('buy-back');
    if (draft) {
      reset(draft.data);
    }
  }, [reset]);
  
  // Auto-save on form changes
  const formValues = watch();
  useEffect(() => {
    save(formValues);
    return () => cancel(); // Cleanup on unmount
  }, [formValues, save, cancel]);
  
  return <form>{/* form fields */}</form>;
}
```

### Error Handling

```typescript
import { saveFormDraft, StorageQuotaExceededError } from '@/lib/storage/form-storage';

try {
  saveFormDraft('buy-back', largeFormData);
} catch (error) {
  if (error instanceof StorageQuotaExceededError) {
    // Handle quota exceeded
    alert('Storage is full. Please clear some browser data.');
  } else {
    // Handle other errors
    console.error('Failed to save draft:', error);
  }
}
```

### Managing Multiple Drafts

```typescript
import { getAllDrafts, clearAllDrafts, hasDraft } from '@/lib/storage/form-storage';

// Check if a draft exists
if (hasDraft('buy-back')) {
  console.log('Draft exists for buy-back form');
}

// Get all drafts
const allDrafts = getAllDrafts();
console.log(`Found ${allDrafts.length} drafts`);

// Clear all drafts
clearAllDrafts();
```

## API Reference

### `saveFormDraft(formType, data, version?)`
Saves a form draft to localStorage.

**Parameters:**
- `formType` (string): The type of form (e.g., 'buy-back')
- `data` (Record<string, any>): The form data to save
- `version` (number, optional): Version number (default: 1)

**Throws:**
- `StorageQuotaExceededError`: When storage quota is exceeded
- `Error`: When localStorage is not available

### `restoreFormDraft(formType)`
Restores a form draft from localStorage.

**Parameters:**
- `formType` (string): The type of form to restore

**Returns:**
- `StoredFormDraft | null`: The stored draft or null if not found

### `clearFormDraft(formType)`
Clears a form draft from localStorage.

**Parameters:**
- `formType` (string): The type of form to clear

### `hasDraft(formType)`
Checks if a draft exists for a specific form type.

**Parameters:**
- `formType` (string): The type of form to check

**Returns:**
- `boolean`: True if a draft exists

### `getAllDrafts()`
Gets all form drafts from localStorage.

**Returns:**
- `StoredFormDraft[]`: Array of all stored drafts

### `clearAllDrafts()`
Clears all form drafts from localStorage.

### `createDebouncedSave(delay?)`
Creates a debounced version of the save function.

**Parameters:**
- `delay` (number, optional): Delay in milliseconds (default: 1000)

**Returns:**
- Object with `debouncedSave` and `cancel` functions

### `useDebouncedFormSave(formType, delay?)`
Hook-friendly debounced save function factory.

**Parameters:**
- `formType` (string): The type of form
- `delay` (number, optional): Delay in milliseconds (default: 1000)

**Returns:**
- Object with `save` and `cancel` functions

## Storage Structure

Drafts are stored with the key pattern: `form-draft-${formType}`

Each draft contains:
```typescript
{
  formType: string;      // Type of form
  lastSaved: string;     // ISO 8601 timestamp
  data: Record<string, any>;  // Form data
  version: number;       // Version number
}
```


---

# Version Tracking System

This module provides version management and change tracking for form submissions, maintaining an audit trail of all changes made to form data.

## Features

- Automatic version numbering
- Delta calculation between versions
- Complete version history storage
- Change tracking (added, modified, removed fields)
- Timestamp and user tracking
- Version comparison utilities

## Usage

### Creating Versions

```typescript
import { createVersion } from '@/lib/storage/version-tracker';

// Create first version
const version1 = createVersion(
  'buy-back',
  'form-123',
  { name: 'Test Company', abn: '12345678901' },
  'user-456' // optional userId
);

console.log(version1.versionNumber); // 1
console.log(version1.delta); // undefined (first version has no delta)

// Create second version with changes
const version2 = createVersion(
  'buy-back',
  'form-123',
  { name: 'Updated Company', abn: '12345678901', city: 'Sydney' }
);

console.log(version2.versionNumber); // 2
console.log(version2.delta); 
// {
//   added: { city: 'Sydney' },
//   modified: { name: { old: 'Test Company', new: 'Updated Company' } },
//   removed: {}
// }
```

### Retrieving Version History

```typescript
import { getVersionHistory, getVersion, getLatestVersion } from '@/lib/storage/version-tracker';

// Get complete history
const history = getVersionHistory('buy-back', 'form-123');
console.log(history.currentVersion); // 2
console.log(history.versions.length); // 2

// Get specific version
const version1 = getVersion('buy-back', 'form-123', 1);
console.log(version1?.data);

// Get latest version
const latest = getLatestVersion('buy-back', 'form-123');
console.log(latest?.versionNumber);
```

### Comparing Versions

```typescript
import { compareVersions, calculateDelta } from '@/lib/storage/version-tracker';

// Compare two versions
const delta = compareVersions('buy-back', 'form-123', 1, 3);
console.log(delta?.added);
console.log(delta?.modified);
console.log(delta?.removed);

// Calculate delta manually
const previous = { name: 'John', age: 30 };
const current = { name: 'Jane', age: 30, city: 'Sydney' };
const manualDelta = calculateDelta(previous, current);
// {
//   added: { city: 'Sydney' },
//   modified: { name: { old: 'John', new: 'Jane' } },
//   removed: {}
// }
```

### Managing Version History

```typescript
import { clearVersionHistory, getAllVersionHistories } from '@/lib/storage/version-tracker';

// Clear history for a specific form
clearVersionHistory('buy-back', 'form-123');

// Get all version histories
const allHistories = getAllVersionHistories();
console.log(`Found ${allHistories.length} form histories`);
```

## API Reference

### `createVersion<T>(formType, formId, data, userId?)`
Creates a new version entry for form data.

**Parameters:**
- `formType` (string): Type of form
- `formId` (string): Unique identifier for the form instance
- `data` (T): Current form data
- `userId` (string, optional): User identifier

**Returns:**
- `FormVersion<T>`: The created version with metadata and delta

### `calculateDelta(previous, current)`
Calculates the delta (differences) between two form versions.

**Parameters:**
- `previous` (Record<string, any>): Previous version of form data
- `current` (Record<string, any>): Current version of form data

**Returns:**
- `FormDelta`: Object with added, modified, and removed fields

### `getVersionHistory<T>(formType, formId)`
Retrieves the version history for a form.

**Parameters:**
- `formType` (string): Type of form
- `formId` (string): Unique identifier for the form instance

**Returns:**
- `FormVersionHistory<T>`: Complete version history

### `getVersion<T>(formType, formId, versionNumber)`
Retrieves a specific version by version number.

**Parameters:**
- `formType` (string): Type of form
- `formId` (string): Unique identifier for the form instance
- `versionNumber` (number): Version number to retrieve

**Returns:**
- `FormVersion<T> | undefined`: The version or undefined if not found

### `getLatestVersion<T>(formType, formId)`
Retrieves the latest version.

**Parameters:**
- `formType` (string): Type of form
- `formId` (string): Unique identifier for the form instance

**Returns:**
- `FormVersion<T> | undefined`: The latest version or undefined if no versions exist

### `compareVersions(formType, formId, fromVersion, toVersion)`
Compares two versions and returns the delta.

**Parameters:**
- `formType` (string): Type of form
- `formId` (string): Unique identifier for the form instance
- `fromVersion` (number): Starting version number
- `toVersion` (number): Ending version number

**Returns:**
- `FormDelta | undefined`: Delta between versions or undefined if versions not found

### `clearVersionHistory(formType, formId)`
Clears all version history for a form.

**Parameters:**
- `formType` (string): Type of form
- `formId` (string): Unique identifier for the form instance

### `getAllVersionHistories()`
Gets all version histories from local storage.

**Returns:**
- `FormVersionHistory[]`: Array of all stored version histories

## Data Structures

### FormVersion
```typescript
interface FormVersion<T = any> {
  versionId: string;           // Unique version identifier
  versionNumber: number;       // Incremental version number
  timestamp: string;           // ISO 8601 timestamp
  userId?: string;             // User who created this version
  data: T;                     // Complete form data
  delta?: FormDelta;           // Changes from previous version
  previousVersionId?: string;  // Reference to previous version
}
```

### FormDelta
```typescript
interface FormDelta {
  added: Record<string, any>;                        // Newly added fields
  modified: Record<string, { old: any; new: any }>; // Modified fields with old/new values
  removed: Record<string, any>;                      // Removed fields
}
```

### FormVersionHistory
```typescript
interface FormVersionHistory<T = any> {
  formType: string;           // Form type identifier
  currentVersion: number;     // Current version number
  versions: FormVersion<T>[]; // All versions in chronological order
}
```

## Storage Structure

Version histories are stored with the key pattern: `form-version-history-${formType}-${formId}`

## Integration with Form Submissions

When submitting a form with version tracking:

```typescript
import { createVersion } from '@/lib/storage/version-tracker';
import { FormSubmission } from '@/lib/types/forms';

const submitFormWithVersioning = async (formType: string, formId: string, data: any) => {
  // Create new version
  const version = createVersion(formType, formId, data, currentUserId);
  
  // Build submission document
  const submission: FormSubmission = {
    submissionId: generateUUID(),
    formType,
    formVersion: '1.0.0',
    submittedAt: new Date().toISOString(),
    data,
    versionNumber: version.versionNumber,
    delta: version.delta,
    previousVersion: version.previousVersionId,
  };
  
  // Submit to API
  await submitForm(submission);
};
```

## Best Practices

1. **Unique Form IDs**: Always use unique form IDs to prevent version history conflicts
2. **Clean Up**: Clear version history after successful final submission if no longer needed
3. **Storage Limits**: Be mindful of localStorage size limits (typically 5-10MB)
4. **Sensitive Data**: Don't store sensitive information in version history
5. **User Context**: Include userId when available for better audit trails
