/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview An EVENT message originating from a connected client.
 */

import { Event as NostrEvent } from 'nostr-tools';

export type ClientEventMessage = ['EVENT', NostrEvent];
