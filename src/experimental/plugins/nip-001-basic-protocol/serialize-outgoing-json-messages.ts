/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for serializing outgoing generic messages
 * as JSON and sending to the WebSocket.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { OutgoingGenericMessageEvent } from '../../../nip-0001-basic-protocol/events/outgoing-generic-message-event';
import { Handler } from '../../types/handler';
import { MemorelayClientDisconnectEvent } from '../../../core/events/memorelay-client-disconnect-event';
import { clearHandlers } from '../../../core/lib/clear-handlers';

/**
 * Memorelay core plugin for serializing generic, outgoing Nostr messages as
 * JSON and sending them to the WebSocket.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export function serializeOutgoingJsonMessages(hub: MemorelayHub): Handler {
  return hub.onEvent(MemorelayClientCreatedEvent, handleClientCreated);

  function handleClientCreated(
    memorelayClientCreatedEvent: MemorelayClientCreatedEvent
  ) {
    const { memorelayClient } = memorelayClientCreatedEvent.details;

    const handlers: Handler[] = [];
    handlers.push(
      // Serialize and send outgoing messages to the WebSocket.
      memorelayClient.onEvent(
        OutgoingGenericMessageEvent,
        handleOutgoingGenericMessage
      ),
      // Clean up on disconnect.
      memorelayClient.onEvent(
        MemorelayClientDisconnectEvent,
        clearHandlers(handlers)
      )
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
