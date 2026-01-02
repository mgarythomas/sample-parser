/**
 * Buy-back form Zod schema with validation rules
 * Based on ASX Appendix 3C requirements
 */

import { z } from 'zod';
import { abnOrArsnSchema, positiveNumberSchema, shareClassSchema } from './common.schema';

/**
 * Buy-back type enumeration
 * Represents the four types of buy-backs allowed under ASX rules
 */
export const buyBackTypeSchema = z.enum([
  'on-market',
  'employee-share-scheme',
  'selective',
  'equal-access-scheme'
], {
  errorMap: () => ({ message: 'Please select a valid buy-back type' })
});

/**
 * On-market buy-back conditional section schema
 * Required when buy-back type is 'on-market'
 */
export const onMarketBuyBackSchema = z.object({
  /** Name of the broker conducting the buy-back */
  brokerName: z.string().min(1, 'Broker name is required'),
  
  /** Maximum number of shares to be bought back (optional) */
  maximumShares: positiveNumberSchema.optional(),
  
  /** Time period for the buy-back (optional) */
  timePeriod: z.string().optional(),
  
  /** Any conditions attached to the buy-back (optional) */
  conditions: z.string().optional(),
}).describe('On-market buy-back details');

/**
 * Employee share scheme buy-back conditional section schema
 * Required when buy-back type is 'employee-share-scheme'
 */
export const employeeShareSchemeBuyBackSchema = z.object({
  /** Number of shares to be bought back */
  numberOfShares: positiveNumberSchema,
  
  /** Price per share */
  price: positiveNumberSchema,
}).describe('Employee share scheme buy-back details');

/**
 * Selective buy-back conditional section schema
 * Required when buy-back type is 'selective'
 */
export const selectiveBuyBackSchema = z.object({
  /** Person or class of persons from whom shares will be bought back */
  personOrClass: z.string().min(1, 'Person or class is required'),
  
  /** Number of shares to be bought back */
  numberOfShares: positiveNumberSchema,
  
  /** Price per share */
  price: positiveNumberSchema,
}).describe('Selective buy-back details');

/**
 * Equal access scheme conditional section schema
 * Required when buy-back type is 'equal-access-scheme'
 */
export const equalAccessSchemeSchema = z.object({
  /** Percentage of shares to be bought back */
  percentage: z.number()
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage cannot exceed 100'),
  
  /** Total number of shares to be bought back */
  totalShares: positiveNumberSchema,
  
  /** Price per share */
  price: positiveNumberSchema,
  
  /** Record date for determining eligible shareholders */
  recordDate: z.date({
    required_error: 'Record date is required',
    invalid_type_error: 'Record date must be a valid date',
  }),
}).describe('Equal access scheme details');

/**
 * Compliance section schema
 * Captures compliance statements and signatory information
 */
export const complianceSchema = z.object({
  /** Whether the entity is a trust */
  isTrust: z.boolean(),
  
  /** Name of the person signing the form */
  signatoryName: z.string().min(1, 'Signatory name is required'),
  
  /** Role of the signatory */
  signatoryRole: z.enum(['director', 'company-secretary'], {
    errorMap: () => ({ message: 'Signatory must be a director or company secretary' })
  }),
  
  /** Date of signature */
  signatureDate: z.date({
    required_error: 'Signature date is required',
    invalid_type_error: 'Signature date must be a valid date',
  }),
}).describe('Compliance and signature information');

/**
 * Main buy-back form schema
 * Includes all sections with conditional validation based on buy-back type
 */
export const buyBackFormSchema = z.object({
  // Entity information
  /** Name of the entity conducting the buy-back */
  entityName: z.string().min(1, 'Entity name is required'),
  
  /** Australian Business Number (ABN) or Australian Registered Scheme Number (ARSN) */
  abnArsn: abnOrArsnSchema,
  
  // Buy-back information
  /** Type of buy-back being conducted */
  buyBackType: buyBackTypeSchema,
  
  /** Share class information */
  shareClass: shareClassSchema,
  
  /** Whether shareholder approval is required */
  shareholderApprovalRequired: z.boolean(),
  
  /** Reason for the buy-back */
  reason: z.string().min(1, 'Reason for buy-back is required'),
  
  /** Any material information relevant to the buy-back (optional) */
  materialInformation: z.string().optional(),
  
  // Conditional sections (only one should be populated based on buy-back type)
  /** On-market buy-back details (conditional) */
  onMarketBuyBack: onMarketBuyBackSchema.optional(),
  
  /** Employee share scheme buy-back details (conditional) */
  employeeShareSchemeBuyBack: employeeShareSchemeBuyBackSchema.optional(),
  
  /** Selective buy-back details (conditional) */
  selectiveBuyBack: selectiveBuyBackSchema.optional(),
  
  /** Equal access scheme details (conditional) */
  equalAccessScheme: equalAccessSchemeSchema.optional(),
  
  // Compliance
  /** Compliance statements and signature */
  compliance: complianceSchema,
}).refine((data) => {
  // Cross-field validation: Ensure the appropriate conditional section is filled
  // based on the selected buy-back type
  const typeToFieldMap: Record<string, keyof typeof data> = {
    'on-market': 'onMarketBuyBack',
    'employee-share-scheme': 'employeeShareSchemeBuyBack',
    'selective': 'selectiveBuyBack',
    'equal-access-scheme': 'equalAccessScheme',
  };
  
  const requiredField = typeToFieldMap[data.buyBackType];
  return data[requiredField] !== undefined && data[requiredField] !== null;
}, {
  message: 'Required fields for the selected buy-back type must be completed',
  path: ['buyBackType'],
}).refine((data) => {
  // Cross-field validation: Ensure only the relevant conditional section is populated
  // Clear validation - other sections should be undefined when not selected
  const typeToFieldMap: Record<string, keyof typeof data> = {
    'on-market': 'onMarketBuyBack',
    'employee-share-scheme': 'employeeShareSchemeBuyBack',
    'selective': 'selectiveBuyBack',
    'equal-access-scheme': 'equalAccessScheme',
  };
  
  const selectedField = typeToFieldMap[data.buyBackType];
  const otherFields = Object.values(typeToFieldMap).filter(field => field !== selectedField);
  
  // Check that other conditional sections are not populated
  return otherFields.every(field => {
    const value = data[field];
    return value === undefined || value === null;
  });
}, {
  message: 'Only fields relevant to the selected buy-back type should be populated',
  path: ['buyBackType'],
});

/**
 * TypeScript type derived from the buy-back form schema
 * Use this type for type-safe form handling
 */
export type BuyBackFormData = z.infer<typeof buyBackFormSchema>;

/**
 * Individual conditional section types for convenience
 */
export type OnMarketBuyBack = z.infer<typeof onMarketBuyBackSchema>;
export type EmployeeShareSchemeBuyBack = z.infer<typeof employeeShareSchemeBuyBackSchema>;
export type SelectiveBuyBack = z.infer<typeof selectiveBuyBackSchema>;
export type EqualAccessScheme = z.infer<typeof equalAccessSchemeSchema>;
export type BuyBackType = z.infer<typeof buyBackTypeSchema>;
export type Compliance = z.infer<typeof complianceSchema>;
