/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal an incoming CLOSE Nostr event.
 */

import { ClientCloseMessage } from '../../lib/message-types';
import {
  ClientEvent,
  ClientEventOptions,
} from '../../core/events/client-event';

export const INCOMING_CLOSE_MESSAGE_EVENT_TYPE = 'incoming-close-message';

/**
 * @see IncomingCloseMessageEvent
 */
export interface IncomingCloseMessageEventDetails {
  /**
   * The incoming Nostr Close message.
   */
  readonly closeMessage: ClientCloseMessage;
}

/**
 * Event emitted when a MemorelayClient has received a properly formed,
 * incoming, REQ Nostr message.
 */
export class IncomingCloseMessageEvent extends ClientEvent<
  typeof INCOMING_CLOSE_MESSAGE_EVENT_TYPE,
  IncomingCloseMessageEventDetails
> {
  static readonly type: typeof INCOMING_CLOSE_MESSAGE_EVENT_TYPE =
    INCOMING_CLOSE_MESSAGE_EVENT_TYPE;
  constructor(
    details: IncomingCloseMessageEventDetails,
    options?: ClientEventOptions
  ) {
    super(INCOMING_CLOSE_MESSAGE_EVENT_TYPE, details, options);
  }
}
