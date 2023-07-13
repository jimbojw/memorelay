/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for rejecting incoming messages.
 */
import { BasicEventEmitter } from '../../../core/lib/basic-event-emitter';
import { Disconnectable } from '../../../core/types/disconnectable';
/**
 * Memorelay plugin which rejects any incoming message by emitting a
 * BadMessageError.
 *
 * This plugin is intended to follow other plugins which identify message types
 * and emit specific incoming events. Note: order is important. If this plugin
 * is incorrectly connected before a plugin that intends to implement an event
 * type, the later will already see defaultPrevented, and a BadMessageError will
 * already be outbound.
 * @param hub Event hub for inter-component communication.
 * @event BadMessageError When an incoming generic message is unrecognized.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export declare function rejectUnrecognizedIncomingMessages(hub: BasicEventEmitter): Disconnectable;
