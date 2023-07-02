/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for validating incoming generic Nostr
 * messages of type 'EVENT'.
 */

import { BadMessageError } from '../../../lib/bad-message-error';
import { checkEventMessage } from '../../../lib/buffer-to-message';
import { BasicEventEmitter } from '../../events/basic-event-emitter';
import { IncomingEventMessageEvent } from '../../events/incoming-event-message-event';
import { IncomingMessageEvent } from '../../events/incoming-message-event';
import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';

/**
 * Memorelay core plugin for validating incoming, generic Nostr messages of type
 * 'EVENT'. Incoming generic messages of any other type are ignored.
 * @param hub Event hub for inter-component communication.
 * @event IncomingEventMessageEvent When a generic message is an EVENT message.
 * @event BadMessageError When an EVENT message is malformed.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function validateIncomingEventMessages(hub: BasicEventEmitter) {
  hub.on(MemorelayClientCreatedEvent.type, handleClientCreated);

  function handleClientCreated(
    memorelayClientCreatedEvent: MemorelayClientCreatedEvent
  ) {
    const { memorelayClient } = memorelayClientCreatedEvent.details;
    memorelayClient.on(IncomingMessageEvent.type, handleIncomingMessage);

    function handleIncomingMessage(incomingMessageEvent: IncomingMessageEvent) {
      if (incomingMessageEvent.defaultPrevented) {
        return; // Preempted by another handler.
      }

      const { incomingMessage } = incomingMessageEvent.details;

      if (incomingMessage[0] !== 'EVENT') {
        return; // The incoming message is not an 'EVENT'.
      }

      try {
        const eventMessage = checkEventMessage(incomingMessage);
        memorelayClient.emitBasic(
          new IncomingEventMessageEvent({ eventMessage })
        );
      } catch (error) {
        memorelayClient.emitError(error as BadMessageError);
      } finally {
        incomingMessageEvent.preventDefault();
      }
    }
  }
}
