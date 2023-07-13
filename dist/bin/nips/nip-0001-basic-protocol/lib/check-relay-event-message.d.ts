/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a message conforms to Nostr relay EVENT message
 * syntax.
 */
import { GenericMessage } from '../types/generic-message';
import { RelayEventMessage } from '../types/relay-event-message';
/**
 * Given a message, check whether it conforms to the outgoing relay EVENT
 * message type.
 * @param maybeRelayEventMessage Potential RelayEventMessage to check.
 * @returns The same message, but cast as RelayEventMessage.
 * @throws BadMessageError if the message is malformed.
 */
export declare function checkRelayEventMessage(maybeRelayEventMessage: GenericMessage): RelayEventMessage;
