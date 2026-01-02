/**
 * Form Configuration Registry
 * 
 * Centralized configuration for all announcement forms in the system.
 * This file provides:
 * - Form type constants and metadata
 * - Routing configuration
 * - Form-specific settings (auto-save, validation)
 * - Extensibility for adding new forms
 * 
 * @see Design Document - Form Template Architecture
 * @see Requirements 8.4 - Form Template Architecture
 */

import { z } from 'zod';
import { buyBackFormSchema } from '@/lib/schemas/buy-back.schema';

/**
 * Form type constants
 * Add new form types here as they are implemented
 */
export const FORM_TYPES = {
  BUY_BACK: 'buy-back',
  // Future form types to be added:
  // APPENDIX_3A_01: 'appendix-3a-01',
  // APPENDIX_3A_02: 'appendix-3a-02',
  // APPENDIX_3A_03: 'appendix-3a-03',
  // APPENDIX_3A_04: 'appendix-3a-04',
  // APPENDIX_3A_05: 'appendix-3a-05',
  // APPENDIX_3A_06: 'appendix-3a-06',
  // APPENDIX_3Y: 'appendix-3y',
  // APPENDIX_4C: 'appendix-4c',
  // APPENDIX_4G: 'appendix-4g',
} as const;

/**
 * Form type union type for type safety
 */
export type FormType = typeof FORM_TYPES[keyof typeof FORM_TYPES];

/**
 * Validation mode options for react-hook-form
 */
export type ValidationMode = 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';

/**
 * Form-specific settings interface
 */
export interface FormSettings {
  /** Auto-save interval in milliseconds (0 to disable) */
  autoSaveInterval: number;
  
  /** Validation mode for react-hook-form */
  validationMode: ValidationMode;
  
  /** Whether to revalidate on blur */
  reValidateMode: ValidationMode;
  
  /** Whether to show a progress indicator */
  showProgress: boolean;
  
  /** Whether to enable draft restoration */
  enableDraftRestoration: boolean;
  
  /** Whether to track version history */
  enableVersionTracking: boolean;
  
  /** Maximum number of versions to keep in history */
  maxVersionHistory: number;
}

/**
 * Form metadata interface
 */
export interface FormMetadata {
  /** Unique form type identifier */
  type: FormType;
  
  /** Display name for the form */
  displayName: string;
  
  /** Short description of the form */
  description: string;
  
  /** Source document reference (e.g., "Appendix 3C") */
  sourceDocument: string;
  
  /** Form schema version */
  version: string;
  
  /** Zod schema for validation */
  schema: z.ZodSchema<unknown>;
  
  /** Form-specific settings */
  settings: FormSettings;
  
  /** Route configuration */
  routes: {
    /** Main form route */
    form: string;
    
    /** Review page route */
    review: string;
    
    /** Success page route (optional) */
    success?: string;
  };
  
  /** API endpoint for form submission */
  apiEndpoint: string;
  
  /** Estimated completion time in minutes */
  estimatedTime: number;
  
  /** Tags for categorization and search */
  tags: string[];
}

/**
 * Default form settings
 * These can be overridden per form
 */
export const DEFAULT_FORM_SETTINGS: FormSettings = {
  autoSaveInterval: 2000, // 2 seconds
  validationMode: 'onBlur',
  reValidateMode: 'onChange',
  showProgress: true,
  enableDraftRestoration: true,
  enableVersionTracking: true,
  maxVersionHistory: 10,
};

/**
 * Form Registry
 * Central registry of all forms with their metadata and configuration
 */
export const FORM_REGISTRY: Record<FormType, FormMetadata> = {
  [FORM_TYPES.BUY_BACK]: {
    type: FORM_TYPES.BUY_BACK,
    displayName: 'Buy-Back Announcement',
    description: 'Notification of buy-back for listed entities',
    sourceDocument: 'Appendix 3C',
    version: '1.0.0',
    schema: buyBackFormSchema,
    settings: {
      ...DEFAULT_FORM_SETTINGS,
      autoSaveInterval: 2000,
      validationMode: 'onBlur',
    },
    routes: {
      form: '/forms/buy-back',
      review: '/forms/buy-back/review',
      success: '/forms/success',
    },
    apiEndpoint: '/api/forms/buy-back',
    estimatedTime: 15,
    tags: ['buy-back', 'shares', 'appendix-3c'],
  },
  
  // Future forms will be added here following the same pattern:
  // [FORM_TYPES.APPENDIX_3A_01]: {
  //   type: FORM_TYPES.APPENDIX_3A_01,
  //   displayName: 'Application for Quotation',
  //   description: 'Application for quotation of securities',
  //   sourceDocument: 'Appendix 3A.01',
  //   version: '1.0.0',
  //   schema: appendix3A01Schema,
  //   settings: DEFAULT_FORM_SETTINGS,
  //   routes: {
  //     form: '/forms/appendix-3a-01',
  //     review: '/forms/appendix-3a-01/review',
  //   },
  //   apiEndpoint: '/api/forms/appendix-3a-01',
  //   estimatedTime: 20,
  //   tags: ['quotation', 'securities', 'appendix-3a'],
  // },
};

/**
 * Get form metadata by type
 * 
 * @param formType - The form type identifier
 * @returns Form metadata or undefined if not found
 */
export function getFormMetadata(formType: FormType): FormMetadata | undefined {
  return FORM_REGISTRY[formType];
}

/**
 * Get all registered form types
 * 
 * @returns Array of all form type identifiers
 */
export function getAllFormTypes(): FormType[] {
  return Object.keys(FORM_REGISTRY) as FormType[];
}

/**
 * Get all form metadata entries
 * 
 * @returns Array of all form metadata objects
 */
export function getAllForms(): FormMetadata[] {
  return Object.values(FORM_REGISTRY);
}

/**
 * Get forms by tag
 * 
 * @param tag - Tag to filter by
 * @returns Array of form metadata matching the tag
 */
export function getFormsByTag(tag: string): FormMetadata[] {
  return getAllForms().filter(form => form.tags.includes(tag));
}

/**
 * Get form route by type and route key
 * 
 * @param formType - The form type identifier
 * @param routeKey - The route key ('form', 'review', or 'success')
 * @returns Route path or undefined if not found
 */
export function getFormRoute(
  formType: FormType,
  routeKey: keyof FormMetadata['routes']
): string | undefined {
  const metadata = getFormMetadata(formType);
  return metadata?.routes[routeKey];
}

/**
 * Validate form type
 * 
 * @param formType - The form type to validate
 * @returns True if the form type is registered
 */
export function isValidFormType(formType: string): formType is FormType {
  return formType in FORM_REGISTRY;
}

/**
 * Get form settings with defaults
 * 
 * @param formType - The form type identifier
 * @returns Form settings merged with defaults
 */
export function getFormSettings(formType: FormType): FormSettings {
  const metadata = getFormMetadata(formType);
  return {
    ...DEFAULT_FORM_SETTINGS,
    ...metadata?.settings,
  };
}

/**
 * Storage key generator for form drafts
 * 
 * @param formType - The form type identifier
 * @returns Local storage key for the form draft
 */
export function getFormDraftKey(formType: FormType): string {
  return `form-draft-${formType}`;
}

/**
 * Storage key generator for form version history
 * 
 * @param formType - The form type identifier
 * @returns Local storage key for the form version history
 */
export function getFormVersionKey(formType: FormType): string {
  return `form-versions-${formType}`;
}
