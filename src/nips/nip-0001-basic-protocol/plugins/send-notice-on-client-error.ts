/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin for sending a NOTICE message to a client in response to
 * a BadMessageError emitted elsewhere.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { Disconnectable } from '../../../core/types/disconnectable';
import { BadMessageErrorEvent } from '../events/bad-message-error-event';
import { OutgoingNoticeMessageEvent } from '../events/outgoing-notice-message-event';

/**
 * Memorelay plugin which responds to ClientErrors (such as BadMessageErrors)
 * emitted elsewhere by issuing a NOTICE message to the client which produced
 * the error.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function sendNoticeOnClientError(hub: MemorelayHub): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
      autoDisconnect(
        memorelayClient,
        memorelayClient.onEvent(
          BadMessageErrorEvent,
          (badMessageErrorEvent: BadMessageErrorEvent) => {
            if (badMessageErrorEvent.defaultPrevented) {
              return; // Preempted by another listener.
            }
            const { message } = badMessageErrorEvent.details.badMessageError;
            queueMicrotask(() => {
              memorelayClient.emitEvent(
                new OutgoingNoticeMessageEvent(
                  {
                    relayNoticeMessage: ['NOTICE', `ERROR: ${message}`],
                  },
                  {
                    parentEvent: badMessageErrorEvent,
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
