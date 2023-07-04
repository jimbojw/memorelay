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
export type ClientEventMessage = ['EVENT', NostrEvent];
export type ClientReqMessage = ['REQ', string, ...Filter[]];
export type ClientCloseMessage = ['CLOSE', string];
export type RelayEOSEMessage = ['EOSE', string];
export type RelayNoticeMessage = ['NOTICE', string];
export type RelayEventMessage = ['EVENT', string, NostrEvent];

// @see https://github.com/nostr-protocol/nips/blob/master/20.md
export type RelayOKMessage = ['OK', string, boolean, string];

/**
 * A message that a client might send to a relay.
 */
export type ClientMessage =
  | ClientEventMessage
  | ClientReqMessage
  | ClientCloseMessage;

/**
 * A message that a relay might send to a client.
 */
export type RelayMessage =
  | RelayEOSEMessage
  | RelayNoticeMessage
  | RelayOKMessage
  | RelayEventMessage;
