"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Integration tests for binary (entry point bin.ts).
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_to_generic_message_1 = require("./nips/nip-0001-basic-protocol/lib/buffer-to-generic-message");
const object_to_json_buffer_1 = require("./nips/nip-0001-basic-protocol/lib/object-to-json-buffer");
const bin_test_harness_1 = require("./test/bin-test-harness");
const signed_test_event_1 = require("./test/signed-test-event");
describe('bin.ts', () => {
    it.concurrent('should send stored events', () => __awaiter(void 0, void 0, void 0, function* () {
        const harness = new bin_test_harness_1.BinTestHarness();
        yield harness.setup();
        const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'HELLO WORLD' });
        // Send a test event to store.
        const senderWebSocket = yield harness.openWebSocket();
        const okMessage = yield new Promise((resolve) => {
            senderWebSocket
                .on('message', (buffer) => {
                resolve((0, buffer_to_generic_message_1.bufferToGenericMessage)(buffer));
            })
                .send((0, object_to_json_buffer_1.objectToJsonBuffer)(['EVENT', testEvent]));
        });
        expect(okMessage).toEqual(['OK', testEvent.id, true, '']);
        // Request all events.
        const receiverWebSocket = yield harness.openWebSocket();
        const eventMessage = yield new Promise((resolve) => {
            receiverWebSocket
                .on('message', (buffer) => {
                resolve((0, buffer_to_generic_message_1.bufferToGenericMessage)(buffer));
            })
                .send((0, object_to_json_buffer_1.objectToJsonBuffer)(['REQ', 'SUBSCRIPTION_ID']));
        });
        expect(eventMessage).toEqual(['EVENT', 'SUBSCRIPTION_ID', testEvent]);
        yield harness.teardown();
    }));
    it.concurrent('should broadcast incoming events', () => __awaiter(void 0, void 0, void 0, function* () {
        const harness = new bin_test_harness_1.BinTestHarness();
        yield harness.setup();
        const testEvent = (0, signed_test_event_1.createSignedTestEvent)({ content: 'HELLO WORLD' });
        // Receiver subscribes all events.
        const receiverWebSocket = yield harness.openWebSocket();
        const eoseMessage = yield new Promise((resolve) => {
            receiverWebSocket
                .on('message', (buffer) => {
                resolve((0, buffer_to_generic_message_1.bufferToGenericMessage)(buffer));
            })
                .send((0, object_to_json_buffer_1.objectToJsonBuffer)(['REQ', 'SUBSCRIPTION_ID']));
        });
        expect(eoseMessage).toEqual(['EOSE', 'SUBSCRIPTION_ID']);
        receiverWebSocket.removeAllListeners();
        const receiverPromise = new Promise((resolve) => {
            receiverWebSocket.on('message', (buffer) => {
                resolve((0, buffer_to_generic_message_1.bufferToGenericMessage)(buffer));
            });
        });
        // Send a test event to store.
        const senderWebSocket = yield harness.openWebSocket();
        senderWebSocket.send((0, object_to_json_buffer_1.objectToJsonBuffer)(['EVENT', testEvent]));
        const eventMessage = yield receiverPromise;
        expect(eventMessage).toEqual(['EVENT', 'SUBSCRIPTION_ID', testEvent]);
        yield harness.teardown();
    }));
});
