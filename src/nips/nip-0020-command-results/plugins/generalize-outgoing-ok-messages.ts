/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Generalize outgoing OK messages as generic.
 */

import { MemorelayClient } from '../../../core/lib/memorelay-client';
import { Disconnectable } from '../../../core/types/disconnectable';
import { OutgoingGenericMessageEvent } from '../../nip-0001-basic-protocol/events/outgoing-generic-message-event';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';

/**
 * After an OutgoingOKMessage, emit an OutgoingGeneralMessageEvent.
 * @param memorelayClient The client to plug into.
 * @returns Handler.
 * @emits OutgoingGeneralMessageEvent
 */
export function generalizeOutgoingOKMessage(
  memorelayClient: MemorelayClient
): Disconnectable {
  return memorelayClient.onEvent(
    OutgoingOKMessageEvent,
    (outgoingGenericMessageEvent: OutgoingOKMessageEvent) => {
      if (outgoingGenericMessageEvent.defaultPrevented) {
        return; // Preempted by another listener.
      }
      queueMicrotask(() => {
        memorelayClient.emitEvent(
          new OutgoingGenericMessageEvent(
            {
              genericMessage: outgoingGenericMessageEvent.details.okMessage,
            },
            {
              parentEvent: outgoingGenericMessageEvent,
              targetEmitter: memorelayClient,
            }
          )
        );
      });
    }
  );
}
