/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for rejecting incoming generic messages
 * in which the type string is unrecognized.
 */

import { BadMessageError } from '../../errors/bad-message-error';
import { BasicEventEmitter } from '../../core/basic-event-emitter';
import { IncomingGenericMessageEvent } from '../../events/incoming-generic-message-event';
import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { Handler } from '../../types/handler';
import { MemorelayClientDisconnectEvent } from '../../events/memorelay-client-disconnect-event';
import { clearHandlers } from '../../core/clear-handlers';

/**
 * Memorelay core plugin that rejects any generic message with an unrecognized
 * type string.
 * @param hub Event hub for inter-component communication.
 * @event BadMessageError When an incoming generic message is unrecognized.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function rejectUnrecognizedIncomingMessages(
  hub: BasicEventEmitter
): Handler {
  return hub.onEvent(MemorelayClientCreatedEvent, handleClientCreated);

  function handleClientCreated(
    memorelayClientCreatedEvent: MemorelayClientCreatedEvent
  ) {
    const { memorelayClient } = memorelayClientCreatedEvent.details;

    const handlers: Handler[] = [];
    handlers.push(
      memorelayClient.onEvent(
        IncomingGenericMessageEvent,
        handleIncomingMessage
      ),
      memorelayClient.onEvent(
        MemorelayClientDisconnectEvent,
        clearHandlers(handlers)
      )
    );

    function handleIncomingMessage(
      incomingGenericMessageEvent: IncomingGenericMessageEvent
    ) {
      if (incomingGenericMessageEvent.defaultPrevented) {
        return; // Preempted by another handler.
      }

      const {
        genericMessage: [messageType],
      } = incomingGenericMessageEvent.details;

      if (
        messageType === 'EVENT' ||
        messageType === 'REQ' ||
        messageType === 'CLOSE'
      ) {
        // Nothing to do. Event type was recognized.
        return;
      }

      incomingGenericMessageEvent.preventDefault();

      memorelayClient.emitError(
        new BadMessageError('unrecognized message type')
      );
    }
  }
}
