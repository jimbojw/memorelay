/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for BasicEventEmitter.
 */

import { defaultMaxListeners, EventEmitter } from 'events';

import { BasicEventEmitter } from './basic-event-emitter';
import { BasicEvent } from '../events/basic-event';
import { BasicError } from '../errors/basic-error';

describe('BasicEventEmitter', () => {
  describe('get maxEventListeners()', () => {
    it('should initialize to the default', () => {
      const basicEventEmitter = new BasicEventEmitter();
      expect(basicEventEmitter.maxEventListeners).toBe(defaultMaxListeners);
    });
  });

  describe('set maxEventListeners()', () => {
    it('should be set to the expected value', () => {
      const basicEventEmitter = new BasicEventEmitter();
      basicEventEmitter.maxEventListeners = 100;
      expect(basicEventEmitter.maxEventListeners).toBe(100);
    });
  });

  describe('emitEvent()', () => {
    it('should emit a BasicEvent and return it', () => {
      const basicEventEmitter = new BasicEventEmitter();

      const mockEmitFn = jest.fn<boolean, [string, BasicEvent]>();
      basicEventEmitter.internalEmitter.emit = mockEmitFn;

      const basicEvent = new BasicEvent('EXAMPLE', undefined);

      const result = basicEventEmitter.emitEvent(basicEvent);

      expect(result).toBe(basicEvent);

      expect(mockEmitFn.mock.calls).toHaveLength(1);
      expect(mockEmitFn.mock.calls[0][0]).toBe('EXAMPLE');
      expect(mockEmitFn.mock.calls[0][1]).toBe(basicEvent);
    });
  });

  describe('onEvent()', () => {
    it('should set up an event listener', () => {
      const basicEventEmitter = new BasicEventEmitter();

      const mockOnFn = jest.fn<
        EventEmitter,
        [string, (basicEvent: BasicEvent) => void]
      >();
      basicEventEmitter.internalEmitter.on = mockOnFn;

      const mockCallbackFn = jest.fn<unknown, [BasicEvent]>();
      basicEventEmitter.onEvent({ type: 'EVENT_TYPE' }, mockCallbackFn);

      expect(mockOnFn.mock.calls).toHaveLength(1);
      const params = mockOnFn.mock.calls[0];
      expect(params[0]).toBe('EVENT_TYPE');
      expect(typeof params[1]).toBe('function');

      expect(mockCallbackFn.mock.calls).toHaveLength(0);
    });

    it('should return a handler which disconnects the listener', () => {
      const basicEventEmitter = new BasicEventEmitter();

      const mockOffFn = jest.fn<
        EventEmitter,
        [string, (basicEvent: BasicEvent) => void]
      >();
      basicEventEmitter.internalEmitter.off = mockOffFn;

      const mockCallbackFn = jest.fn<unknown, [BasicEvent]>();
      const handler = basicEventEmitter.onEvent(
        { type: 'EVENT_TYPE' },
        mockCallbackFn
      );

      expect(mockOffFn.mock.calls).toHaveLength(0);

      handler.disconnect();

      expect(mockOffFn.mock.calls).toHaveLength(1);

      const params = mockOffFn.mock.calls[0];
      expect(params[0]).toBe('EVENT_TYPE');
      expect(typeof params[1]).toBe('function');

      expect(mockCallbackFn.mock.calls).toHaveLength(0);
    });
  });

  describe('emitError()', () => {
    it('should emit an error and return it', () => {
      const basicEventEmitter = new BasicEventEmitter();

      const mockEmitFn = jest.fn<boolean, [string, BasicEvent]>();
      basicEventEmitter.internalEmitter.emit = mockEmitFn;

      const mockError = {
        type: 'EXAMPLE_ERROR',
        message: 'everything is broken',
      } as BasicError;

      const result = basicEventEmitter.emitError(mockError);

      expect(result).toBe(mockError);

      expect(mockEmitFn.mock.calls).toHaveLength(1);
      expect(mockEmitFn.mock.calls[0][0]).toBe('EXAMPLE_ERROR');
      expect(mockEmitFn.mock.calls[0][1]).toBe(mockError);
    });
  });

  describe('onError()', () => {
    it('should set up an error listener', () => {
      const basicEventEmitter = new BasicEventEmitter();

      const mockOnFn = jest.fn<
        EventEmitter,
        [string, (error: { type: string }) => void]
      >();
      basicEventEmitter.internalEmitter.on = mockOnFn;

      const mockCallbackFn = jest.fn<unknown, [{ type: string }]>();
      basicEventEmitter.onError({ type: 'ERROR_TYPE' }, mockCallbackFn);

      expect(mockOnFn.mock.calls).toHaveLength(1);
      const params = mockOnFn.mock.calls[0];
      expect(params[0]).toBe('ERROR_TYPE');
      expect(typeof params[1]).toBe('function');

      expect(mockCallbackFn.mock.calls).toHaveLength(0);
    });

    it('should return a handler which disconnects the listener', () => {
      const basicEventEmitter = new BasicEventEmitter();

      const mockOffFn = jest.fn<
        EventEmitter,
        [string, (basicEvent: BasicEvent) => void]
      >();
      basicEventEmitter.internalEmitter.off = mockOffFn;

      const mockCallbackFn = jest.fn<unknown, [BasicError]>();
      const handler = basicEventEmitter.onError(
        { type: 'EVENT_TYPE' },
        mockCallbackFn
      );

      expect(mockOffFn.mock.calls).toHaveLength(0);

      handler.disconnect();

      expect(mockOffFn.mock.calls).toHaveLength(1);

      const params = mockOffFn.mock.calls[0];
      expect(params[0]).toBe('EVENT_TYPE');
      expect(typeof params[1]).toBe('function');

      expect(mockCallbackFn.mock.calls).toHaveLength(0);
    });
  });
});
