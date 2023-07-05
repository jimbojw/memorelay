/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for subscribing to REQ messages.
 */

import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { MemorelayHub } from '../../core/memorelay-hub';
import { IncomingReqMessageEvent } from '../../events/incoming-req-message-event';
import { Filter, matchFilters } from 'nostr-tools';
import { IncomingCloseMessageEvent } from '../../events/incoming-close-message-event';
import { SubscriptionNotFoundError } from '../../errors/subscription-not-found-error';
import { BroadcastEventMessageEvent } from '../../events/broadcast-event-message-event';
import { Handler } from '../../types/handler';
import { MemorelayClientDisconnectEvent } from '../../events/memorelay-client-disconnect-event';
import { clearHandlers } from '../../core/clear-handlers';
import { RelayEventMessage } from '../../../lib/message-types';
import { OutgoingGenericMessageEvent } from '../../events/outgoing-generic-message-event';

/**
 * Memorelay core plugin for subscribing to REQ messages. Note that this plugin
 * does not handle sending stored events. It only handles the subscriptions for
 * new events.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function subscribeToIncomingReqMessages(hub: MemorelayHub): Handler {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
      const subscriptions = new Map<string, Filter[]>();

      const handlers: Handler[] = [];
      handlers.push(
        // Subscribe on incoming REQ event.
        memorelayClient.onEvent(IncomingReqMessageEvent, handleReqMessage),

        // Cancel subscription on CLOSE event.
        memorelayClient.onEvent(IncomingCloseMessageEvent, handleCloseMessage),

        // Listen for broadcasted EVENTs from other connected clients.
        hub.onEvent(BroadcastEventMessageEvent, handleBroadcastEventMessage),

        // Clean up on disconnect.
        memorelayClient.onEvent(
          MemorelayClientDisconnectEvent,
          clearHandlers(handlers)
        )
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

        const [, subscriptionId] =
          incomingCloseMessageEvent.details.closeMessage;

        if (!subscriptions.has(subscriptionId)) {
          memorelayClient.emitError(
            new SubscriptionNotFoundError(subscriptionId)
          );
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
              const outgoingEventMessage: RelayEventMessage = [
                'EVENT',
                subscriptionId,
                broadcastEvent,
              ];
              // TODO(jimbo): Implement and switch to OutgoingEventMessageEvent.
              memorelayClient.emitEvent(
                new OutgoingGenericMessageEvent(
                  { genericMessage: outgoingEventMessage },
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
