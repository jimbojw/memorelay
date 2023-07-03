/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for broadcasting an incoming EVENT
 * message from one client to others.
 */

import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { MemorelayHub } from '../../core/memorelay-hub';
import { MemorelayClient } from '../../core/memorelay-client';
import { IncomingEventMessageEvent } from '../../events/incoming-event-message-event';
import { BroadcastEventMessageEvent } from '../../events/broadcast-event-message-event';
import { WebSocketCloseEvent } from '../../events/web-socket-close-event';

/**
 * Memorelay core plugin for broadcasting incoming EVENT messages from one
 * client to all other connected clients.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function broadcastIncomingEventMessages(hub: MemorelayHub) {
  hub.onEvent(MemorelayClientCreatedEvent, handleClientCreated);

  const allClients = new Set<MemorelayClient>();

  function handleClientCreated(
    memorelayClientCreatedEvent: MemorelayClientCreatedEvent
  ) {
    const { memorelayClient } = memorelayClientCreatedEvent.details;

    allClients.add(memorelayClient);

    memorelayClient.onEvent(WebSocketCloseEvent, () => {
      // TODO(jimbo): Does this also need to disconnect handlers?
      allClients.delete(memorelayClient);
    });

    memorelayClient.onEvent(
      IncomingEventMessageEvent,
      (incomingEventMessageEvent: IncomingEventMessageEvent) => {
        const broadcastEventDetails = {
          eventMessage: incomingEventMessageEvent.details.eventMessage,
          memorelayClient,
        };

        for (const otherClient of allClients) {
          if (otherClient === memorelayClient) {
            continue;
          }

          queueMicrotask(() => {
            otherClient.emitEvent(
              new BroadcastEventMessageEvent(broadcastEventDetails)
            );
          });
        }
      }
    );
  }
}
