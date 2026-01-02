# Buy-Back Form Page

This directory contains the buy-back announcement form page implementation.

## Overview

The buy-back form page provides a user interface for completing and submitting buy-back announcement forms (Appendix 3C) to ASX. It implements the requirements from the announcement forms system specification.

## Features

### Form Initialization
- Automatically restores draft data from local storage on page load
- Displays a notification when a saved draft is found
- Allows users to continue with the draft or start fresh

### Auto-Save
- Form data is automatically saved to local storage as users type
- Debounced to prevent excessive storage operations
- Persists across browser sessions

### Navigation
- Redirects to review page after successful submission
- Provides clear error messages on submission failure

### User Experience
- Loading state while checking for saved drafts
- Clear page header with instructions
- Responsive design for desktop and tablet
- Toast notifications for user feedback
- Help text and links to ASX Listing Rules

## File Structure

```
buy-back/
├── page.tsx              # Main page component
├── __tests__/
│   └── page.test.tsx     # Page tests
└── README.md             # This file
```

## Usage

Navigate to `/forms/buy-back` to access the form.

### URL Parameters

The page accepts the following query parameters after submission:
- `submissionId`: The ID of the submitted form (used for review page)

## Components Used

- `BuyBackForm`: Main form component with all form fields and validation
- `ToastContainer`: Displays toast notifications
- `Button`: UI button component from shared package
- `Card`: UI card component from shared package

## State Management

The page manages the following state:
- `initialData`: Form data restored from local storage
- `showDraftNotification`: Whether to show the draft notification
- `isLoading`: Loading state while checking for drafts

## Local Storage

The page uses the following local storage keys:
- `form-draft-buy-back`: Stores the draft form data

## Requirements Satisfied

- **1.1**: Display buy-back form with all required fields
- **6.2**: Restore form data from local storage
- **8.1**: Use react-hook-form for form management

## Testing

Run tests with:
```bash
pnpm test -- src/app/forms/buy-back/__tests__/page.test.tsx
```

## Future Enhancements

- Add progress indicator for multi-step forms
- Implement form validation summary
- Add keyboard shortcuts for common actions
- Support for saving multiple drafts
