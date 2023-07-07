/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Signifies a relay EVENT message on its way out to the client.
 */

import { RelayEventMessage } from '../../lib/message-types';
import {
  ClientEvent,
  ClientEventOptions,
} from '../../core/events/client-event';

export const OUTGOING_EVENT_MESSAGE_EVENT_TYPE = 'outgoing-event-message';

/**
 * @see OutgoingEventMessageEvent
 */
export interface OutgoingEventMessageEventDetails {
  /**
   * Outgoing relay EVENT message destined for the client.
   */
  readonly relayEventMessage: RelayEventMessage;
}

/**
 * Event emitted when a NOTICE message is on its way out to the connected
 * client. The default handler for this event will create an
 * OutgoingGenericMessageEvent linked to it.
 */
export class OutgoingEventMessageEvent extends ClientEvent<
  typeof OUTGOING_EVENT_MESSAGE_EVENT_TYPE,
  OutgoingEventMessageEventDetails
> {
  static readonly type: typeof OUTGOING_EVENT_MESSAGE_EVENT_TYPE =
    OUTGOING_EVENT_MESSAGE_EVENT_TYPE;
  constructor(
    details: OutgoingEventMessageEventDetails,
    options?: ClientEventOptions
  ) {
    super(OUTGOING_EVENT_MESSAGE_EVENT_TYPE, details, options);
  }
}
