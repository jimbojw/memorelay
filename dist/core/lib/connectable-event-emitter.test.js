"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for ConnectableEventEmitter.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const connectable_event_emitter_1 = require("./connectable-event-emitter");
describe('ConnectableEventEmitter', () => {
    describe('connect()', () => {
        it('should store an empty handlers array when there are no plugins', () => {
            const connectableEventEmitter = new connectable_event_emitter_1.ConnectableEventEmitter();
            expect(connectableEventEmitter.isConnected).toBe(false);
            expect(connectableEventEmitter[connectable_event_emitter_1.HANDLERS]).not.toBeDefined();
            const returnValue = connectableEventEmitter.connect();
            expect(returnValue).toBe(connectableEventEmitter);
            expect(connectableEventEmitter[connectable_event_emitter_1.HANDLERS]).toHaveLength(0);
            expect(connectableEventEmitter.isConnected).toBe(true);
        });
        it('should call plugins and store the result', () => {
            const mockDisconnectFn = jest.fn();
            const mockHandler = { disconnect: mockDisconnectFn };
            const mockPluginFn = jest.fn(() => mockHandler);
            const connectableEventEmitter = new connectable_event_emitter_1.ConnectableEventEmitter();
            connectableEventEmitter.plugins = [mockPluginFn];
            expect(connectableEventEmitter.isConnected).toBe(false);
            expect(connectableEventEmitter[connectable_event_emitter_1.HANDLERS]).not.toBeDefined();
            const returnValue = connectableEventEmitter.connect();
            expect(returnValue).toBe(connectableEventEmitter);
            expect(connectableEventEmitter.isConnected).toBe(true);
            expect(connectableEventEmitter[connectable_event_emitter_1.HANDLERS]).toEqual([mockHandler]);
        });
        it('should do nothing if already connected', () => {
            const mockDisconnectFn = jest.fn();
            const mockHandler = { disconnect: mockDisconnectFn };
            const mockPluginFn = jest.fn(() => mockHandler);
            const connectableEventEmitter = new connectable_event_emitter_1.ConnectableEventEmitter();
            connectableEventEmitter.plugins = [mockPluginFn];
            connectableEventEmitter[connectable_event_emitter_1.HANDLERS] = [];
            expect(connectableEventEmitter.isConnected).toBe(true);
            connectableEventEmitter.connect();
            expect(mockPluginFn).not.toBeCalled();
        });
    });
    describe('disconnect()', () => {
        it('should call handlers disconnect() callbacks and remove them', () => {
            const mockDisconnectFn = jest.fn();
            const mockHandler = { disconnect: mockDisconnectFn };
            const mockPluginFn = jest.fn(() => mockHandler);
            const connectableEventEmitter = new connectable_event_emitter_1.ConnectableEventEmitter();
            connectableEventEmitter.plugins = [mockPluginFn];
            connectableEventEmitter[connectable_event_emitter_1.HANDLERS] = [mockHandler];
            expect(mockDisconnectFn).not.toHaveBeenCalled();
            const returnValue = connectableEventEmitter.disconnect();
            expect(returnValue).toBe(connectableEventEmitter);
            expect(connectableEventEmitter.isConnected).toBe(false);
            expect(mockDisconnectFn).toHaveBeenCalledTimes(1);
            expect(connectableEventEmitter[connectable_event_emitter_1.HANDLERS]).not.toBeDefined();
        });
        it('should do nothing if not connected', () => {
            const mockDisconnectFn = jest.fn();
            const mockHandler = { disconnect: mockDisconnectFn };
            const mockPluginFn = jest.fn(() => mockHandler);
            const connectableEventEmitter = new connectable_event_emitter_1.ConnectableEventEmitter();
            connectableEventEmitter.plugins = [mockPluginFn];
            connectableEventEmitter.disconnect();
            expect(mockDisconnectFn).not.toHaveBeenCalled();
        });
    });
});
