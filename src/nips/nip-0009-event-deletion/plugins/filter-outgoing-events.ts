/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Filter outgoing events so that deleted events are not emitted.
 */

import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { Disconnectable } from '../../../core/types/disconnectable';
import { OutgoingEventMessageEvent } from '../../nip-0001-basic-protocol/events/outgoing-event-message-event';
import { EventDeletionDatabase } from '../lib/event-deletion-database';
import { RelayEventMessage } from '../../nip-0001-basic-protocol/types/relay-event-message';

/**
 * Filter outgoing event messages so that deleted events are not emitted.
 * @param eventDeletionDatabase Event deletion database.
 * @param memorelayClient Client that may be sending or receiving events.
 * @returns Handler for disconnection.
 */
export function filterOutgoingEvents(
  eventDeletionDatabase: EventDeletionDatabase,
  memorelayClient: MemorelayClient
): Disconnectable {
  return memorelayClient.onEvent(
    OutgoingEventMessageEvent,
    (outgoingEventMessageEvent: OutgoingEventMessageEvent) => {
      if (outgoingEventMessageEvent.defaultPrevented) {
        return; // Preempted by another listener.
      }
      const relayEventMessage = outgoingEventMessageEvent.details
        .relayEventMessage as RelayEventMessage;
      const outgoingEvent = relayEventMessage[2];
      if (eventDeletionDatabase.isDeleted(outgoingEvent.id)) {
        outgoingEventMessageEvent.preventDefault();
        // TODO(jimbo): Should this emit something?
      }
    }
  );
}
