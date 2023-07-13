/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a message conforms to Nostr relay EVENT message
 * syntax.
 */

import {
  Event as NostrEvent,
  validateEvent,
  verifySignature,
} from 'nostr-tools';

import { BadMessageError } from '../errors/bad-message-error';
import { GenericMessage } from '../types/generic-message';
import { RelayEventMessage } from '../types/relay-event-message';
import { checkSubscriptionId } from './check-subscription-id';

/**
 * Given a message, check whether it conforms to the outgoing relay EVENT
 * message type.
 * @param maybeRelayEventMessage Potential RelayEventMessage to check.
 * @returns The same message, but cast as RelayEventMessage.
 * @throws BadMessageError if the message is malformed.
 */
export function checkRelayEventMessage(
  maybeRelayEventMessage: GenericMessage
): RelayEventMessage {
  if (maybeRelayEventMessage.length < 2) {
    throw new BadMessageError('subscription id missing');
  }

  checkSubscriptionId(maybeRelayEventMessage[1]);

  if (maybeRelayEventMessage.length < 3) {
    throw new BadMessageError('event missing');
  }

  if (maybeRelayEventMessage.length > 3) {
    throw new BadMessageError('extra elements detected');
  }

  const payloadEvent = maybeRelayEventMessage[2] as NostrEvent;

  if (!validateEvent(payloadEvent)) {
    throw new BadMessageError('event invalid');
  }

  if (!payloadEvent.sig) {
    throw new BadMessageError('event signature missing');
  }

  if (!verifySignature(payloadEvent)) {
    throw new BadMessageError('bad signature');
  }

  return maybeRelayEventMessage as RelayEventMessage;
}
