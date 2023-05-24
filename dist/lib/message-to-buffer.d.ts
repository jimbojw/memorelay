/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Serialize a Nostr message to send as a Buffer.
 */
/// <reference types="node" />
import { ClientMessage, RelayMessage } from './message-types';
export declare function messageToBuffer(message: ClientMessage | RelayMessage): Buffer;
