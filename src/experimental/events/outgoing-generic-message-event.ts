/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Signifies a message on its way out to the client.
 */

import { GenericMessage } from '../../lib/message-types';
import { BasicEvent } from './basic-event';

export const OUTGOING_GENERIC_MESSAGE_EVENT_TYPE = 'outgoing-generic-message';

/**
 * @see OutgoingGenericMessageEvent
 */
export interface OutgoingGenericMessageEventDetails {
  /**
   * Outgoing message destined for the client.
   */
  readonly genericMessage: GenericMessage;
}

/**
 * Event emitted when a message is on its way out to the connected WebSocket.
 * The default handler for this event will serialize the message as JSON, then
 * push it down the wire.
 */
export class OutgoingGenericMessageEvent extends BasicEvent<
  typeof OUTGOING_GENERIC_MESSAGE_EVENT_TYPE,
  OutgoingGenericMessageEventDetails
> {
  static readonly type: typeof OUTGOING_GENERIC_MESSAGE_EVENT_TYPE =
    OUTGOING_GENERIC_MESSAGE_EVENT_TYPE;
  constructor(details: OutgoingGenericMessageEventDetails) {
    super(OUTGOING_GENERIC_MESSAGE_EVENT_TYPE, details);
  }
}