/**
 * Buy-back form page
 * 
 * This page provides the interface for users to complete and submit
 * buy-back announcement forms (Appendix 3C).
 * 
 * Features:
 * - Initializes form with data from local storage if available
 * - Provides navigation to review page
 * - Handles form submission
 * 
 * Requirements:
 * - 1.1: Display buy-back form with all required fields
 * - 6.2: Restore form data from local storage
 * - 8.1: Use react-hook-form for form management
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BuyBackForm } from '../../../components/forms/buy-back-form';
import { BuyBackFormData } from '../../../lib/schemas/buy-back.schema';
import { restoreFormDraft, clearFormDraft } from '../../../lib/storage/form-storage';
import { ToastContainer } from '../../../components/ui/toast-container';
import { toast } from '../../../lib/utils/toast';
import { Button } from '@repo/ui';
import { Card } from '@repo/ui';

export default function BuyBackFormPage() {
  const router = useRouter();
  const [initialData, setInitialData] = React.useState<Partial<BuyBackFormData> | undefined>(undefined);
  const [showDraftNotification, setShowDraftNotification] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Restore draft from local storage on mount
  React.useEffect(() => {
    try {
      const draft = restoreFormDraft('buy-back');
      
      if (draft && draft.data) {
        setInitialData(draft.data as Partial<BuyBackFormData>);
        setShowDraftNotification(true);
      }
    } catch (error) {
      console.error('Error restoring draft:', error);
      toast.error('Failed to restore saved draft');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartFresh = () => {
    clearFormDraft('buy-back');
    setInitialData(undefined);
    setShowDraftNotification(false);
    toast.info('Starting with a fresh form');
  };

  const handleContinueDraft = () => {
    setShowDraftNotification(false);
    toast.success('Continuing with saved draft');
  };

  const handleReview = () => {
    // Data is already saved to local storage via auto-save
    // Navigate to review page
    router.push('/forms/buy-back/review');
  };

  const handleSubmitSuccess = () => {
    // Navigate to success page
    toast.success('Form submitted successfully');
    router.push('/forms/buy-back?success=true');
  };

  const handleSubmitError = (error: Error) => {
    console.error('Form submission error:', error);
    // Error toast is already shown by the form component
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center px-4">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 py-6 sm:py-8 lg:py-12">
      <ToastContainer />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <header className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">
                Buy-Back Announcement Form
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Complete this form to submit a buy-back announcement (Appendix 3C) to ASX.
                Your progress is automatically saved.
              </p>
            </div>
            <div 
              className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-white px-3 py-2 rounded-lg border shadow-sm"
              role="status"
              aria-live="polite"
              aria-label="Form auto-save status"
            >
              <svg 
                className="w-4 h-4 text-green-600" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Auto-saving</span>
            </div>
          </div>
        </header>

        {/* Draft Notification */}
        {showDraftNotification && (
          <aside 
            role="alert" 
            aria-live="polite"
            aria-label="Saved draft notification"
          >
            <Card className="mb-6 sm:mb-8 p-4 sm:p-6 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-50/50 shadow-md">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <svg 
                    className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-blue-900 mb-1 sm:mb-2">
                    Draft Found
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-800 mb-3 sm:mb-4 leading-relaxed">
                    We found a saved draft from your previous session. Would you like to continue
                    where you left off or start fresh?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      onClick={handleContinueDraft}
                      size="sm"
                      className="w-full sm:w-auto"
                      aria-label="Continue with saved draft"
                    >
                      Continue Draft
                    </Button>
                    <Button
                      onClick={handleStartFresh}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      aria-label="Discard draft and start fresh"
                    >
                      Start Fresh
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        )}

        {/* Form Card */}
        <Card className="p-4 sm:p-6 lg:p-8 shadow-lg">
          <BuyBackForm
            initialData={initialData}
            onReview={handleReview}
            onSubmitSuccess={handleSubmitSuccess}
            onSubmitError={handleSubmitError}
          />
        </Card>

        {/* Help Text */}
        <footer className="mt-6 sm:mt-8 text-center" role="contentinfo">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Need help? Contact{' '}
            <a 
              href="#" 
              className="text-primary hover:underline font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              aria-label="Contact support"
            >
              support
            </a>
            {' '}or refer to the{' '}
            <a 
              href="#" 
              className="text-primary hover:underline font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              aria-label="View ASX Listing Rules"
            >
              ASX Listing Rules
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
