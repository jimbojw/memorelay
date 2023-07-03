/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for parsing incoming WebSocket message
 * payloads as generic JSON client messages.
 */

import { BadMessageError } from '../../errors/bad-message-error';
import { bufferToGenericMessage } from '../../../lib/buffer-to-message';
import { BasicEventEmitter } from '../../core/basic-event-emitter';
import { IncomingGenericMessageEvent } from '../../events/incoming-generic-message-event';
import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { WebSocketMessageEvent } from '../../events/web-socket-message-event';

/**
 * Memorelay core plugin for parsing incoming WebSocket 'message' payload
 * buffers as JSON-encoded generic Nostr messages.
 *
 * A generic Nostr message is an array whose first element is a string
 * indicating which kind of message it is.  Remaining array elements depend on
 * the type of message and other factors.
 * @param hub Event hub for inter-component communication.
 * @event IncomingGenericMessageEvent When a payload buffer could be parsed.
 * @event BadMessageError When a message payload buffer could not be parsed.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function parseIncomingJsonMessages(hub: BasicEventEmitter) {
  hub.onEvent(MemorelayClientCreatedEvent, handleClientCreated);

  function handleClientCreated(
    memorelayClientCreatedEvent: MemorelayClientCreatedEvent
  ) {
    const { memorelayClient } = memorelayClientCreatedEvent.details;
    memorelayClient.onEvent(WebSocketMessageEvent, handleWebSocketMessage);

    function handleWebSocketMessage(
      webSocketMessageEvent: WebSocketMessageEvent
    ) {
      if (webSocketMessageEvent.defaultPrevented) {
        return; // Preempted by another handler.
      }

      const { data } = webSocketMessageEvent.details;
      const buffer = Array.isArray(data)
        ? Buffer.concat(data)
        : (data as Buffer);

      try {
        const genericMessage = bufferToGenericMessage(buffer);
        memorelayClient.emitEvent(
          new IncomingGenericMessageEvent({ genericMessage })
        );
      } catch (error) {
        memorelayClient.emitError(error as BadMessageError);
      }
    }
  }
}
