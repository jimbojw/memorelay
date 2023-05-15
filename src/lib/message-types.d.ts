/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Nostr message types.
 */

import { Event as NostrEvent } from 'nostr-tools';
import { Filter } from 'nostr-tools';

export type EventMessage = ['EVENT', NostrEvent];
export type ReqMessage = ['REQ', string, ...Filter[]];
export type CloseMessage = ['CLOSE', string];
export type ClientMessage = EventMessage | ReqMessage | CloseMessage;
