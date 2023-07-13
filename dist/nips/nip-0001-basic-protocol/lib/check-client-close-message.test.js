"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for checkClientCloseMessage().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const check_client_close_message_1 = require("./check-client-close-message");
describe('checkClientCloseMessage()', () => {
    it('should throw if not passed a CLOSE message', () => {
        expect(() => {
            (0, check_client_close_message_1.checkClientCloseMessage)(['FOO']);
        }).toThrow('bad msg: wrong message type');
    });
    it('should throw if not passed extra array elements', () => {
        expect(() => {
            (0, check_client_close_message_1.checkClientCloseMessage)(['CLOSE', '1', 'EXTRA']);
        }).toThrow('bad msg: extra elements detected');
    });
});
