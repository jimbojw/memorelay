/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a message conforms to Nostr relay EOSE message
 * syntax.
 */
import { GenericMessage } from '../types/generic-message';
import { RelayEOSEMessage } from '../types/relay-eose-message';
/**
 * Given an message, check whether it conforms to the outgoing relay EOSE
 * message type.
 * @param maybeRelayEOSEMessage Potential RelayEOSEMessage to check.
 * @returns The same message, but cast as RelayEOSEMessage.
 * @throws BadMessageError if the message is malformed.
 */
export declare function checkRelayEOSEMessage(maybeRelayEOSEMessage: GenericMessage): RelayEOSEMessage;
