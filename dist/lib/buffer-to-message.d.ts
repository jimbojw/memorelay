/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Parse an incoming Buffer as a Nostr message.
 */
/// <reference types="node" />
import { ClientMessage } from './message-types';
/**
 * Check whether the subscription id is valid.
 * @param subscriptionId Possibly valid subscription id.
 */
export declare function checkSubscriptionId(subscriptionId: unknown): void;
/**
 * Parse a payload data buffer as a ClientMessage.
 * @param payloadRawData The incoming Buffer data.
 * @returns A parsed, valid ClientMessage.
 */
export declare function bufferToMessage(payloadRawData: Buffer): ClientMessage;
