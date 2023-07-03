/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Union type of events emitted at the relay level.
 */

import { MemorelayClientCreatedEvent } from './memorelay-client-created-event';
import { RelayInformationDocumentEvent } from './relay-information-document-event';
import { WebSocketConnectedEvent } from './web-socket-connected-event';

/**
 * Union type of events that are expected to be emitted at the relay level.
 */
export type RelayEvent =
  | MemorelayClientCreatedEvent
  | RelayInformationDocumentEvent
  | WebSocketConnectedEvent;
