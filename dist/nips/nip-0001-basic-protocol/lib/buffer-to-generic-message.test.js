"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for bufferToGenericMessage().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_to_generic_message_1 = require("./buffer-to-generic-message");
const object_to_json_buffer_1 = require("./object-to-json-buffer");
describe('bufferToGenericMessage', () => {
    it('should be a function', () => {
        expect(typeof buffer_to_generic_message_1.bufferToGenericMessage).toBe('function');
    });
    it('should reject non-JSON message', () => {
        expect(() => {
            (0, buffer_to_generic_message_1.bufferToGenericMessage)(Buffer.from('hello world', 'utf-8'));
        }).toThrow('bad msg: unparseable message');
    });
    it('should reject non-Array message', () => {
        expect(() => {
            (0, buffer_to_generic_message_1.bufferToGenericMessage)((0, object_to_json_buffer_1.objectToJsonBuffer)({}));
        }).toThrow('bad msg: message was not an array');
    });
    it('should reject empty array message', () => {
        expect(() => {
            (0, buffer_to_generic_message_1.bufferToGenericMessage)((0, object_to_json_buffer_1.objectToJsonBuffer)([]));
        }).toThrow('bad msg: message type missing');
    });
    it('should reject message with non-string event type', () => {
        expect(() => {
            (0, buffer_to_generic_message_1.bufferToGenericMessage)((0, object_to_json_buffer_1.objectToJsonBuffer)([{}]));
        }).toThrow('bad msg: message type was not a string');
        expect(() => {
            (0, buffer_to_generic_message_1.bufferToGenericMessage)((0, object_to_json_buffer_1.objectToJsonBuffer)([null]));
        }).toThrow('bad msg: message type was not a string');
        expect(() => {
            (0, buffer_to_generic_message_1.bufferToGenericMessage)((0, object_to_json_buffer_1.objectToJsonBuffer)([12]));
        }).toThrow('bad msg: message type was not a string');
    });
});
