/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Create a signed event for testing.
 */
import { UnsignedEvent } from 'nostr-tools';
interface ExtendedUnsignedEvent extends UnsignedEvent {
    kind: number;
}
export declare function createSignedTestEvent(templateEvent: Partial<ExtendedUnsignedEvent>, secretKey?: string): import("nostr-tools").Event;
export {};
