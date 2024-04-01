/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send OK after duplicate event.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { DuplicateEventMessageEvent } from '../events/duplicate-event-message-event';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';

/**
 * After a DuplicateEventMessageEvent, send an OutgoingOKMessageEvent.
 * @param hub Event hub for inter-component communication.
 * @emits OutgoingOKMessageEvent
 */
export function sendOKAfterDuplicate(hub: MemorelayHub): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    (memorelayClientCreatedEvent: MemorelayClientCreatedEvent) => {
      const { memorelayClient } = memorelayClientCreatedEvent.details;
      autoDisconnect(
        memorelayClient,
        memorelayClient.onEvent(
          DuplicateEventMessageEvent,
          (duplicateEventMessageEvent: DuplicateEventMessageEvent) => {
            if (duplicateEventMessageEvent.defaultPrevented) {
              return; // Preempted by another listener.
            }
            const { event } = duplicateEventMessageEvent.details;
            queueMicrotask(() => {
              memorelayClient.emitEvent(
                new OutgoingOKMessageEvent(
                  { okMessage: ['OK', event.id, true, 'duplicate:'] },
                  {
                    parentEvent: duplicateEventMessageEvent,
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
