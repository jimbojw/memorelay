/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Types and constants related to the REQ message filters object.
 */

import { Filter } from 'nostr-tools';

/**
 * Allowed fields on a filters object whose values are arrays of ID strings.
 * These are strings of hexidecmal characters up to 64 characters in length.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export const FILTER_ID_ARRAY_FIELDS: (keyof Filter)[] = [
  'ids',
  'authors',
  '#e',
  '#p',
];

export const FILTER_ID_ARRAY_FIELDS_MAP = FILTER_ID_ARRAY_FIELDS.reduce<
  Partial<Record<keyof Filter, never>>
>((map, key) => ({ ...map, [key]: key }), {});

/**
 * Allowed fields on a filter objects whose values are arrays of arbitrary
 * strings.
 * @see https://github.com/nostr-protocol/nips/blob/master/50.md
 */
export const FILTER_STRING_ARRAY_FIELDS: (keyof Filter)[] = ['search'];

export const FILTER_STRING_ARRAY_FIELDS_MAP = FILTER_ID_ARRAY_FIELDS.reduce<
  Partial<Record<keyof Filter, never>>
>((map, key) => ({ ...map, [key]: key }), {});

/**
 * Allowed fields on a filters object whose values are arrays of integers.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export const FILTER_INTEGER_ARRAY_FIELDS: (keyof Filter)[] = ['kinds'];

export const FILTER_INTEGER_ARRAY_FIELDS_MAP =
  FILTER_INTEGER_ARRAY_FIELDS.reduce<Partial<Record<keyof Filter, never>>>(
    (map, key) => ({ ...map, [key]: key }),
    {}
  );

/**
 * Allowed fields on a filters object whose values are integers.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export const FILTER_INTEGER_FIELDS: (keyof Filter)[] = [
  'since',
  'until',
  'limit',
];

export const FILTER_INTEGER_FIELDS_MAP = FILTER_INTEGER_FIELDS.reduce<
  Partial<Record<keyof Filter, never>>
>((map, key) => ({ ...map, [key]: key }), {});

/**
 * Allowed keys on a filters object.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export const FILTER_FIELDS: (keyof Filter)[] = [
  ...FILTER_ID_ARRAY_FIELDS,
  ...FILTER_INTEGER_ARRAY_FIELDS,
  ...FILTER_INTEGER_FIELDS,
  ...FILTER_STRING_ARRAY_FIELDS,
];

export const FILTER_FIELDS_MAP = FILTER_FIELDS.reduce<
  Partial<Record<keyof Filter, never>>
>((map, key) => ({ ...map, [key]: key }), {});
