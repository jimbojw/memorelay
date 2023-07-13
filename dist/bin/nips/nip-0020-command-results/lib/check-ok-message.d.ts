/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether an incoming OK message is valid.
 */
import { RelayOKMessage } from '../types/relay-ok-message';
/**
 * Check whether a generic Nostr message meets the NIP-20 criteria for an OK
 * Command Results message.
 * @param genericMessage Generic message with 'OK' message type.
 * @returns The same incoming generic message, cast as a RelayOKMessage.
 * @throws BadMessageError if the OK message is malformed.
 */
export declare function checkOKMessage(genericMessage: ['OK', ...unknown[]]): RelayOKMessage;
