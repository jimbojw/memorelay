/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Add incoming events to the event deletion database.
 */

import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { Disconnectable } from '../../../core/types/disconnectable';
import { IncomingEventMessageEvent } from '../../nip-0001-basic-protocol/events/incoming-event-message-event';
import { EventDeletionDatabase } from '../lib/event-deletion-database';

/**
 * Add incoming events to the database.
 * @param eventDeletionDatabase Event deletion database.
 * @param memorelayClient Client that may be sending or receiving events.
 * @returns Handler for disconnection.
 */
export function addIncomingEventsToDatabase(
  eventDeletionDatabase: EventDeletionDatabase,
  memorelayClient: MemorelayClient
): Disconnectable {
  return memorelayClient.onEvent(
    IncomingEventMessageEvent,
    (incomingEventMessageEvent: IncomingEventMessageEvent) => {
      if (incomingEventMessageEvent.defaultPrevented) {
        return; // Preempted by another listener.
      }
      eventDeletionDatabase.addEvent(
        incomingEventMessageEvent.details.clientEventMessage[1]
      );
    }
  );
}
