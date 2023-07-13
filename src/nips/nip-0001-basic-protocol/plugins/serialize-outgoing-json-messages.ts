/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for serializing outgoing generic messages
 * as JSON and sending to the WebSocket.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { OutgoingGenericMessageEvent } from '../events/outgoing-generic-message-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { objectToJsonBuffer } from '../lib/object-to-json-buffer';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';
import { WebSocketSendEvent } from '../../../core/events/web-socket-send-event';

/**
 * Memorelay core plugin for serializing generic, outgoing Nostr messages as
 * JSON and sending them to the WebSocket.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function serializeOutgoingJsonMessages(
  hub: MemorelayHub
): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    (memorelayClientCreatedEvent: MemorelayClientCreatedEvent) => {
      const { memorelayClient } = memorelayClientCreatedEvent.details;
      autoDisconnect(
        memorelayClient,
        memorelayClient.onEvent(
          OutgoingGenericMessageEvent,
          (outgoingGenericMessage: OutgoingGenericMessageEvent) => {
            if (outgoingGenericMessage.defaultPrevented) {
              return; // Preempted by another handler.
            }
            outgoingGenericMessage.preventDefault();
            const { genericMessage } = outgoingGenericMessage.details;
            const buffer = objectToJsonBuffer(genericMessage);
            queueMicrotask(() => {
              memorelayClient.emitEvent(
                new WebSocketSendEvent(
                  { buffer },
                  {
                    parentEvent: outgoingGenericMessage,
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
