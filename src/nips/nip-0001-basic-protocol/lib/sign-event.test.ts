/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for singEvent() utility function.
 */

import {
  Kind,
  UnsignedEvent,
  generatePrivateKey,
  getPublicKey,
} from 'nostr-tools';
import { signEvent } from './sign-event';
import { verifyEvent } from './verify-event';

describe('signEvent', () => {
  it('should be a function', () => {
    expect(typeof signEvent).toBe('function');
  });

  it('should sign an event', () => {
    const secretKey = generatePrivateKey();
    const pubkey = getPublicKey(secretKey);

    const textEvent = signEvent(
      {
        kind: Kind.Text,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: 'SIMPLE TEXT EVENT',
        pubkey,
      },
      secretKey
    );

    expect(() => {
      verifyEvent(textEvent);
    }).not.toThrow();
  });

  it('should ignore unsigned event id if present', () => {
    const secretKey = generatePrivateKey();
    const pubkey = getPublicKey(secretKey);

    const textEvent = signEvent(
      {
        id: 'INCORRECT ID FIELD VALUE',
        kind: Kind.Text,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: 'SIMPLE TEXT EVENT',
        pubkey,
      } as UnsignedEvent,
      secretKey
    );

    expect(() => {
      verifyEvent(textEvent);
    }).not.toThrow();
  });
});
