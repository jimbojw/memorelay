/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error type for bad messages incoming from a client.
 */

export class BadMessageError extends Error {
  constructor(reason: string) {
    super(`bad msg: ${reason}`);
  }
}
