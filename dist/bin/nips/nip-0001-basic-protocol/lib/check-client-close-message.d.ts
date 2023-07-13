/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a message conforms to Nostr CLOSE message syntax.
 */
import { GenericMessage } from '../types/generic-message';
import { ClientCloseMessage } from '../types/client-close-message';
/**
 * Given an incoming message, check whether it conforms to the Nostr CLOSE
 * message type.
 * @param maybeCloseMessage Potential ClientCloseMessage to check.
 * @returns The same incoming message, but cast as ClientCloseMessage.
 * @throws BadMessageError if the incoming message is malformed.
 */
export declare function checkClientCloseMessage(maybeCloseMessage: GenericMessage): ClientCloseMessage;
