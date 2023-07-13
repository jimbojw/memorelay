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
import { verifyFilterIdArrayField } from './verify-filter-id-array-field';
import { verifyFilterIntegerArrayField } from './verify-filter-integer-array-field';

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
    verifyFilterIdArrayField(
      field as string,
      (filter as Record<keyof Filter, unknown>)[field]
    );
  }

  for (const field of FILTER_INTEGER_ARRAY_FIELDS) {
    if (!(field in filter)) {
      continue;
    }
    verifyFilterIntegerArrayField(
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
    const numericValue = value as number;
    if (numericValue < 0) {
      throw new Error(`${field} contains a negative value`);
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
