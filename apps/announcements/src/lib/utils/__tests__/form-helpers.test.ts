/**
 * Unit tests for form helper utilities
 */

import {
  generateUUID,
  formatDateToISO,
  formatDateToDisplay,
  formatDateToShort,
  parseISODate,
  createFormSubmission,
  transformDatesForSubmission,
  transformDatesFromStorage,
  removeEmptyFields,
  deepClone,
  deepEqual,
} from '../form-helpers';

describe('generateUUID', () => {
  it('should generate a valid UUID v4 format', () => {
    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuid).toMatch(uuidRegex);
  });

  it('should generate unique UUIDs', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });

  it('should generate UUIDs of correct length', () => {
    const uuid = generateUUID();
    expect(uuid).toHaveLength(36);
  });
});

describe('formatDateToISO', () => {
  it('should format date to ISO 8601 string', () => {
    const date = new Date('2025-10-20T14:30:00.000Z');
    const formatted = formatDateToISO(date);
    expect(formatted).toBe('2025-10-20T14:30:00.000Z');
  });

  it('should handle dates with milliseconds', () => {
    const date = new Date('2025-10-20T14:30:00.123Z');
    const formatted = formatDateToISO(date);
    expect(formatted).toBe('2025-10-20T14:30:00.123Z');
  });
});

describe('formatDateToDisplay', () => {
  it('should format date to human-readable string', () => {
    const date = new Date('2025-10-20T00:00:00.000Z');
    const formatted = formatDateToDisplay(date, 'en-AU');
    expect(formatted).toContain('October');
    expect(formatted).toContain('2025');
  });

  it('should use default locale when not specified', () => {
    const date = new Date('2025-10-20T00:00:00.000Z');
    const formatted = formatDateToDisplay(date);
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });
});

