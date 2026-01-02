/**
 * Unit tests for buy-back form schema validation
 */

import {
  buyBackFormSchema,
  buyBackTypeSchema,
  onMarketBuyBackSchema,
  employeeShareSchemeBuyBackSchema,
  selectiveBuyBackSchema,
  equalAccessSchemeSchema,
  complianceSchema,
  type BuyBackFormData,
} from '../buy-back.schema';

describe('buyBackTypeSchema', () => {
  it('should accept valid buy-back types', () => {
    expect(buyBackTypeSchema.parse('on-market')).toBe('on-market');
    expect(buyBackTypeSchema.parse('employee-share-scheme')).toBe('employee-share-scheme');
    expect(buyBackTypeSchema.parse('selective')).toBe('selective');
    expect(buyBackTypeSchema.parse('equal-access-scheme')).toBe('equal-access-scheme');
  });

  it('should reject invalid buy-back types', () => {
    expect(() => buyBackTypeSchema.parse('invalid-type')).toThrow();
    expect(() => buyBackTypeSchema.parse('')).toThrow();
    expect(() => buyBackTypeSchema.parse(null)).toThrow();
  });
});

describe('onMarketBuyBackSchema', () => {
  it('should accept valid on-market buy-back data', () => {
    const validData = {
      brokerName: 'ABC Brokers',
      maximumShares: 1000000,
      timePeriod: '12 months',
      conditions: 'Subject to market conditions',
    };
    expect(onMarketBuyBackSchema.parse(validData)).toEqual(validData);
  });

  it('should accept minimal valid data with only required fields', () => {
    const minimalData = {
      brokerName: 'ABC Brokers',
    };
    expect(onMarketBuyBackSchema.parse(minimalData)).toEqual(minimalData);
  });

  it('should reject data without broker name', () => {
    const invalidData = {
      maximumShares: 1000000,
    };
    expect(() => onMarketBuyBackSchema.parse(invalidData)).toThrow();
  });

  it('should reject negative maximum shares', () => {
    const invalidData = {
      brokerName: 'ABC Brokers',
      maximumShares: -1000,
    };
    expect(() => onMarketBuyBackSchema.parse(invalidData)).toThrow();
  });
});

describe('employeeShareSchemeBuyBackSchema', () => {
  it('should accept valid employee share scheme data', () => {
    const validData = {
      numberOfShares: 50000,
      price: 2.50,
    };
    expect(employeeShareSchemeBuyBackSchema.parse(validData)).toEqual(validData);
  });

  it('should reject data without required fields', () => {
    expect(() => employeeShareSchemeBuyBackSchema.parse({})).toThrow();
    expect(() => employeeShareSchemeBuyBackSchema.parse({ numberOfShares: 50000 })).toThrow();
    expect(() => employeeShareSchemeBuyBackSchema.parse({ price: 2.50 })).toThrow();
  });

  it('should reject negative values', () => {
    expect(() => employeeShareSchemeBuyBackSchema.parse({
      numberOfShares: -50000,
      price: 2.50,
    })).toThrow();

    expect(() => employeeShareSchemeBuyBackSchema.parse({
      numberOfShares: 50000,
      price: -2.50,
    })).toThrow();
  });
});

describe('selectiveBuyBackSchema', () => {
  it('should accept valid selective buy-back data', () => {
    const validData = {
      personOrClass: 'John Smith',
      numberOfShares: 100000,
      price: 3.75,
    };
    expect(selectiveBuyBackSchema.parse(validData)).toEqual(validData);
  });

  it('should reject data without required fields', () => {
    expect(() => selectiveBuyBackSchema.parse({})).toThrow();
    expect(() => selectiveBuyBackSchema.parse({
      numberOfShares: 100000,
      price: 3.75,
    })).toThrow();
  });

  it('should reject negative values', () => {
    expect(() => selectiveBuyBackSchema.parse({
      personOrClass: 'John Smith',
      numberOfShares: -100000,
      price: 3.75,
    })).toThrow();
  });
});

