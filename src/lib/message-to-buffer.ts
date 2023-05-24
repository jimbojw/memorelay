/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Serialize a Nostr message to send as a Buffer.
 */

import { ClientMessage, RelayMessage } from './message-types';

export function messageToBuffer(message: ClientMessage | RelayMessage): Buffer {
  return Buffer.from(JSON.stringify(message), 'utf8');
}
