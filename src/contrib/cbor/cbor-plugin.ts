/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview EXPERIMENTAL - Memorelay plugin to implement CBOR.
 */

import { decode, encode } from 'cborg';

import { MemorelayClientCreatedEvent } from '../../core/events/memorelay-client-created-event';
import { IncomingGenericMessageEvent } from '../../nips/nip-0001-basic-protocol/events/incoming-generic-message-event';
import { WebSocketMessageEvent } from '../../core/events/web-socket-message-event';
import { GenericMessage } from '../../nips/nip-0001-basic-protocol/types/generic-message';
import { BadMessageError } from '../../nips/nip-0001-basic-protocol/errors/bad-message-error';
import { OutgoingGenericMessageEvent } from '../../nips/nip-0001-basic-protocol/events/outgoing-generic-message-event';
import { OutgoingNoticeMessageEvent } from '../../nips/nip-0001-basic-protocol/events/outgoing-notice-message-event';
import { checkGenericMessage } from '../../nips/nip-0001-basic-protocol/lib/check-generic-message';
import { CborDecodingErrorEvent } from './events/cbor-decoding-error-event';
import { BadMessageErrorEvent } from '../../nips/nip-0001-basic-protocol/events/bad-message-error-event';
import { CborEncodingErrorEvent } from './events/cbor-encoding-error-event';
import { WebSocketSendEvent } from '../../core/events/web-socket-send-event';
import { MemorelayHub } from '../../core/lib/memorelay-hub';

/**
 * Plugin setup function. Establishes listeners on a Memorelay instance.
 * @param hub The Memorelay instance to connect to.
 */
export function cborPlugin(hub: MemorelayHub) {
  return hub.onEvent(
    MemorelayClientCreatedEvent,
    handleMemorelayClientCreatedEvent
  );
}

/**
 * Internal function to wrap a MemorelayClient with CBOR functionality.
 * @param memorelayClient The connected MemorelayClient to wrap.
 */
