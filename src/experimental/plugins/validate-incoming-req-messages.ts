/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for validating incoming generic Nostr
 * messages of type 'REQ'.
 */

import { BadMessageError } from '../../lib/bad-message-error';
import { checkReqMessage } from '../../lib/buffer-to-message';
import { BasicEventEmitter } from '../events/basic-event-emitter';
import { IncomingReqMessageEvent } from '../events/incoming-req-message-event';
import { IncomingMessageEvent } from '../events/incoming-message-event';
import { MemorelayClientCreatedEvent } from '../events/memorelay-client-created-event';

/**
 * Memorelay core plugin for validating incoming, generic Nostr messages of type
 * 'REQ'. Incoming generic messages of any other type are ignored.
 * @param hub Event hub for inter-component communication.
 * @event IncomingReqMessageEvent When a generic message is an REQ message.
 * @event BadMessageError When a REQ message is malformed.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function validateIncomingReqMessages(hub: BasicEventEmitter) {
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

      if (incomingMessage[0] !== 'REQ') {
        return; // The incoming message is not a 'REQ' message.
      }

      try {
        const reqMessage = checkReqMessage(incomingMessage);
        memorelayClient.emitBasic(new IncomingReqMessageEvent({ reqMessage }));
      } catch (error) {
        memorelayClient.emitError(error as BadMessageError);
      } finally {
        incomingMessageEvent.preventDefault();
      }
    }
  }
}
