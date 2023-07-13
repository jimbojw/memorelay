/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for autoDisconnect().
 */

import { setupTestClient } from '../../test/setup-test-hub-and-client';
import { MemorelayClientDisconnectEvent } from '../events/memorelay-client-disconnect-event';
import { autoDisconnect } from './auto-disconnect';

describe('autoDisconnect()', () => {
  it('should automatically disconnect handlers', () => {
    const memorelayClient = setupTestClient();

    const mockDisconnectFn = jest.fn<unknown, []>();

    autoDisconnect(memorelayClient, {
      disconnect: mockDisconnectFn,
    });

    memorelayClient.emitEvent(
      new MemorelayClientDisconnectEvent({ memorelayClient })
    );

    expect(mockDisconnectFn).toHaveBeenCalledTimes(1);
  });
});
