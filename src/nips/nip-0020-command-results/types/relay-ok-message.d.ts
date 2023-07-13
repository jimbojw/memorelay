/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview NIP-20 Command Results message types.
 */

/**
 * ["OK", <event_id>, <true|false>, <message>]
 * @see https://github.com/nostr-protocol/nips/blob/master/20.md
 */
export type RelayOKMessage = ['OK', string, boolean, string];
