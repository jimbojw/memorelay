"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the verifyFilters() function.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const verify_filters_1 = require("./verify-filters");
const filters_1 = require("./filters");
// An identifier that exceeds the 32-byte (64 char) expected length.
const LONG_ID = Array(65).fill('f').join('');
describe('verifyFilters', () => {
    it('should reject non-array arguments', () => {
        expect(() => {
            (0, verify_filters_1.verifyFilters)(undefined);
        }).toThrow('filters value is not an array');
    });
    it('should reject non-object parameters', () => {
        expect(() => {
            (0, verify_filters_1.verifyFilter)(undefined);
        }).toThrow('filter must be an object');
    });
    it('should accept an empty filters object', () => {
        expect(() => {
            (0, verify_filters_1.verifyFilter)({});
        }).not.toThrow();
    });
    it('should reject filters with unexpected fields', () => {
        expect(() => {
            (0, verify_filters_1.verifyFilter)({ foo: [] });
        }).toThrow('unexpected filter field');
        expect(() => {
            (0, verify_filters_1.verifyFilter)({ '': '' });
        }).toThrow('unexpected filter field');
    });
    [...filters_1.FILTER_ID_ARRAY_FIELDS, ...filters_1.FILTER_INTEGER_ARRAY_FIELDS].forEach((field) => {
        describe(field, () => {
            it('should reject non-array values', () => {
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: undefined });
                }).toThrow(`${field} value is not an array`);
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: 678 });
                }).toThrow(`${field} value is not an array`);
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: 'abcde' });
                }).toThrow(`${field} value is not an array`);
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: {} });
                }).toThrow(`${field} value is not an array`);
            });
            it('should accept an empty array', () => {
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: [] });
                }).not.toThrow();
            });
        });
    });
    filters_1.FILTER_ID_ARRAY_FIELDS.forEach((field) => {
        describe(field, () => {
            it('should accept an array of strings', () => {
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: ['1'] });
                }).not.toThrow();
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: ['1', '2', '3'] });
                }).not.toThrow();
            });
            it('should reject an array of non-strings', () => {
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: [1] });
                }).toThrow(`non-string value in ${field} array`);
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: [1, 2, 3] });
                }).toThrow(`non-string value in ${field} array`);
            });
            it('should reject values longer than 64 characters', () => {
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: [LONG_ID] });
                }).toThrow(`${field} element value too long`);
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: ['1', LONG_ID] });
                }).toThrow(`${field} element value too long`);
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: [LONG_ID, '2'] });
                }).toThrow(`${field} element value too long`);
            });
        });
    });
    filters_1.FILTER_INTEGER_ARRAY_FIELDS.forEach((field) => {
        describe(field, () => {
            it('should accept an array of integers', () => {
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: [1] });
                }).not.toThrow();
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: [1, 2, 3] });
                }).not.toThrow();
            });
            it('should reject an array containing non-integer numbers', () => {
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: [1.5] });
                }).toThrow(`${field} contains a non-integer value`);
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: [1, 2.5, 3] });
                }).toThrow(`${field} contains a non-integer value`);
            });
        });
    });
    filters_1.FILTER_INTEGER_FIELDS.forEach((field) => {
        describe(field, () => {
            it('should accept an integer', () => {
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: 12345 });
                }).not.toThrow();
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: 0 });
                }).not.toThrow();
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: -12345 });
                }).toThrow(`${field} contains a negative value`);
            });
            it('should reject a non-integer', () => {
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: 1.5 });
                }).toThrow(`${field} contains a non-integer value`);
                expect(() => {
                    (0, verify_filters_1.verifyFilter)({ [field]: -2.5 });
                }).toThrow(`${field} contains a non-integer value`);
            });
        });
    });
});
