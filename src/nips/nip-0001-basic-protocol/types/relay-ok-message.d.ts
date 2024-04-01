/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview NIP-01 Command Results message types.
 */

/**
 * ["OK", <event_id>, <true|false>, <message>]
 */
export type RelayOKMessage = ['OK', string, boolean, string];
