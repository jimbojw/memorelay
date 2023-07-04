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
import { BadMessageError } from '../experimental/errors/bad-message-error';
import { verifyFilter } from './verify-filters';

import {
  ClientMessage,
  EventMessage,
  ReqMessage,
  CloseMessage,
  EOSEMessage,
  NoticeMessage,
  OKMessage,
  RelayMessage,
  GenericMessage,
  RelayEventMessage,
} from './message-types';

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
 * Parse a payload data buffer as a generic message.
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

/**
 * Parse a payload data buffer as a ClientMessage.
 * @param payloadRawData The incoming Buffer data.
 * @returns A parsed, valid ClientMessage.
 */
export function bufferToClientMessage(payloadRawData: Buffer): ClientMessage {
  const genericMessage = bufferToGenericMessage(payloadRawData);
  const eventType: unknown = genericMessage[0];

  if (eventType === 'EVENT') {
    return checkEventMessage(genericMessage);
  }

  if (eventType === 'REQ') {
    return checkReqMessage(genericMessage);
  }

  if (eventType === 'CLOSE') {
    return checkCloseMessage(genericMessage);
  }

  throw new BadMessageError('unrecognized event type');
}

/**
 * Given a GenericMessage, check whether it conforms to the EVENT message type.
 * @param genericMessage Potential EventMessage to check.
 * @returns The same incoming genericMessage, but cast as EventMessage.
 * @throws BadMessageError if the incoming genericMessage is malformed.
 */
export function checkEventMessage(
  genericMessage: GenericMessage
): EventMessage {
  if (genericMessage.length < 2) {
    throw new BadMessageError('event missing');
  }

  if (genericMessage.length > 2) {
    throw new BadMessageError('extra elements detected');
  }

  const payloadEvent = genericMessage[1] as NostrEvent;

  if (!validateEvent(payloadEvent)) {
    throw new BadMessageError('event invalid');
  }

  if (!payloadEvent.sig) {
    throw new BadMessageError('event signature missing');
  }

  if (!verifySignature(payloadEvent)) {
    throw new BadMessageError('bad signature');
  }

  return genericMessage as EventMessage;
}

/**
 * Given a GenericMessage, check whether it conforms to the REQ message type.
 * @param genericMessage Potential ReqMessage to check.
 * @returns The same incoming genericMessage, but cast as ReqMessage.
 * @throws BadMessageError if the incoming genericMessage is malformed.
 */
export function checkReqMessage(genericMessage: GenericMessage): ReqMessage {
  checkSubscriptionId(genericMessage[1]);

  try {
    for (let i = 2; i < genericMessage.length; i++) {
      verifyFilter(genericMessage[i]);
    }
  } catch (err) {
    throw new BadMessageError((err as Error).message);
  }

  return genericMessage as ReqMessage;
}

/**
 * Given a GenericMessage, check whether it conforms to the CLOSE message type.
 * @param genericMessage Potential CloseMessage to check.
 * @returns The same incoming genericMessage, but cast as CloseMessage.
 * @throws BadMessageError if the incoming genericMessage is malformed.
 */
export function checkCloseMessage(
  genericMessage: GenericMessage
): CloseMessage {
  checkSubscriptionId(genericMessage[1]);

  if (genericMessage.length > 2) {
    throw new BadMessageError('extra elements detected');
  }

  return genericMessage as CloseMessage;
}

/**
 * Parse a payload data buffer as a RelayMessage.
 * @param payloadRawData The incoming Buffer data.
 * @returns A parsed, valid RelayMessage.
 */
export function bufferToRelayMessage(payloadRawData: Buffer): RelayMessage {
  const genericMessage = bufferToGenericMessage(payloadRawData);
  const eventType: unknown = genericMessage[0];

  if (typeof eventType !== 'string') {
    throw new BadMessageError('message type was not a string');
  }

  if (eventType === 'EVENT') {
    if (genericMessage.length < 2) {
      throw new BadMessageError('subscription id missing');
    }

    checkSubscriptionId(genericMessage[1]);

    if (genericMessage.length < 3) {
      throw new BadMessageError('event missing');
    }

    if (genericMessage.length > 3) {
      throw new BadMessageError('extra elements detected');
    }

    const payloadEvent = genericMessage[2] as NostrEvent;

    if (!validateEvent(payloadEvent)) {
      throw new BadMessageError('event invalid');
    }

    if (!payloadEvent.sig) {
      throw new BadMessageError('event signature missing');
    }

    if (!verifySignature(payloadEvent)) {
      throw new BadMessageError('bad signature');
    }

    return genericMessage as RelayEventMessage;
  }

  if (eventType === 'EOSE') {
    checkSubscriptionId(genericMessage[1]);

    return genericMessage as EOSEMessage;
  }

  if (eventType === 'NOTICE') {
    if (genericMessage.length < 2) {
      throw new BadMessageError('notice message missing');
    }

    if (typeof genericMessage[1] !== 'string') {
      throw new BadMessageError('notice message type mismatch');
    }

    if (genericMessage.length > 2) {
      throw new BadMessageError('extra elements detected');
    }

    return genericMessage as NoticeMessage;
  }

  if (eventType === 'OK') {
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

    return genericMessage as OKMessage;
  }

  throw new BadMessageError('unrecognized event type');
}
