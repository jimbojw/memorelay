"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for onWithHandler().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const on_with_handler_1 = require("./on-with-handler");
describe('onWithHandler()', () => {
    it('should set up an event listener', () => {
        const mockOnFn = jest.fn();
        const mockEmitter = { on: mockOnFn };
        const mockListenerFn = jest.fn();
        (0, on_with_handler_1.onWithHandler)(mockEmitter, 'EVENT_TYPE', mockListenerFn);
        expect(mockOnFn.mock.calls).toHaveLength(1);
        const params = mockOnFn.mock.calls[0];
        expect(params[0]).toBe('EVENT_TYPE');
        expect(typeof params[1]).toBe('function');
        expect(mockListenerFn.mock.calls).toHaveLength(0);
    });
    describe('handler.disconnect()', () => {
        it('should remove the previously added listener', () => {
            const mockOffFn = jest.fn();
            const mockEmitter = {
                on: jest.fn(),
                off: mockOffFn,
            };
            const mockListenerFn = jest.fn();
            const handler = (0, on_with_handler_1.onWithHandler)(mockEmitter, 'EVENT_TYPE', mockListenerFn);
            expect(mockOffFn.mock.calls).toHaveLength(0);
            handler.disconnect();
            expect(mockOffFn.mock.calls).toHaveLength(1);
            const params = mockOffFn.mock.calls[0];
            expect(params[0]).toBe('EVENT_TYPE');
            expect(typeof params[1]).toBe('function');
        });
        it('should do nothing if called more than once', () => {
            const mockOffFn = jest.fn();
            const mockEmitter = {
                on: jest.fn(),
                off: mockOffFn,
            };
            const handler = (0, on_with_handler_1.onWithHandler)(mockEmitter, 'EVENT_TYPE', jest.fn());
            handler.disconnect();
            handler.disconnect();
            handler.disconnect();
            expect(mockOffFn.mock.calls).toHaveLength(1);
        });
        it('should not affect order of prior listeners', () => {
            const emitter = new events_1.EventEmitter();
            const mockDetectorFn = jest.fn();
            const outerListener = () => {
                mockDetectorFn('OUTER');
            };
            const middleListener = () => {
                mockDetectorFn('MIDDLE');
            };
            const handlers = [
                (0, on_with_handler_1.onWithHandler)(emitter, 'LIVE', outerListener),
                (0, on_with_handler_1.onWithHandler)(emitter, 'LIVE', middleListener),
                (0, on_with_handler_1.onWithHandler)(emitter, 'LIVE', outerListener),
            ];
            emitter.emit('LIVE');
            expect(mockDetectorFn.mock.calls).toEqual([
                ['OUTER'],
                ['MIDDLE'],
                ['OUTER'],
            ]);
            mockDetectorFn.mockClear();
            // Disconnect the last handler. Prior order must be unaffected.
            handlers[2].disconnect();
            emitter.emit('LIVE');
            expect(mockDetectorFn.mock.calls).toEqual([['OUTER'], ['MIDDLE']]);
        });
        it('should not affect order of subsequent listeners', () => {
            const emitter = new events_1.EventEmitter();
            const mockDetectorFn = jest.fn();
            const outerListener = () => {
                mockDetectorFn('OUTER');
            };
            const middleListener = () => {
                mockDetectorFn('MIDDLE');
            };
            const handlers = [
                (0, on_with_handler_1.onWithHandler)(emitter, 'LIVE', outerListener),
                (0, on_with_handler_1.onWithHandler)(emitter, 'LIVE', middleListener),
                (0, on_with_handler_1.onWithHandler)(emitter, 'LIVE', outerListener),
            ];
            emitter.emit('LIVE');
            expect(mockDetectorFn.mock.calls).toEqual([
                ['OUTER'],
                ['MIDDLE'],
                ['OUTER'],
            ]);
            mockDetectorFn.mockClear();
            // Disconnect the first handler. Subsequent order must be unaffected.
            handlers[0].disconnect();
            emitter.emit('LIVE');
            expect(mockDetectorFn.mock.calls).toEqual([['MIDDLE'], ['OUTER']]);
        });
    });
});
