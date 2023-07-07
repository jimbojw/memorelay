/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for broadcasting an incoming EVENT
 * message from one client to others.
 */

import { MemorelayClientCreatedEvent } from '../../core/events/memorelay-client-created-event';
import { MemorelayHub } from '../../core/lib/memorelay-hub';
import { IncomingEventMessageEvent } from '../events/incoming-event-message-event';
import { BroadcastEventMessageEvent } from '../events/broadcast-event-message-event';
import { Disconnectable } from '../../core/types/disconnectable';
import { MemorelayClientDisconnectEvent } from '../../core/events/memorelay-client-disconnect-event';
import { clearHandlers } from '../../core/lib/clear-handlers';

/**
 * Memorelay core plugin for broadcasting incoming EVENT messages from one
 * client to all other connected clients.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function broadcastIncomingEventMessages(
  hub: MemorelayHub
): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
      const handlers: Disconnectable[] = [];
      handlers.push(
        // Broadcast incoming EVENT messages up to hub.
        memorelayClient.onEvent(
          IncomingEventMessageEvent,
          (incomingEventMessageEvent: IncomingEventMessageEvent) => {
            if (incomingEventMessageEvent.defaultPrevented) {
              return; // Preempted by another listener.
            }

            const {
              details: { clientEventMessage },
            } = incomingEventMessageEvent;
            hub.emitEvent(
              new BroadcastEventMessageEvent(
                { clientEventMessage, memorelayClient },
                { parentEvent: incomingEventMessageEvent, targetEmitter: hub }
              )
            );
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
