/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for validating incoming generic Nostr
 * messages of type 'CLOSE'.
 */

import { BadMessageError } from '../errors/bad-message-error';
import { BasicEventEmitter } from '../../../core/lib/basic-event-emitter';
import { IncomingCloseMessageEvent } from '../events/incoming-close-message-event';
import { IncomingGenericMessageEvent } from '../events/incoming-generic-message-event';
import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { checkClientCloseMessage } from '../lib/check-client-close-message';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';
import { BadMessageErrorEvent } from '../events/bad-message-error-event';

/**
 * Memorelay core plugin for validating incoming, generic Nostr messages of type
 * 'CLOSE'. Incoming generic messages of any other type are ignored.
 * @param hub Event hub for inter-component communication.
 * @event IncomingCloseMessageEvent When a generic message is an CLOSE message.
 * @event BadMessageError When a CLOSE message is malformed.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function validateIncomingCloseMessages(
  hub: BasicEventEmitter
): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
      autoDisconnect(
        memorelayClient,
        memorelayClient.onEvent(
          IncomingGenericMessageEvent,
          (incomingGenericMessageEvent: IncomingGenericMessageEvent) => {
            if (incomingGenericMessageEvent.defaultPrevented) {
              return; // Preempted by another handler.
            }

            const { genericMessage } = incomingGenericMessageEvent.details;

            if (genericMessage[0] !== 'CLOSE') {
              return; // The incoming message is not a 'REQ' message.
            }

            incomingGenericMessageEvent.preventDefault();

            const eventOptions = {
              parentEvent: incomingGenericMessageEvent,
              targetEmitter: memorelayClient,
            };

            queueMicrotask(() => {
              try {
                const closeMessage = checkClientCloseMessage(genericMessage);
                memorelayClient.emitEvent(
                  new IncomingCloseMessageEvent({ closeMessage }, eventOptions)
                );
              } catch (error) {
                const badMessageError = error as BadMessageError;
                memorelayClient.emitEvent(
                  new BadMessageErrorEvent({ badMessageError }, eventOptions)
                );
              }
            });
          }
        )
      );
    }
  );
}
