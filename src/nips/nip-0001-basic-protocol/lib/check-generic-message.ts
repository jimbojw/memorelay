/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether an object conforms to Nostr message structure.
 */

import { BadMessageError } from '../errors/bad-message-error';
import { GenericMessage } from '../types/message-types';

/**
 * Check whether an unknown object conforms to the basic Nostr structure of a
 * message. If the object does not conform, this function throws a
 * BatMessageError to indicate in what way it failed.
 * @param object The object to check.
 * @returns The tested object, cast as a GenericMessage.
 * @throws BadMessageError if the object is not a message.
 */
export function checkGenericMessage(maybeMessage: unknown): GenericMessage {
  if (!Array.isArray(maybeMessage)) {
    throw new BadMessageError('message was not an array');
  }

  if (!maybeMessage.length) {
    throw new BadMessageError('message type missing');
  }

  const eventType: unknown = maybeMessage[0];

  if (typeof eventType !== 'string') {
    throw new BadMessageError('message type was not a string');
  }

  return maybeMessage as GenericMessage;
}
