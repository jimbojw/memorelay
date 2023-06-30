/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Events emitted by MemorelayClient instances.
 */

import { ClientMessage } from '../../lib/message-types';
import { BasicEvent } from './basic-event';

/**
 * @see IncomingMessageEvent
 */
export interface IncomingMessageEventDetails {
  /**
   * The incoming Nostr ClientMessage.
   */
  readonly incomingMessage: ClientMessage;
}

/**
 * Event emitted by a MemorelayClient when it has received a properly formed,
 * incoming, Nostr client message. Generally this will be in response to a
 * previously received WebSocket 'message' event.
 */
export class IncomingMessageEvent extends BasicEvent<
  'incoming-message',
  IncomingMessageEventDetails
> {
  static readonly type = 'incoming-message';
  constructor(details: IncomingMessageEventDetails) {
    super('incoming-message', details);
  }
}
