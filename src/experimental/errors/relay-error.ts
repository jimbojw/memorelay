/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Union type of errors emitted at the relay level.
 */

import { DuplicateWebSocketError } from './duplicate-web-socket-error';

export type RelayError = DuplicateWebSocketError;
