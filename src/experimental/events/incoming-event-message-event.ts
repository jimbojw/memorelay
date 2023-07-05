/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal an incoming generic Nostr event.
 */

import { ClientEventMessage } from '../../lib/message-types';
import { ClientEvent } from './client-event';

export const INCOMING_EVENT_MESSAGE_EVENT_TYPE = 'incoming-event-message';

/**
 * @see IncomingEventMessageEvent
 */
export interface IncomingEventMessageEventDetails {
  /**
   * The incoming Nostr EVENT message.
   */
  readonly clientEventMessage: ClientEventMessage;
}

/**
 * Event emitted when a MemorelayClient has received a properly formed,
 * incoming, EVENT Nostr message.
 */
export class IncomingEventMessageEvent extends ClientEvent<
  typeof INCOMING_EVENT_MESSAGE_EVENT_TYPE,
  IncomingEventMessageEventDetails
> {
  static readonly type: typeof INCOMING_EVENT_MESSAGE_EVENT_TYPE =
    INCOMING_EVENT_MESSAGE_EVENT_TYPE;
  constructor(details: IncomingEventMessageEventDetails) {
    super(INCOMING_EVENT_MESSAGE_EVENT_TYPE, details);
  }
}
