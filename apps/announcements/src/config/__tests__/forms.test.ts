/**
 * Tests for form configuration registry
 */

import {
  FORM_TYPES,
  FORM_REGISTRY,
  DEFAULT_FORM_SETTINGS,
  getFormMetadata,
  getAllFormTypes,
  getAllForms,
  getFormsByTag,
  getFormRoute,
  isValidFormType,
  getFormSettings,
  getFormDraftKey,
  getFormVersionKey,
} from '../forms';

describe('Form Configuration', () => {
  describe('FORM_TYPES', () => {
    it('should define BUY_BACK form type', () => {
      expect(FORM_TYPES.BUY_BACK).toBe('buy-back');
    });
  });

  describe('FORM_REGISTRY', () => {
    it('should contain buy-back form metadata', () => {
      const buyBackForm = FORM_REGISTRY[FORM_TYPES.BUY_BACK];
      
      expect(buyBackForm).toBeDefined();
      expect(buyBackForm.type).toBe('buy-back');
      expect(buyBackForm.displayName).toBe('Buy-Back Announcement');
      expect(buyBackForm.sourceDocument).toBe('Appendix 3C');
      expect(buyBackForm.version).toBe('1.0.0');
    });

    it('should have valid schema for buy-back form', () => {
      const buyBackForm = FORM_REGISTRY[FORM_TYPES.BUY_BACK];
      
      expect(buyBackForm.schema).toBeDefined();
      expect(typeof buyBackForm.schema.parse).toBe('function');
    });

    it('should have route configuration for buy-back form', () => {
      const buyBackForm = FORM_REGISTRY[FORM_TYPES.BUY_BACK];
      
      expect(buyBackForm.routes.form).toBe('/forms/buy-back');
      expect(buyBackForm.routes.review).toBe('/forms/buy-back/review');
      expect(buyBackForm.routes.success).toBe('/forms/success');
    });

    it('should have settings for buy-back form', () => {
      const buyBackForm = FORM_REGISTRY[FORM_TYPES.BUY_BACK];
      
      expect(buyBackForm.settings).toBeDefined();
      expect(buyBackForm.settings.autoSaveInterval).toBe(2000);
      expect(buyBackForm.settings.validationMode).toBe('onBlur');
    });
  });

  describe('DEFAULT_FORM_SETTINGS', () => {
    it('should define default auto-save interval', () => {
      expect(DEFAULT_FORM_SETTINGS.autoSaveInterval).toBe(2000);
    });

    it('should define default validation mode', () => {
      expect(DEFAULT_FORM_SETTINGS.validationMode).toBe('onBlur');
    });

    it('should enable draft restoration by default', () => {
      expect(DEFAULT_FORM_SETTINGS.enableDraftRestoration).toBe(true);
    });

    it('should enable version tracking by default', () => {
      expect(DEFAULT_FORM_SETTINGS.enableVersionTracking).toBe(true);
    });
  });

  describe('getFormMetadata', () => {
    it('should return metadata for valid form type', () => {
      const metadata = getFormMetadata(FORM_TYPES.BUY_BACK);
      
      expect(metadata).toBeDefined();
      expect(metadata?.type).toBe('buy-back');
    });

    it('should return undefined for invalid form type', () => {
      const metadata = getFormMetadata('invalid-form' as any);
      
      expect(metadata).toBeUndefined();
    });
  });

  describe('getAllFormTypes', () => {
    it('should return array of all form types', () => {
      const formTypes = getAllFormTypes();
      
      expect(Array.isArray(formTypes)).toBe(true);
      expect(formTypes).toContain('buy-back');
    });
  });

  describe('getAllForms', () => {
    it('should return array of all form metadata', () => {
      const forms = getAllForms();
      
      expect(Array.isArray(forms)).toBe(true);
      expect(forms.length).toBeGreaterThan(0);
      expect(forms[0]).toHaveProperty('type');
      expect(forms[0]).toHaveProperty('displayName');
    });
  });

  describe('getFormsByTag', () => {
    it('should return forms matching the tag', () => {
      const forms = getFormsByTag('buy-back');
      
      expect(Array.isArray(forms)).toBe(true);
      expect(forms.length).toBeGreaterThan(0);
      expect(forms[0].tags).toContain('buy-back');
    });

    it('should return empty array for non-existent tag', () => {
      const forms = getFormsByTag('non-existent-tag');
      
      expect(Array.isArray(forms)).toBe(true);
      expect(forms.length).toBe(0);
    });
  });

  describe('getFormRoute', () => {
    it('should return form route for valid form type', () => {
      const route = getFormRoute(FORM_TYPES.BUY_BACK, 'form');
      
      expect(route).toBe('/forms/buy-back');
    });

    it('should return review route for valid form type', () => {
      const route = getFormRoute(FORM_TYPES.BUY_BACK, 'review');
      
      expect(route).toBe('/forms/buy-back/review');
    });

    it('should return success route for valid form type', () => {
      const route = getFormRoute(FORM_TYPES.BUY_BACK, 'success');
      
      expect(route).toBe('/forms/success');
    });

    it('should return undefined for invalid form type', () => {
      const route = getFormRoute('invalid-form' as any, 'form');
      
      expect(route).toBeUndefined();
    });
  });

  describe('isValidFormType', () => {
    it('should return true for valid form type', () => {
      expect(isValidFormType('buy-back')).toBe(true);
    });

    it('should return false for invalid form type', () => {
      expect(isValidFormType('invalid-form')).toBe(false);
    });
  });

  describe('getFormSettings', () => {
    it('should return settings for valid form type', () => {
      const settings = getFormSettings(FORM_TYPES.BUY_BACK);
      
      expect(settings).toBeDefined();
      expect(settings.autoSaveInterval).toBe(2000);
      expect(settings.validationMode).toBe('onBlur');
    });

    it('should merge with default settings', () => {
      const settings = getFormSettings(FORM_TYPES.BUY_BACK);
      
      expect(settings.enableDraftRestoration).toBe(true);
      expect(settings.enableVersionTracking).toBe(true);
    });
  });

  describe('getFormDraftKey', () => {
    it('should return correct storage key for form draft', () => {
      const key = getFormDraftKey(FORM_TYPES.BUY_BACK);
      
      expect(key).toBe('form-draft-buy-back');
    });
  });

  describe('getFormVersionKey', () => {
    it('should return correct storage key for form version history', () => {
      const key = getFormVersionKey(FORM_TYPES.BUY_BACK);
      
      expect(key).toBe('form-versions-buy-back');
    });
  });
});
