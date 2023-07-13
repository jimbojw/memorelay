/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Parse an incoming Buffer as a generic Nostr message.
 */
/// <reference types="node" />
import { GenericMessage } from '../types/generic-message';
/**
 * Parse a payload data buffer as a generic message.
 * @param payloadRawData Buffer of raw data, typically from a WebSocket.
 * @returns Parsed generic message.
 * @throws BadMessageError if the payload is unparseable or fails to conform to
 * the structure of a Nostr message.
 */
export declare function bufferToGenericMessage(payloadRawData: Buffer): GenericMessage;
