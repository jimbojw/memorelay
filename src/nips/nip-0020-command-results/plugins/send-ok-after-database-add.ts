/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send OK message after event is added to the database.
 */

import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { Disconnectable } from '../../../core/types/disconnectable';
import { DidAddEventToDatabaseEvent } from '../../nip-0001-basic-protocol/events/did-add-event-to-database-event';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';

/**
 * After a DidAddEventToDatabaseEvent, send an OutgoingOKMessageEvent.
 * @param memorelayClient The client to plug into.
 * @returns Handler.
 * @emits OutgoingOKMessageEvent
 */
export function sendOKAfterDatabaseAdd(
  memorelayClient: MemorelayClient
): Disconnectable {
  return memorelayClient.onEvent(
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
  );
}
