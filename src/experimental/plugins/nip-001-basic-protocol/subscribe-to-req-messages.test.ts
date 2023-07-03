/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for parseIncomingJsonMessages().
 */

import { BasicEventEmitter } from '../../core/basic-event-emitter';
import { MemorelayHub } from '../../core/memorelay-hub';
import { subscribeToReqMessages } from './subscribe-to-req-messages';

describe('subscribeToReqMessages()', () => {
  it('should subscribe to incoming REQ messages', () => {
    const hub = new BasicEventEmitter() as MemorelayHub;
    subscribeToReqMessages(hub);

    // TODO(jimbo): Test functionality.
  });
});
