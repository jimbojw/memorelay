/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for validating incoming generic Nostr
 * messages of type 'EVENT'.
 */

import { BadMessageError } from '../../errors/bad-message-error';
import { checkEventMessage } from '../../../lib/buffer-to-message';
import { BasicEventEmitter } from '../../core/basic-event-emitter';
import { IncomingEventMessageEvent } from '../../events/incoming-event-message-event';
import { IncomingGenericMessageEvent } from '../../events/incoming-generic-message-event';
import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { Handler } from '../../types/handler';
import { MemorelayClientDisconnectEvent } from '../../events/memorelay-client-disconnect-event';
import { clearHandlers } from '../../core/clear-handlers';

/**
 * Memorelay core plugin for validating incoming, generic Nostr messages of type
 * 'EVENT'. Incoming generic messages of any other type are ignored.
 * @param hub Event hub for inter-component communication.
 * @event IncomingEventMessageEvent When a generic message is an EVENT message.
 * @event BadMessageError When an EVENT message is malformed.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function validateIncomingEventMessages(hub: BasicEventEmitter): Handler {
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

      const { genericMessage } = incomingGenericMessageEvent.details;

      if (genericMessage[0] !== 'EVENT') {
        return; // The incoming message is not an 'EVENT'.
      }

      try {
        const eventMessage = checkEventMessage(genericMessage);
        memorelayClient.emitEvent(
          new IncomingEventMessageEvent({ clientEventMessage: eventMessage })
        );
      } catch (error) {
        memorelayClient.emitError(error as BadMessageError);
      } finally {
        incomingGenericMessageEvent.preventDefault();
      }
    }
  }
}
