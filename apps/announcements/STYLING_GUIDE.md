# Announcement Forms Styling Guide

## Quick Reference for Responsive Design Patterns

### Typography Scale
```tsx
// Page Titles
className="text-2xl sm:text-3xl lg:text-4xl font-bold"

// Section Titles
className="text-base sm:text-lg lg:text-xl font-semibold"

// Subsection Titles
className="text-sm sm:text-base font-semibold"

// Body Text
className="text-xs sm:text-sm"

// Help Text
className="text-xs sm:text-sm text-muted-foreground"
```

### Spacing Scale
```tsx
// Container Padding
className="p-4 sm:p-6 lg:p-8"

// Section Spacing
className="space-y-4 sm:space-y-6"

// Field Spacing
className="space-y-4 sm:space-y-5"

// Button Gaps
className="gap-3 sm:gap-4"
```

### Layout Patterns
```tsx
// Responsive Button Group
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  <Button className="w-full sm:w-auto">Action</Button>
</div>

// Responsive Grid
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* Content */}
</div>

// Responsive Flex
<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
  {/* Content */}
</div>
```

### Card Styles
```tsx
// Standard Card
<Card className="p-4 sm:p-6 lg:p-8 shadow-lg">

// Highlighted Card
<Card className="p-4 sm:p-6 border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">

// Gradient Card
<Card className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100/50">
```

### Loading States
```tsx
// Button Loading
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      Loading...
    </>
  ) : 'Submit'}
</Button>

// Full Page Loading
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
  <div className="text-center px-4">
    <div className="relative w-16 h-16 mx-auto mb-6">
      <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
    <p className="text-sm sm:text-base text-muted-foreground font-medium">Loading...</p>
  </div>
</div>

// Modal Loading Overlay
{isSubmitting && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-sm mx-4 text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing</h3>
      <p className="text-sm text-gray-600">Please wait...</p>
    </div>
  </div>
)}
```

### Error States
```tsx
// Field Error with Icon
{error && (
  <p className="text-xs sm:text-sm font-medium text-destructive flex items-start gap-1.5" role="alert">
    <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
    <span>{error.message}</span>
  </p>
)}

// Error Page
<Card className="p-6 sm:p-8 lg:p-12 text-center shadow-lg">
  <div className="mb-6">
    <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 flex items-center justify-center">
      <svg className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  </div>
  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Error Title</h2>
  <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">Error message</p>
</Card>
```

### Status Badges
```tsx
// Auto-save Indicator
<div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-white px-3 py-2 rounded-lg border shadow-sm">
  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
  <span className="font-medium">Auto-saving</span>
</div>

// Incomplete Badge
<span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
  Incomplete
</span>
```

### Icon Patterns
```tsx
// Section Header Icon
<h4 className="font-semibold text-sm sm:text-base flex items-center gap-2">
  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
    {/* Icon path */}
  </svg>
  Section Title
</h4>

// Button Icon
<Button>
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {/* Icon path */}
  </svg>
  Button Text
</Button>
```

### Gradient Backgrounds
```tsx
// Page Background
className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30"

// Card Background
className="bg-gradient-to-br from-gray-50 to-gray-100/50"

// Highlighted Section
className="bg-gradient-to-br from-primary/5 to-primary/10"

// Info Box
className="bg-gradient-to-r from-blue-50 to-blue-50/50"

// Compliance Box
className="bg-gradient-to-br from-blue-50 to-blue-50/30"
```

### Shadow System
```tsx
// Default
className="shadow-sm"

// Hover
className="shadow-sm hover:shadow-md transition-shadow"

// Elevated
className="shadow-lg"

// Modal
className="shadow-2xl"
```

### Transition Patterns
```tsx
// Hover Transition
className="transition-all duration-200 hover:shadow-md"

// Color Transition
className="transition-colors duration-200"

// Transform Transition
className="transition-transform duration-200 hover:scale-105"
```

## Common Component Patterns

### Form Section
```tsx
<FormSection
  title="Section Title"
  description="Section description"
  className="border-l-4 border-l-primary/20"
>
  {/* Fields */}
</FormSection>
```

### Form Field
```tsx
<FormFieldWrapper
  label="Field Label"
  name="fieldName"
  required
  helpText="Help text"
  error={errors.fieldName}
>
  <Input {...field} placeholder="Enter value" />
</FormFieldWrapper>
```

### Action Buttons
```tsx
<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-6 mt-6 border-t">
  <Button variant="outline" className="w-full sm:w-auto order-3 sm:order-1">
    Secondary Action
  </Button>
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2">
    <Button variant="outline" className="w-full sm:w-auto">
      Review
    </Button>
    <Button type="submit" className="w-full sm:w-auto">
      Submit
    </Button>
  </div>
</div>
```

## Accessibility Checklist

- [ ] All interactive elements have adequate touch targets (min 44x44px)
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] Focus indicators are visible
- [ ] Error messages have `role="alert"`
- [ ] Form fields have associated labels
- [ ] Loading states are announced to screen readers
- [ ] Keyboard navigation works throughout
- [ ] Icons have `aria-hidden="true"` or descriptive text

## Performance Tips

1. Use CSS transitions instead of JavaScript animations
2. Avoid layout shifts with proper sizing
3. Use `will-change` sparingly
4. Optimize images and icons
5. Lazy load heavy components
6. Debounce expensive operations
7. Use React.memo for expensive renders

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with -webkit- prefixes for scrollbar)
- Mobile browsers: Full support

## Testing Checklist

- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (640px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Test all loading states
- [ ] Test all error states
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Test form submission flow
- [ ] Test validation feedback
- [ ] Test responsive images/icons
