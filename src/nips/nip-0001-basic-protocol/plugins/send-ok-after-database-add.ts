/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send OK message after event is added to the database.
 */

import { Disconnectable } from '../../../core/types/disconnectable';
import { DidAddEventToDatabaseEvent } from '../events/did-add-event-to-database-event';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';
import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';

/**
 * After a DidAddEventToDatabaseEvent, send an OutgoingOKMessageEvent.
 * @param hub Event hub for inter-component communication.
 * @emits OutgoingOKMessageEvent
 */
export function sendOKAfterDatabaseAdd(hub: MemorelayHub): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    (memorelayClientCreatedEvent: MemorelayClientCreatedEvent) => {
      const { memorelayClient } = memorelayClientCreatedEvent.details;
      autoDisconnect(
        memorelayClient,
        memorelayClient.onEvent(
          DidAddEventToDatabaseEvent,
          (didAddEventToDatabaseEvent: DidAddEventToDatabaseEvent) => {
            if (didAddEventToDatabaseEvent.defaultPrevented) {
              return; // Preempted by another listener.
            }
            const { event } = didAddEventToDatabaseEvent.details;
            queueMicrotask(() => {
              memorelayClient.emitEvent(
                new OutgoingOKMessageEvent(
                  { okMessage: ['OK', event.id, true, ''] },
                  {
                    parentEvent: didAddEventToDatabaseEvent,
                    targetEmitter: memorelayClient,
                  }
                )
              );
            });
          }
        )
      );
    }
  );
}
