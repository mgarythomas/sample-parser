import * as React from 'react';
import { Card } from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  visible?: boolean;
  className?: string;
}

/**
 * FormSection groups related form fields with visual separation and optional conditional rendering.
 * It provides a consistent layout for organizing form content into logical sections.
 * 
 * @example
 * <FormSection
 *   title="Entity Information"
 *   description="Provide details about the entity"
 *   visible={true}
 * >
 *   <FormFieldWrapper label="Name" name="name">
 *     <Input {...register('name')} />
 *   </FormFieldWrapper>
 * </FormSection>
 */
export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ title, description, children, visible = true, className }, ref) => {
    const sectionId = React.useId();
    const titleId = `${sectionId}-title`;
    const descriptionId = `${sectionId}-description`;

    if (!visible) {
      return null;
    }

    return (
      <Card 
        ref={ref} 
        className={cn(
          'p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6',
          'shadow-sm hover:shadow-md transition-shadow duration-200',
          'border-l-4 border-l-primary/20',
          className
        )}
        role="region"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="space-y-1 sm:space-y-2">
          <h3 
            id={titleId}
            className="text-base sm:text-lg lg:text-xl font-semibold leading-none tracking-tight text-gray-900"
          >
            {title}
          </h3>
          {description && (
            <p 
              id={descriptionId}
              className="text-xs sm:text-sm text-muted-foreground leading-relaxed"
            >
              {description}
            </p>
          )}
        </div>
        <div className="space-y-4 sm:space-y-5">{children}</div>
      </Card>
    );
  }
);

FormSection.displayName = 'FormSection';
