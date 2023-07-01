/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Signifies a message on its way out to the client.
 */

import { RelayMessage } from '../../lib/message-types';
import { BasicEvent } from './basic-event';

export const OUTGOING_MESSAGE_EVENT_TYPE = 'outgoing-message';

/**
 * @see OutgoingMessageEvent
 */
export interface OutgoingMessageEventDetails {
  /**
   * Outgoing message destined for the client.
   */
  readonly outgoingMessage: RelayMessage;
}

/**
 * Event emitted when a message is on its way out to the connected WebSocket.
 * The default handler for this event will serialize the message as JSON, then
 * push it down the wire.
 */
export class OutgoingMessageEvent extends BasicEvent<
  typeof OUTGOING_MESSAGE_EVENT_TYPE,
  OutgoingMessageEventDetails
> {
  static readonly type: typeof OUTGOING_MESSAGE_EVENT_TYPE =
    OUTGOING_MESSAGE_EVENT_TYPE;
  constructor(details: OutgoingMessageEventDetails) {
    super('outgoing-message', details);
  }
}
