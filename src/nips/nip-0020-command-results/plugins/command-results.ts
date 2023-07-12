/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin to implement NIP-20 Command Results.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { Disconnectable } from '../../../core/types/disconnectable';
import { BadMessageErrorEvent } from '../../nip-0001-basic-protocol/events/bad-message-error-event';
import { DidAddEventToDatabaseEvent } from '../../nip-0001-basic-protocol/events/did-add-event-to-database-event';
import { DuplicateEventMessageEvent } from '../../nip-0001-basic-protocol/events/duplicate-event-message-event';
import { OutgoingGenericMessageEvent } from '../../nip-0001-basic-protocol/events/outgoing-generic-message-event';
import { checkGenericMessage } from '../../nip-0001-basic-protocol/lib/check-generic-message';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';

/**
 * Given an event emitter hub (presumed to be a Memorelay instance), attach
 * handlers to implement NIP-20.
 * @param hub Basic event emitter, often a Memorelay instance.
 * @returns Handler for disconnection.
 */
export function commandResults(hub: MemorelayHub): Disconnectable {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
      autoDisconnect(
        memorelayClient,
        memorelayClient.onEvent(
          DidAddEventToDatabaseEvent,
          (didAddEventToDatabaseEvent: DidAddEventToDatabaseEvent) => {
            if (didAddEventToDatabaseEvent.defaultPrevented) {
              return; // Preempted by another listener.
            }
            const { event } = didAddEventToDatabaseEvent.details;
            queueMicrotask(() => {
              memorelayClient.emitEvent(
                new OutgoingOKMessageEvent(
                  { okMessage: ['OK', event.id, true, ''] },
                  {
                    parentEvent: didAddEventToDatabaseEvent,
                    targetEmitter: memorelayClient,
                  }
                )
              );
            });
          }
        ),

        memorelayClient.onEvent(
          DuplicateEventMessageEvent,
          (duplicateEventMessageEvent: DuplicateEventMessageEvent) => {
            if (duplicateEventMessageEvent.defaultPrevented) {
              return; // Preempted by another listener.
            }
            const { event } = duplicateEventMessageEvent.details;
            queueMicrotask(() => {
              memorelayClient.emitEvent(
                new OutgoingOKMessageEvent(
                  { okMessage: ['OK', event.id, true, 'duplicate:'] },
                  {
                    parentEvent: duplicateEventMessageEvent,
                    targetEmitter: memorelayClient,
                  }
                )
              );
            });
          }
        ),

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
        ),

        memorelayClient.onEvent(
          OutgoingOKMessageEvent,
          (outgoingGenericMessageEvent: OutgoingOKMessageEvent) => {
            if (outgoingGenericMessageEvent.defaultPrevented) {
              return; // Preempted by another listener.
            }
            queueMicrotask(() => {
              memorelayClient.emitEvent(
                new OutgoingGenericMessageEvent(
                  {
                    genericMessage:
                      outgoingGenericMessageEvent.details.okMessage,
                  },
                  {
                    parentEvent: outgoingGenericMessageEvent,
                    targetEmitter: memorelayClient,
                  }
                )
              );
            });
          }
        )
      );
    }
  );
}
