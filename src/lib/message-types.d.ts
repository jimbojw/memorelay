/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Nostr message types.
 */

import { Event as NostrEvent } from 'nostr-tools';
import { Filter } from 'nostr-tools';

export type GenericMessage = [string, ...unknown[]];

// @see https://github.com/nostr-protocol/nips/blob/master/01.md
export type EventMessage = ['EVENT', NostrEvent];
export type ReqMessage = ['REQ', string, ...Filter[]];
export type CloseMessage = ['CLOSE', string];
export type EOSEMessage = ['EOSE', string];
export type NoticeMessage = ['NOTICE', string];
export type RelayEventMessage = ['EVENT', string, NostrEvent];

// @see https://github.com/nostr-protocol/nips/blob/master/20.md
export type OKMessage = ['OK', string, boolean, string];

/**
 * A message that a client might send to a relay.
 */
export type ClientMessage = EventMessage | ReqMessage | CloseMessage;

/**
 * A message that a relay might send to a client.
 */
export type RelayMessage =
  | RelayEventMessage
  | EOSEMessage
  | NoticeMessage
  | OKMessage;
