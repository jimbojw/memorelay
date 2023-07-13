"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Verify whether a filter object is valid.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFilters = exports.verifyFilter = void 0;
const filters_1 = require("./filters");
const verify_filter_id_array_field_1 = require("./verify-filter-id-array-field");
const verify_filter_integer_array_field_1 = require("./verify-filter-integer-array-field");
/**
 * Verify that the provided filter object is valid.
 * @param filter Possibly a valid filter object.
 */
function verifyFilter(filter) {
    if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
        throw new Error('filter must be an object');
    }
    for (const field in filter) {
        if (!(field in filters_1.FILTER_FIELDS_MAP)) {
            throw new Error('unexpected filter field');
        }
    }
    for (const field of filters_1.FILTER_ID_ARRAY_FIELDS) {
        if (!(field in filter)) {
            continue;
        }
        (0, verify_filter_id_array_field_1.verifyFilterIdArrayField)(field, filter[field]);
    }
    for (const field of filters_1.FILTER_INTEGER_ARRAY_FIELDS) {
        if (!(field in filter)) {
            continue;
        }
        (0, verify_filter_integer_array_field_1.verifyFilterIntegerArrayField)(field, filter[field]);
    }
    for (const field of filters_1.FILTER_INTEGER_FIELDS) {
        if (!(field in filter)) {
            continue;
        }
        const value = filter[field];
        if (!Number.isInteger(value)) {
            throw new Error(`${field} contains a non-integer value`);
        }
        const numericValue = value;
        if (numericValue < 0) {
            throw new Error(`${field} contains a negative value`);
        }
    }
}
exports.verifyFilter = verifyFilter;
/**
 * Verify that the provided array of filter objects are all valid.
 * @param filters Array of possibly valid filter objects.
 */
function verifyFilters(filters) {
    if (!Array.isArray(filters)) {
        throw new Error('filters value is not an array');
    }
    for (const filter of filters) {
        verifyFilter(filter);
    }
}
exports.verifyFilters = verifyFilters;
