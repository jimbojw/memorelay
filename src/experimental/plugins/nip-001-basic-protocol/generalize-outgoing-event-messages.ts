/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for re-casting outgoing EVENT messages as
 * generic messages.
 */

import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { Handler } from '../../types/handler';
import { MemorelayClientDisconnectEvent } from '../../events/memorelay-client-disconnect-event';
import { clearHandlers } from '../../../core/clear-handlers';
import { MemorelayHub } from '../../../core/memorelay-hub';
import { OutgoingEventMessageEvent } from '../../events/outgoing-event-message-event';
import { OutgoingGenericMessageEvent } from '../../events/outgoing-generic-message-event';

/**
 * Memorelay plugin for re-casting outgoing EVENT messages as generic messages.
 * @param hub Event hub for inter-component communication.
 * @event OutgoingGenericMessageEvent
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function generalizeOutgoingEventMessages(hub: MemorelayHub): Handler {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    (memorelayClientCreatedEvent: MemorelayClientCreatedEvent) => {
      const { memorelayClient } = memorelayClientCreatedEvent.details;

      const handlers: Handler[] = [];
      handlers.push(
        // Generalize incoming EVENT messages.
        memorelayClient.onEvent(
          OutgoingEventMessageEvent,
          (outgoingEventMessageEvent: OutgoingEventMessageEvent) => {
            queueMicrotask(() => {
              if (outgoingEventMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
              }
              outgoingEventMessageEvent.preventDefault();
              const { relayEventMessage } = outgoingEventMessageEvent.details;
              memorelayClient.emitEvent(
                new OutgoingGenericMessageEvent(
                  { genericMessage: relayEventMessage },
                  {
                    parentEvent: outgoingEventMessageEvent,
                    targetEmitter: memorelayClient,
                  }
                )
              );
            });
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
