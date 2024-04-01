/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether an incoming OK message is valid.
 */

import { BadMessageError } from '../errors/bad-message-error';
import { RelayOKMessage } from '../types/relay-ok-message';

/**
 * Check whether a generic Nostr message meets the criteria for an OK Command
 * Results message.
 * @param genericMessage Generic message with 'OK' message type.
 * @returns The same incoming generic message, cast as a RelayOKMessage.
 * @throws BadMessageError if the OK message is malformed.
 */
export function checkOKMessage(
  genericMessage: ['OK', ...unknown[]]
): RelayOKMessage {
  if (genericMessage.length < 2) {
    throw new BadMessageError('event id missing');
  }

  const eventId = genericMessage[1] as string;
  if (typeof eventId !== 'string') {
    throw new BadMessageError('event id type mismatch');
  }

  if (eventId.length !== 64) {
    throw new BadMessageError('event id malformed');
  }

  if (genericMessage.length < 3) {
    throw new BadMessageError('status missing');
  }

  const status = genericMessage[2] as boolean;
  if (typeof status !== 'boolean') {
    throw new BadMessageError('status type mismatch');
  }

  if (genericMessage.length < 4) {
    throw new BadMessageError('description missing');
  }

  const description = genericMessage[3] as string;
  if (typeof description !== 'string') {
    throw new BadMessageError('description type mismatch');
  }

  if (description.length) {
    const colonIndex = description.indexOf(':');
    if (colonIndex < 1) {
      throw new BadMessageError('reason missing');
    }

    const reason = description.substring(0, colonIndex).trim();
    if (!reason.length) {
      throw new BadMessageError('reason missing');
    }

    if (reason !== 'duplicate' && reason !== 'deleted') {
      throw new BadMessageError(`unrecognized reason: ${reason}`);
    }
  }

  if (genericMessage.length > 4) {
    throw new BadMessageError('extra elements detected');
  }

  return genericMessage as RelayOKMessage;
}
