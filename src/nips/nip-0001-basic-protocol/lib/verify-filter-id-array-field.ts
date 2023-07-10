/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview For a filter field which should contain an array of ids, verify
 * that it is valid.
 */

/**
 * Maximum length of a filter value when checking id-based fields.
 */
const MAX_ID_LENGTH = 64;

/**
 * Verify that the values object is an array of ID strings.
 * @param field Name of the field being checked.
 * @param values Possibly an array of strings.
 */
export function verifyFilterIdArrayField(field: string, values: unknown) {
  if (!Array.isArray(values)) {
    throw new Error(`${field} value is not an array`);
  }

  for (const value of values) {
    if (typeof value !== 'string') {
      throw new Error(`non-string value in ${field} array`);
    }
    if (value.length > MAX_ID_LENGTH) {
      throw new Error(`${field} element value too long`);
    }
  }
}
