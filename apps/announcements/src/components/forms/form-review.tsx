/**
 * Form review component
 * 
 * Displays completed form data in read-only format for user review before submission.
 * Organizes data by sections matching the form structure and highlights active
 * conditional sections based on buy-back type.
 * 
 * Requirements:
 * - 10.1: Provide "Review" option before final submission
 * - 10.2: Display all entered data in read-only format organized by section
 * - 10.3: Clearly indicate buy-back type and show only relevant sections
 * - 10.4: Provide "Edit" option to return to form
 * - 10.5: Provide "Confirm" option to proceed to submission
 */

import * as React from 'react';
import { Button } from '@repo/ui';
import { BuyBackFormData, BuyBackType } from '../../lib/schemas/buy-back.schema';
import { formatDateToDisplay } from '../../lib/utils/form-helpers';

export interface FormReviewProps {
  /** Complete form data to display */
  data: BuyBackFormData;
  
  /** Callback when user clicks Edit button */
  onEdit: () => void;
  
  /** Callback when user clicks Confirm button */
  onConfirm: () => void;
  
  /** Whether the form is being submitted */
  isSubmitting?: boolean;
}

/**
 * Section component for organizing review data
 */
const ReviewSection: React.FC<{
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}> = ({ title, children, highlight = false }) => {
  const sectionId = React.useId();
  const titleId = `${sectionId}-title`;

  return (
    <section 
      className={`
        space-y-3 sm:space-y-4 rounded-lg border p-4 sm:p-6 
        transition-all duration-200 hover:shadow-md
        ${highlight 
          ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10 border-l-4' 
          : 'border-gray-200 bg-white'
        }
      `}
      aria-labelledby={titleId}
    >
      <div className="flex items-center gap-2">
        {highlight && (
          <svg 
            className="w-5 h-5 text-primary flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        <h3 id={titleId} className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <dl className="space-y-3 sm:space-y-4">
        {children}
      </dl>
    </section>
  );
};

/**
 * Field component for displaying individual field values
 */
const ReviewField: React.FC<{
  label: string;
  value: string | number | boolean | undefined | null;
  emptyText?: string;
}> = ({ label, value, emptyText = 'Not provided' }) => {
  const displayValue = React.useMemo(() => {
    if (value === undefined || value === null || value === '') {
      return emptyText;
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  }, [value, emptyText]);

  const isEmpty = value === undefined || value === null || value === '';

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs sm:text-sm font-medium text-gray-600 sm:w-1/3 flex-shrink-0">
        {label}
      </dt>
      <dd className={`text-xs sm:text-sm sm:w-2/3 ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900 font-medium'}`}>
        {displayValue}
      </dd>
    </div>
  );
};

/**
 * Helper function to get buy-back type display name
 */
const getBuyBackTypeLabel = (type: BuyBackType): string => {
  const labels: Record<BuyBackType, string> = {
    'on-market': 'On-Market Buy-Back',
    'employee-share-scheme': 'Employee Share Scheme Buy-Back',
    'selective': 'Selective Buy-Back',
    'equal-access-scheme': 'Equal Access Scheme',
  };
  return labels[type];
};

/**
 * Helper function to get paid status display name
 */
const getPaidStatusLabel = (status: 'fully-paid' | 'partly-paid'): string => {
  return status === 'fully-paid' ? 'Fully Paid' : 'Partly Paid';
};

/**
 * Helper function to get signatory role display name
 */
const getSignatoryRoleLabel = (role: 'director' | 'company-secretary'): string => {
  return role === 'director' ? 'Director' : 'Company Secretary';
};

/**
 * FormReview component
 * Main review component that displays all form data in read-only format
 */
export const FormReview: React.FC<FormReviewProps> = ({
  data,
  onEdit,
  onConfirm,
  isSubmitting = false,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Review Your Submission</h2>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Please review all information carefully before submitting. You can edit any section if needed.
        </p>
      </div>

      {/* Entity Information Section */}
      <ReviewSection title="Entity Information">
        <ReviewField label="Entity Name" value={data.entityName} />
        <ReviewField label="ABN or ARSN" value={data.abnArsn} />
      </ReviewSection>

      {/* Buy-back Information Section */}
      <ReviewSection title="Buy-back Information">
        <ReviewField 
          label="Buy-back Type" 
          value={getBuyBackTypeLabel(data.buyBackType)} 
        />
        
        {/* Share Class Information */}
        <div className="space-y-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 sm:p-5 border border-gray-200">
          <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Share Class Information
          </h4>
          <ReviewField label="Share Class" value={data.shareClass.class} />
          <ReviewField label="Voting Rights" value={data.shareClass.votingRights} />
          <ReviewField 
            label="Paid Status" 
            value={getPaidStatusLabel(data.shareClass.paidStatus)} 
          />
          {data.shareClass.paidStatus === 'partly-paid' && data.shareClass.paidDetails && (
            <ReviewField label="Paid Details" value={data.shareClass.paidDetails} />
          )}
          <ReviewField 
            label="Number on Issue" 
            value={data.shareClass.numberOnIssue.toLocaleString()} 
          />
        </div>

        <ReviewField 
          label="Shareholder Approval Required" 
          value={data.shareholderApprovalRequired} 
        />
        <ReviewField label="Reason for Buy-back" value={data.reason} />
        {data.materialInformation && (
          <ReviewField label="Material Information" value={data.materialInformation} />
        )}
      </ReviewSection>

      {/* Conditional Sections - Only show the active one */}
      
      {/* On-Market Buy-Back Details */}
      {data.buyBackType === 'on-market' && data.onMarketBuyBack && (
        <ReviewSection title="On-Market Buy-Back Details" highlight>
          <ReviewField label="Broker Name" value={data.onMarketBuyBack.brokerName} />
          {data.onMarketBuyBack.maximumShares !== undefined && (
            <ReviewField 
              label="Maximum Number of Shares" 
              value={data.onMarketBuyBack.maximumShares.toLocaleString()} 
            />
          )}
          {data.onMarketBuyBack.timePeriod && (
            <ReviewField label="Time Period" value={data.onMarketBuyBack.timePeriod} />
          )}
          {data.onMarketBuyBack.conditions && (
            <ReviewField label="Conditions" value={data.onMarketBuyBack.conditions} />
          )}
        </ReviewSection>
      )}

      {/* Employee Share Scheme Buy-Back Details */}
      {data.buyBackType === 'employee-share-scheme' && data.employeeShareSchemeBuyBack && (
        <ReviewSection title="Employee Share Scheme Buy-Back Details" highlight>
          <ReviewField 
            label="Number of Shares" 
            value={data.employeeShareSchemeBuyBack.numberOfShares.toLocaleString()} 
          />
          <ReviewField 
            label="Price per Share" 
            value={`$${data.employeeShareSchemeBuyBack.price.toFixed(2)}`} 
          />
        </ReviewSection>
      )}

      {/* Selective Buy-Back Details */}
      {data.buyBackType === 'selective' && data.selectiveBuyBack && (
        <ReviewSection title="Selective Buy-Back Details" highlight>
          <ReviewField 
            label="Person or Class" 
            value={data.selectiveBuyBack.personOrClass} 
          />
          <ReviewField 
            label="Number of Shares" 
            value={data.selectiveBuyBack.numberOfShares.toLocaleString()} 
          />
          <ReviewField 
            label="Price per Share" 
            value={`$${data.selectiveBuyBack.price.toFixed(2)}`} 
          />
        </ReviewSection>
      )}

      {/* Equal Access Scheme Details */}
      {data.buyBackType === 'equal-access-scheme' && data.equalAccessScheme && (
        <ReviewSection title="Equal Access Scheme Details" highlight>
          <ReviewField 
            label="Percentage" 
            value={`${data.equalAccessScheme.percentage}%`} 
          />
          <ReviewField 
            label="Total Shares" 
            value={data.equalAccessScheme.totalShares.toLocaleString()} 
          />
          <ReviewField 
            label="Price per Share" 
            value={`$${data.equalAccessScheme.price.toFixed(2)}`} 
          />
          <ReviewField 
            label="Record Date" 
            value={formatDateToDisplay(data.equalAccessScheme.recordDate)} 
          />
        </ReviewSection>
      )}

      {/* Compliance Section */}
      <ReviewSection title="Compliance and Signature">
        <ReviewField 
          label="Entity Type" 
          value={data.compliance.isTrust ? 'Trust' : 'Company'} 
        />
        <ReviewField label="Signatory Name" value={data.compliance.signatoryName} />
        <ReviewField 
          label="Signatory Role" 
          value={getSignatoryRoleLabel(data.compliance.signatoryRole)} 
        />
        <ReviewField 
          label="Signature Date" 
          value={formatDateToDisplay(data.compliance.signatureDate)} 
        />
      </ReviewSection>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-t pt-6 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          disabled={isSubmitting}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Form
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full sm:w-auto order-1 sm:order-2 relative overflow-hidden"
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
              Confirm and Submit
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
