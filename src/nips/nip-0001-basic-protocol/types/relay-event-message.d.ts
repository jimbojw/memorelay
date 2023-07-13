/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview An EVENT message originating from the relay.
 */

import { Event as NostrEvent } from 'nostr-tools';

export type RelayEventMessage = ['EVENT', string, NostrEvent];