describe('equalAccessSchemeSchema', () => {
  it('should accept valid equal access scheme data', () => {
    const validData = {
      percentage: 10,
      totalShares: 500000,
      price: 4.25,
      recordDate: new Date('2025-12-31'),
    };
    expect(equalAccessSchemeSchema.parse(validData)).toEqual(validData);
  });

  it('should reject percentage outside valid range', () => {
    expect(() => equalAccessSchemeSchema.parse({
      percentage: -5,
      totalShares: 500000,
      price: 4.25,
      recordDate: new Date('2025-12-31'),
    })).toThrow('Percentage must be at least 0');

    expect(() => equalAccessSchemeSchema.parse({
      percentage: 150,
      totalShares: 500000,
      price: 4.25,
      recordDate: new Date('2025-12-31'),
    })).toThrow('Percentage cannot exceed 100');
  });

  it('should accept boundary percentage values', () => {
    const dataWith0 = {
      percentage: 0,
      totalShares: 500000,
      price: 4.25,
      recordDate: new Date('2025-12-31'),
    };
    expect(equalAccessSchemeSchema.parse(dataWith0).percentage).toBe(0);

    const dataWith100 = {
      percentage: 100,
      totalShares: 500000,
      price: 4.25,
      recordDate: new Date('2025-12-31'),
    };
    expect(equalAccessSchemeSchema.parse(dataWith100).percentage).toBe(100);
  });

  it('should reject invalid date', () => {
    expect(() => equalAccessSchemeSchema.parse({
      percentage: 10,
      totalShares: 500000,
      price: 4.25,
      recordDate: 'invalid-date',
    })).toThrow();
  });
});

describe('complianceSchema', () => {
  it('should accept valid compliance data', () => {
    const validData = {
      isTrust: false,
      signatoryName: 'Jane Doe',
      signatoryRole: 'director' as const,
      signatureDate: new Date('2025-10-19'),
    };
    expect(complianceSchema.parse(validData)).toEqual(validData);
  });

  it('should accept company-secretary role', () => {
    const validData = {
      isTrust: true,
      signatoryName: 'John Smith',
      signatoryRole: 'company-secretary' as const,
      signatureDate: new Date('2025-10-19'),
    };
    expect(complianceSchema.parse(validData)).toEqual(validData);
  });

  it('should reject invalid signatory role', () => {
    expect(() => complianceSchema.parse({
      isTrust: false,
      signatoryName: 'Jane Doe',
      signatoryRole: 'manager',
      signatureDate: new Date('2025-10-19'),
    })).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => complianceSchema.parse({
      isTrust: false,
      signatoryRole: 'director',
      signatureDate: new Date('2025-10-19'),
    })).toThrow();
  });
});

describe('buyBackFormSchema - Valid Data', () => {
  const baseFormData = {
    entityName: 'Example Corporation Pty Ltd',
    abnArsn: '12345678901', // Valid 11-digit ABN
    buyBackType: 'on-market' as const,
    shareClass: {
      class: 'Ordinary',
      votingRights: 'One vote per share',
      paidStatus: 'fully-paid' as const,
      numberOnIssue: 10000000,
    },
    shareholderApprovalRequired: true,
    reason: 'Capital management',
    compliance: {
      isTrust: false,
      signatoryName: 'Jane Doe',
      signatoryRole: 'director' as const,
      signatureDate: new Date('2025-10-19'),
    },
  };

  it('should accept valid buy-back form with on-market type', () => {
    const validData: BuyBackFormData = {
      ...baseFormData,
      buyBackType: 'on-market',
      onMarketBuyBack: {
        brokerName: 'ABC Brokers',
        maximumShares: 1000000,
        timePeriod: '12 months',
      },
    };
    expect(() => buyBackFormSchema.parse(validData)).not.toThrow();
  });

  it('should accept valid buy-back form with employee-share-scheme type', () => {
    const validData: BuyBackFormData = {
      ...baseFormData,
      buyBackType: 'employee-share-scheme',
      employeeShareSchemeBuyBack: {
        numberOfShares: 50000,
        price: 2.50,
      },
    };
    expect(() => buyBackFormSchema.parse(validData)).not.toThrow();
  });

  it('should accept valid buy-back form with selective type', () => {
    const validData: BuyBackFormData = {
      ...baseFormData,
      buyBackType: 'selective',
      selectiveBuyBack: {
        personOrClass: 'John Smith',
        numberOfShares: 100000,
        price: 3.75,
      },
    };
    expect(() => buyBackFormSchema.parse(validData)).not.toThrow();
  });

  it('should accept valid buy-back form with equal-access-scheme type', () => {
    const validData: BuyBackFormData = {
      ...baseFormData,
      buyBackType: 'equal-access-scheme',
      equalAccessScheme: {
        percentage: 10,
        totalShares: 500000,
        price: 4.25,
        recordDate: new Date('2025-12-31'),
      },
    };
    expect(() => buyBackFormSchema.parse(validData)).not.toThrow();
  });

  it('should accept optional materialInformation field', () => {
    const validData: BuyBackFormData = {
      ...baseFormData,
      buyBackType: 'on-market',
      materialInformation: 'Additional context about the buy-back',
      onMarketBuyBack: {
        brokerName: 'ABC Brokers',
      },
    };
    expect(() => buyBackFormSchema.parse(validData)).not.toThrow();
  });
});

