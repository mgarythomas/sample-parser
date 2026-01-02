/**
 * Unit tests for version tracking system
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  calculateDelta,
  createVersion,
  getVersionHistory,
  getVersion,
  getLatestVersion,
  clearVersionHistory,
  compareVersions,
  type FormVersion as _FormVersion,
  type FormVersionHistory as _FormVersionHistory,
} from '../version-tracker';

describe('version-tracker', () => {
  // Mock localStorage
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Reset localStorage before each test
    localStorageMock = {};

    global.localStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        localStorageMock = {};
      },
      get length() {
        return Object.keys(localStorageMock).length;
      },
      key: (index: number) => {
        const keys = Object.keys(localStorageMock);
        return keys[index] || null;
      },
    } as Storage;
  });

  afterEach(() => {
    // Clear localStorage after each test
    localStorageMock = {};
  });

  describe('calculateDelta', () => {
    it('should identify added fields', () => {
      const previous = { name: 'John' };
      const current = { name: 'John', age: 30 };

      const delta = calculateDelta(previous, current);

      expect(delta.added).toEqual({ age: 30 });
      expect(delta.modified).toEqual({});
      expect(delta.removed).toEqual({});
    });

    it('should identify modified fields', () => {
      const previous = { name: 'John', age: 30 };
      const current = { name: 'Jane', age: 30 };

      const delta = calculateDelta(previous, current);

      expect(delta.added).toEqual({});
      expect(delta.modified).toEqual({
        name: { old: 'John', new: 'Jane' },
      });
      expect(delta.removed).toEqual({});
    });

    it('should identify removed fields', () => {
      const previous = { name: 'John', age: 30 };
      const current = { name: 'John' };

      const delta = calculateDelta(previous, current);

      expect(delta.added).toEqual({});
      expect(delta.modified).toEqual({});
      expect(delta.removed).toEqual({ age: 30 });
    });

    it('should handle multiple changes at once', () => {
      const previous = {
        name: 'John',
        age: 30,
        city: 'New York',
      };
      const current = {
        name: 'Jane',
        age: 30,
        country: 'USA',
      };

      const delta = calculateDelta(previous, current);

      expect(delta.added).toEqual({ country: 'USA' });
      expect(delta.modified).toEqual({
        name: { old: 'John', new: 'Jane' },
      });
      expect(delta.removed).toEqual({ city: 'New York' });
    });

    it('should handle nested objects', () => {
      const previous = {
        user: { name: 'John', age: 30 },
      };
      const current = {
        user: { name: 'John', age: 31 },
      };

      const delta = calculateDelta(previous, current);

      expect(delta.modified).toEqual({
        user: {
          old: { name: 'John', age: 30 },
          new: { name: 'John', age: 31 },
        },
      });
    });

    it('should handle arrays', () => {
      const previous = { tags: ['a', 'b'] };
      const current = { tags: ['a', 'b', 'c'] };

      const delta = calculateDelta(previous, current);

      expect(delta.modified).toEqual({
        tags: {
          old: ['a', 'b'],
          new: ['a', 'b', 'c'],
        },
      });
    });

    it('should return empty delta for identical objects', () => {
      const previous = { name: 'John', age: 30 };
      const current = { name: 'John', age: 30 };

      const delta = calculateDelta(previous, current);

      expect(delta.added).toEqual({});
      expect(delta.modified).toEqual({});
      expect(delta.removed).toEqual({});
    });
  });

  describe('createVersion', () => {
    it('should create version 1 for new form', () => {
      const formType = 'buy-back';
      const formId = 'form-create-v1';
      const data = { name: 'Test Company', abn: '12345678901' };

      const version = createVersion(formType, formId, data);

      expect(version.versionNumber).toBe(1);
      expect(version.data).toEqual(data);
      expect(version.delta).toBeUndefined();
      expect(version.previousVersionId).toBeUndefined();
      expect(version.versionId).toBeDefined();
      expect(version.timestamp).toBeDefined();
    });

    it('should increment version number', () => {
      const formType = 'buy-back';
      const formId = 'form-increment';
      const data1 = { name: 'Test Company' };
      const data2 = { name: 'Test Company', abn: '12345678901' };

      const version1 = createVersion(formType, formId, data1);
      const version2 = createVersion(formType, formId, data2);

      expect(version1.versionNumber).toBe(1);
      expect(version2.versionNumber).toBe(2);
    });

    it('should calculate delta for subsequent versions', () => {
      const formType = 'buy-back';
      const formId = 'form-delta';
      const data1 = { name: 'Test Company' };
      const data2 = { name: 'Test Company', abn: '12345678901' };

      createVersion(formType, formId, data1);
      const version2 = createVersion(formType, formId, data2);

      expect(version2.delta).toBeDefined();
      expect(version2.delta?.added).toEqual({ abn: '12345678901' });
      expect(version2.previousVersionId).toBeDefined();
    });

    it('should include userId when provided', () => {
      const formType = 'buy-back';
      const formId = 'form-userid';
      const data = { name: 'Test Company' };
      const userId = 'user-456';

      const version = createVersion(formType, formId, data, userId);

      expect(version.userId).toBe(userId);
    });

    it('should store version in history', () => {
      const formType = 'buy-back';
      const formId = 'form-store';
      const data = { name: 'Test Company' };

      createVersion(formType, formId, data);

      const history = getVersionHistory(formType, formId);
      expect(history.versions).toHaveLength(1);
      expect(history.currentVersion).toBe(1);
    });
  });

  describe('getVersionHistory', () => {
    it('should return empty history for new form', () => {
      const history = getVersionHistory('buy-back', 'form-empty');

      expect(history.formType).toBe('buy-back');
      expect(history.currentVersion).toBe(0);
      expect(history.versions).toEqual([]);
    });

    it('should return existing history', () => {
      const formType = 'buy-back';
      const formId = 'form-existing';
      const data1 = { name: 'Test Company' };
      const data2 = { name: 'Test Company', abn: '12345678901' };

      createVersion(formType, formId, data1);
      createVersion(formType, formId, data2);

      const history = getVersionHistory(formType, formId);

      expect(history.versions).toHaveLength(2);
      expect(history.currentVersion).toBe(2);
    });

    it('should handle corrupted data gracefully', () => {
      const key = 'form-version-history-buy-back-form-corrupted';
      localStorageMock[key] = 'invalid json';

      const history = getVersionHistory('buy-back', 'form-corrupted');

      expect(history.currentVersion).toBe(0);
      expect(history.versions).toEqual([]);
    });
  });

  describe('getVersion', () => {
    it('should retrieve specific version by number', () => {
      const formType = 'buy-back';
      const formId = 'form-getversion';
      const data1 = { name: 'Test Company' };
      const data2 = { name: 'Test Company', abn: '12345678901' };

      createVersion(formType, formId, data1);
      createVersion(formType, formId, data2);

      const version1 = getVersion(formType, formId, 1);
      const version2 = getVersion(formType, formId, 2);

      expect(version1?.data).toEqual(data1);
      expect(version2?.data).toEqual(data2);
    });

    it('should return undefined for non-existent version', () => {
      const version = getVersion('buy-back', 'form-nonexistent', 99);

      expect(version).toBeUndefined();
    });
  });

  describe('getLatestVersion', () => {
    it('should return undefined for form with no versions', () => {
      const latest = getLatestVersion('buy-back', 'form-noversions');

      expect(latest).toBeUndefined();
    });

    it('should return the most recent version', () => {
      const formType = 'buy-back';
      const formId = 'form-latest';
      const data1 = { name: 'Test Company' };
      const data2 = { name: 'Test Company', abn: '12345678901' };
      const data3 = { name: 'Updated Company', abn: '12345678901' };

      createVersion(formType, formId, data1);
      createVersion(formType, formId, data2);
      createVersion(formType, formId, data3);

      const latest = getLatestVersion(formType, formId);

      expect(latest?.versionNumber).toBe(3);
      expect(latest?.data).toEqual(data3);
    });
  });

  describe('clearVersionHistory', () => {
    it('should remove all versions for a form', () => {
      const formType = 'buy-back';
      const formId = 'form-clear';
      const data = { name: 'Test Company' };

      createVersion(formType, formId, data);

      let history = getVersionHistory(formType, formId);
      expect(history.versions).toHaveLength(1);

      clearVersionHistory(formType, formId);

      history = getVersionHistory(formType, formId);
      expect(history.versions).toHaveLength(0);
      expect(history.currentVersion).toBe(0);
    });
  });

  describe('compareVersions', () => {
    it('should return delta between two versions', () => {
      const formType = 'buy-back';
      const formId = 'form-compare';
      const data1 = { name: 'Test Company' };
      const data2 = { name: 'Test Company', abn: '12345678901' };
      const data3 = { name: 'Updated Company', abn: '12345678901' };

      createVersion(formType, formId, data1);
      createVersion(formType, formId, data2);
      createVersion(formType, formId, data3);

      const delta = compareVersions(formType, formId, 1, 3);

      expect(delta?.added).toEqual({ abn: '12345678901' });
      expect(delta?.modified).toEqual({
        name: { old: 'Test Company', new: 'Updated Company' },
      });
    });

    it('should return undefined if versions do not exist', () => {
      const delta = compareVersions('buy-back', 'form-notexist', 1, 2);

      expect(delta).toBeUndefined();
    });
  });
});
