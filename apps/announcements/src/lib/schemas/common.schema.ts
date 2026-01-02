/**
 * Common reusable Zod validation schemas
 */

import { z } from 'zod';

/**
 * Australian Business Number (ABN) validation schema
 * ABN must be exactly 11 digits
 */
export const abnSchema = z.string()
  .regex(/^\d{11}$/, 'ABN must be 11 digits')
  .describe('Australian Business Number');

/**
 * Australian Registered Scheme Number (ARSN) validation schema
 * ARSN must be exactly 9 digits
 */
export const arsnSchema = z.string()
  .regex(/^\d{9}$/, 'ARSN must be 9 digits')
  .describe('Australian Registered Scheme Number');

/**
 * Combined ABN or ARSN validation schema
 * Accepts either an 11-digit ABN or a 9-digit ARSN
 */
export const abnOrArsnSchema = z.string()
  .refine(
    (value) => /^\d{11}$/.test(value) || /^\d{9}$/.test(value),
    'Must be a valid ABN (11 digits) or ARSN (9 digits)'
  )
  .describe('ABN or ARSN');

/**
 * Positive number validation schema
 * Ensures the number is greater than zero
 */
export const positiveNumberSchema = z.number()
  .positive('Must be a positive number')
  .describe('Positive number');

/**
 * Share class validation schema
 * Captures complete share class information including voting rights and paid status
 */
export const shareClassSchema = z.object({
  /** Share class name/identifier */
  class: z.string().min(1, 'Share class is required'),
  
  /** Description of voting rights */
  votingRights: z.string().min(1, 'Voting rights are required'),
  
  /** Whether shares are fully or partly paid */
  paidStatus: z.enum(['fully-paid', 'partly-paid'], {
    errorMap: () => ({ message: 'Paid status must be either fully-paid or partly-paid' })
  }),
  
  /** Additional details if partly paid */
  paidDetails: z.string().optional(),
  
  /** Number of shares on issue */
  numberOnIssue: positiveNumberSchema,
}).describe('Share class information');

/**
 * Collection of all common schemas for easy import
 */
export const commonSchemas = {
  abn: abnSchema,
  arsn: arsnSchema,
  abnOrArsn: abnOrArsnSchema,
  positiveNumber: positiveNumberSchema,
  shareClass: shareClassSchema,
};
