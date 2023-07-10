/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin to drop duplicate incoming EVENT messages.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { IncomingEventMessageEvent } from '../events/incoming-event-message-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';

/**
 * Memorelay plugin to drop incoming EVENT messages if it has been seen before.
 * @param hub Event hub for inter-component communication.
 */
export function dropDuplicateIncomingEventMessages(
  hub: MemorelayHub
): Disconnectable {
  const seenEventIds: Record<string, true> = {};

  return hub.onEvent(
    MemorelayClientCreatedEvent,
    ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
      autoDisconnect(
        memorelayClient,
        // Broadcast incoming EVENT messages up to hub.
        memorelayClient.onEvent(
          IncomingEventMessageEvent,
          (incomingEventMessageEvent: IncomingEventMessageEvent) => {
            if (incomingEventMessageEvent.defaultPrevented) {
              return; // Preempted by another listener.
            }

            const [, { id: incomingEventId }] =
              incomingEventMessageEvent.details.clientEventMessage;

            if (incomingEventId in seenEventIds) {
              // TODO(jimbo): Should this also emit an error/event?
              incomingEventMessageEvent.preventDefault();
              return;
            }

            seenEventIds[incomingEventId] = true;
          }
        )
      );
    }
  );
}