describe('formatDateToShort', () => {
  it('should format date to short string', () => {
    const date = new Date('2025-10-20T00:00:00.000Z');
    const formatted = formatDateToShort(date, 'en-AU');
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('should use default locale when not specified', () => {
    const date = new Date('2025-10-20T00:00:00.000Z');
    const formatted = formatDateToShort(date);
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });
});

describe('parseISODate', () => {
  it('should parse valid ISO date string', () => {
    const isoString = '2025-10-20T14:30:00.000Z';
    const date = parseISODate(isoString);
    expect(date).toBeInstanceOf(Date);
    expect(date?.toISOString()).toBe(isoString);
  });

  it('should return null for invalid date string', () => {
    const invalidString = 'not-a-date';
    const date = parseISODate(invalidString);
    expect(date).toBeNull();
  });

  it('should return null for empty string', () => {
    const date = parseISODate('');
    expect(date).toBeNull();
  });

  it('should handle various ISO formats', () => {
    const formats = [
      '2025-10-20',
      '2025-10-20T14:30:00',
      '2025-10-20T14:30:00.000Z',
      '2025-10-20T14:30:00+10:00',
    ];

    formats.forEach(format => {
      const date = parseISODate(format);
      expect(date).toBeInstanceOf(Date);
    });
  });
});

describe('createFormSubmission', () => {
  it('should create form submission with required fields', () => {
    const formData = { entityName: 'Test Entity', abnArsn: '12345678901' };
    const submission = createFormSubmission('buy-back', '1.0.0', formData);

    expect(submission).toHaveProperty('submissionId');
    expect(submission.formType).toBe('buy-back');
    expect(submission.formVersion).toBe('1.0.0');
    expect(submission.submittedAt).toBeTruthy();
    expect(submission.data).toEqual(formData);
    expect(submission.versionNumber).toBe(1);
  });

  it('should generate unique submission IDs', () => {
    const formData = { test: 'data' };
    const submission1 = createFormSubmission('test', '1.0.0', formData);
    const submission2 = createFormSubmission('test', '1.0.0', formData);

    expect(submission1.submissionId).not.toBe(submission2.submissionId);
  });

  it('should include optional version tracking fields', () => {
    const formData = { test: 'data' };
    const delta = {
      added: { newField: 'value' },
      modified: {},
      removed: {},
    };

    const submission = createFormSubmission('test', '1.0.0', formData, {
      previousVersion: 'prev-uuid',
      versionNumber: 2,
      delta,
    });

    expect(submission.previousVersion).toBe('prev-uuid');
    expect(submission.versionNumber).toBe(2);
    expect(submission.delta).toEqual(delta);
  });

  it('should default version number to 1 when not provided', () => {
    const formData = { test: 'data' };
    const submission = createFormSubmission('test', '1.0.0', formData);

    expect(submission.versionNumber).toBe(1);
  });

  it('should format submittedAt as ISO string', () => {
    const formData = { test: 'data' };
    const submission = createFormSubmission('test', '1.0.0', formData);

    expect(submission.submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe('transformDatesForSubmission', () => {
  it('should convert Date objects to ISO strings', () => {
    const date = new Date('2025-10-20T14:30:00.000Z');
    const data = { signatureDate: date };
    const transformed = transformDatesForSubmission(data);

    expect(transformed.signatureDate).toBe('2025-10-20T14:30:00.000Z');
  });

  it('should handle nested objects with dates', () => {
    const date = new Date('2025-10-20T14:30:00.000Z');
    const data = {
      compliance: {
        signatureDate: date,
        signatoryName: 'John Doe',
      },
    };
    const transformed = transformDatesForSubmission(data);

    expect(transformed.compliance.signatureDate).toBe('2025-10-20T14:30:00.000Z');
    expect(transformed.compliance.signatoryName).toBe('John Doe');
  });

  it('should handle arrays with dates', () => {
    const date1 = new Date('2025-10-20T14:30:00.000Z');
    const date2 = new Date('2025-10-21T14:30:00.000Z');
    const data = { dates: [date1, date2] };
    const transformed = transformDatesForSubmission(data);

    expect(transformed.dates).toEqual([
      '2025-10-20T14:30:00.000Z',
      '2025-10-21T14:30:00.000Z',
    ]);
  });

  it('should preserve non-date values', () => {
    const data = {
      string: 'test',
      number: 42,
      boolean: true,
      null: null,
      undefined: undefined,
    };
    const transformed = transformDatesForSubmission(data);

    expect(transformed).toEqual(data);
  });

  it('should handle null and undefined', () => {
    expect(transformDatesForSubmission(null)).toBeNull();
    expect(transformDatesForSubmission(undefined)).toBeUndefined();
  });
});

describe('transformDatesFromStorage', () => {
  it('should convert ISO strings to Date objects for specified fields', () => {
    const data = {
      compliance: {
        signatureDate: '2025-10-20T14:30:00.000Z',
        signatoryName: 'John Doe',
      },
    };
    const transformed = transformDatesFromStorage(data, ['compliance.signatureDate']);

    expect(transformed.compliance.signatureDate).toBeInstanceOf(Date);
    expect(transformed.compliance.signatoryName).toBe('John Doe');
  });

  it('should handle multiple date fields', () => {
    const data = {
      recordDate: '2025-10-20T14:30:00.000Z',
      compliance: {
        signatureDate: '2025-10-21T14:30:00.000Z',
      },
    };
    const transformed = transformDatesFromStorage(data, ['recordDate', 'signatureDate']);

    expect(transformed.recordDate).toBeInstanceOf(Date);
    expect(transformed.compliance.signatureDate).toBeInstanceOf(Date);
  });

  it('should preserve non-date string values', () => {
    const data = {
      name: 'Test Entity',
      date: '2025-10-20T14:30:00.000Z',
    };
    const transformed = transformDatesFromStorage(data, ['date']);

    expect(transformed.name).toBe('Test Entity');
    expect(transformed.date).toBeInstanceOf(Date);
  });

  it('should handle invalid date strings gracefully', () => {
    const data = {
      date: 'not-a-date',
    };
    const transformed = transformDatesFromStorage(data, ['date']);

    expect(transformed.date).toBe('not-a-date');
  });

  it('should handle null and undefined', () => {
    expect(transformDatesFromStorage(null, [])).toBeNull();
    expect(transformDatesFromStorage(undefined, [])).toBeUndefined();
  });
});

describe('removeEmptyFields', () => {
  it('should remove undefined fields', () => {
    const obj = {
      name: 'Test',
      value: undefined,
      count: 42,
    };
    const cleaned = removeEmptyFields(obj);

    expect(cleaned).toEqual({ name: 'Test', count: 42 });
    expect(cleaned).not.toHaveProperty('value');
  });

  it('should preserve null fields by default', () => {
    const obj = {
      name: 'Test',
      value: null,
    };
    const cleaned = removeEmptyFields(obj);

    expect(cleaned).toEqual({ name: 'Test', value: null });
  });

  it('should remove null fields when requested', () => {
    const obj = {
      name: 'Test',
      value: null,
    };
    const cleaned = removeEmptyFields(obj, true);

    expect(cleaned).toEqual({ name: 'Test' });
    expect(cleaned).not.toHaveProperty('value');
  });

  it('should handle nested objects', () => {
    const obj = {
      name: 'Test',
      nested: {
        value: undefined,
        count: 42,
      },
    };
    const cleaned = removeEmptyFields(obj);

    expect(cleaned).toEqual({
      name: 'Test',
      nested: { count: 42 },
    });
  });

  it('should remove empty nested objects', () => {
    const obj = {
      name: 'Test',
      nested: {
        value: undefined,
      },
    };
    const cleaned = removeEmptyFields(obj);

    expect(cleaned).toEqual({ name: 'Test' });
    expect(cleaned).not.toHaveProperty('nested');
  });

  it('should preserve Date objects', () => {
    const date = new Date('2025-10-20T14:30:00.000Z');
    const obj = {
      name: 'Test',
      date,
    };
    const cleaned = removeEmptyFields(obj);

    expect(cleaned.date).toBe(date);
  });

  it('should preserve arrays', () => {
    const obj = {
      name: 'Test',
      items: [1, 2, 3],
    };
    const cleaned = removeEmptyFields(obj);

    expect(cleaned.items).toEqual([1, 2, 3]);
  });
});

describe('deepClone', () => {
  it('should clone primitive values', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('test')).toBe('test');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBeNull();
  });

  it('should clone Date objects', () => {
    const date = new Date('2025-10-20T14:30:00.000Z');
    const cloned = deepClone(date);

    expect(cloned).toBeInstanceOf(Date);
    expect(cloned.getTime()).toBe(date.getTime());
    expect(cloned).not.toBe(date);
  });

  it('should clone arrays', () => {
    const arr = [1, 2, 3];
    const cloned = deepClone(arr);

    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
  });

  it('should clone nested objects', () => {
    const obj = {
      name: 'Test',
      nested: {
        value: 42,
      },
    };
    const cloned = deepClone(obj);

    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.nested).not.toBe(obj.nested);
  });

  it('should clone complex nested structures', () => {
    const date = new Date('2025-10-20T14:30:00.000Z');
    const obj = {
      name: 'Test',
      items: [1, 2, { nested: 'value' }],
      date,
      nested: {
        deep: {
          value: 42,
        },
      },
    };
    const cloned = deepClone(obj);

    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.items).not.toBe(obj.items);
    expect(cloned.date).not.toBe(obj.date);
    expect(cloned.nested).not.toBe(obj.nested);
  });

  it('should create independent copies', () => {
    const obj = { value: 42 };
    const cloned = deepClone(obj);

    cloned.value = 100;

    expect(obj.value).toBe(42);
    expect(cloned.value).toBe(100);
  });
});

describe('deepEqual', () => {
  it('should return true for equal primitive values', () => {
    expect(deepEqual(42, 42)).toBe(true);
    expect(deepEqual('test', 'test')).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
  });

  it('should return false for different primitive values', () => {
    expect(deepEqual(42, 43)).toBe(false);
    expect(deepEqual('test', 'other')).toBe(false);
    expect(deepEqual(true, false)).toBe(false);
  });

  it('should compare Date objects', () => {
    const date1 = new Date('2025-10-20T14:30:00.000Z');
    const date2 = new Date('2025-10-20T14:30:00.000Z');
    const date3 = new Date('2025-10-21T14:30:00.000Z');

    expect(deepEqual(date1, date2)).toBe(true);
    expect(deepEqual(date1, date3)).toBe(false);
  });

  it('should compare arrays', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it('should compare nested objects', () => {
    const obj1 = { name: 'Test', nested: { value: 42 } };
    const obj2 = { name: 'Test', nested: { value: 42 } };
    const obj3 = { name: 'Test', nested: { value: 43 } };

    expect(deepEqual(obj1, obj2)).toBe(true);
    expect(deepEqual(obj1, obj3)).toBe(false);
  });

  it('should compare objects with different keys', () => {
    const obj1 = { name: 'Test', value: 42 };
    const obj2 = { name: 'Test' };

    expect(deepEqual(obj1, obj2)).toBe(false);
  });

  it('should handle null and undefined', () => {
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual({}, null)).toBe(false);
  });

  it('should compare complex nested structures', () => {
    const date = new Date('2025-10-20T14:30:00.000Z');
    const obj1 = {
      name: 'Test',
      items: [1, 2, { nested: 'value' }],
      date,
      nested: {
        deep: {
          value: 42,
        },
      },
    };
    const obj2 = deepClone(obj1);

    expect(deepEqual(obj1, obj2)).toBe(true);

    obj2.nested.deep.value = 43;
    expect(deepEqual(obj1, obj2)).toBe(false);
  });
});