describe('buyBackFormSchema - ABN/ARSN Validation', () => {
  const baseFormData = {
    entityName: 'Example Corporation Pty Ltd',
    buyBackType: 'on-market' as const,
    shareClass: {
      class: 'Ordinary',
      votingRights: 'One vote per share',
      paidStatus: 'fully-paid' as const,
      numberOnIssue: 10000000,
    },
    shareholderApprovalRequired: true,
    reason: 'Capital management',
    onMarketBuyBack: {
      brokerName: 'ABC Brokers',
    },
    compliance: {
      isTrust: false,
      signatoryName: 'Jane Doe',
      signatoryRole: 'director' as const,
      signatureDate: new Date('2025-10-19'),
    },
  };

  it('should accept valid 11-digit ABN', () => {
    const validData = {
      ...baseFormData,
      abnArsn: '12345678901',
    };
    expect(() => buyBackFormSchema.parse(validData)).not.toThrow();
  });

  it('should accept valid 9-digit ARSN', () => {
    const validData = {
      ...baseFormData,
      abnArsn: '123456789',
    };
    expect(() => buyBackFormSchema.parse(validData)).not.toThrow();
  });

  it('should reject ABN with incorrect length', () => {
    const invalidData = {
      ...baseFormData,
      abnArsn: '123456789012', // 12 digits
    };
    expect(() => buyBackFormSchema.parse(invalidData)).toThrow();
  });

  it('should reject ABN with non-numeric characters', () => {
    const invalidData = {
      ...baseFormData,
      abnArsn: '1234567890A',
    };
    expect(() => buyBackFormSchema.parse(invalidData)).toThrow();
  });

  it('should reject empty ABN/ARSN', () => {
    const invalidData = {
      ...baseFormData,
      abnArsn: '',
    };
    expect(() => buyBackFormSchema.parse(invalidData)).toThrow();
  });
});

describe('buyBackFormSchema - Conditional Field Requirements', () => {
  const baseFormData = {
    entityName: 'Example Corporation Pty Ltd',
    abnArsn: '12345678901',
    shareClass: {
      class: 'Ordinary',
      votingRights: 'One vote per share',
      paidStatus: 'fully-paid' as const,
      numberOnIssue: 10000000,
    },
    shareholderApprovalRequired: true,
    reason: 'Capital management',
    compliance: {
      isTrust: false,
      signatoryName: 'Jane Doe',
      signatoryRole: 'director' as const,
      signatureDate: new Date('2025-10-19'),
    },
  };

  it('should reject on-market type without onMarketBuyBack section', () => {
    const invalidData = {
      ...baseFormData,
      buyBackType: 'on-market' as const,
    };
    expect(() => buyBackFormSchema.parse(invalidData)).toThrow(
      'Required fields for the selected buy-back type must be completed'
    );
  });

  it('should reject employee-share-scheme type without employeeShareSchemeBuyBack section', () => {
    const invalidData = {
      ...baseFormData,
      buyBackType: 'employee-share-scheme' as const,
    };
    expect(() => buyBackFormSchema.parse(invalidData)).toThrow(
      'Required fields for the selected buy-back type must be completed'
    );
  });

  it('should reject selective type without selectiveBuyBack section', () => {
    const invalidData = {
      ...baseFormData,
      buyBackType: 'selective' as const,
    };
    expect(() => buyBackFormSchema.parse(invalidData)).toThrow(
      'Required fields for the selected buy-back type must be completed'
    );
  });

  it('should reject equal-access-scheme type without equalAccessScheme section', () => {
    const invalidData = {
      ...baseFormData,
      buyBackType: 'equal-access-scheme' as const,
    };
    expect(() => buyBackFormSchema.parse(invalidData)).toThrow(
      'Required fields for the selected buy-back type must be completed'
    );
  });
});

