/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin to implement NIP-20 Command Results.
 */

import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { Disconnectable } from '../../../core/types/disconnectable';
import { DuplicateEventMessageEvent } from '../../nip-0001-basic-protocol/events/duplicate-event-message-event';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';

/**
 * After a DuplicateEventMessageEvent, send an OutgoingOKMessageEvent.
 * @param memorelayClient The client to plug into.
 * @returns Handler.
 * @emits OutgoingOKMessageEvent
 */
export function sendOKAfterDuplicate(
  memorelayClient: MemorelayClient
): Disconnectable {
  return memorelayClient.onEvent(
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
  );
}
