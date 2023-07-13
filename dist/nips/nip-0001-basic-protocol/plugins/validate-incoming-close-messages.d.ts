/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for validating incoming generic Nostr
 * messages of type 'CLOSE'.
 */
import { BasicEventEmitter } from '../../../core/lib/basic-event-emitter';
import { Disconnectable } from '../../../core/types/disconnectable';
/**
 * Memorelay core plugin for validating incoming, generic Nostr messages of type
 * 'CLOSE'. Incoming generic messages of any other type are ignored.
 * @param hub Event hub for inter-component communication.
 * @event IncomingCloseMessageEvent When a generic message is an CLOSE message.
 * @event BadMessageError When a CLOSE message is malformed.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export declare function validateIncomingCloseMessages(hub: BasicEventEmitter): Disconnectable;
