/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a Nostr message conforms to the incoming client
 * EVENT message type.
 */
import { GenericMessage } from '../types/generic-message';
import { ClientEventMessage } from '../types/client-event-message';
/**
 * Given a Nostr message, check whether it conforms to the EVENT message type.
 * @param maybeEventMessage Potential EventMessage to check.
 * @returns The same incoming message, but cast as ClientEventMessage.
 * @throws BadMessageError if the incoming message is malformed.
 */
export declare function checkClientEventMessage(maybeEventMessage: GenericMessage): ClientEventMessage;
