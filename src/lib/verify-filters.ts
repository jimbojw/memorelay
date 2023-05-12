/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Verify whether a filter object is valid.
 */

import {
  FILTER_FIELDS_MAP,
  FILTER_INTEGER_ARRAY_FIELDS,
  FILTER_INTEGER_FIELDS,
  FILTER_ID_ARRAY_FIELDS,
} from './filters';

import { Filter } from 'nostr-tools';

// Maximum length of a filter value when checking id-based fields.
const MAX_FILTER_LENGTH = 64;

/**
 * Verify that the values object is an array of strings.
 * @param field Name of the field being checked.
 * @param values Possibly an array of strings.
 * @param maxLength Maximum allowed length of a string value.
 */
export function verifyStringArrayField(
  field: string,
  values: unknown,
  maxLength = Infinity
) {
  if (!Array.isArray(values)) {
    throw new Error(`${field} value is not an array`);
  }

  for (const value of values) {
    if (typeof value !== 'string') {
      throw new Error(`non-string value in ${field} array`);
    }
    if (value.length > maxLength) {
      throw new Error(`${field} element value too long`);
    }
  }
}

/**
 * Verify that the values object is an array of numbers.
 * @param field Name of the field being checked.
 * @param values Possibly an array of numbers.
 */
export function verifyIntegerArrayField(field: string, values: unknown) {
  if (!Array.isArray(values)) {
    throw new Error(`${field} value is not an array`);
  }

  for (const value of values) {
    if (!Number.isInteger(value)) {
      throw new Error(`${field} contains a non-integer value`);
    }
  }
}

/**
 * Verify that the provided filter object is valid.
 * @param filter Possibly a valid filter object.
 */
export function verifyFilter(filter: unknown) {
  if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
    throw new Error('filter must be an object');
  }

  for (const field in filter) {
    if (!(field in FILTER_FIELDS_MAP)) {
      throw new Error('unexpected filter field');
    }
  }

  for (const field of FILTER_ID_ARRAY_FIELDS) {
    if (!(field in filter)) {
      continue;
    }
    verifyStringArrayField(
      field as string,
      (filter as Record<keyof Filter, unknown>)[field],
      MAX_FILTER_LENGTH
    );
  }

  for (const field of FILTER_INTEGER_ARRAY_FIELDS) {
    if (!(field in filter)) {
      continue;
    }
    verifyIntegerArrayField(
      field,
      (filter as Record<keyof Filter, unknown>)[field]
    );
  }

  for (const field of FILTER_INTEGER_FIELDS) {
    if (!(field in filter)) {
      continue;
    }
    const value = (filter as Record<keyof Filter, unknown>)[field];
    if (!Number.isInteger(value)) {
      throw new Error(`${field} contains a non-integer value`);
    }
  }
}

/**
 * Verify that the provided array of filter objects are all valid.
 * @param filters Array of possibly valid filter objects.
 */
export function verifyFilters(filters: unknown) {
  if (!Array.isArray(filters)) {
    throw new Error('filters value is not an array');
  }
  for (const filter of filters) {
    verifyFilter(filter);
  }
}
