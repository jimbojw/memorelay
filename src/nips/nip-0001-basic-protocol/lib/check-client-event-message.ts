/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a Nostr message conforms to the incoming client
 * EVENT message type.
 */

import {
  Event as NostrEvent,
  validateEvent,
  verifySignature,
} from 'nostr-tools';

import { BadMessageError } from '../errors/bad-message-error';
import { ClientEventMessage, GenericMessage } from '../types/message-types';

/**
 * Given a Nostr message, check whether it conforms to the EVENT message type.
 * @param maybeEventMessage Potential EventMessage to check.
 * @returns The same incoming message, but cast as ClientEventMessage.
 * @throws BadMessageError if the incoming message is malformed.
 */
export function checkClientEventMessage(
  maybeEventMessage: GenericMessage
): ClientEventMessage {
  if (maybeEventMessage[0] !== 'EVENT') {
    throw new BadMessageError('wrong message type');
  }

  if (maybeEventMessage.length < 2) {
    throw new BadMessageError('event missing');
  }

  if (maybeEventMessage.length > 2) {
    throw new BadMessageError('extra elements detected');
  }

  const payloadEvent = maybeEventMessage[1] as NostrEvent;

  if (!validateEvent(payloadEvent)) {
    throw new BadMessageError('event invalid');
  }

  if (!payloadEvent.sig) {
    throw new BadMessageError('event signature missing');
  }

  if (!verifySignature(payloadEvent)) {
    throw new BadMessageError('bad signature');
  }

  return maybeEventMessage as ClientEventMessage;
}
