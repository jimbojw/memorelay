/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for subscribeToReqMessages().
 */

import { BasicEventEmitter } from '../../core/basic-event-emitter';
import { MemorelayHub } from '../../core/memorelay-hub';
import { subscribeToIncomingReqMessages } from './subscribe-to-incoming-req-messages';

describe('subscribeToReqMessages()', () => {
  it('should subscribe to incoming REQ messages', () => {
    const hub = new BasicEventEmitter() as MemorelayHub;
    subscribeToIncomingReqMessages(hub);

    // TODO(jimbo): Test functionality.
  });
});
