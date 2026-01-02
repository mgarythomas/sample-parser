/**
 * Buy-back form review page
 * 
 * This page displays the completed buy-back form data for user review
 * before final submission. Users can edit the form or confirm and submit.
 * 
 * Features:
 * - Loads form data from local storage
 * - Displays form data using FormReview component
 * - Provides Edit navigation back to form
 * - Handles Confirm to trigger submission
 * 
 * Requirements:
 * - 10.1: Provide "Review" option before final submission
 * - 10.2: Display all entered data in read-only format organized by section
 * - 10.4: Provide "Edit" option to return to form
 * - 10.5: Provide "Confirm" option to proceed to submission
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@repo/ui';
import { FormReview } from '../../../../components/forms/form-review';
import { ToastContainer } from '../../../../components/ui/toast-container';
import { toast } from '../../../../lib/utils/toast';
import { BuyBackFormData, buyBackFormSchema } from '../../../../lib/schemas/buy-back.schema';
import { restoreFormDraft, clearFormDraft } from '../../../../lib/storage/form-storage';
import { submitForm } from '../../../../lib/api/forms';
import { FormSubmission } from '../../../../lib/types/forms';
import { generateUUID } from '../../../../lib/utils/form-helpers';
import { ApiRequestError } from '../../../../lib/api/client';

export default function BuyBackReviewPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<BuyBackFormData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load form data on mount
  React.useEffect(() => {
    try {
      // Try to restore from local storage
      const draft = restoreFormDraft('buy-back');
      
      if (!draft || !draft.data) {
        setError('No form data found. Please complete the form first.');
        setIsLoading(false);
        return;
      }

      // Validate the data against the schema
      const validationResult = buyBackFormSchema.safeParse(draft.data);
      
      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error);
        setError('Form data is incomplete or invalid. Please return to the form and complete all required fields.');
        setIsLoading(false);
        return;
      }

      setFormData(validationResult.data);
    } catch (err) {
      console.error('Error loading form data:', err);
      setError('Failed to load form data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEdit = () => {
    // Navigate back to the form page
    router.push('/forms/buy-back');
  };

  const handleConfirm = async () => {
    if (!formData) {
      toast.error('No form data available');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create submission document
      const submission: FormSubmission<BuyBackFormData> = {
        submissionId: generateUUID(),
        formType: 'buy-back',
        formVersion: '1.0.0',
        submittedAt: new Date().toISOString(),
        data: formData,
        versionNumber: 1,
      };

      // Submit to API
      await submitForm(submission);

      // Clear local storage draft on successful submission
      clearFormDraft('buy-back');

      // Show success toast
      toast.success('Buy-back form submitted successfully');

      // Navigate to success page or dashboard
      // For now, we'll navigate to the forms page
      router.push('/forms/buy-back?success=true');
    } catch (err) {
      // Handle submission errors
      let errorMessage = 'Failed to submit form. Please try again.';

      if (err instanceof ApiRequestError) {
        // Handle specific API errors
        switch (err.code) {
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
            errorMessage = err.message || errorMessage;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      // Show error toast
      toast.error(errorMessage);

      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center px-4">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">Loading form data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <ToastContainer />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6 sm:p-8 lg:p-12 text-center shadow-lg">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="h-8 w-8 sm:h-10 sm:w-10 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Unable to Load Form Data
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
              {error || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => router.push('/forms/buy-back')}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 sm:h-11 px-6 sm:px-8 py-2 shadow-md hover:shadow-lg"
            >
              Return to Form
            </button>
          </Card>
        </div>
      </div>
    );
  }

  // Main review page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 py-6 sm:py-8 lg:py-12">
      <ToastContainer />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">
                Review Buy-Back Announcement
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Please review your submission carefully. You can edit any information or confirm to submit.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-white px-3 py-2 rounded-lg border shadow-sm">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Review Mode</span>
            </div>
          </div>
        </div>

        {/* Review Card */}
        <Card className="p-4 sm:p-6 lg:p-8 shadow-lg">
          <FormReview
            data={formData}
            onEdit={handleEdit}
            onConfirm={handleConfirm}
            isSubmitting={isSubmitting}
          />
        </Card>

        {/* Help Text */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Need help? Contact{' '}
            <a href="#" className="text-primary hover:underline font-medium transition-colors">
              support
            </a>
            {' '}or refer to the{' '}
            <a href="#" className="text-primary hover:underline font-medium transition-colors">
              ASX Listing Rules
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
