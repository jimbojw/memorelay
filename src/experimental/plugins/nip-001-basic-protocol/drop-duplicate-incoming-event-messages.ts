/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin to drop duplicate incoming EVENT messages.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { IncomingEventMessageEvent } from '../../../nip-0001-basic-protocol/events/incoming-event-message-event';
import { Handler } from '../../types/handler';
import { MemorelayClientDisconnectEvent } from '../../../core/events/memorelay-client-disconnect-event';
import { clearHandlers } from '../../../core/lib/clear-handlers';

/**
 * Memorelay plugin to drop incoming EVENT messages if it has been seen before.
 * @param hub Event hub for inter-component communication.
 */
export function dropDuplicateIncomingEventMessages(hub: MemorelayHub): Handler {
  const seenEventIds: Record<string, true> = {};

  return hub.onEvent(
    MemorelayClientCreatedEvent,
    ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
      const handlers: Handler[] = [];
      handlers.push(
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
        ),

        // Clean up on disconnect.
        memorelayClient.onEvent(
          MemorelayClientDisconnectEvent,
          clearHandlers(handlers)
        )
      );
    }
  );
}
