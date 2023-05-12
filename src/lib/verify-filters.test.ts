/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the verifyFilters() function.
 */

import { verifyFilter } from './verify-filters';
import {
  FILTER_INTEGER_ARRAY_FIELDS,
  FILTER_INTEGER_FIELDS,
  FILTER_ID_ARRAY_FIELDS,
} from './filters';

// An identifier that exceeds the 32-byte (64 char) expected length.
const LONG_ID = Array(65).fill('f').join('');

describe('verifyFilters', () => {
  it('should be a function', () => {
    expect(typeof verifyFilter).toBe('function');
  });

  it('should reject non-object parameters', () => {
    expect(() => {
      verifyFilter(undefined);
    }).toThrow('filter must be an object');
  });

  it('should accept an empty filters object', () => {
    expect(() => {
      verifyFilter({});
    }).not.toThrow();
  });

  it('should reject filters with unexpected fields', () => {
    expect(() => {
      verifyFilter({ foo: [] });
    }).toThrow('unexpected filter field');

    expect(() => {
      verifyFilter({ '': '' });
    }).toThrow('unexpected filter field');
  });

  [...FILTER_ID_ARRAY_FIELDS, ...FILTER_INTEGER_ARRAY_FIELDS].forEach(
    (field) => {
      describe(field, () => {
        it('should reject non-array values', () => {
          expect(() => {
            verifyFilter({ [field]: undefined });
          }).toThrow(`${field} value is not an array`);

          expect(() => {
            verifyFilter({ [field]: 678 });
          }).toThrow(`${field} value is not an array`);

          expect(() => {
            verifyFilter({ [field]: 'abcde' });
          }).toThrow(`${field} value is not an array`);

          expect(() => {
            verifyFilter({ [field]: {} });
          }).toThrow(`${field} value is not an array`);
        });

        it('should accept an empty array', () => {
          expect(() => {
            verifyFilter({ [field]: [] });
          }).not.toThrow();
        });
      });
    }
  );

  FILTER_ID_ARRAY_FIELDS.forEach((field) => {
    describe(field, () => {
      it('should accept an array of strings', () => {
        expect(() => {
          verifyFilter({ [field]: ['1'] });
        }).not.toThrow();

        expect(() => {
          verifyFilter({ [field]: ['1', '2', '3'] });
        }).not.toThrow();
      });

      it('should reject values longer than 64 characters', () => {
        expect(() => {
          verifyFilter({ [field]: [LONG_ID] });
        }).toThrow(`${field} element value too long`);

        expect(() => {
          verifyFilter({ [field]: ['1', LONG_ID] });
        }).toThrow(`${field} element value too long`);

        expect(() => {
          verifyFilter({ [field]: [LONG_ID, '2'] });
        }).toThrow(`${field} element value too long`);
      });
    });
  });

  FILTER_INTEGER_ARRAY_FIELDS.forEach((field) => {
    describe(field, () => {
      it('should accept an array of integers', () => {
        expect(() => {
          verifyFilter({ [field]: [1] });
        }).not.toThrow();

        expect(() => {
          verifyFilter({ [field]: [1, 2, 3] });
        }).not.toThrow();
      });

      it('should reject an array containing non-integer numbers', () => {
        expect(() => {
          verifyFilter({ [field]: [1.5] });
        }).toThrow(`${field} contains a non-integer value`);

        expect(() => {
          verifyFilter({ [field]: [1, 2.5, 3] });
        }).toThrow(`${field} contains a non-integer value`);
      });
    });
  });

  FILTER_INTEGER_FIELDS.forEach((field) => {
    describe(field, () => {
      it('should accept an integer', () => {
        expect(() => {
          verifyFilter({ [field]: 12345 });
        }).not.toThrow();

        expect(() => {
          verifyFilter({ [field]: 0 });
        }).not.toThrow();

        expect(() => {
          verifyFilter({ [field]: -12345 });
        }).not.toThrow();
      });

      it('should reject a non-integer', () => {
        expect(() => {
          verifyFilter({ [field]: 1.5 });
        }).toThrow(`${field} contains a non-integer value`);

        expect(() => {
          verifyFilter({ [field]: -2.5 });
        }).toThrow(`${field} contains a non-integer value`);
      });
    });
  });
});
