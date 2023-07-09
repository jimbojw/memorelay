/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Nostr message types.
 */

import { Event as NostrEvent } from 'nostr-tools';
import { Filter } from 'nostr-tools';

export type GenericMessage = [string, ...unknown[]];

export type ClientEventMessage = ['EVENT', NostrEvent];
export type ClientReqMessage = ['REQ', string, ...Filter[]];
export type ClientCloseMessage = ['CLOSE', string];

/**
 * A message that a client might send to a relay.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export type ClientMessage =
  | ClientEventMessage
  | ClientReqMessage
  | ClientCloseMessage;

export type RelayEOSEMessage = ['EOSE', string];
export type RelayNoticeMessage = ['NOTICE', string];
export type RelayEventMessage = ['EVENT', string, NostrEvent];

/**
 * A message that a relay might send to a client.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export type RelayMessage =
  | RelayEOSEMessage
  | RelayNoticeMessage
  | RelayEventMessage;
