/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for parsing incoming WebSocket message
 * payloads as generic JSON client messages.
 */

import { BadMessageError } from '../errors/bad-message-error';
import { BasicEventEmitter } from '../../../core/lib/basic-event-emitter';
import { IncomingGenericMessageEvent } from '../events/incoming-generic-message-event';
import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { WebSocketMessageEvent } from '../../../core/events/web-socket-message-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { bufferToGenericMessage } from '../lib/buffer-to-generic-message';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';

/**
 * Memorelay plugin for parsing incoming WebSocket 'message' payload buffers as
 * JSON-encoded generic Nostr messages.
 *
 * A generic Nostr message is an array whose first element is a string
 * indicating which kind of message it is.  Remaining array elements depend on
 * the type of message and other factors.
 * @param hub Event hub for inter-component communication.
 * @event IncomingGenericMessageEvent When a payload buffer could be parsed.
 * @event BadMessageError When a message payload buffer could not be parsed.
 * @returns Handler for disconnection.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function parseIncomingJsonMessages(
  hub: BasicEventEmitter
): Disconnectable {
  return hub.onEvent(MemorelayClientCreatedEvent, handleClientCreated);

  function handleClientCreated(
    memorelayClientCreatedEvent: MemorelayClientCreatedEvent
  ) {
    const { memorelayClient } = memorelayClientCreatedEvent.details;
    autoDisconnect(
      memorelayClient,
      memorelayClient.onEvent(
        WebSocketMessageEvent,
        (webSocketMessageEvent: WebSocketMessageEvent) => {
          if (webSocketMessageEvent.defaultPrevented) {
            return; // Preempted by another handler.
          }

          webSocketMessageEvent.preventDefault();

          queueMicrotask(() => {
            const { data } = webSocketMessageEvent.details;
            const buffer = Array.isArray(data)
              ? Buffer.concat(data)
              : (data as Buffer);

            try {
              const genericMessage = bufferToGenericMessage(buffer);
              memorelayClient.emitEvent(
                new IncomingGenericMessageEvent(
                  { genericMessage },
                  {
                    parentEvent: webSocketMessageEvent,
                    targetEmitter: memorelayClient,
                  }
                )
              );
            } catch (error) {
              memorelayClient.emitError(error as BadMessageError);
            }
          });
        }
      )
    );
  }
}
