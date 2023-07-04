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

/**
 * Memorelay core plugin for subscribing to REQ messages. Note that this plugin
 * does not handle sending stored events. It only handles the subscriptions for
 * new events.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function subscribeToIncomingReqMessages(hub: MemorelayHub) {
  hub.onEvent(MemorelayClientCreatedEvent, handleClientCreated);

  function handleClientCreated(
    memorelayClientCreatedEvent: MemorelayClientCreatedEvent
  ) {
    const { memorelayClient } = memorelayClientCreatedEvent.details;

    const subscriptions = new Map<string, Filter[]>();

    memorelayClient.onEvent(IncomingReqMessageEvent, handleReqMessage);
    memorelayClient.onEvent(IncomingCloseMessageEvent, handleCloseMessage);
    memorelayClient.onEvent(
      BroadcastEventMessageEvent,
      handleBroadcastEventMessage
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

      const [, subscriptionId] = incomingCloseMessageEvent.details.closeMessage;

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
      const [, broadcastEvent] =
        broadcastEventMessageEvent.details.eventMessage;
      for (const [subscriptionId, filters] of subscriptions.entries()) {
        if (!filters.length || matchFilters(filters, broadcastEvent)) {
          queueMicrotask(() => {
            // TODO(jimbo): Send event down to client.
          });
        }
      }
    }
  }
}
