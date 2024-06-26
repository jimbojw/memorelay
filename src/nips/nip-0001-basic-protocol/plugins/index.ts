/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugins for implementing NIP-01.
 */

import { PluginFn } from '../../../core/types/plugin-types';
import { increaseClientMaxEventListeners } from '../../../core/plugins/increase-client-max-event-listeners';
import { clearHandlers } from '../../../core/lib/clear-handlers';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { Disconnectable } from '../../../core/types/disconnectable';
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
import { EventsDatabase } from '../lib/events-database';
import { storeIncomingEventsToDatabase } from './store-incoming-events-to-database';
import { generalizeOutgoingOKMessages } from './generalize-outgoing-ok-messages';
import { sendOKAfterDuplicate } from './send-ok-after-duplicate';
import { sendOKAfterBadEvent } from './send-ok-after-bad-event-messages';
import { sendNoticeOnClientError } from './send-notice-on-client-error';
import { sendOKAfterDatabaseAdd } from './send-ok-after-database-add';

/**
 * Given an event emitter hub (presumed to be a Memorelay instance), attach all
 * component functionality.
 * @param hub Basic event emitter, often a Memorelay instance.
 * @returns Handler for disconnection.
 */
export function basicProtocol(hub: MemorelayHub): Disconnectable {
  const eventsDatabase = new EventsDatabase();

  const plugins: PluginFn<MemorelayHub>[] = [
    // Increase max event listeners for clients. This is a heuristic, as is
    // Node's built-in limit of 10 listeners per event type on an EventEmitter.
    // Programmatically increasing the number each time a listener is added
    // would defeat the purpose of the heuristic-based memory leak detection.
    increaseClientMaxEventListeners(20),

    // Parse incoming WebSocket 'message' buffers as generic Nostr messages.
    parseIncomingJsonMessages,

    // Validate and upgrade incoming EVENT, REQ and CLOSE messages.
    validateIncomingEventMessages,
    validateIncomingReqMessages,
    validateIncomingCloseMessages,

    // Reject any message type other than EVENT, REQ and CLOSE.
    rejectUnrecognizedIncomingMessages,

    // Send OK in response to a client error such as a bad message.
    sendOKAfterBadEvent,

    // Send NOTICE in response to a client error other than a bad EVENT.
    sendNoticeOnClientError,

    // Drop incoming EVENT messages where the clientEvent has been seen before.
    dropDuplicateIncomingEventMessages,

    // Send OK to posting client after dropping duplicate EVENT message.
    sendOKAfterDuplicate,

    // Broadcast incoming EVENT messages to all other connected clients.
    broadcastIncomingEventMessages,

    // Store incoming events to the database.
    storeIncomingEventsToDatabase(eventsDatabase),

    // Send OK after adding an event to the database.
    sendOKAfterDatabaseAdd,

    // Send stored events to REQ subscribers.
    sendStoredEventsToSubscribers(eventsDatabase),

    // Subscribe to incoming REQ messages.
    subscribeToIncomingReqMessages,

    // Convert outgoing EVENT, EOSE, NOTICE and OK message events to
    // OutgoingGenericMessageEvents.
    generalizeOutgoingEventMessages,
    generalizeOutgoingEOSEMessages,
    generalizeOutgoingNoticeMessages,
    generalizeOutgoingOKMessages,

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
