/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Union type of events emitted at the client level.
 */

import { BroadcastEventMessageEvent } from './broadcast-event-message-event';
import { IncomingCloseMessageEvent } from './incoming-close-message-event';
import { IncomingEventMessageEvent } from './incoming-event-message-event';
import { IncomingGenericMessageEvent } from './incoming-generic-message-event';
import { IncomingReqMessageEvent } from './incoming-req-message-event';
import { MemorelayClientDisconnectEvent } from './memorelay-client-disconnect-event';
import { OutgoingGenericMessageEvent } from './outgoing-generic-message-event';
import { WebSocketCloseEvent } from './web-socket-close-event';
import { WebSocketMessageEvent } from './web-socket-message-event';

/**
 * Union type of events that are expected to be emitted at the client level.
 */
export type ClientEvent =
  | BroadcastEventMessageEvent
  | IncomingCloseMessageEvent
  | IncomingEventMessageEvent
  | IncomingGenericMessageEvent
  | IncomingReqMessageEvent
  | MemorelayClientDisconnectEvent
  | OutgoingGenericMessageEvent
  | WebSocketCloseEvent
  | WebSocketMessageEvent;
