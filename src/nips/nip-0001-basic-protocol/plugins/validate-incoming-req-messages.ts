/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for validating incoming generic Nostr
 * messages of type 'REQ'.
 */

import { BadMessageError } from '../errors/bad-message-error';
import { BasicEventEmitter } from '../../../core/lib/basic-event-emitter';
import { IncomingReqMessageEvent } from '../events/incoming-req-message-event';
import { IncomingGenericMessageEvent } from '../events/incoming-generic-message-event';
import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { checkClientReqMessage } from '../lib/check-client-req-message';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';
import { BadMessageErrorEvent } from '../events/bad-message-error-event';

/**
 * Memorelay core plugin for validating incoming, generic Nostr messages of type
 * 'REQ'. Incoming generic messages of any other type are ignored.
 * @param hub Event hub for inter-component communication.
 * @event IncomingReqMessageEvent When a generic message is an REQ message.
 * @event BadMessageError When a REQ message is malformed.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function validateIncomingReqMessages(
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

            if (genericMessage[0] !== 'REQ') {
              return; // The incoming message is not a 'REQ' message.
            }

            incomingGenericMessageEvent.preventDefault();

            const eventOptions = {
              parentEvent: incomingGenericMessageEvent,
              targetEmitter: memorelayClient,
            };

            queueMicrotask(() => {
              try {
                const reqMessage = checkClientReqMessage(genericMessage);
                memorelayClient.emitEvent(
                  new IncomingReqMessageEvent({ reqMessage }, eventOptions)
                );
              } catch (error) {
                const badMessageError = error as BadMessageError;
                memorelayClient.emitEvent(
                  new BadMessageErrorEvent(
                    { badMessageError, badMessage: genericMessage },
                    eventOptions
                  )
                );
              }
            });
          }
        )
      );
    }
  );
}
