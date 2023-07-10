/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for re-casting outgoing NOTICE messages
 * as generic messages.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { OutgoingGenericMessageEvent } from '../events/outgoing-generic-message-event';
import { OutgoingNoticeMessageEvent } from '../events/outgoing-notice-message-event';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';

/**
 * Memorelay plugin for re-casting outgoing NOTICE messages as generic messages.
 * @param hub Event hub for inter-component communication.
 * @event OutgoingGenericMessageEvent
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function generalizeOutgoingNoticeMessages(
  hub: MemorelayHub
): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    (memorelayClientCreatedEvent: MemorelayClientCreatedEvent) => {
      const { memorelayClient } = memorelayClientCreatedEvent.details;
      autoDisconnect(
        memorelayClient,
        memorelayClient.onEvent(
          OutgoingNoticeMessageEvent,
          (outgoingNoticeMessageEvent: OutgoingNoticeMessageEvent) => {
            if (outgoingNoticeMessageEvent.defaultPrevented) {
              return; // Preempted by another handler.
            }
            outgoingNoticeMessageEvent.preventDefault();
            queueMicrotask(() => {
              memorelayClient.emitEvent(
                new OutgoingGenericMessageEvent(
                  {
                    genericMessage:
                      outgoingNoticeMessageEvent.details.relayNoticeMessage,
                  },
                  {
                    parentEvent: outgoingNoticeMessageEvent,
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
