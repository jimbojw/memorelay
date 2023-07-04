/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal an incoming generic Nostr event.
 */

import { ClientReqMessage } from '../../lib/message-types';
import { BasicEvent } from './basic-event';

export const INCOMING_REQ_MESSAGE_EVENT_TYPE = 'incoming-req-message';

/**
 * @see IncomingReqMessageEvent
 */
export interface IncomingReqMessageEventDetails {
  /**
   * The incoming Nostr REQ message.
   */
  readonly reqMessage: ClientReqMessage;
}

/**
 * Event emitted when a MemorelayClient has received a properly formed,
 * incoming, REQ Nostr message.
 */
export class IncomingReqMessageEvent extends BasicEvent<
  typeof INCOMING_REQ_MESSAGE_EVENT_TYPE,
  IncomingReqMessageEventDetails
> {
  static readonly type: typeof INCOMING_REQ_MESSAGE_EVENT_TYPE =
    INCOMING_REQ_MESSAGE_EVENT_TYPE;
  constructor(details: IncomingReqMessageEventDetails) {
    super(INCOMING_REQ_MESSAGE_EVENT_TYPE, details);
  }
}
