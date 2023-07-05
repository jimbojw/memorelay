/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for validating incoming generic Nostr
 * messages of type 'CLOSE'.
 */

import { BadMessageError } from '../../errors/bad-message-error';
import { checkCloseMessage } from '../../../lib/buffer-to-message';
import { BasicEventEmitter } from '../../core/basic-event-emitter';
import { IncomingCloseMessageEvent } from '../../events/incoming-close-message-event';
import { IncomingGenericMessageEvent } from '../../events/incoming-generic-message-event';
import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { Handler } from '../../types/handler';
import { MemorelayClientDisconnectEvent } from '../../events/memorelay-client-disconnect-event';
import { clearHandlers } from '../../core/clear-handlers';

/**
 * Memorelay core plugin for validating incoming, generic Nostr messages of type
 * 'CLOSE'. Incoming generic messages of any other type are ignored.
 * @param hub Event hub for inter-component communication.
 * @event IncomingCloseMessageEvent When a generic message is an CLOSE message.
 * @event BadMessageError When a CLOSE message is malformed.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function validateIncomingCloseMessages(hub: BasicEventEmitter): Handler {
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

      if (genericMessage[0] !== 'CLOSE') {
        return; // The incoming message is not a 'REQ' message.
      }

      try {
        const closeMessage = checkCloseMessage(genericMessage);
        memorelayClient.emitEvent(
          new IncomingCloseMessageEvent(
            { closeMessage },
            {
              parentEvent: incomingGenericMessageEvent,
              targetEmitter: memorelayClient,
            }
          )
        );
      } catch (error) {
        memorelayClient.emitError(error as BadMessageError);
      } finally {
        incomingGenericMessageEvent.preventDefault();
      }
    }
  }
}
