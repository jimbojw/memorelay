/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Union type of events emitted at the client level.
 */

import { IncomingCloseMessageEvent } from './incoming-close-message-event';
import { IncomingEventMessageEvent } from './incoming-event-message-event';
import { IncomingGenericMessageEvent } from './incoming-generic-message-event';
import { IncomingReqMessageEvent } from './incoming-req-message-event';
import { OutgoingMessageEvent } from './outgoing-message-event';
import { WebSocketCloseEvent } from './web-socket-close-event';
import { WebSocketMessageEvent } from './web-socket-message-event';

/**
 * Union type of events that are expected to be emitted at the client level.
 */
export type ClientEvent =
  | IncomingCloseMessageEvent
  | IncomingEventMessageEvent
  | IncomingGenericMessageEvent
  | IncomingReqMessageEvent
  | OutgoingMessageEvent
  | WebSocketCloseEvent
  | WebSocketMessageEvent;