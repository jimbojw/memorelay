/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin/handler for responding to requests for the
 * information document.
 */
import { Disconnectable } from '../../../core/types/disconnectable';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
/**
 * Memorelay plugin for responding to requests for the relay information
 * document.
 * @param hub Memorelay hub instance for which HTTP requests for relay
 * information documents are to be handled.
 * @event RelayInformationDocumentEvent For Memorelay plugins to make changes to
 * the outgoing document.
 * @see https://github.com/nostr-protocol/nips/blob/master/11.md
 */
export declare function relayInformationDocument(hub: MemorelayHub): Disconnectable;
