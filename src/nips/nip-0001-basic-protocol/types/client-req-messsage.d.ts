/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A REQ message originating from a connected client.
 */

import { Filter } from 'nostr-tools';

export type ClientReqMessage = ['REQ', string, ...Filter[]];
