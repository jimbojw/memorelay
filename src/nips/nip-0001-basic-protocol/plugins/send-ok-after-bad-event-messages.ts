/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send an OK message after a bad incoming EVENT message.
 */

import { Disconnectable } from '../../../core/types/disconnectable';
import { BadMessageErrorEvent } from '../events/bad-message-error-event';
import { checkGenericMessage } from '../lib/check-generic-message';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';
import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';

/**
 * After a BadMessageErrorEvent where an EVENT object was malformed, send an
 * OutgoingOKMessageEvent.
 * @param hub Event hub for inter-component communication.
 * @emits OutgoingOKMessageEvent
 */
export function sendOKAfterBadEvent(hub: MemorelayHub): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    (memorelayClientCreatedEvent: MemorelayClientCreatedEvent) => {
      const { memorelayClient } = memorelayClientCreatedEvent.details;
      autoDisconnect(
        memorelayClient,
        memorelayClient.onEvent(
          BadMessageErrorEvent,
          (badMessageErrorEvent: BadMessageErrorEvent) => {
            if (badMessageErrorEvent.defaultPrevented) {
              return; // Preempted by another listener.
            }
            const { badMessageError, badMessage } =
              badMessageErrorEvent.details;

            try {
              const genericMessage = checkGenericMessage(badMessage);

              if (genericMessage[0] !== 'EVENT') {
                return; // The bad message wasn't an EVENT message.
              }

              badMessageErrorEvent.preventDefault();

              const maybeEventObject = genericMessage[1];

              const eventId =
                maybeEventObject &&
                typeof maybeEventObject === 'object' &&
                'id' in maybeEventObject &&
                typeof maybeEventObject.id === 'string'
                  ? maybeEventObject.id
                  : 'undefined';

              queueMicrotask(() => {
                memorelayClient.emitEvent(
                  new OutgoingOKMessageEvent(
                    {
                      okMessage: [
                        'OK',
                        eventId,
                        false,
                        `invalid: ${badMessageError.message}`,
                      ],
                    },
                    {
                      parentEvent: badMessageErrorEvent,
                      targetEmitter: memorelayClient,
                    }
                  )
                );
              });
            } catch (err) {
              // Nothing for us to do if the cause of the BadMessageError
              // doesn't meet the qualifications of even a generic message.
              return;
            }
          }
        )
      );
    }
  );
}
