/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for re-casting outgoing OK messages
 * as generic messages.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { OutgoingGenericMessageEvent } from '../events/outgoing-generic-message-event';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';

/**
 * Memorelay plugin for re-casting outgoing OK messages as generic messages.
 * @param hub Event hub for inter-component communication.
 * @event OutgoingGenericMessageEvent
 */
export function generalizeOutgoingOKMessages(
  hub: MemorelayHub
): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    (memorelayClientCreatedEvent: MemorelayClientCreatedEvent) => {
      const { memorelayClient } = memorelayClientCreatedEvent.details;
      autoDisconnect(
        memorelayClient,
        memorelayClient.onEvent(
          OutgoingOKMessageEvent,
          (outgoingOKMessageEvent: OutgoingOKMessageEvent) => {
            if (outgoingOKMessageEvent.defaultPrevented) {
              return; // Preempted by another handler.
            }
            outgoingOKMessageEvent.preventDefault();
            queueMicrotask(() => {
              memorelayClient.emitEvent(
                new OutgoingGenericMessageEvent(
                  {
                    genericMessage: outgoingOKMessageEvent.details.okMessage,
                  },
                  {
                    parentEvent: outgoingOKMessageEvent,
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
