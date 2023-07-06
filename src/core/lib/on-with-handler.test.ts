/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for onWithHandler().
 */

import { EventEmitter } from 'events';
import { onWithHandler } from './on-with-handler';

type CallbackFn = (...args: any[]) => void;

describe('onWithHandler()', () => {
  it('should set up an event listener', () => {
    const mockOnFn = jest.fn<EventEmitter, [string, CallbackFn]>();
    const mockEmitter = { on: mockOnFn } as unknown as EventEmitter;

    const mockListenerFn = jest.fn<unknown, unknown[]>();
    onWithHandler(mockEmitter, 'EVENT_TYPE', mockListenerFn);

    expect(mockOnFn.mock.calls).toHaveLength(1);
    const params = mockOnFn.mock.calls[0];
    expect(params[0]).toBe('EVENT_TYPE');
    expect(typeof params[1]).toBe('function');

    expect(mockListenerFn.mock.calls).toHaveLength(0);
  });

  describe('handler.disconnect()', () => {
    it('should remove the previously added listener', () => {
      const mockOffFn = jest.fn<EventEmitter, [string, CallbackFn]>();
      const mockEmitter = {
        on: jest.fn<EventEmitter, [string, CallbackFn]>(),
        off: mockOffFn,
      } as unknown as EventEmitter;

      const mockListenerFn = jest.fn<unknown, unknown[]>();
      const handler = onWithHandler(mockEmitter, 'EVENT_TYPE', mockListenerFn);

      expect(mockOffFn.mock.calls).toHaveLength(0);

      handler.disconnect();

      expect(mockOffFn.mock.calls).toHaveLength(1);
      const params = mockOffFn.mock.calls[0];
      expect(params[0]).toBe('EVENT_TYPE');
      expect(typeof params[1]).toBe('function');
    });

    it('should do nothing if called more than once', () => {
      const mockOffFn = jest.fn<EventEmitter, [string, CallbackFn]>();
      const mockEmitter = {
        on: jest.fn<EventEmitter, [string, CallbackFn]>(),
        off: mockOffFn,
      } as unknown as EventEmitter;

      const handler = onWithHandler(
        mockEmitter,
        'EVENT_TYPE',
        jest.fn<unknown, unknown[]>()
      );

      handler.disconnect();
      handler.disconnect();
      handler.disconnect();

      expect(mockOffFn.mock.calls).toHaveLength(1);
    });

    it('should not affect order of prior listeners', () => {
      const emitter = new EventEmitter();

      const mockDetectorFn = jest.fn<unknown, [string]>();

      const outerListener = () => {
        mockDetectorFn('OUTER');
      };

      const middleListener = () => {
        mockDetectorFn('MIDDLE');
      };

      const handlers = [
        onWithHandler(emitter, 'LIVE', outerListener),
        onWithHandler(emitter, 'LIVE', middleListener),
        onWithHandler(emitter, 'LIVE', outerListener),
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
      const emitter = new EventEmitter();

      const mockDetectorFn = jest.fn<unknown, [string]>();

      const outerListener = () => {
        mockDetectorFn('OUTER');
      };

      const middleListener = () => {
        mockDetectorFn('MIDDLE');
      };

      const handlers = [
        onWithHandler(emitter, 'LIVE', outerListener),
        onWithHandler(emitter, 'LIVE', middleListener),
        onWithHandler(emitter, 'LIVE', outerListener),
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
