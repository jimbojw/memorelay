/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Signifies a relay EOSE message on its way out to the client.
 */

import { RelayEOSEMessage } from '../types/relay-eose-message';
import {
  ClientEvent,
  ClientEventOptions,
} from '../../../core/events/client-event';

export const OUTGOING_EOSE_MESSAGE_EVENT_TYPE = 'outgoing-eose-message';

/**
 * @see OutgoingEOSEMessageEvent
 */
export interface OutgoingEOSEMessageEventDetails {
  /**
   * Outgoing relay EOSE message destined for the client.
   */
  readonly relayEOSEMessage: RelayEOSEMessage;
}

/**
 * Event emitted when an EOSE message is on its way out to the connected
 * client. The default handler for this event will create an
 * OutgoingGenericMessageEvent linked to it.
 */
export class OutgoingEOSEMessageEvent extends ClientEvent<
  typeof OUTGOING_EOSE_MESSAGE_EVENT_TYPE,
  OutgoingEOSEMessageEventDetails
> {
  static readonly type: typeof OUTGOING_EOSE_MESSAGE_EVENT_TYPE =
    OUTGOING_EOSE_MESSAGE_EVENT_TYPE;
  constructor(
    details: OutgoingEOSEMessageEventDetails,
    options?: ClientEventOptions
  ) {
    super(OUTGOING_EOSE_MESSAGE_EVENT_TYPE, details, options);
  }
}
