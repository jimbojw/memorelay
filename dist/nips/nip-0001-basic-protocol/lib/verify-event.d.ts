/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function to verify a Nostr event.
 */
import { Event as NostrEvent } from 'nostr-tools';
/**
 * Verify that an object is a valid Nostr event and has a verified signature.
 * @throws BadEventError if any checks fail.
 */
export declare function verifyEvent(event: NostrEvent): void;
