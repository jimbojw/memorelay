/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for basicProtocol().
 */

import { basicProtocol } from '.';
import { BasicEventEmitter } from '../../core/basic-event-emitter';
import { MemorelayHub } from '../../core/memorelay-hub';

describe('basicProtocol()', () => {
  it('should implement the basic Nostr protocol per NIP-01', () => {
    basicProtocol(new BasicEventEmitter() as MemorelayHub);

    // TODO(jimbo): Add integration tests.
  });
});
