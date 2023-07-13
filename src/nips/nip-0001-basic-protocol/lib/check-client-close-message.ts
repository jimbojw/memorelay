/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a message conforms to Nostr CLOSE message syntax.
 */

import { BadMessageError } from '../errors/bad-message-error';
import { GenericMessage } from '../types/generic-message';
import { ClientCloseMessage } from '../types/client-close-message';
import { checkSubscriptionId } from './check-subscription-id';

/**
 * Given an incoming message, check whether it conforms to the Nostr CLOSE
 * message type.
 * @param maybeCloseMessage Potential ClientCloseMessage to check.
 * @returns The same incoming message, but cast as ClientCloseMessage.
 * @throws BadMessageError if the incoming message is malformed.
 */
export function checkClientCloseMessage(
  maybeCloseMessage: GenericMessage
): ClientCloseMessage {
  if (maybeCloseMessage[0] !== 'CLOSE') {
    throw new BadMessageError('wrong message type');
  }

  checkSubscriptionId(maybeCloseMessage[1]);

  if (maybeCloseMessage.length > 2) {
    throw new BadMessageError('extra elements detected');
  }

  return maybeCloseMessage as ClientCloseMessage;
}
