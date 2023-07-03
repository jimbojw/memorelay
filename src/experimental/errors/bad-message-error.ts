/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error type for bad messages.
 */

export const BAD_MESSAGE_ERROR_TYPE = 'bad-message-error';

export class BadMessageError extends Error {
  static readonly type: typeof BAD_MESSAGE_ERROR_TYPE = BAD_MESSAGE_ERROR_TYPE;

  constructor(private readonly reason: string) {
    super(`bad msg: ${reason}`);
  }

  get type() {
    return BadMessageError.type;
  }
}
