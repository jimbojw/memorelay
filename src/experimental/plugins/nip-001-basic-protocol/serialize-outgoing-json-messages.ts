/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for serializing outgoing generic messages
 * as JSON and sending to the WebSocket.
 */

import { MemorelayClientCreatedEvent } from '../../events/memorelay-client-created-event';
import { MemorelayHub } from '../../core/memorelay-hub';
import { OutgoingGenericMessageEvent } from '../../events/outgoing-generic-message-event';

/**
 * Memorelay core plugin for serializing generic, outgoing Nostr messages as
 * JSON and sending them to the WebSocket.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function serializeOutgoingJsonMessages(hub: MemorelayHub) {
  hub.onEvent(MemorelayClientCreatedEvent.type, handleClientCreated);

  function handleClientCreated(
    memorelayClientCreatedEvent: MemorelayClientCreatedEvent
  ) {
    const { memorelayClient } = memorelayClientCreatedEvent.details;
    memorelayClient.onEvent(
      OutgoingGenericMessageEvent.type,
      handleOutgoingGenericMessage
    );

    function handleOutgoingGenericMessage(
      outgoingGenericMessage: OutgoingGenericMessageEvent
    ) {
      if (outgoingGenericMessage.defaultPrevented) {
        return; // Preempted by another handler.
      }

      outgoingGenericMessage.preventDefault();

      // TODO(jimbo): What kinds of errors could occur that should be caught?
      const { genericMessage } = outgoingGenericMessage.details;
      const buffer = Buffer.from(JSON.stringify(genericMessage), 'utf8');
      memorelayClient.webSocket.send(buffer);
    }
  }
}
