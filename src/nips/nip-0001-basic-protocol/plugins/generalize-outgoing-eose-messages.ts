/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for re-casting outgoing EOSE messages as
 * generic messages.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { MemorelayClientDisconnectEvent } from '../../../core/events/memorelay-client-disconnect-event';
import { clearHandlers } from '../../../core/lib/clear-handlers';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { OutgoingGenericMessageEvent } from '../events/outgoing-generic-message-event';
import { OutgoingEOSEMessageEvent } from '../events/outgoing-eose-message-event';

/**
 * Memorelay plugin for re-casting outgoing EOSE messages as generic messages.
 * @param hub Event hub for inter-component communication.
 * @event OutgoingGenericMessageEvent
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function generalizeOutgoingEOSEMessages(
  hub: MemorelayHub
): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    (memorelayClientCreatedEvent: MemorelayClientCreatedEvent) => {
      const { memorelayClient } = memorelayClientCreatedEvent.details;

      const handlers: Disconnectable[] = [];
      handlers.push(
        // Generalize incoming EVENT messages.
        memorelayClient.onEvent(
          OutgoingEOSEMessageEvent,
          (outgoingEOSEMessageEvent: OutgoingEOSEMessageEvent) => {
            queueMicrotask(() => {
              if (outgoingEOSEMessageEvent.defaultPrevented) {
                return; // Preempted by another handler.
              }
              outgoingEOSEMessageEvent.preventDefault();
              const { relayEOSEMessage } = outgoingEOSEMessageEvent.details;
              memorelayClient.emitEvent(
                new OutgoingGenericMessageEvent(
                  { genericMessage: relayEOSEMessage },
                  {
                    parentEvent: outgoingEOSEMessageEvent,
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
