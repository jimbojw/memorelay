/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal an incoming CLOSE Nostr event.
 */

import { ClientCloseMessage } from '../../lib/message-types';
import { BasicEvent } from './basic-event';

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
export class IncomingCloseMessageEvent extends BasicEvent<
  typeof INCOMING_CLOSE_MESSAGE_EVENT_TYPE,
  IncomingCloseMessageEventDetails
> {
  static readonly type: typeof INCOMING_CLOSE_MESSAGE_EVENT_TYPE =
    INCOMING_CLOSE_MESSAGE_EVENT_TYPE;
  constructor(details: IncomingCloseMessageEventDetails) {
    super(INCOMING_CLOSE_MESSAGE_EVENT_TYPE, details);
  }
}
