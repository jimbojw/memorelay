/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Events emitted by MemorelayClient instances.
 */

import { ClientMessage } from '../../lib/message-types';
import { BasicEvent } from './basic-event';

export const INCOMING_MESSAGE_EVENT_TYPE = 'incoming-message';

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
  typeof INCOMING_MESSAGE_EVENT_TYPE,
  IncomingMessageEventDetails
> {
  static readonly type: typeof INCOMING_MESSAGE_EVENT_TYPE =
    INCOMING_MESSAGE_EVENT_TYPE;
  constructor(details: IncomingMessageEventDetails) {
    super(INCOMING_MESSAGE_EVENT_TYPE, details);
  }
}
