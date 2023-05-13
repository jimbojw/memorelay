/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Parse an incoming Buffer as a Nostr message.
 */

import {
  Event as NostrEvent,
  validateEvent,
  verifySignature,
} from 'nostr-tools';
import { BadMessageError } from './bad-message-error';
import { verifyFilter } from './verify-filters';

import { Filter } from 'nostr-tools';

export type EventMessage = ['EVENT', NostrEvent];
export type ReqMessage = ['REQ', string, ...Filter[]];
export type CloseMessage = ['CLOSE', string];
export type ClientMessage = EventMessage | ReqMessage | CloseMessage;

/**
 * Check whether the subscription id is valid.
 * @param subscriptionId Possibly valid subscription id.
 */
export function checkSubscriptionId(subscriptionId: unknown) {
  if (subscriptionId === undefined) {
    throw new BadMessageError('subscription id missing');
  }

  if (typeof subscriptionId !== 'string') {
    throw new BadMessageError('subscription id is not a string');
  }

  if (!subscriptionId) {
    throw new BadMessageError('subscription id is empty');
  }

  if (subscriptionId.length > 64) {
    throw new BadMessageError('subscription id is too long');
  }
}

/**
 * Parse a payload data buffer as a ClientMessage.
 * @param payloadRawData The incoming Buffer data.
 * @returns A parsed, valid ClientMessage.
 */
export function bufferToMessage(payloadRawData: Buffer): ClientMessage {
  const payloadString = payloadRawData.toString('utf-8');

  let payloadJson: unknown;
  try {
    payloadJson = JSON.parse(payloadString);
  } catch (err) {
    throw new BadMessageError('unparseable message');
  }

  if (!Array.isArray(payloadJson)) {
    throw new BadMessageError('message was not an array');
  }

  if (!payloadJson.length) {
    throw new BadMessageError('message type missing');
  }

  const eventType: unknown = payloadJson[0];

  if (typeof eventType !== 'string') {
    throw new BadMessageError('message type was not a string');
  }

  if (eventType === 'EVENT') {
    if (payloadJson.length < 2) {
      throw new BadMessageError('event missing');
    }

    if (payloadJson.length > 2) {
      throw new BadMessageError('extra elements detected');
    }

    const payloadEvent = payloadJson[1] as NostrEvent;

    if (!validateEvent(payloadEvent)) {
      throw new BadMessageError('event invalid');
    }

    if (!payloadEvent.sig) {
      throw new BadMessageError('event signature missing');
    }

    if (!verifySignature(payloadEvent)) {
      throw new BadMessageError('bad signature');
    }

    return payloadJson as EventMessage;
  }

  if (eventType === 'REQ') {
    checkSubscriptionId(payloadJson[1]);

    try {
      for (let i = 2; i < payloadJson.length; i++) {
        verifyFilter(payloadJson[i]);
      }
    } catch (err) {
      throw new BadMessageError((err as Error).message);
    }

    return payloadJson as ReqMessage;
  }

  if (eventType === 'CLOSE') {
    checkSubscriptionId(payloadJson[1]);

    if (payloadJson.length > 2) {
      throw new BadMessageError('extra elements detected');
    }

    return payloadJson as CloseMessage;
  }

  throw new BadMessageError('unrecognized event type');
}
