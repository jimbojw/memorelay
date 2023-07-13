/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for broadcasting an incoming EVENT
 * message from one client to others.
 */
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { Disconnectable } from '../../../core/types/disconnectable';
/**
 * Memorelay plugin for broadcasting incoming EVENT messages from one client to
 * all other connected clients.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export declare function broadcastIncomingEventMessages(hub: MemorelayHub): Disconnectable;
