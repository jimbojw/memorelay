/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function for signing an event.
 */
import { Event as NostrEvent, UnsignedEvent } from 'nostr-tools';
/**
 * Given an unsigned event, compute and set its `id` and `sig` fields and return
 * the object.
 * @param unsignedEvent The event to sign.
 * @param secretKey The secret key to sign with.
 * @returns The same event, but signed.
 */
export declare function signEvent(unsignedEvent: UnsignedEvent, secretKey: string): NostrEvent;
