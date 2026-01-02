/**
 * Buy-back form component with conditional sections
 * 
 * This component implements the buy-back announcement form (Appendix 3C) with:
 * - react-hook-form integration for state management
 * - Zod schema validation
 * - Conditional sections based on buy-back type
 * - Auto-save to local storage with debouncing
 * 
 * Requirements:
 * - 1.1: Display all fields from Appendix 3C
 * - 1.2: Capture entity information (name, ABN/ARSN)
 * - 1.3: Display conditional sections based on buy-back type
 * - 1.4: Validate all required fields
 * - 4.1-4.4: Conditional sections for each buy-back type
 * - 4.5: Hide/show sections based on type selection
 * - 4.6: Clear data when sections are hidden
 * - 6.1: Auto-save to local storage
 * - 8.1: Use react-hook-form
 * - 8.2: Use Zod schemas
 * - 8.3: Use UI components
 * - 8.5: Use watch() for conditional logic
 */

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, DatePicker } from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';
import { buyBackFormSchema, BuyBackFormData } from '../../lib/schemas/buy-back.schema';
import { FormFieldWrapper } from './form-field-wrapper';
import { FormSection } from './form-section';
import { ComplianceSection } from './compliance-section';
import { createDebouncedSave, clearFormDraft } from '../../lib/storage/form-storage';
import { submitForm } from '../../lib/api/forms';
import { FormSubmission } from '../../lib/types/forms';
import { generateUUID } from '../../lib/utils/form-helpers';
import { toast } from '../../lib/utils/toast';
import { ApiRequestError } from '../../lib/api/client';

export interface BuyBackFormProps {
  /** Initial form data (e.g., from restored draft) */
  initialData?: Partial<BuyBackFormData>;
  
  /** Callback when form is submitted with valid data (optional - uses default API submission if not provided) */
  onSubmit?: (data: BuyBackFormData) => Promise<void>;
  
  /** Callback when draft is saved (optional) */
  onSaveDraft?: (data: Partial<BuyBackFormData>) => void;
  
  /** Callback when submission is successful (optional) */
  onSubmitSuccess?: (submissionId: string) => void;
  
  /** Callback when submission fails (optional) */
  onSubmitError?: (error: Error) => void;
  
  /** Callback when user clicks Review button (optional - navigates to review page if not provided) */
  onReview?: (data: BuyBackFormData) => void;
}

/**
 * BuyBackForm component
 * Main form component for buy-back announcements
 */
