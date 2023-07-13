"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for clearHandlers().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const clear_handlers_1 = require("./clear-handlers");
describe('clearHandlers()', () => {
    it('should invoke disconnect() on each handler and remove all', () => {
        const mockDisconnectFns = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ];
        const mockHandlers = mockDisconnectFns.map((mockDisconnectFn) => ({ disconnect: mockDisconnectFn }));
        const callbackFn = (0, clear_handlers_1.clearHandlers)(mockHandlers);
        callbackFn();
        expect(mockHandlers).toHaveLength(0);
        mockDisconnectFns.forEach((mockDisconnectFn) => {
            expect(mockDisconnectFn).toHaveBeenCalledTimes(1);
        });
    });
});
