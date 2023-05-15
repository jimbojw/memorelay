/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Verify whether a filter object is valid.
 */
/**
 * Verify that the values object is an array of strings.
 * @param field Name of the field being checked.
 * @param values Possibly an array of strings.
 * @param maxLength Maximum allowed length of a string value.
 */
export declare function verifyStringArrayField(field: string, values: unknown, maxLength?: number): void;
/**
 * Verify that the values object is an array of numbers.
 * @param field Name of the field being checked.
 * @param values Possibly an array of numbers.
 */
export declare function verifyIntegerArrayField(field: string, values: unknown): void;
/**
 * Verify that the provided filter object is valid.
 * @param filter Possibly a valid filter object.
 */
export declare function verifyFilter(filter: unknown): void;
/**
 * Verify that the provided array of filter objects are all valid.
 * @param filters Array of possibly valid filter objects.
 */
export declare function verifyFilters(filters: unknown): void;
