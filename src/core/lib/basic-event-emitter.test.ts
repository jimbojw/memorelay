/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for BasicEventEmitter.
 */

import { defaultMaxListeners, EventEmitter } from 'events';

import { BasicEventEmitter } from './basic-event-emitter';
import { BasicEvent } from '../events/basic-event';
import {
  PREFLIGHT_EVENT_TYPE,
  PreflightEvent,
} from '../events/preflight-event';

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
    it('should emit a PreflightEvent, then a BasicEvent and return it', () => {
      const basicEventEmitter = new BasicEventEmitter();

      const mockEmitFn = jest.fn<boolean, [string, BasicEvent]>();
      basicEventEmitter.internalEmitter.emit = mockEmitFn;

      const basicEvent = new BasicEvent('EXAMPLE', undefined);

      const result = basicEventEmitter.emitEvent(basicEvent);

      expect(result).toBe(basicEvent);

      expect(mockEmitFn).toHaveBeenCalledTimes(2);

      expect(mockEmitFn.mock.calls[0][0]).toBe(PREFLIGHT_EVENT_TYPE);
      const preflightEvent = mockEmitFn.mock.calls[0][1] as PreflightEvent;
      expect(preflightEvent).toBeInstanceOf(PreflightEvent);
      expect(preflightEvent.details.event).toBe(basicEvent);

      expect(mockEmitFn.mock.calls[1][0]).toBe('EXAMPLE');
      expect(mockEmitFn.mock.calls[1][1]).toBe(basicEvent);
    });

    it('should emit a PreflightEvent', () => {
      const basicEventEmitter = new BasicEventEmitter();

      const mockEmitFn = jest.fn<boolean, [string, BasicEvent]>();
      basicEventEmitter.internalEmitter.emit = mockEmitFn;

      const mockBasicEvent = {} as BasicEvent;
      const preflightEvent = new PreflightEvent({ event: mockBasicEvent });

      const result = basicEventEmitter.emitEvent(preflightEvent);

      expect(result).toBe(preflightEvent);

      expect(mockEmitFn).toHaveBeenCalledTimes(1);
      expect(mockEmitFn.mock.calls[0][0]).toBe(PREFLIGHT_EVENT_TYPE);
      expect(mockEmitFn.mock.calls[0][1]).toBe(preflightEvent);
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
});
