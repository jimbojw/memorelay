/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a message conforms to Nostr relay EOSE message
 * syntax.
 */

import { BadMessageError } from '../errors/bad-message-error';
import { GenericMessage, RelayEOSEMessage } from '../types/message-types';
import { checkSubscriptionId } from './check-subscription-id';

/**
 * Given an message, check whether it conforms to the outgoing relay EOSE
 * message type.
 * @param maybeRelayEOSEMessage Potential RelayEOSEMessage to check.
 * @returns The same message, but cast as RelayEOSEMessage.
 * @throws BadMessageError if the message is malformed.
 */
export function checkRelayEOSEMessage(
  maybeRelayEOSEMessage: GenericMessage
): RelayEOSEMessage {
  if (maybeRelayEOSEMessage.length < 2) {
    throw new BadMessageError('subscription id missing');
  }

  checkSubscriptionId(maybeRelayEOSEMessage[1]);

  if (maybeRelayEOSEMessage.length > 2) {
    throw new BadMessageError('extra elements detected');
  }

  return maybeRelayEOSEMessage as RelayEOSEMessage;
}
