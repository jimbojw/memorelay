/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Parse an incoming Buffer as a generic Nostr message.
 */

import { BadMessageError } from '../errors/bad-message-error';
import { GenericMessage } from '../types/message-types';
import { checkGenericMessage } from './check-generic-message';

/**
 * Parse a payload data buffer as a generic message.
 * @param payloadRawData Buffer of raw data, typically from a WebSocket.
 * @returns Parsed generic message.
 * @throws BadMessageError if the payload is unparseable or fails to conform to
 * the structure of a Nostr message.
 */
export function bufferToGenericMessage(payloadRawData: Buffer): GenericMessage {
  const payloadString = payloadRawData.toString('utf-8');

  let payloadJson: unknown;
  try {
    payloadJson = JSON.parse(payloadString);
  } catch (err) {
    throw new BadMessageError('unparseable message');
  }

  return checkGenericMessage(payloadJson);
}
