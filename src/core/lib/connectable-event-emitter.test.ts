/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for ConnectableEventEmitter.
 */

import { Disconnectable } from '../types/disconnectable';
import { ConnectableEventEmitter, HANDLERS } from './connectable-event-emitter';

describe('ConnectableEventEmitter', () => {
  describe('connect()', () => {
    it('should store an empty handlers array when there are no plugins', () => {
      const connectableEventEmitter = new ConnectableEventEmitter();

      expect(connectableEventEmitter.isConnected).toBe(false);
      expect(connectableEventEmitter[HANDLERS]).not.toBeDefined();

      const returnValue = connectableEventEmitter.connect();

      expect(returnValue).toBe(connectableEventEmitter);
      expect(connectableEventEmitter[HANDLERS]).toHaveLength(0);
      expect(connectableEventEmitter.isConnected).toBe(true);
    });

    it('should call plugins and store the result', () => {
      const mockDisconnectFn = jest.fn<unknown, []>();
      const mockHandler = { disconnect: mockDisconnectFn };
      const mockPluginFn = jest.fn<Disconnectable, [ConnectableEventEmitter]>(
        () => mockHandler
      );

      const connectableEventEmitter = new ConnectableEventEmitter();
      connectableEventEmitter.plugins = [mockPluginFn];

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
      const mockPluginFn = jest.fn<Disconnectable, [ConnectableEventEmitter]>(
        () => mockHandler
      );

      const connectableEventEmitter = new ConnectableEventEmitter();
      connectableEventEmitter.plugins = [mockPluginFn];

      connectableEventEmitter[HANDLERS] = [];

      expect(connectableEventEmitter.isConnected).toBe(true);

      connectableEventEmitter.connect();

      expect(mockPluginFn).not.toBeCalled();
    });
  });

  describe('disconnect()', () => {
    it('should call handlers disconnect() callbacks and remove them', () => {
      const mockDisconnectFn = jest.fn<unknown, []>();
      const mockHandler = { disconnect: mockDisconnectFn };
      const mockPluginFn = jest.fn<Disconnectable, [ConnectableEventEmitter]>(
        () => mockHandler
      );

      const connectableEventEmitter = new ConnectableEventEmitter();
      connectableEventEmitter.plugins = [mockPluginFn];

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
      const mockPluginFn = jest.fn<Disconnectable, [ConnectableEventEmitter]>(
        () => mockHandler
      );

      const connectableEventEmitter = new ConnectableEventEmitter();
      connectableEventEmitter.plugins = [mockPluginFn];

      connectableEventEmitter.disconnect();

      expect(mockDisconnectFn).not.toHaveBeenCalled();
    });
  });
});
