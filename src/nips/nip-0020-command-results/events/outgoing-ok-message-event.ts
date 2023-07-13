/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Signifies an OK message on its way out to the client.
 */

import {
  ClientEvent,
  ClientEventOptions,
} from '../../../core/events/client-event';
import { RelayOKMessage } from '../types/relay-ok-message';

export const OUTGOING_OK_MESSAGE_EVENT_TYPE = 'outgoing-ok-message';

/**
 * @see OutgoingOKMessageEvent
 */
export interface OutgoingOKMessageEventDetails {
  /**
   * Outgoing OK message destined for the client.
   */
  readonly okMessage: RelayOKMessage;
}

/**
 * Event emitted when an OK Command Result message is on its way out to the
 * connected WebSocket. The default handler for this event will generalize this
 * to a new OutgoingGenericMessageEvent.
 */
export class OutgoingOKMessageEvent extends ClientEvent<
  typeof OUTGOING_OK_MESSAGE_EVENT_TYPE,
  OutgoingOKMessageEventDetails
> {
  static readonly type: typeof OUTGOING_OK_MESSAGE_EVENT_TYPE =
    OUTGOING_OK_MESSAGE_EVENT_TYPE;
  constructor(
    details: OutgoingOKMessageEventDetails,
    options?: ClientEventOptions
  ) {
    super(OUTGOING_OK_MESSAGE_EVENT_TYPE, details, options);
  }
}
