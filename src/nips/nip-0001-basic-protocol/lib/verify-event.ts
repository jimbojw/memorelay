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
import { BadEventError } from '../errors/bad-event-error';

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
