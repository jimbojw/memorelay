"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for clearHandlers().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const disconnect_all_1 = require("./disconnect-all");
describe('disconnectAll()', () => {
    it('should invoke disconnect() on each handler and remove all', () => {
        const mockDisconnectFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ];
        const mockHandlers = mockDisconnectFns.map((mockDisconnectFn) => ({ disconnect: mockDisconnectFn }));
        (0, disconnect_all_1.disconnectAll)(mockHandlers);
        expect(mockHandlers).toHaveLength(0);
        mockDisconnectFns.forEach((mockDisconnectFn) => {
            expect(mockDisconnectFn).toHaveBeenCalledTimes(1);
        });
    });
});
