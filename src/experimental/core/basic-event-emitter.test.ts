/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for BasicEventEmitter.
 */

import { EventEmitter } from 'events';

import { BasicEventEmitter, BasicEventHandler } from './basic-event-emitter';
import { BasicEvent } from '../events/basic-event';

describe('BasicEventEmitter', () => {
  it('should be a constructor function', () => {
    expect(typeof BasicEventEmitter).toBe('function');
    const basicEventEmitter = new BasicEventEmitter();
    expect(basicEventEmitter).toBeInstanceOf(BasicEventEmitter);
  });

  describe('connect()', () => {
    it('should connect handlers', () => {
      const mockOnFn = jest.fn<unknown, [string, (...args: any[]) => void]>();
      const mockHandlerFn = jest.fn<unknown, [(...args: any[]) => void]>();
      const mockHandler: BasicEventHandler = {
        target: { on: mockOnFn } as unknown as EventEmitter,
        type: 'EXAMPLE_EVENT_TYPE',
        handler: mockHandlerFn,
      };
      const basicEventEmitter = new BasicEventEmitter([mockHandler]);

      basicEventEmitter.connect();

      expect(mockOnFn.mock.calls).toHaveLength(1);

      expect(mockOnFn.mock.calls[0][0]).toBe('EXAMPLE_EVENT_TYPE');
      expect(mockOnFn.mock.calls[0][1]).toBe(mockHandlerFn);

      // Sanity check: confirm that the handler callback function was not itself
      // invoked as part of the listener setup.
      expect(mockHandlerFn.mock.calls).toHaveLength(0);
    });
  });

  describe('disconnect()', () => {
    it('should disconnect handlers', () => {
      const mockOffFn = jest.fn<unknown, [string, (...args: any[]) => void]>();
      const mockHandlerFn = jest.fn<unknown, [(...args: any[]) => void]>();
      const mockHandler: BasicEventHandler = {
        target: { off: mockOffFn } as unknown as EventEmitter,
        type: 'EXAMPLE_EVENT_TYPE',
        handler: mockHandlerFn,
      };
      const basicEventEmitter = new BasicEventEmitter([mockHandler]);

      basicEventEmitter.disconnect();

      expect(mockOffFn.mock.calls).toHaveLength(1);

      expect(mockOffFn.mock.calls[0][0]).toBe('EXAMPLE_EVENT_TYPE');
      expect(mockOffFn.mock.calls[0][1]).toBe(mockHandlerFn);

      // Sanity check: confirm that the handler callback function was not itself
      // invoked as part of the listener setup.
      expect(mockHandlerFn.mock.calls).toHaveLength(0);
    });
  });

  describe('emitBasic()', () => {
    it('should emit a BasicEvent and return it', () => {
      const basicEventEmitter = new BasicEventEmitter();

      const mockEmitFn = jest.fn<boolean, [string, BasicEvent]>();
      basicEventEmitter.emit = mockEmitFn;

      const basicEvent = new BasicEvent('EXAMPLE', undefined);

      const result = basicEventEmitter.emitBasic(basicEvent);

      expect(result).toBe(basicEvent);

      expect(mockEmitFn.mock.calls).toHaveLength(1);
      expect(mockEmitFn.mock.calls[0][0]).toBe('EXAMPLE');
      expect(mockEmitFn.mock.calls[0][1]).toBe(basicEvent);
    });
  });

  describe('emitError()', () => {
    it('should emit an error and return it', () => {
      const basicEventEmitter = new BasicEventEmitter();

      const mockEmitFn = jest.fn<boolean, [string, BasicEvent]>();
      basicEventEmitter.emit = mockEmitFn;

      const error = { type: 'EXAMPLE_ERROR', message: 'everything is broken' };

      const result = basicEventEmitter.emitError(error);

      expect(result).toBe(error);

      expect(mockEmitFn.mock.calls).toHaveLength(1);
      expect(mockEmitFn.mock.calls[0][0]).toBe('EXAMPLE_ERROR');
      expect(mockEmitFn.mock.calls[0][1]).toBe(error);
    });
  });
});
