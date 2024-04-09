/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Filter incoming events so that known deleted events make it no
 * further.
 */

import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { Disconnectable } from '../../../core/types/disconnectable';
import { EventDeletionDatabase } from '../lib/event-deletion-database';
import { IncomingEventMessageEvent } from '../../nip-0001-basic-protocol/events/incoming-event-message-event';
import { ClientEventMessage } from '../../nip-0001-basic-protocol/types/client-event-message';
import { DidAddEventToDatabaseEvent } from '../../nip-0001-basic-protocol/events/did-add-event-to-database-event';

/**
 * Filter incoming event messages so that known deleted events make it no
 * further into the flow.
 * @param eventDeletionDatabase Event deletion database.
 * @param memorelayClient Client that may be sending or receiving events.
 * @returns Handler for disconnection.
 */
export function filterIncomingEvents(
  eventDeletionDatabase: EventDeletionDatabase,
  memorelayClient: MemorelayClient
): Disconnectable {
  return memorelayClient.onEvent(
    IncomingEventMessageEvent,
    (incomingEventMessageEvent: IncomingEventMessageEvent) => {
      if (incomingEventMessageEvent.defaultPrevented) {
        return; // Preempted by another listener.
      }
      const clientEventMessage = incomingEventMessageEvent.details
        .clientEventMessage as ClientEventMessage;
      const incomingEvent = clientEventMessage[1];
      if (eventDeletionDatabase.isDeleted(incomingEvent.id)) {
        incomingEventMessageEvent.preventDefault();

        // Since the incoming event is considered handled, we emit a synthetic
        // DidAddEventToDatabaseEvent to trigger downstream outgoing OK event.
        const didAddEventToDatabaseEvent = new DidAddEventToDatabaseEvent({
          event: clientEventMessage[1],
        });
        queueMicrotask(() => {
          memorelayClient.emitEvent(didAddEventToDatabaseEvent);
        });
      }
    }
  );
}
