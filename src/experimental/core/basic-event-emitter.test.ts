/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for BasicEventEmitter.
 */

import { BasicEventEmitter } from './basic-event-emitter';
import { BasicEvent } from '../events/basic-event';

describe('BasicEventEmitter', () => {
  it('should be a constructor function', () => {
    expect(typeof BasicEventEmitter).toBe('function');
    const basicEventEmitter = new BasicEventEmitter();
    expect(basicEventEmitter).toBeInstanceOf(BasicEventEmitter);
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
