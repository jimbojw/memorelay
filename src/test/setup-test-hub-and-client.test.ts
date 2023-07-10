/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for hub and client scaffolding.
 */

import { MemorelayClientCreatedEvent } from '../core/events/memorelay-client-created-event';
import { MemorelayClient } from '../core/lib/memorelay-client';
import { MemorelayHub } from '../core/lib/memorelay-hub';
import {
  setupTestClient,
  setupTestHub,
  setupTestHubAndClient,
} from './setup-test-hub-and-client';

describe('setupTestHub()', () => {
  it('should create a connectable test hub', () => {
    const hub = setupTestHub();
    expect(hub).toBeInstanceOf(MemorelayHub);
    hub.connect();
  });

  it('should invoke plugin functions', () => {
    const mockPluginFn = jest.fn<unknown, [MemorelayHub]>();
    const hub = setupTestHub(mockPluginFn);
    expect(mockPluginFn).toHaveBeenCalledTimes(1);
    expect(mockPluginFn).toHaveBeenCalledWith(hub);
  });
});

describe('setupTestClient()', () => {
  it('should create a test client', () => {
    const client = setupTestClient();
    expect(client).toBeInstanceOf(MemorelayClient);
  });

  it('should emit created test client to hub', () => {
    const hub = new MemorelayHub(() => []);

    const mockHandlerFn = jest.fn<unknown, [MemorelayClientCreatedEvent]>();
    hub.onEvent(MemorelayClientCreatedEvent, mockHandlerFn);

    const client = setupTestClient(hub);

    expect(mockHandlerFn).toHaveBeenCalledTimes(1);
    const memorelayClientCreatedEvent = mockHandlerFn.mock.calls[0][0];
    expect(memorelayClientCreatedEvent.details.memorelayClient).toBe(client);
  });
});

describe('setupTestClientAndHub()', () => {
  it('should create a test client and hub', () => {
    const { hub, memorelayClient } = setupTestHubAndClient();
    expect(hub).toBeInstanceOf(MemorelayHub);
    expect(memorelayClient).toBeInstanceOf(MemorelayClient);
  });

  it('should invoke plugin functions', () => {
    const mockPluginFns = [
      jest.fn<unknown, [MemorelayHub]>(),
      jest.fn<unknown, [MemorelayHub]>(),
    ];
    const hub = setupTestHub(...mockPluginFns);
    expect(mockPluginFns[0]).toHaveBeenCalledTimes(1);
    expect(mockPluginFns[0]).toHaveBeenCalledWith(hub);
    expect(mockPluginFns[1]).toHaveBeenCalledTimes(1);
    expect(mockPluginFns[1]).toHaveBeenCalledWith(hub);
  });
});
