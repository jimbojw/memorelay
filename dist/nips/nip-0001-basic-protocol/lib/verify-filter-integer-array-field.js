"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview For a filter field that is supposed to contain an array of
 * integers, verify that it is valid.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFilterIntegerArrayField = void 0;
/**
 * Verify that the values object is an array of numbers.
 * @param field Name of the field being checked.
 * @param values Possibly an array of numbers.
 */
function verifyFilterIntegerArrayField(field, values) {
    if (!Array.isArray(values)) {
        throw new Error(`${field} value is not an array`);
    }
    for (const value of values) {
        if (!Number.isInteger(value)) {
            throw new Error(`${field} contains a non-integer value`);
        }
    }
}
exports.verifyFilterIntegerArrayField = verifyFilterIntegerArrayField;
