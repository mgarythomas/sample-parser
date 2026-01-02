import * as React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Input, Checkbox, Button } from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';
import { Calendar } from '@repo/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { FormFieldWrapper } from './form-field-wrapper';
import { FormSection } from './form-section';
import { BuyBackFormData } from '../../lib/schemas/buy-back.schema';

export interface ComplianceSectionProps {
  control: Control<BuyBackFormData>;
  errors: FieldErrors<BuyBackFormData>;
  isTrust: boolean;
}

/**
 * ComplianceSection renders compliance statements and signature fields.
 * It conditionally displays trust vs company compliance statements based on entity type.
 * 
 * Requirements:
 * - 9.1: Display required compliance statements from source document
 * - 9.2: Conditional display based on trust vs company
 * - 9.3: Capture signatory name, role, and date
 * - 9.4: Validate all required signature fields
 * 
 * @example
 * <ComplianceSection
 *   control={control}
 *   errors={errors}
 *   isTrust={watch('compliance.isTrust')}
 * />
 */
export const ComplianceSection = React.forwardRef<HTMLDivElement, ComplianceSectionProps>(
  ({ control, errors, isTrust }, ref) => {
    const complianceErrors = errors.compliance;

    return (
      <FormSection
        ref={ref}
        title="Compliance and Signature"
        description="Please review the compliance statements and provide your signature"
      >
        {/* Trust/Company Toggle */}
        <Controller
          name="compliance.isTrust"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-2" role="group" aria-label="Entity type">
              <Checkbox
                id="isTrust"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-describedby="isTrust-description"
              />
              <label
                htmlFor="isTrust"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                This entity is a trust
              </label>
              <span id="isTrust-description" className="sr-only">
                Check this box if the entity is a trust, otherwise it will be treated as a company
              </span>
            </div>
          )}
        />

        {/* Compliance Statement */}
        <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-50/30 border-blue-200 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h4 className="font-semibold text-sm sm:text-base text-blue-900">Compliance Statement</h4>
          </div>
          
          {isTrust ? (
            <div className="text-xs sm:text-sm space-y-2 text-blue-900">
              <p className="font-medium">
                The entity named above confirms that:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2 leading-relaxed">
                <li>
                  The buy-back does not materially prejudice the entity&apos;s ability to pay its creditors
                </li>
                <li>
                  The buy-back has been approved by the board in accordance with the entity&apos;s constitution
                </li>
                <li>
                  The buy-back is in accordance with the Corporations Act 2001 and the entity&apos;s constitution
                </li>
                <li>
                  As a trust, the buy-back is being conducted in accordance with the trust deed
                </li>
              </ul>
            </div>
          ) : (
            <div className="text-xs sm:text-sm space-y-2 text-blue-900">
              <p className="font-medium">
                The entity named above confirms that:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2 leading-relaxed">
                <li>
                  The buy-back does not materially prejudice the company&apos;s ability to pay its creditors
                </li>
                <li>
                  The buy-back has been approved by the board in accordance with the company&apos;s constitution
                </li>
                <li>
                  The buy-back is in accordance with the Corporations Act 2001 and the company&apos;s constitution
                </li>
                <li>
                  The company has lodged all documents required to be lodged with ASIC
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Signatory Name */}
        <Controller
          name="compliance.signatoryName"
          control={control}
          render={({ field }) => (
            <FormFieldWrapper
              label="Signatory Name"
              name="compliance.signatoryName"
              required
              helpText="Full name of the person signing this form"
              error={complianceErrors?.signatoryName}
            >
              <Input
                {...field}
                placeholder="Enter full name"
                aria-required="true"
              />
            </FormFieldWrapper>
          )}
        />

        {/* Signatory Role */}
        <Controller
          name="compliance.signatoryRole"
          control={control}
          render={({ field }) => (
            <FormFieldWrapper
              label="Signatory Role"
              name="compliance.signatoryRole"
              required
              helpText="Select the role of the signatory"
              error={complianceErrors?.signatoryRole}
            >
              <div 
                className="space-y-2" 
                role="radiogroup" 
                aria-required="true"
                aria-labelledby="signatory-role-label"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="role-director"
                    name="signatoryRole"
                    value="director"
                    checked={field.value === 'director'}
                    onChange={() => field.onChange('director')}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-checked={field.value === 'director'}
                  />
                  <label htmlFor="role-director" className="text-sm font-medium cursor-pointer">
                    Director
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="role-company-secretary"
                    name="signatoryRole"
                    value="company-secretary"
                    checked={field.value === 'company-secretary'}
                    onChange={() => field.onChange('company-secretary')}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-checked={field.value === 'company-secretary'}
                  />
                  <label htmlFor="role-company-secretary" className="text-sm font-medium cursor-pointer">
                    Company Secretary
                  </label>
                </div>
              </div>
            </FormFieldWrapper>
          )}
        />

        {/* Signature Date */}
        <Controller
          name="compliance.signatureDate"
          control={control}
          render={({ field }) => (
            <FormFieldWrapper
              label="Signature Date"
              name="compliance.signatureDate"
              required
              helpText="Date of signature"
              error={complianceErrors?.signatureDate}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                    aria-required="true"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormFieldWrapper>
          )}
        />
      </FormSection>
    );
  }
);

ComplianceSection.displayName = 'ComplianceSection';
