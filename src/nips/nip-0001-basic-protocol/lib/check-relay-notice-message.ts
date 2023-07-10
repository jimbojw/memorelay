/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a message conforms to Nostr relay NOTICE message
 * syntax.
 */

import { BadMessageError } from '../errors/bad-message-error';
import { GenericMessage, RelayNoticeMessage } from '../types/message-types';

/**
 * Given a message, check whether it conforms to the outgoing relay NOTICE
 * message type.
 * @param maybeRelayNoticeMessage Potential RelayNoticeMessage to check.
 * @returns The same message, but cast as RelayNoticeMessage.
 * @throws BadMessageError if the message is malformed.
 */
export function checkRelayNoticeMessage(
  maybeRelayNoticeMessage: GenericMessage
): RelayNoticeMessage {
  if (maybeRelayNoticeMessage.length < 2) {
    throw new BadMessageError('notice message missing');
  }

  if (typeof maybeRelayNoticeMessage[1] !== 'string') {
    throw new BadMessageError('notice message type mismatch');
  }

  if (maybeRelayNoticeMessage.length > 2) {
    throw new BadMessageError('extra elements detected');
  }

  return maybeRelayNoticeMessage as RelayNoticeMessage;
}
