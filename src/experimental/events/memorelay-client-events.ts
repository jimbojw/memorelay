/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Events emitted by MemorelayClient instances.
 */

import { ClientMessage } from '../../lib/message-types';
import { BasicEvent } from './basic-event';

/**
 * @see MemorelayClientMessageEvent
 */
export interface MemorelayClientMessageEventDetails {
  /**
   * The newly received Nostr ClientMessage.
   */
  readonly clientMessage: ClientMessage;
}

/**
 * Event emitted by a MemorelayClient when it has received a properly formed
 * Nostr client message.
 */
export class MemorelayClientMessageEvent extends BasicEvent<
  'memorelay-client-message',
  MemorelayClientMessageEventDetails
> {
  static readonly type = 'memorelay-client-message';
  constructor(details: MemorelayClientMessageEventDetails) {
    super('memorelay-client-message', details);
  }
}