describe('buyBackFormSchema - Cross-field Validation Refinements', () => {
  const baseFormData = {
    entityName: 'Example Corporation Pty Ltd',
    abnArsn: '12345678901',
    shareClass: {
      class: 'Ordinary',
      votingRights: 'One vote per share',
      paidStatus: 'fully-paid' as const,
      numberOnIssue: 10000000,
    },
    shareholderApprovalRequired: true,
    reason: 'Capital management',
    compliance: {
      isTrust: false,
      signatoryName: 'Jane Doe',
      signatoryRole: 'director' as const,
      signatureDate: new Date('2025-10-19'),
    },
  };

  it('should reject form with multiple conditional sections populated', () => {
    const invalidData = {
      ...baseFormData,
      buyBackType: 'on-market' as const,
      onMarketBuyBack: {
        brokerName: 'ABC Brokers',
      },
      employeeShareSchemeBuyBack: {
        numberOfShares: 50000,
        price: 2.50,
      },
    };
    expect(() => buyBackFormSchema.parse(invalidData)).toThrow(
      'Only fields relevant to the selected buy-back type should be populated'
    );
  });

  it('should reject on-market type with wrong conditional section', () => {
    const invalidData = {
      ...baseFormData,
      buyBackType: 'on-market' as const,
      selectiveBuyBack: {
        personOrClass: 'John Smith',
        numberOfShares: 100000,
        price: 3.75,
      },
    };
    expect(() => buyBackFormSchema.parse(invalidData)).toThrow();
  });

  it('should accept form with only the correct conditional section', () => {
    const validData = {
      ...baseFormData,
      buyBackType: 'selective' as const,
      selectiveBuyBack: {
        personOrClass: 'John Smith',
        numberOfShares: 100000,
        price: 3.75,
      },
    };
    expect(() => buyBackFormSchema.parse(validData)).not.toThrow();
  });

  it('should ensure conditional sections match selected buy-back type', () => {
    // Test that employee-share-scheme requires employeeShareSchemeBuyBack
    const validEmployeeScheme = {
      ...baseFormData,
      buyBackType: 'employee-share-scheme' as const,
      employeeShareSchemeBuyBack: {
        numberOfShares: 50000,
        price: 2.50,
      },
    };
    expect(() => buyBackFormSchema.parse(validEmployeeScheme)).not.toThrow();

    // Test that equal-access-scheme requires equalAccessScheme
    const validEqualAccess = {
      ...baseFormData,
      buyBackType: 'equal-access-scheme' as const,
      equalAccessScheme: {
        percentage: 10,
        totalShares: 500000,
        price: 4.25,
        recordDate: new Date('2025-12-31'),
      },
    };
    expect(() => buyBackFormSchema.parse(validEqualAccess)).not.toThrow();
  });
});

describe('buyBackFormSchema - Required Fields', () => {
  it('should reject form without entity name', () => {
    expect(() => buyBackFormSchema.parse({
      abnArsn: '12345678901',
      buyBackType: 'on-market',
    })).toThrow();
  });

  it('should reject form without buy-back type', () => {
    expect(() => buyBackFormSchema.parse({
      entityName: 'Example Corporation',
      abnArsn: '12345678901',
    })).toThrow();
  });

  it('should reject form without share class', () => {
    expect(() => buyBackFormSchema.parse({
      entityName: 'Example Corporation',
      abnArsn: '12345678901',
      buyBackType: 'on-market',
    })).toThrow();
  });

  it('should reject form without reason', () => {
    const invalidData = {
      entityName: 'Example Corporation',
      abnArsn: '12345678901',
      buyBackType: 'on-market' as const,
      shareClass: {
        class: 'Ordinary',
        votingRights: 'One vote per share',
        paidStatus: 'fully-paid' as const,
        numberOnIssue: 10000000,
      },
      shareholderApprovalRequired: true,
      onMarketBuyBack: {
        brokerName: 'ABC Brokers',
      },
      compliance: {
        isTrust: false,
        signatoryName: 'Jane Doe',
        signatoryRole: 'director' as const,
        signatureDate: new Date('2025-10-19'),
      },
    };
    expect(() => buyBackFormSchema.parse(invalidData)).toThrow();
  });

  it('should reject form without compliance section', () => {
    const invalidData = {
      entityName: 'Example Corporation',
      abnArsn: '12345678901',
      buyBackType: 'on-market' as const,
      shareClass: {
        class: 'Ordinary',
        votingRights: 'One vote per share',
        paidStatus: 'fully-paid' as const,
        numberOnIssue: 10000000,
      },
      shareholderApprovalRequired: true,
      reason: 'Capital management',
      onMarketBuyBack: {
        brokerName: 'ABC Brokers',
      },
    };
    expect(() => buyBackFormSchema.parse(invalidData)).toThrow();
  });
});
