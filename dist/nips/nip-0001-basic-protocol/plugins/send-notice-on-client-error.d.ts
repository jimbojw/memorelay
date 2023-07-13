/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin for sending a NOTICE message to a client in response to
 * a BadMessageError emitted elsewhere.
 */
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { Disconnectable } from '../../../core/types/disconnectable';
/**
 * Memorelay plugin which responds to ClientErrors (such as BadMessageErrors)
 * emitted elsewhere by issuing a NOTICE message to the client which produced
 * the error.
 * @param hub Event hub for inter-component communication.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export declare function sendNoticeOnClientError(hub: MemorelayHub): Disconnectable;
