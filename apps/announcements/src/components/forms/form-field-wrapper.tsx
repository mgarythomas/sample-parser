import * as React from 'react';
import { FieldError } from 'react-hook-form';
import { Label } from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';

export interface FormFieldWrapperProps {
  label: string;
  name: string;
  required?: boolean;
  helpText?: string;
  error?: FieldError;
  children: React.ReactNode;
  className?: string;
}

/**
 * FormFieldWrapper provides consistent field rendering with labels, errors, and help text.
 * It wraps form fields with proper accessibility attributes and styling.
 * 
 * @example
 * <FormFieldWrapper
 *   label="Entity Name"
 *   name="entityName"
 *   required
 *   helpText="Enter the full legal name of the entity"
 *   error={errors.entityName}
 * >
 *   <Input {...register('entityName')} />
 * </FormFieldWrapper>
 */
export const FormFieldWrapper = React.forwardRef<HTMLDivElement, FormFieldWrapperProps>(
  ({ label, name, required = false, helpText, error, children, className }, ref) => {
    const fieldId = React.useId();
    const descriptionId = `${fieldId}-description`;
    const errorId = `${fieldId}-error`;

    // Build aria-describedby string with all relevant IDs
    const ariaDescribedBy = React.useMemo(() => {
      const ids: string[] = [];
      if (helpText) ids.push(descriptionId);
      if (error) ids.push(errorId);
      return ids.length > 0 ? ids.join(' ') : undefined;
    }, [helpText, error, descriptionId, errorId]);

    // Clone children to add accessibility attributes
    const childWithProps = React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          id: fieldId,
          'aria-describedby': ariaDescribedBy,
          'aria-invalid': error ? 'true' : 'false',
          'aria-required': required ? 'true' : undefined,
        })
      : children;

    return (
      <div 
        ref={ref} 
        className={cn(
          'space-y-2',
          'transition-all duration-200',
          error && 'animate-shake',
          className
        )} 
        data-field-name={name}
        role="group"
        aria-labelledby={`${fieldId}-label`}
      >
        <Label 
          id={`${fieldId}-label`}
          htmlFor={fieldId} 
          className={cn(
            'text-sm sm:text-base font-medium',
            error && 'text-destructive'
          )}
        >
          {label}
          {required && (
            <span className="text-destructive ml-1 text-base" aria-label="required field">
              *
            </span>
          )}
        </Label>
        <div className="relative">
          {childWithProps}
          {error && (
            <div 
              className="absolute -right-2 top-1/2 -translate-y-1/2 hidden sm:block"
              aria-hidden="true"
            >
              <svg 
                className="h-5 w-5 text-destructive" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          )}
        </div>
        {helpText && (
          <p id={descriptionId} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {helpText}
          </p>
        )}
        {error && (
          <p 
            id={errorId} 
            className="text-xs sm:text-sm font-medium text-destructive flex items-start gap-1.5"
            role="alert"
            aria-live="polite"
          >
            <svg 
              className="h-4 w-4 mt-0.5 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
            <span>{error.message}</span>
          </p>
        )}
      </div>
    );
  }
);

FormFieldWrapper.displayName = 'FormFieldWrapper';
