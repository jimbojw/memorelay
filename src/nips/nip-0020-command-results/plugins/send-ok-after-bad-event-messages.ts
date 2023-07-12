/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Send an OK message after a bad incoming EVENT message.
 */

import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { Disconnectable } from '../../../core/types/disconnectable';
import { BadMessageErrorEvent } from '../../nip-0001-basic-protocol/events/bad-message-error-event';
import { checkGenericMessage } from '../../nip-0001-basic-protocol/lib/check-generic-message';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';

/**
 * After a BadMessageErrorEvent where an EVENT object was malformed, send an
 * OutgoingOKMessageEvent.
 * @param memorelayClient The client to plug into.
 * @returns Handler.
 * @emits OutgoingOKMessageEvent
 */
export function sendOKAfterBadEvent(
  memorelayClient: MemorelayClient
): Disconnectable {
  return memorelayClient.onEvent(
    BadMessageErrorEvent,
    (badMessageErrorEvent: BadMessageErrorEvent) => {
      if (badMessageErrorEvent.defaultPrevented) {
        return; // Preempted by another listener.
      }
      const { badMessageError, badMessage } = badMessageErrorEvent.details;

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
  );
}
