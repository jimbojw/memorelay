/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for subscribing to REQ messages.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { IncomingReqMessageEvent } from '../events/incoming-req-message-event';
import { Filter, matchFilters } from 'nostr-tools';
import { IncomingCloseMessageEvent } from '../events/incoming-close-message-event';
import { BroadcastEventMessageEvent } from '../events/broadcast-event-message-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { MemorelayClientDisconnectEvent } from '../../../core/events/memorelay-client-disconnect-event';
import { clearHandlers } from '../../../core/lib/clear-handlers';
import { OutgoingEventMessageEvent } from '../events/outgoing-event-message-event';
import { SubscriptionNotFoundEvent } from '../events/subscription-not-found-event';
import { ClientCloseMessage } from '../types/client-close-message';
import { disconnectAll } from '../../../core/lib/disconnect-all';

/**
 * Memorelay core plugin for subscribing to REQ messages. Note that this plugin
 * does not handle sending stored events. It only handles the subscriptions for
 * new events.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function subscribeToIncomingReqMessages(
  hub: MemorelayHub
): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
      const subscriptions = new Map<string, Filter[]>();

      const handlers: Disconnectable[] = [];

      // Since every new client will add a listener on the hub, and there could
      // be many clients, we increment the hub's maxEventListeners.
      hub.maxEventListeners += 1;

      // Then, on disconnect, in addition to clearing the handlers, we undo the
      // addition to the maxEventListeners value.
      function disconnect() {
        disconnectAll(handlers);
        hub.maxEventListeners -= 1; // Restore previous maxEventListeners.
      }

      handlers.push(
        // Subscribe on incoming REQ event.
        memorelayClient.onEvent(IncomingReqMessageEvent, handleReqMessage),

        // Cancel subscription on CLOSE event.
        memorelayClient.onEvent(IncomingCloseMessageEvent, handleCloseMessage),

        // Listen for broadcasted EVENTs from other connected clients.
        hub.onEvent(BroadcastEventMessageEvent, handleBroadcastEventMessage),

        // Clean up on disconnect.
        memorelayClient.onEvent(MemorelayClientDisconnectEvent, disconnect)
      );

      function handleReqMessage(
        incomingReqMessageEvent: IncomingReqMessageEvent
      ) {
        if (incomingReqMessageEvent.defaultPrevented) {
          return; // Preempted by another handler.
        }
        const [, subscriptionId, ...filters] =
          incomingReqMessageEvent.details.reqMessage;
        subscriptions.set(subscriptionId, filters);
      }

      function handleCloseMessage(
        incomingCloseMessageEvent: IncomingCloseMessageEvent
      ) {
        if (incomingCloseMessageEvent.defaultPrevented) {
          return; // Preempted by another handler.
        }

        const [, subscriptionId] = incomingCloseMessageEvent.details
          .closeMessage as ClientCloseMessage;

        if (!subscriptions.has(subscriptionId)) {
          queueMicrotask(() => {
            memorelayClient.emitEvent(
              new SubscriptionNotFoundEvent(
                { subscriptionId },
                {
                  parentEvent: incomingCloseMessageEvent,
                  targetEmitter: memorelayClient,
                }
              )
            );
          });
          return;
        }

        subscriptions.delete(subscriptionId);
      }

      function handleBroadcastEventMessage(
        broadcastEventMessageEvent: BroadcastEventMessageEvent
      ) {
        const broadcastDetails = broadcastEventMessageEvent.details;

        if (broadcastDetails.memorelayClient === memorelayClient) {
          return; // Nothing to do. This client originated this broadcast event.
        }

        const [, broadcastEvent] = broadcastDetails.clientEventMessage;

        for (const [subscriptionId, filters] of subscriptions.entries()) {
          if (!filters.length || matchFilters(filters, broadcastEvent)) {
            queueMicrotask(() => {
              memorelayClient.emitEvent(
                new OutgoingEventMessageEvent(
                  {
                    relayEventMessage: [
                      'EVENT',
                      subscriptionId,
                      broadcastEvent,
                    ],
                  },
                  {
                    parentEvent: broadcastEventMessageEvent,
                    targetEmitter: memorelayClient,
                  }
                )
              );
            });
          }
        }
      }
    }
  );
}
