/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Error type for malformed Nostr EVENTs.
 */

/**
 * Error thrown when a Nostr event is determined to be invalid or failed
 * verification.
 */
export class BadEventError extends Error {}
