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
import { DidAddEventToDatabaseEvent } from '../../nip-0001-basic-protocol/events/did-add-event-to-database-event';
import { OutgoingGenericMessageEvent } from '../../nip-0001-basic-protocol/events/outgoing-generic-message-event';
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