export const BuyBackForm = React.forwardRef<HTMLFormElement, BuyBackFormProps>(
  ({ initialData, onSubmit, onSaveDraft, onSubmitSuccess, onSubmitError, onReview }, ref) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const errorSummaryRef = React.useRef<HTMLDivElement>(null);
    
    const {
      control,
      handleSubmit,
      watch,
      setValue,
      reset,
      setFocus,
      formState: { errors, isValid },
    } = useForm<BuyBackFormData>({
      resolver: zodResolver(buyBackFormSchema),
      mode: 'onChange',
      defaultValues: initialData || {
        entityName: '',
        abnArsn: '',
        buyBackType: 'on-market',
        shareClass: {
          class: '',
          votingRights: '',
          paidStatus: 'fully-paid',
          paidDetails: '',
          numberOnIssue: 0,
        },
        shareholderApprovalRequired: false,
        reason: '',
        materialInformation: '',
        compliance: {
          isTrust: false,
          signatoryName: '',
          signatoryRole: 'director',
          signatureDate: new Date(),
        },
      },
    });

    // Focus management for validation errors
    React.useEffect(() => {
      if (Object.keys(errors).length > 0) {
        // Focus the error summary when errors appear
        errorSummaryRef.current?.focus();
        
        // Find the first error field and focus it
        const firstErrorField = Object.keys(errors)[0] as keyof BuyBackFormData;
        if (firstErrorField) {
          // Use setTimeout to ensure DOM is updated
          setTimeout(() => {
            setFocus(firstErrorField);
          }, 100);
        }
      }
    }, [errors, setFocus]);

    // Watch buy-back type for conditional rendering
    const buyBackType = watch('buyBackType');
    const isTrust = watch('compliance.isTrust');
    
    // Watch all form values for auto-save
    const formValues = watch();

    // Set up debounced auto-save
    const debouncedSaveRef = React.useRef(createDebouncedSave(1000));

    // Auto-save effect
    React.useEffect(() => {
      const { debouncedSave } = debouncedSaveRef.current;
      
      // Save draft to local storage
      debouncedSave('buy-back', formValues as Record<string, unknown>);
      
      // Call optional callback
      if (onSaveDraft) {
        onSaveDraft(formValues);
      }
    }, [formValues, onSaveDraft]);

    // Clear conditional sections when buy-back type changes
    React.useEffect(() => {
      // Only clear sections that don't match the current buy-back type
      if (buyBackType !== 'on-market') {
        setValue('onMarketBuyBack', undefined);
      }
      if (buyBackType !== 'employee-share-scheme') {
        setValue('employeeShareSchemeBuyBack', undefined);
      }
      if (buyBackType !== 'selective') {
        setValue('selectiveBuyBack', undefined);
      }
      if (buyBackType !== 'equal-access-scheme') {
        setValue('equalAccessScheme', undefined);
      }
    }, [buyBackType, setValue]);

    // Cleanup debounced save on unmount
    React.useEffect(() => {
      return () => {
        debouncedSaveRef.current.cancel();
      };
    }, []);

    const handleFormSubmit = async (data: BuyBackFormData) => {
      setIsSubmitting(true);

      try {
        // If custom onSubmit is provided, use it
        if (onSubmit) {
          await onSubmit(data);
        } else {
          // Default submission logic
          const submission: FormSubmission<BuyBackFormData> = {
            submissionId: generateUUID(),
            formType: 'buy-back',
            formVersion: '1.0.0',
            submittedAt: new Date().toISOString(),
            data,
            versionNumber: 1,
          };

          // Submit to API
          const response = await submitForm(submission);

          // Clear local storage draft on successful submission
          clearFormDraft('buy-back');

          // Show success toast
          toast.success('Buy-back form submitted successfully');

          // Call success callback if provided
          if (onSubmitSuccess) {
            onSubmitSuccess(response.submissionId);
          }

          // Reset form
          reset();
        }
      } catch (error) {
        // Handle submission errors
        let errorMessage = 'Failed to submit form. Please try again.';

        if (error instanceof ApiRequestError) {
          // Handle specific API errors
          switch (error.code) {
            case 'NETWORK_ERROR':
              errorMessage = 'Network error. Please check your connection and try again.';
              break;
            case 'VALIDATION_ERROR':
              errorMessage = 'Form validation failed. Please check your entries.';
              break;
            case 'UNAUTHORIZED':
              errorMessage = 'You are not authorized to submit this form. Please log in.';
              break;
            case 'SERVER_ERROR':
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = error.message || errorMessage;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        // Show error toast
        toast.error(errorMessage);

        // Call error callback if provided
        if (onSubmitError) {
          onSubmitError(error instanceof Error ? error : new Error(errorMessage));
        }

        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form 
        ref={ref} 
        onSubmit={handleSubmit(handleFormSubmit)} 
        className="space-y-6"
        noValidate
        aria-label="Buy-back announcement form"
      >
        {/* Error Summary - Accessible announcement of validation errors */}
        {Object.keys(errors).length > 0 && (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className="rounded-lg border-2 border-destructive bg-destructive/10 p-4 sm:p-5 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
          >
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"
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
              <div className="flex-1">
                <h2 className="text-sm sm:text-base font-semibold text-destructive mb-2">
                  There {Object.keys(errors).length === 1 ? 'is' : 'are'} {Object.keys(errors).length} error{Object.keys(errors).length === 1 ? '' : 's'} in the form
                </h2>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-destructive">
                  {errors.entityName && <li>Entity Name: {errors.entityName.message}</li>}
                  {errors.abnArsn && <li>ABN or ARSN: {errors.abnArsn.message}</li>}
                  {errors.buyBackType && <li>Buy-back Type: {errors.buyBackType.message}</li>}
                  {errors.shareClass?.class && <li>Share Class: {errors.shareClass.class.message}</li>}
                  {errors.shareClass?.votingRights && <li>Voting Rights: {errors.shareClass.votingRights.message}</li>}
                  {errors.shareClass?.numberOnIssue && <li>Number on Issue: {errors.shareClass.numberOnIssue.message}</li>}
                  {errors.reason && <li>Reason for Buy-back: {errors.reason.message}</li>}
                  {errors.onMarketBuyBack?.brokerName && <li>Broker Name: {errors.onMarketBuyBack.brokerName.message}</li>}
                  {errors.employeeShareSchemeBuyBack?.numberOfShares && <li>Number of Shares: {errors.employeeShareSchemeBuyBack.numberOfShares.message}</li>}
                  {errors.employeeShareSchemeBuyBack?.price && <li>Price per Share: {errors.employeeShareSchemeBuyBack.price.message}</li>}
                  {errors.selectiveBuyBack?.personOrClass && <li>Person or Class: {errors.selectiveBuyBack.personOrClass.message}</li>}
                  {errors.selectiveBuyBack?.numberOfShares && <li>Number of Shares: {errors.selectiveBuyBack.numberOfShares.message}</li>}
                  {errors.selectiveBuyBack?.price && <li>Price per Share: {errors.selectiveBuyBack.price.message}</li>}
                  {errors.equalAccessScheme?.percentage && <li>Percentage: {errors.equalAccessScheme.percentage.message}</li>}
                  {errors.equalAccessScheme?.totalShares && <li>Total Shares: {errors.equalAccessScheme.totalShares.message}</li>}
                  {errors.equalAccessScheme?.price && <li>Price per Share: {errors.equalAccessScheme.price.message}</li>}
                  {errors.compliance?.signatoryName && <li>Signatory Name: {errors.compliance.signatoryName.message}</li>}
                  {errors.compliance?.signatoryRole && <li>Signatory Role: {errors.compliance.signatoryRole.message}</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Entity Information Section */}
        <FormSection
          title="Entity Information"
          description="Provide details about the entity conducting the buy-back"
        >
          <Controller
            name="entityName"
            control={control}
            render={({ field }) => (
              <FormFieldWrapper
                label="Entity Name"
                name="entityName"
                required
                helpText="Full legal name of the entity"
                error={errors.entityName}
              >
                <Input
                  {...field}
                  placeholder="Enter entity name"
                  aria-required="true"
                />
              </FormFieldWrapper>
            )}
          />

          <Controller
            name="abnArsn"
            control={control}
            render={({ field }) => (
              <FormFieldWrapper
                label="ABN or ARSN"
                name="abnArsn"
                required
                helpText="Enter 11-digit ABN or 9-digit ARSN"
                error={errors.abnArsn}
              >
                <Input
                  {...field}
                  placeholder="Enter ABN or ARSN"
                  aria-required="true"
                />
              </FormFieldWrapper>
            )}
          />
        </FormSection>

        {/* Buy-back Information Section */}
        <FormSection
          title="Buy-back Information"
          description="Provide details about the buy-back"
        >
          <Controller
            name="buyBackType"
            control={control}
            render={({ field }) => (
              <FormFieldWrapper
                label="Buy-back Type"
                name="buyBackType"
                required
                helpText="Select the type of buy-back"
                error={errors.buyBackType}
              >
                <select
                  {...field}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                  aria-required="true"
                >
                  <option value="on-market">On-market buy-back</option>
                  <option value="employee-share-scheme">Employee share scheme buy-back</option>
                  <option value="selective">Selective buy-back</option>
                  <option value="equal-access-scheme">Equal access scheme</option>
                </select>
              </FormFieldWrapper>
            )}
          />

          {/* Share Class Information */}
          <div className="space-y-4 rounded-lg border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 sm:p-5 shadow-sm">
            <h4 className="font-semibold text-sm sm:text-base text-gray-900 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Share Class Information
            </h4>
            
            <Controller
              name="shareClass.class"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Share Class"
                  name="shareClass.class"
                  required
                  helpText="e.g., Ordinary, Preference"
                  error={errors.shareClass?.class}
                >
                  <Input
                    {...field}
                    placeholder="Enter share class"
                    aria-required="true"
                  />
                </FormFieldWrapper>
              )}
            />

            <Controller
              name="shareClass.votingRights"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Voting Rights"
                  name="shareClass.votingRights"
                  required
                  helpText="Description of voting rights"
                  error={errors.shareClass?.votingRights}
                >
                  <Input
                    {...field}
                    placeholder="e.g., One vote per share"
                    aria-required="true"
                  />
                </FormFieldWrapper>
              )}
            />

            <Controller
              name="shareClass.paidStatus"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Paid Status"
                  name="shareClass.paidStatus"
                  required
                  error={errors.shareClass?.paidStatus}
                >
                  <select
                    {...field}
                    className={cn(
                      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                    aria-required="true"
                  >
                    <option value="fully-paid">Fully paid</option>
                    <option value="partly-paid">Partly paid</option>
                  </select>
                </FormFieldWrapper>
              )}
            />

            {watch('shareClass.paidStatus') === 'partly-paid' && (
              <Controller
                name="shareClass.paidDetails"
                control={control}
                render={({ field }) => (
                  <FormFieldWrapper
                    label="Paid Details"
                    name="shareClass.paidDetails"
                    helpText="Provide details about the partly paid status"
                    error={errors.shareClass?.paidDetails}
                  >
                    <Input
                      {...field}
                      placeholder="Enter paid details"
                    />
                  </FormFieldWrapper>
                )}
              />
            )}

            <Controller
              name="shareClass.numberOnIssue"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Number on Issue"
                  name="shareClass.numberOnIssue"
                  required
                  helpText="Total number of shares on issue"
                  error={errors.shareClass?.numberOnIssue}
                >
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter number of shares"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value || ''}
                    aria-required="true"
                  />
                </FormFieldWrapper>
              )}
            />
          </div>

          <Controller
            name="shareholderApprovalRequired"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2" role="group" aria-label="Shareholder approval">
                <input
                  type="checkbox"
                  id="shareholderApprovalRequired"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-checked={field.value}
                  aria-describedby="shareholderApprovalRequired-description"
                />
                <label
                  htmlFor="shareholderApprovalRequired"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Shareholder approval required
                </label>
                <span id="shareholderApprovalRequired-description" className="sr-only">
                  Check this box if shareholder approval is required for this buy-back
                </span>
              </div>
            )}
          />

          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <FormFieldWrapper
                label="Reason for Buy-back"
                name="reason"
                required
                helpText="Provide the reason for conducting this buy-back"
                error={errors.reason}
              >
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Enter reason for buy-back"
                  className={cn(
                    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                  aria-required="true"
                />
              </FormFieldWrapper>
            )}
          />

          <Controller
            name="materialInformation"
            control={control}
            render={({ field }) => (
              <FormFieldWrapper
                label="Material Information"
                name="materialInformation"
                helpText="Any material information relevant to the buy-back (optional)"
                error={errors.materialInformation}
              >
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Enter any material information"
                  className={cn(
                    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                    'placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                />
              </FormFieldWrapper>
            )}
          />
        </FormSection>

        {/* Conditional Sections */}
        
        {/* On-Market Buy-Back Section */}
        {buyBackType === 'on-market' && (
          <FormSection
            title="On-Market Buy-Back Details"
            description="Provide details specific to on-market buy-back"
            visible={true}
          >
            <Controller
              name="onMarketBuyBack.brokerName"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Broker Name"
                  name="onMarketBuyBack.brokerName"
                  required
                  helpText="Name of the broker conducting the buy-back"
                  error={errors.onMarketBuyBack?.brokerName}
                >
                  <Input
                    {...field}
                    placeholder="Enter broker name"
                    aria-required="true"
                  />
                </FormFieldWrapper>
              )}
            />

            <Controller
              name="onMarketBuyBack.maximumShares"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Maximum Number of Shares"
                  name="onMarketBuyBack.maximumShares"
                  helpText="Maximum number of shares to be bought back (optional)"
                  error={errors.onMarketBuyBack?.maximumShares}
                >
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter maximum shares"
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value ?? ''}
                  />
                </FormFieldWrapper>
              )}
            />

            <Controller
              name="onMarketBuyBack.timePeriod"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Time Period"
                  name="onMarketBuyBack.timePeriod"
                  helpText="Time period for the buy-back (optional)"
                  error={errors.onMarketBuyBack?.timePeriod}
                >
                  <Input
                    {...field}
                    placeholder="e.g., 12 months from approval date"
                  />
                </FormFieldWrapper>
              )}
            />

            <Controller
              name="onMarketBuyBack.conditions"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Conditions"
                  name="onMarketBuyBack.conditions"
                  helpText="Any conditions attached to the buy-back (optional)"
                  error={errors.onMarketBuyBack?.conditions}
                >
                  <textarea
                    {...field}
                    rows={4}
                    placeholder="Enter any conditions"
                    className={cn(
                      'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                      'placeholder:text-muted-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                  />
                </FormFieldWrapper>
              )}
            />
          </FormSection>
        )}

        {/* Employee Share Scheme Buy-Back Section */}
        {buyBackType === 'employee-share-scheme' && (
          <FormSection
            title="Employee Share Scheme Buy-Back Details"
            description="Provide details specific to employee share scheme buy-back"
            visible={true}
          >
            <Controller
              name="employeeShareSchemeBuyBack.numberOfShares"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Number of Shares"
                  name="employeeShareSchemeBuyBack.numberOfShares"
                  required
                  helpText="Total number of shares to be bought back"
                  error={errors.employeeShareSchemeBuyBack?.numberOfShares}
                >
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter number of shares"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value || ''}
                    aria-required="true"
                  />
                </FormFieldWrapper>
              )}
            />

            <Controller
              name="employeeShareSchemeBuyBack.price"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Price per Share"
                  name="employeeShareSchemeBuyBack.price"
                  required
                  helpText="Price per share for the buy-back"
                  error={errors.employeeShareSchemeBuyBack?.price}
                >
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="Enter price per share"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value || ''}
                    aria-required="true"
                  />
                </FormFieldWrapper>
              )}
            />
          </FormSection>
        )}

        {/* Selective Buy-Back Section */}
        {buyBackType === 'selective' && (
          <FormSection
            title="Selective Buy-Back Details"
            description="Provide details specific to selective buy-back"
            visible={true}
          >
            <Controller
              name="selectiveBuyBack.personOrClass"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Person or Class"
                  name="selectiveBuyBack.personOrClass"
                  required
                  helpText="Person or class of persons from whom shares will be bought back"
                  error={errors.selectiveBuyBack?.personOrClass}
                >
                  <Input
                    {...field}
                    placeholder="Enter person or class"
                    aria-required="true"
                  />
                </FormFieldWrapper>
              )}
            />

            <Controller
              name="selectiveBuyBack.numberOfShares"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Number of Shares"
                  name="selectiveBuyBack.numberOfShares"
                  required
                  helpText="Total number of shares to be bought back"
                  error={errors.selectiveBuyBack?.numberOfShares}
                >
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter number of shares"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value || ''}
                    aria-required="true"
                  />
                </FormFieldWrapper>
              )}
            />

            <Controller
              name="selectiveBuyBack.price"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Price per Share"
                  name="selectiveBuyBack.price"
                  required
                  helpText="Price per share for the buy-back"
                  error={errors.selectiveBuyBack?.price}
                >
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="Enter price per share"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value || ''}
                    aria-required="true"
                  />
                </FormFieldWrapper>
              )}
            />
          </FormSection>
        )}

        {/* Equal Access Scheme Section */}
        {buyBackType === 'equal-access-scheme' && (
          <FormSection
            title="Equal Access Scheme Details"
            description="Provide details specific to equal access scheme"
            visible={true}
          >
            <Controller
              name="equalAccessScheme.percentage"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Percentage"
                  name="equalAccessScheme.percentage"
                  required
                  helpText="Percentage of shares to be bought back (0-100)"
                  error={errors.equalAccessScheme?.percentage}
                >
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Enter percentage"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value ?? ''}
                    aria-required="true"
                  />
                </FormFieldWrapper>
              )}
            />

            <Controller
              name="equalAccessScheme.totalShares"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Total Shares"
                  name="equalAccessScheme.totalShares"
                  required
                  helpText="Total number of shares to be bought back"
                  error={errors.equalAccessScheme?.totalShares}
                >
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter total shares"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value || ''}
                    aria-required="true"
                  />
                </FormFieldWrapper>
              )}
            />

            <Controller
              name="equalAccessScheme.price"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Price per Share"
                  name="equalAccessScheme.price"
                  required
                  helpText="Price per share for the buy-back"
                  error={errors.equalAccessScheme?.price}
                >
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="Enter price per share"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value || ''}
                    aria-required="true"
                  />
                </FormFieldWrapper>
              )}
            />

            <Controller
              name="equalAccessScheme.recordDate"
              control={control}
              render={({ field }) => (
                <FormFieldWrapper
                  label="Record Date"
                  name="equalAccessScheme.recordDate"
                  required
                  helpText="Record date for determining eligible shareholders"
                  error={errors.equalAccessScheme?.recordDate}
                >
                  <DatePicker
                    date={field.value}
                    onDateChange={field.onChange}
                    placeholder="Select record date"
                    className="w-full"
                  />
                </FormFieldWrapper>
              )}
            />
          </FormSection>
        )}
        
        {/* Compliance Section */}
        <ComplianceSection
          control={control}
          errors={errors}
          isTrust={isTrust}
        />

        {/* Form Actions */}
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-6 mt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              clearFormDraft('buy-back');
              toast.info('Form cleared');
            }}
            disabled={isSubmitting}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Form
          </Button>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit((data) => {
                if (onReview) {
                  onReview(data);
                }
              })}
              disabled={isSubmitting || !isValid}
              className="w-full sm:w-auto relative"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Review
              {!isValid && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  Incomplete
                </span>
              )}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full sm:w-auto relative overflow-hidden"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-sm mx-4 text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitting Form</h3>
              <p className="text-sm text-gray-600">
                Please wait while we process your submission...
              </p>
            </div>
          </div>
        )}
      </form>
    );
  }
);

BuyBackForm.displayName = 'BuyBackForm';
