/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether an incoming client REQ message is valid.
 */

import { BadMessageError } from '../errors/bad-message-error';
import { ClientReqMessage, GenericMessage } from '../types/message-types';
import { checkSubscriptionId } from './check-subscription-id';
import { verifyFilter } from './verify-filters';

/**
 * Given a GenericMessage, check whether it conforms to the REQ message type.
 * @param maybeClientReqMessage Potential ClientReqMessage to check.
 * @returns The same message, but cast as ClientReqMessage.
 * @throws BadMessageError if the incoming message is malformed.
 */
export function checkClientReqMessage(
  maybeClientReqMessage: GenericMessage
): ClientReqMessage {
  if (maybeClientReqMessage[0] !== 'REQ') {
    throw new BadMessageError('wrong message type');
  }

  checkSubscriptionId(maybeClientReqMessage[1]);

  try {
    for (let i = 2; i < maybeClientReqMessage.length; i++) {
      verifyFilter(maybeClientReqMessage[i]);
    }
  } catch (err) {
    throw new BadMessageError((err as Error).message);
  }

  return maybeClientReqMessage as ClientReqMessage;
}
