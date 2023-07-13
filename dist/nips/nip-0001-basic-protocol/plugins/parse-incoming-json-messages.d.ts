/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for parsing incoming WebSocket message
 * payloads as generic JSON client messages.
 */
import { BasicEventEmitter } from '../../../core/lib/basic-event-emitter';
import { Disconnectable } from '../../../core/types/disconnectable';
/**
 * Memorelay plugin for parsing incoming WebSocket 'message' payload buffers as
 * JSON-encoded generic Nostr messages.
 *
 * A generic Nostr message is an array whose first element is a string
 * indicating which kind of message it is.  Remaining array elements depend on
 * the type of message and other factors.
 * @param hub Event hub for inter-component communication.
 * @event IncomingGenericMessageEvent When a payload buffer could be parsed.
 * @event BadMessageError When a message payload buffer could not be parsed.
 * @returns Handler for disconnection.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export declare function parseIncomingJsonMessages(hub: BasicEventEmitter): Disconnectable;
