/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Union type of errors emitted at the client level.
 */

import { BadMessageError } from './bad-message-error';

export type ClientError = BadMessageError;
