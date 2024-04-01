"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for checkOKMessage().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const check_ok_message_1 = require("./check-ok-message");
// A valid event id consisting of all zeros.
const ZERO_ID = Array(64).fill(0).join('');
describe('checkOKMessage()', () => {
    it('should reject OK message with missing event id', () => {
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK']);
        }).toThrow('bad msg: event id missing');
    });
    it('should reject OK message with malformed id', () => {
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', null]);
        }).toThrow('bad msg: event id type mismatch');
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', 5]);
        }).toThrow('bad msg: event id type mismatch');
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', 'abcde']);
        }).toThrow('bad msg: event id malformed');
    });
    it('should reject OK message missing status', () => {
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', ZERO_ID]);
        }).toThrow('bad msg: status missing');
    });
    it('should reject OK message with non-boolean status', () => {
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', ZERO_ID, null]);
        }).toThrow('bad msg: status type mismatch');
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', ZERO_ID, 7]);
        }).toThrow('bad msg: status type mismatch');
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', ZERO_ID, 'false']);
        }).toThrow('bad msg: status type mismatch');
    });
    it('should reject OK message missing description', () => {
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', ZERO_ID, true]);
        }).toThrow('bad msg: description missing');
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', ZERO_ID, false]);
        }).toThrow('bad msg: description missing');
    });
    it('should accept OK message with empty description', () => {
        const okMessage = ['OK', ZERO_ID, true, ''];
        expect((0, check_ok_message_1.checkOKMessage)(okMessage)).toBe(okMessage);
    });
    it('should reject OK message with non-string description', () => {
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', ZERO_ID, true, { BAD: 'DESCRIPTION' }]);
        }).toThrow('bad msg: description type mismatch');
    });
    it('should accept OK message marking duplicate', () => {
        const okMessage = ['OK', ZERO_ID, true, 'duplicate:'];
        expect((0, check_ok_message_1.checkOKMessage)(okMessage)).toBe(okMessage);
    });
    it('should accept OK message marking deleted event', () => {
        const okMessage = ['OK', ZERO_ID, true, 'deleted:'];
        expect((0, check_ok_message_1.checkOKMessage)(okMessage)).toBe(okMessage);
    });
    it('should reject OK message with missing reason', () => {
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', ZERO_ID, true, 'no reason']);
        }).toThrow('bad msg: reason missing');
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', ZERO_ID, true, ':no reason']);
        }).toThrow('bad msg: reason missing');
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', ZERO_ID, true, '     :  no reason']);
        }).toThrow('bad msg: reason missing');
    });
    it('should reject OK message with unrecognized reason', () => {
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', ZERO_ID, true, 'unspecified: no reason']);
        }).toThrow('bad msg: unrecognized reason: unspecified');
    });
    it('should reject OK message with extra elements', () => {
        expect(() => {
            (0, check_ok_message_1.checkOKMessage)(['OK', ZERO_ID, true, '', 'EXTRA_ELEMENT']);
        }).toThrow('bad msg: extra elements detected');
    });
});
