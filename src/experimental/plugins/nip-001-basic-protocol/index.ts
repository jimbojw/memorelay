/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugins for implementing NIP-01.
 */

import { MemorelayHub } from '../../core/memorelay-hub';
import { broadcastIncomingEventMessages } from './broadcast-incoming-event-messages';

import { parseIncomingJsonMessages } from './parse-incoming-json-messages';
import { rejectUnrecognizedIncomingMessages } from './reject-unrecognized-incoming-messages';
import { serializeOutgoingJsonMessages } from './serialize-outgoing-json-messages';
import { subscribeToIncomingReqMessages } from './subscribe-to-incoming-req-messages';
import { validateIncomingCloseMessages } from './validate-incoming-close-messages';
import { validateIncomingEventMessages } from './validate-incoming-event-messages';
import { validateIncomingReqMessages } from './validate-incoming-req-messages';

/**
 * Given an event emitter hub (presumed to be a Memorelay instance), attach all
 * component functionality.
 * @param hub Basic event emitter, often a Memorelay instance.
 */
export function basicProtocol(hub: MemorelayHub) {
  // Parse incoming WebSocket 'message' buffers as generic Nostr messages.
  parseIncomingJsonMessages(hub);

  // Validate and upgrade incoming EVENT, REQ and CLOSE messages.
  validateIncomingEventMessages(hub);
  validateIncomingReqMessages(hub);
  validateIncomingCloseMessages(hub);

  // Reject any message type other than EVENT, REQ and CLOSE.
  rejectUnrecognizedIncomingMessages(hub);

  // Broadcast incoming EVENT messages to all other connected clients.
  broadcastIncomingEventMessages(hub);

  // Subscribe to incoming REQ messages.
  subscribeToIncomingReqMessages(hub);

  // Serialize outgoing generic messages and send to the WebSocket.
  serializeOutgoingJsonMessages(hub);
}
