/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether a message conforms to Nostr relay NOTICE message
 * syntax.
 */
import { GenericMessage } from '../types/generic-message';
import { RelayNoticeMessage } from '../types/relay-notice-message';
/**
 * Given a message, check whether it conforms to the outgoing relay NOTICE
 * message type.
 * @param maybeRelayNoticeMessage Potential RelayNoticeMessage to check.
 * @returns The same message, but cast as RelayNoticeMessage.
 * @throws BadMessageError if the message is malformed.
 */
export declare function checkRelayNoticeMessage(maybeRelayNoticeMessage: GenericMessage): RelayNoticeMessage;
