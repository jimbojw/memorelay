/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for serializing outgoing generic messages
 * as JSON and sending to the WebSocket.
 */
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { Disconnectable } from '../../../core/types/disconnectable';
/**
 * Memorelay core plugin for serializing generic, outgoing Nostr messages as
 * JSON and sending them to the WebSocket.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export declare function serializeOutgoingJsonMessages(hub: MemorelayHub): Disconnectable;
