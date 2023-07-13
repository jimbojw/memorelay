"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for main Memorelay entry point.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const memorelay_1 = require("./memorelay");
describe('Memorelay', () => {
    it('should take plugins', () => {
        const mockPluginFn = jest.fn();
        const memorelay = new memorelay_1.Memorelay(mockPluginFn);
        expect(memorelay.plugins).toContain(mockPluginFn);
        expect(mockPluginFn).not.toHaveBeenCalled();
        memorelay.connect();
        expect(mockPluginFn).toHaveBeenCalledTimes(1);
    });
    describe('connect()', () => {
        it('should establish all default Nostr relay functionality', () => {
            const memorelay = new memorelay_1.Memorelay();
            memorelay.connect();
            // TODO(jimbo): Add integration tests.
        });
    });
});
