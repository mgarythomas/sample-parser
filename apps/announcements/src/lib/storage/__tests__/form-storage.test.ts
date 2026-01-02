/**
 * Unit tests for form storage utilities
 */

import {
  saveFormDraft,
  restoreFormDraft,
  clearFormDraft,
  hasDraft,
  getAllDrafts,
  clearAllDrafts,
  createDebouncedSave,
  StorageQuotaExceededError,
} from '../form-storage';
import { StoredFormDraft } from '../../types/forms';

describe('form-storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('saveFormDraft', () => {
    it('should save a form draft to localStorage', () => {
      const formType = 'buy-back';
      const data = { entityName: 'Test Company', abnArsn: '12345678901' };

      saveFormDraft(formType, data);

      const stored = localStorage.getItem('form-draft-buy-back');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!) as StoredFormDraft;
      expect(parsed.formType).toBe(formType);
      expect(parsed.data).toEqual(data);
      expect(parsed.version).toBe(1);
      expect(parsed.lastSaved).toBeTruthy();
    });

    it('should save with custom version number', () => {
      const formType = 'buy-back';
      const data = { entityName: 'Test Company' };
      const version = 5;

      saveFormDraft(formType, data, version);

      const stored = localStorage.getItem('form-draft-buy-back');
      const parsed = JSON.parse(stored!) as StoredFormDraft;
      expect(parsed.version).toBe(version);
    });

    it('should overwrite existing draft', () => {
      const formType = 'buy-back';
      const data1 = { entityName: 'Company 1' };
      const data2 = { entityName: 'Company 2' };

      saveFormDraft(formType, data1);
      saveFormDraft(formType, data2);

      const stored = localStorage.getItem('form-draft-buy-back');
      const parsed = JSON.parse(stored!) as StoredFormDraft;
      expect(parsed.data).toEqual(data2);
    });

    it('should throw StorageQuotaExceededError when quota is exceeded', () => {
      const formType = 'buy-back';
      const data = { test: 'data' };

      // Mock localStorage.setItem to throw QuotaExceededError
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      mockSetItem.mockImplementation((key: string) => {
        // Allow the test key for isLocalStorageAvailable check
        if (key === '__localStorage_test__') {
          return;
        }
        throw quotaError;
      });

      expect(() => saveFormDraft(formType, data)).toThrow(StorageQuotaExceededError);
      expect(() => saveFormDraft(formType, data)).toThrow('storage quota exceeded');

      mockSetItem.mockRestore();
    });
  });

  describe('restoreFormDraft', () => {
    it('should restore a saved form draft', () => {
      const formType = 'buy-back';
      const data = { entityName: 'Test Company', abnArsn: '12345678901' };

      saveFormDraft(formType, data);
      const restored = restoreFormDraft(formType);

      expect(restored).toBeTruthy();
      expect(restored!.formType).toBe(formType);
      expect(restored!.data).toEqual(data);
      expect(restored!.version).toBe(1);
    });

    it('should return null when no draft exists', () => {
      const restored = restoreFormDraft('non-existent');
      expect(restored).toBeNull();
    });

    it('should return null and clear corrupted data', () => {
      const formType = 'buy-back';
      
      // Store invalid JSON
      localStorage.setItem('form-draft-buy-back', 'invalid json');

      const restored = restoreFormDraft(formType);
      expect(restored).toBeNull();
      
      // Verify corrupted data was cleared
      expect(localStorage.getItem('form-draft-buy-back')).toBeNull();
    });

    it('should return null and clear data with invalid structure', () => {
      const formType = 'buy-back';
      
      // Store data with missing required fields
      localStorage.setItem('form-draft-buy-back', JSON.stringify({
        formType: 'buy-back',
        // missing lastSaved, data, version
      }));

      const restored = restoreFormDraft(formType);
      expect(restored).toBeNull();
      
      // Verify invalid data was cleared
      expect(localStorage.getItem('form-draft-buy-back')).toBeNull();
    });
  });

  describe('clearFormDraft', () => {
    it('should clear a form draft from localStorage', () => {
      const formType = 'buy-back';
      const data = { entityName: 'Test Company' };

      saveFormDraft(formType, data);
      expect(localStorage.getItem('form-draft-buy-back')).toBeTruthy();

      clearFormDraft(formType);
      expect(localStorage.getItem('form-draft-buy-back')).toBeNull();
    });

    it('should not throw error when clearing non-existent draft', () => {
      expect(() => clearFormDraft('non-existent')).not.toThrow();
    });
  });

  describe('hasDraft', () => {
    it('should return true when draft exists', () => {
      const formType = 'buy-back';
      const data = { entityName: 'Test Company' };

      saveFormDraft(formType, data);
      expect(hasDraft(formType)).toBe(true);
    });

    it('should return false when draft does not exist', () => {
      expect(hasDraft('non-existent')).toBe(false);
    });
  });

  describe('getAllDrafts', () => {
    it('should return all form drafts', () => {
      saveFormDraft('buy-back', { entityName: 'Company 1' });
      saveFormDraft('appendix-3a', { entityName: 'Company 2' });
      saveFormDraft('appendix-3b', { entityName: 'Company 3' });

      const drafts = getAllDrafts();
      expect(drafts).toHaveLength(3);
      expect(drafts.map(d => d.formType)).toContain('buy-back');
      expect(drafts.map(d => d.formType)).toContain('appendix-3a');
      expect(drafts.map(d => d.formType)).toContain('appendix-3b');
    });

    it('should return empty array when no drafts exist', () => {
      const drafts = getAllDrafts();
      expect(drafts).toEqual([]);
    });

    it('should skip corrupted drafts', () => {
      saveFormDraft('buy-back', { entityName: 'Company 1' });
      localStorage.setItem('form-draft-corrupted', 'invalid json');

      const drafts = getAllDrafts();
      expect(drafts).toHaveLength(1);
      expect(drafts[0].formType).toBe('buy-back');
    });

    it('should not include non-form-draft items', () => {
      saveFormDraft('buy-back', { entityName: 'Company 1' });
      localStorage.setItem('other-key', 'some value');

      const drafts = getAllDrafts();
      expect(drafts).toHaveLength(1);
    });
  });

  describe('clearAllDrafts', () => {
    it('should clear all form drafts', () => {
      saveFormDraft('buy-back', { entityName: 'Company 1' });
      saveFormDraft('appendix-3a', { entityName: 'Company 2' });
      localStorage.setItem('other-key', 'should remain');

      clearAllDrafts();

      expect(localStorage.getItem('form-draft-buy-back')).toBeNull();
      expect(localStorage.getItem('form-draft-appendix-3a')).toBeNull();
      expect(localStorage.getItem('other-key')).toBe('should remain');
    });

    it('should not throw error when no drafts exist', () => {
      expect(() => clearAllDrafts()).not.toThrow();
    });
  });

  describe('createDebouncedSave', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce save calls', () => {
      const { debouncedSave } = createDebouncedSave(1000);
      const formType = 'buy-back';
      const data1 = { entityName: 'Company 1' };
      const data2 = { entityName: 'Company 2' };
      const data3 = { entityName: 'Company 3' };

      // Make multiple rapid calls
      debouncedSave(formType, data1);
      debouncedSave(formType, data2);
      debouncedSave(formType, data3);

      // Nothing should be saved yet
      expect(localStorage.getItem('form-draft-buy-back')).toBeNull();

      // Fast-forward time
      jest.advanceTimersByTime(1000);

      // Only the last call should be saved
      const stored = localStorage.getItem('form-draft-buy-back');
      const parsed = JSON.parse(stored!) as StoredFormDraft;
      expect(parsed.data).toEqual(data3);
    });

    it('should respect custom delay', () => {
      const { debouncedSave } = createDebouncedSave(500);
      const formType = 'buy-back';
      const data = { entityName: 'Company' };

      debouncedSave(formType, data);

      // Not saved after 400ms
      jest.advanceTimersByTime(400);
      expect(localStorage.getItem('form-draft-buy-back')).toBeNull();

      // Saved after 500ms
      jest.advanceTimersByTime(100);
      expect(localStorage.getItem('form-draft-buy-back')).toBeTruthy();
    });

    it('should cancel pending save', () => {
      const { debouncedSave, cancel } = createDebouncedSave(1000);
      const formType = 'buy-back';
      const data = { entityName: 'Company' };

      debouncedSave(formType, data);
      cancel();

      jest.advanceTimersByTime(1000);

      // Should not be saved
      expect(localStorage.getItem('form-draft-buy-back')).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const { debouncedSave } = createDebouncedSave(1000);
      const formType = 'buy-back';
      const data = { test: 'data' };

      // Mock console.error to suppress error output
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock localStorage.setItem to throw error
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation((key: string) => {
        // Allow the test key for isLocalStorageAvailable check
        if (key === '__localStorage_test__') {
          return;
        }
        throw new Error('Storage error');
      });

      debouncedSave(formType, data);
      jest.advanceTimersByTime(1000);

      // Should log error but not throw
      expect(consoleErrorSpy).toHaveBeenCalled();

      mockSetItem.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should reset timeout on subsequent calls', () => {
      const { debouncedSave } = createDebouncedSave(1000);
      const formType = 'buy-back';
      const data1 = { entityName: 'Company 1' };
      const data2 = { entityName: 'Company 2' };

      debouncedSave(formType, data1);
      
      // Advance 800ms
      jest.advanceTimersByTime(800);
      
      // Make another call (should reset timer)
      debouncedSave(formType, data2);
      
      // Advance 800ms more (total 1600ms from first call, but only 800ms from second)
      jest.advanceTimersByTime(800);
      
      // Should not be saved yet
      expect(localStorage.getItem('form-draft-buy-back')).toBeNull();
      
      // Advance final 200ms
      jest.advanceTimersByTime(200);
      
      // Now should be saved with data2
      const stored = localStorage.getItem('form-draft-buy-back');
      const parsed = JSON.parse(stored!) as StoredFormDraft;
      expect(parsed.data).toEqual(data2);
    });
  });
});
