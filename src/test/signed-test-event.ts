/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Create a signed event for testing.
 */

import {
  Kind,
  UnsignedEvent,
  generatePrivateKey,
  getPublicKey,
} from 'nostr-tools';
import { signEvent } from '../nips/nip-0001-basic-protocol/lib/sign-event';

interface ExtendedUnsignedEvent extends UnsignedEvent {
  kind: number;
}

export function createSignedTestEvent(
  templateEvent: Partial<ExtendedUnsignedEvent>,
  secretKey = generatePrivateKey()
) {
  const pubkey = getPublicKey(secretKey);
  return signEvent(
    Object.assign(
      {
        kind: Kind.Text,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: 'SIMPLE TEXT EVENT',
        pubkey,
      },
      templateEvent
    ),
    secretKey
  );
}
