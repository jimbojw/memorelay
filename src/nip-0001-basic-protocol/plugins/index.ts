/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugins for implementing NIP-01.
 */

import { clearHandlers } from '../../core/lib/clear-handlers';
import { MemorelayHub } from '../../core/lib/memorelay-hub';
import { Disconnectable } from '../../core/types/disconnectable';
import { broadcastIncomingEventMessages } from './broadcast-incoming-event-messages';
import { generalizeOutgoingEOSEMessages } from './generalize-outgoing-eose-messages';
import { generalizeOutgoingEventMessages } from './generalize-outgoing-event-messages';
import { generalizeOutgoingNoticeMessages } from './generalize-outgoing-notice-messages';

import { parseIncomingJsonMessages } from './parse-incoming-json-messages';
import { dropDuplicateIncomingEventMessages } from './drop-duplicate-incoming-event-messages';
import { rejectUnrecognizedIncomingMessages } from './reject-unrecognized-incoming-messages';
import { sendStoredEventsToSubscribers } from './send-stored-events-to-subscribers';
import { serializeOutgoingJsonMessages } from './serialize-outgoing-json-messages';
import { subscribeToIncomingReqMessages } from './subscribe-to-incoming-req-messages';
import { validateIncomingCloseMessages } from './validate-incoming-close-messages';
import { validateIncomingEventMessages } from './validate-incoming-event-messages';
import { validateIncomingReqMessages } from './validate-incoming-req-messages';

/**
 * Given an event emitter hub (presumed to be a Memorelay instance), attach all
 * component functionality.
 * @param hub Basic event emitter, often a Memorelay instance.
 * @returns Handler for disconnection.
 */
export function basicProtocol(hub: MemorelayHub): Disconnectable {
  const plugins = [
    // Parse incoming WebSocket 'message' buffers as generic Nostr messages.
    parseIncomingJsonMessages,

    // Validate and upgrade incoming EVENT, REQ and CLOSE messages.
    validateIncomingEventMessages,
    validateIncomingReqMessages,
    validateIncomingCloseMessages,

    // Reject any message type other than EVENT, REQ and CLOSE.
    rejectUnrecognizedIncomingMessages,

    // Drop incoming EVENT messages where the clientEvent has been seen before.
    dropDuplicateIncomingEventMessages,

    // Broadcast incoming EVENT messages to all other connected clients.
    broadcastIncomingEventMessages,

    // Send stored events to incoming subscriptions.
    sendStoredEventsToSubscribers,

    // Subscribe to incoming REQ messages.
    subscribeToIncomingReqMessages,

    // Convert outgoing EVENT, EOSE and NOTICE message events to
    // OutgoingGenericMessageEvents.
    generalizeOutgoingEventMessages,
    generalizeOutgoingEOSEMessages,
    generalizeOutgoingNoticeMessages,

    // Serialize outgoing generic messages and send to the WebSocket.
    serializeOutgoingJsonMessages,
  ];

  // Avoid Node's MaxListenersExceededWarning.
  hub.maxEventListeners += plugins.length;

  const handlers = plugins.map((plugin) => plugin(hub));

  return {
    disconnect: () => {
      clearHandlers(handlers);
      hub.maxEventListeners -= plugins.length; // Restore maxListeners.
    },
  };
}
