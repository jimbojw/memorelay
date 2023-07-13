/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for re-casting outgoing EVENT messages as
 * generic messages.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { OutgoingEventMessageEvent } from '../events/outgoing-event-message-event';
import { OutgoingGenericMessageEvent } from '../events/outgoing-generic-message-event';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';

/**
 * Memorelay plugin for re-casting outgoing EVENT messages as generic messages.
 * @param hub Event hub for inter-component communication.
 * @event OutgoingGenericMessageEvent
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function generalizeOutgoingEventMessages(
  hub: MemorelayHub
): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    (memorelayClientCreatedEvent: MemorelayClientCreatedEvent) => {
      const { memorelayClient } = memorelayClientCreatedEvent.details;
      autoDisconnect(
        memorelayClient,
        memorelayClient.onEvent(
          OutgoingEventMessageEvent,
          (outgoingEventMessageEvent: OutgoingEventMessageEvent) => {
            if (outgoingEventMessageEvent.defaultPrevented) {
              return; // Preempted by another handler.
            }
            outgoingEventMessageEvent.preventDefault();
            queueMicrotask(() => {
              memorelayClient.emitEvent(
                new OutgoingGenericMessageEvent(
                  {
                    genericMessage:
                      outgoingEventMessageEvent.details.relayEventMessage,
                  },
                  {
                    parentEvent: outgoingEventMessageEvent,
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
