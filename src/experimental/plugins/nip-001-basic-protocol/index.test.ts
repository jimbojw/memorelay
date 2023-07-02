/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for basicProtocol().
 */

import { basicProtocol } from '.';
import { BasicEventEmitter } from '../../core/basic-event-emitter';

describe('basicProtocol()', () => {
  it('should implement the basic Nostr protocol per NIP-01', () => {
    basicProtocol(new BasicEventEmitter());

    // TODO(jimbo): Add integration tests.
  });
});
