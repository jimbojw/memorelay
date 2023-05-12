/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function to verify a Nostr event.
 */

import {
  Event as NostrEvent,
  validateEvent,
  verifySignature,
} from 'nostr-tools';

/**
 * Error thrown when a Nostr event is determined to be invalid or failed
 * verification.
 */
export class BadEventError extends Error {}

/**
 * Verify that an object is a valid Nostr event and has a verified signature.
 * @throws BadEventError if any checks fail.
 */
export function verifyEvent(event: NostrEvent) {
  if (!validateEvent(event)) {
    throw new BadEventError('event invalid');
  }
  if (!event.sig) {
    throw new BadEventError('event signature missing');
  }
  if (!verifySignature(event)) {
    throw new BadEventError('bad signature');
  }
}
