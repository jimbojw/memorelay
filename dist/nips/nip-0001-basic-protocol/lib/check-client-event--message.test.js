"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for checkClientEventMessage().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const signed_test_event_1 = require("../../../test/signed-test-event");
const check_client_event_message_1 = require("./check-client-event-message");
describe('checkClientEventMessage()', () => {
    it('should throw if not passed an EVENT message', () => {
        expect(() => {
            (0, check_client_event_message_1.checkClientEventMessage)(['FOO']);
        }).toThrow('bad msg: wrong message type');
    });
    it('should throw if event is missing', () => {
        expect(() => {
            (0, check_client_event_message_1.checkClientEventMessage)(['EVENT']);
        }).toThrow('bad msg: event missing');
    });
    it('should throw if event signature is missing', () => {
        const unsignedTestEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST EVENT' });
        unsignedTestEvent.sig = undefined;
        expect(() => {
            (0, check_client_event_message_1.checkClientEventMessage)(['EVENT', unsignedTestEvent]);
        }).toThrow('bad msg: event signature missing');
    });
    it('should throw if event signature is invalid', () => {
        const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST EVENT' });
        testEvent.sig = 'INVALID SIGNATURE';
        expect(() => {
            (0, check_client_event_message_1.checkClientEventMessage)(['EVENT', testEvent]);
        }).toThrow('bad msg: bad signature');
    });
    it('should throw if not passed extra array elements', () => {
        const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'TEST EVENT' });
        expect(() => {
            (0, check_client_event_message_1.checkClientEventMessage)(['EVENT', testEvent, 'EXTRA']);
        }).toThrow('bad msg: extra elements detected');
    });
});