function handleMemorelayClientCreatedEvent({
  details: { memorelayClient },
}: MemorelayClientCreatedEvent) {
  let isCborEnabled = false;

  memorelayClient.onEvent(WebSocketMessageEvent, handleWebSocketMessage);
  memorelayClient.onEvent(IncomingGenericMessageEvent, handleIncomingMessage);
  memorelayClient.onEvent(OutgoingGenericMessageEvent, handleOutgoingMessage);

  /**
   * When the MemorelayClient's underlying WebSocket emits a 'message' event,
   * attempt to decode it as a CBOR message body, but only if:
   *
   * - The client has already indicated that it supports CBOR.
   * - The event has not had its preventDefault() method called.
   * - The message has been flagged as containing binary data.
   *
   * If all these conditions apply:
   *
   * - The message will be decoded as CBOR.
   * - The payload will be checked for generic Nostr message format.
   * - If correctly formatted, a MemorelayClientMessageEvent will be emitted.
   * - If not, a 'cbor-decoding-error' will be emitted.
   *
   * @event 'cbor-decoding-error' If decoding fails.
   */
  function handleWebSocketMessage(
    webSocketMessageEvent: WebSocketMessageEvent
  ) {
    if (!isCborEnabled) {
      return; // Only handle WebSocket messages if client has enabled CBOR.
    }

    if (webSocketMessageEvent.defaultPrevented) {
      return; // Some other plugin must have already handled this.
    }

    if (!webSocketMessageEvent.details.isBinary) {
      return; // Though the client supports CBOR, the event was not binary.
    }

    const { data } = webSocketMessageEvent.details;
    const combinedBuffer = Array.isArray(data) ? Buffer.concat(data) : data;
    const dataArray = new Uint8Array(combinedBuffer);

    let payloadObject: unknown = undefined;
    try {
      payloadObject = decode(dataArray) as unknown;
    } catch (error) {
      // Failed to decode CBOR payload. This could be a legitimate error in
      // the CBOR encoding, or it could be that despite the client supporting
      // CBOR, and the fact that the WebSocket raw message was flagged as
      // binary, this is not an actual CBOR message, but rather some other
      // kind of encoded message.
      //
      // Since we can't tell, the thing to do is abort here and let the rest
      // of the system continue processing. But for posterity, emit a custom
      // error to indicate the problem. This way, some other handler can log
      // it, optionally, for investigative purposes.
      queueMicrotask(() => {
        memorelayClient.emitEvent(
          new CborDecodingErrorEvent(
            { error },
            {
              targetEmitter: memorelayClient,
              parentEvent: webSocketMessageEvent,
            }
          )
        );
      });
      return;
    }

    try {
      // This will either return the payloadObject or throw a BadMessageError.
      const genericMessage = checkGenericMessage(payloadObject);

      // Now that we have a CBOR-decoded ClientMessage, we call
      // preventDefault() to signal that this event has been handled.  This
      // will stop the default MemorelayClient handler from attempting to
      // parse the buffer as utf-8 JSON.
      webSocketMessageEvent.preventDefault();

      // Emit an IncomingGenericMessageEvent with the CBOR-decoded client
      // message.
      queueMicrotask(() => {
        memorelayClient.emitEvent(
          new IncomingGenericMessageEvent(
            { genericMessage },
            {
              parentEvent: webSocketMessageEvent,
              targetEmitter: memorelayClient,
            }
          )
        );
      });
    } catch (error) {
      if (!(error instanceof BadMessageError)) {
        throw error; // Unexpected error type. Fail loud.
      }
      const badMessageError = error;
      queueMicrotask(() => {
        memorelayClient.emitEvent(
          new BadMessageErrorEvent(
            { badMessageError },
            {
              parentEvent: webSocketMessageEvent,
              targetEmitter: memorelayClient,
            }
          )
        );
      });
    }
  }

  /**
   * To signal that it supports CBOR, a client must send a special new kind of
   * message: ["UPGRADE", "CBOR"]. This method listens for these UPGRADE
   * messages, and in response to one, it will send back a NOTICE message
   * indicating that future messages will be CBOR encoded.
   * @event OutgoingMessageEvent NOTICE if CBOR upgrade was received.
   */
  function handleIncomingMessage(
    incomingGenericMessageEvent: IncomingGenericMessageEvent
  ) {
    const genericMessage: GenericMessage =
      incomingGenericMessageEvent.details.genericMessage;

    if (genericMessage[0] !== 'UPGRADE') {
      return; // Not an UPGRADE message. Ignore.
    }

    if (genericMessage[1] !== 'CBOR') {
      return; // UPGRADE message is for something other than CBOR.
    }

    // Signal that this message event has been handled.
    incomingGenericMessageEvent.preventDefault();

    // Client has signaled support for CBOR.
    isCborEnabled = true;

    queueMicrotask(() => {
      // Emit a NOTICE to inform the client.
      memorelayClient.emitEvent(
        new OutgoingNoticeMessageEvent(
          {
            relayNoticeMessage: ['NOTICE', 'CBOR enabled'],
          },
          {
            parentEvent: incomingGenericMessageEvent,
            targetEmitter: memorelayClient,
          }
        )
      );
    });
  }

  /**
   * If the client has signaled CBOR support, handle outgoing messages by
   * encoding them as CBOR and pushing them to the client's WebSocket.
   * @event 'cbor-encoding-error' Emits on client if encoding fails.
   */
  function handleOutgoingMessage(
    outgoingMessageEvent: OutgoingGenericMessageEvent
  ) {
    if (!isCborEnabled) {
      return; // Only handle outgoing messages if client has enabled CBOR.
    }

    if (outgoingMessageEvent.defaultPrevented) {
      return; // Some other plugin must have already handled this.
    }

    // Attempt to CBOR encode the message.
    const { buffer, error } = attemptEncode(
      outgoingMessageEvent.details.genericMessage
    );

    if (buffer) {
      // Signal that this event has been handled.
      outgoingMessageEvent.preventDefault();

      queueMicrotask(() => {
        memorelayClient.emitEvent(
          new WebSocketSendEvent(
            { buffer },
            {
              parentEvent: outgoingMessageEvent,
              targetEmitter: memorelayClient,
            }
          )
        );
      });
    } else {
      queueMicrotask(() => {
        memorelayClient.emitEvent(
          new CborEncodingErrorEvent(
            { error },
            {
              parentEvent: outgoingMessageEvent,
              targetEmitter: memorelayClient,
            }
          )
        );
      });
    }
  }
}

/**
 * Attempt to CBOR-encode a specified generic message.
 * @param genericMessage The message to encode.
 * @returns Object containing either the buffer or error thrown.
 */
function attemptEncode(genericMessage: GenericMessage) {
  try {
    const dataArray = encode(genericMessage);
    return { buffer: dataArray.buffer as Buffer, error: undefined };
  } catch (error) {
    return { buffer: undefined, error: error as Error };
  }
}
