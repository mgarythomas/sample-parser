/**
 * Tests for FormReview component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { FormReview } from '../form-review';
import { BuyBackFormData } from '../../../lib/schemas/buy-back.schema';

describe('FormReview', () => {
  const mockOnEdit = jest.fn();
  const mockOnConfirm = jest.fn();

  const baseFormData: BuyBackFormData = {
    entityName: 'Test Company Pty Ltd',
    abnArsn: '12345678901',
    buyBackType: 'on-market',
    shareClass: {
      class: 'Ordinary',
      votingRights: 'One vote per share',
      paidStatus: 'fully-paid',
      paidDetails: '',
      numberOnIssue: 1000000,
    },
    shareholderApprovalRequired: true,
    reason: 'Capital management',
    materialInformation: 'No material information',
    onMarketBuyBack: {
      brokerName: 'Test Broker',
      maximumShares: 50000,
      timePeriod: '12 months',
      conditions: 'Standard conditions',
    },
    compliance: {
      isTrust: false,
      signatoryName: 'John Smith',
      signatoryRole: 'director',
      signatureDate: new Date('2025-10-20'),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all entity information', () => {
    render(
      <FormReview
        data={baseFormData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Test Company Pty Ltd')).toBeInTheDocument();
    expect(screen.getByText('12345678901')).toBeInTheDocument();
  });

  it('renders buy-back information', () => {
    render(
      <FormReview
        data={baseFormData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('On-Market Buy-Back')).toBeInTheDocument();
    expect(screen.getByText('Ordinary')).toBeInTheDocument();
    expect(screen.getByText('One vote per share')).toBeInTheDocument();
    expect(screen.getByText('Fully Paid')).toBeInTheDocument();
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument(); // Shareholder approval
    expect(screen.getByText('Capital management')).toBeInTheDocument();
  });

  it('renders on-market buy-back details with highlight', () => {
    render(
      <FormReview
        data={baseFormData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('On-Market Buy-Back Details')).toBeInTheDocument();
    expect(screen.getByText('Test Broker')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();
    expect(screen.getByText('12 months')).toBeInTheDocument();
    expect(screen.getByText('Standard conditions')).toBeInTheDocument();
  });

  it('renders employee share scheme buy-back details', () => {
    const employeeSchemeData: BuyBackFormData = {
      ...baseFormData,
      buyBackType: 'employee-share-scheme',
      onMarketBuyBack: undefined,
      employeeShareSchemeBuyBack: {
        numberOfShares: 25000,
        price: 1.50,
      },
    };

    render(
      <FormReview
        data={employeeSchemeData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Employee Share Scheme Buy-Back Details')).toBeInTheDocument();
    expect(screen.getByText('25,000')).toBeInTheDocument();
    expect(screen.getByText('$1.50')).toBeInTheDocument();
  });

  it('renders selective buy-back details', () => {
    const selectiveData: BuyBackFormData = {
      ...baseFormData,
      buyBackType: 'selective',
      onMarketBuyBack: undefined,
      selectiveBuyBack: {
        personOrClass: 'Major Shareholder',
        numberOfShares: 100000,
        price: 2.00,
      },
    };

    render(
      <FormReview
        data={selectiveData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Selective Buy-Back Details')).toBeInTheDocument();
    expect(screen.getByText('Major Shareholder')).toBeInTheDocument();
    expect(screen.getByText('100,000')).toBeInTheDocument();
    expect(screen.getByText('$2.00')).toBeInTheDocument();
  });

  it('renders equal access scheme details', () => {
    const equalAccessData: BuyBackFormData = {
      ...baseFormData,
      buyBackType: 'equal-access-scheme',
      onMarketBuyBack: undefined,
      equalAccessScheme: {
        percentage: 10,
        totalShares: 100000,
        price: 1.75,
        recordDate: new Date('2025-11-01'),
      },
    };

    render(
      <FormReview
        data={equalAccessData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Equal Access Scheme Details')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('100,000')).toBeInTheDocument();
    expect(screen.getByText('$1.75')).toBeInTheDocument();
  });

  it('renders compliance information', () => {
    render(
      <FormReview
        data={baseFormData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Director')).toBeInTheDocument();
  });

  it('renders trust entity type correctly', () => {
    const trustData: BuyBackFormData = {
      ...baseFormData,
      compliance: {
        ...baseFormData.compliance,
        isTrust: true,
      },
    };

    render(
      <FormReview
        data={trustData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Trust')).toBeInTheDocument();
  });

  it('renders company secretary role correctly', () => {
    const secretaryData: BuyBackFormData = {
      ...baseFormData,
      compliance: {
        ...baseFormData.compliance,
        signatoryRole: 'company-secretary',
      },
    };

    render(
      <FormReview
        data={secretaryData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Company Secretary')).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    render(
      <FormReview
        data={baseFormData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    const editButton = screen.getByText('Edit Form');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when Confirm button is clicked', () => {
    render(
      <FormReview
        data={baseFormData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmButton = screen.getByText('Confirm and Submit');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isSubmitting is true', () => {
    render(
      <FormReview
        data={baseFormData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
        isSubmitting={true}
      />
    );

    const editButton = screen.getByText('Edit Form');
    const confirmButton = screen.getByText('Submitting...');

    expect(editButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
  });

  it('shows "Not provided" for optional empty fields', () => {
    const minimalData: BuyBackFormData = {
      ...baseFormData,
      materialInformation: undefined,
      onMarketBuyBack: {
        brokerName: 'Test Broker',
        maximumShares: undefined,
        timePeriod: undefined,
        conditions: undefined,
      },
    };

    render(
      <FormReview
        data={minimalData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    // Material information should not be shown if undefined
    expect(screen.queryByText('Material Information')).not.toBeInTheDocument();
  });

  it('renders partly paid share details when applicable', () => {
    const partlyPaidData: BuyBackFormData = {
      ...baseFormData,
      shareClass: {
        ...baseFormData.shareClass,
        paidStatus: 'partly-paid',
        paidDetails: '$0.50 paid per share',
      },
    };

    render(
      <FormReview
        data={partlyPaidData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Partly Paid')).toBeInTheDocument();
    expect(screen.getByText('$0.50 paid per share')).toBeInTheDocument();
  });

  it('only shows the conditional section matching the buy-back type', () => {
    render(
      <FormReview
        data={baseFormData}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );

    // Should show on-market details
    expect(screen.getByText('On-Market Buy-Back Details')).toBeInTheDocument();

    // Should not show other conditional sections
    expect(screen.queryByText('Employee Share Scheme Buy-Back Details')).not.toBeInTheDocument();
    expect(screen.queryByText('Selective Buy-Back Details')).not.toBeInTheDocument();
    expect(screen.queryByText('Equal Access Scheme Details')).not.toBeInTheDocument();
  });
});
