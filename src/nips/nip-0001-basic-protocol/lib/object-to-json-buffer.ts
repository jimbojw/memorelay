/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Serialize an object as a Buffer containing JSON.
 */

/**
 * Utility function to turn an object into a buffer.
 */
export function objectToJsonBuffer(payloadJson: unknown) {
  return Buffer.from(JSON.stringify(payloadJson), 'utf-8');
}
