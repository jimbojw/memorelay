/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for clearHandlers().
 */

import { Disconnectable } from '../types/disconnectable';
import { clearHandlers } from './clear-handlers';

describe('clearHandlers()', () => {
  it('should invoke disconnect() on each handler and remove all', () => {
    const mockDisconnectFns = [
      jest.fn<unknown, []>(),
      jest.fn<unknown, []>(),
      jest.fn<unknown, []>(),
    ];
    const mockHandlers: Disconnectable[] = mockDisconnectFns.map(
      (mockDisconnectFn) => ({ disconnect: mockDisconnectFn })
    );

    const callbackFn = clearHandlers(mockHandlers);
    callbackFn();

    expect(mockHandlers).toHaveLength(0);
    mockDisconnectFns.forEach((mockDisconnectFn) => {
      expect(mockDisconnectFn).toHaveBeenCalledTimes(1);
    });
  });
});
