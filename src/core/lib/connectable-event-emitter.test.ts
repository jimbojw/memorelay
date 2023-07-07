/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for ConnectableEventEmitter.
 */

import { Handler } from '../types/handler';
import { ConnectableEventEmitter, HANDLERS } from './connectable-event-emitter';

class TestConnectableEventEmitter extends ConnectableEventEmitter {
  constructor(readonly setupHandlers: () => Handler[]) {
    super();
  }
}

describe('ConnectableEventEmitter', () => {
  describe('connect()', () => {
    it('should call setupHandlers() and store the result', () => {
      const mockDisconnectFn = jest.fn<unknown, []>();
      const mockHandler = { disconnect: mockDisconnectFn };
      const mockSetupHandlersFn = jest.fn<Handler[], []>(() => [mockHandler]);

      const connectableEventEmitter = new TestConnectableEventEmitter(
        mockSetupHandlersFn
      );

      expect(connectableEventEmitter.isConnected).toBe(false);
      expect(connectableEventEmitter[HANDLERS]).not.toBeDefined();

      const returnValue = connectableEventEmitter.connect();

      expect(returnValue).toBe(connectableEventEmitter);
      expect(connectableEventEmitter.isConnected).toBe(true);
      expect(connectableEventEmitter[HANDLERS]).toEqual([mockHandler]);
    });

    it('should do nothing if already connected', () => {
      const mockDisconnectFn = jest.fn<unknown, []>();
      const mockHandler = { disconnect: mockDisconnectFn };
      const mockSetupHandlersFn = jest.fn<Handler[], []>(() => [mockHandler]);

      const connectableEventEmitter = new TestConnectableEventEmitter(
        mockSetupHandlersFn
      );

      connectableEventEmitter[HANDLERS] = [];

      expect(connectableEventEmitter.isConnected).toBe(true);

      connectableEventEmitter.connect();

      expect(mockSetupHandlersFn).not.toBeCalled();
    });
  });

  describe('disconnect()', () => {
    it('should call handlers disconnect() callbacks and remove them', () => {
      const mockDisconnectFn = jest.fn<unknown, []>();
      const mockHandler = { disconnect: mockDisconnectFn };
      const mockSetupHandlersFn = jest.fn<Handler[], []>(() => [mockHandler]);

      const connectableEventEmitter = new TestConnectableEventEmitter(
        mockSetupHandlersFn
      );

      connectableEventEmitter[HANDLERS] = [mockHandler];

      expect(mockDisconnectFn).not.toHaveBeenCalled();

      const returnValue = connectableEventEmitter.disconnect();

      expect(returnValue).toBe(connectableEventEmitter);
      expect(connectableEventEmitter.isConnected).toBe(false);
      expect(mockDisconnectFn).toHaveBeenCalledTimes(1);
      expect(connectableEventEmitter[HANDLERS]).not.toBeDefined();
    });

    it('should do nothing if not connected', () => {
      const mockDisconnectFn = jest.fn<unknown, []>();
      const mockHandler = { disconnect: mockDisconnectFn };
      const mockSetupHandlersFn = jest.fn<Handler[], []>(() => [mockHandler]);

      const connectableEventEmitter = new TestConnectableEventEmitter(
        mockSetupHandlersFn
      );

      connectableEventEmitter.disconnect();

      expect(mockDisconnectFn).not.toHaveBeenCalled();
    });
  });
});
