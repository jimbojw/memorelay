/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether an object conforms to Nostr message structure.
 */
import { GenericMessage } from '../types/generic-message';
/**
 * Check whether an unknown object conforms to the basic Nostr structure of a
 * message. If the object does not conform, this function throws a
 * BatMessageError to indicate in what way it failed.
 * @param object The object to check.
 * @returns The tested object, cast as a GenericMessage.
 * @throws BadMessageError if the object is not a message.
 */
export declare function checkGenericMessage(maybeMessage: unknown): GenericMessage;
