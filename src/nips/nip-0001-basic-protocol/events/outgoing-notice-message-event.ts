/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Signifies a relay NOTICE message on its way out to the client.
 */

import { RelayNoticeMessage } from '../types/relay-notice-message';
import {
  ClientEvent,
  ClientEventOptions,
} from '../../../core/events/client-event';

export const OUTGOING_NOTICE_MESSAGE_EVENT_TYPE = 'outgoing-notice-message';

/**
 * @see OutgoingNoticeMessageEvent
 */
export interface OutgoingNoticeMessageEventDetails {
  /**
   * Outgoing relay NOTICE message destined for the client.
   */
  readonly relayNoticeMessage: RelayNoticeMessage;
}

/**
 * Event emitted when a NOTICE message is on its way out to the connected
 * client. The default handler for this event will create an
 * OutgoingGenericMessageEvent linked to it.
 */
export class OutgoingNoticeMessageEvent extends ClientEvent<
  typeof OUTGOING_NOTICE_MESSAGE_EVENT_TYPE,
  OutgoingNoticeMessageEventDetails
> {
  static readonly type: typeof OUTGOING_NOTICE_MESSAGE_EVENT_TYPE =
    OUTGOING_NOTICE_MESSAGE_EVENT_TYPE;
  constructor(
    details: OutgoingNoticeMessageEventDetails,
    options?: ClientEventOptions
  ) {
    super(OUTGOING_NOTICE_MESSAGE_EVENT_TYPE, details, options);
  }
}
