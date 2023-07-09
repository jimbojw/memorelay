/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error type for bad messages incoming from a client.
 */

import { ClientError } from '../../../core/errors/client-error';

export const BAD_MESSAGE_ERROR_TYPE = 'bad-message-error';

export class BadMessageError extends ClientError {
  static readonly type = BAD_MESSAGE_ERROR_TYPE;

  constructor(reason: string) {
    super(`bad msg: ${reason}`);
  }

  get type() {
    return BadMessageError.type;
  }
}
