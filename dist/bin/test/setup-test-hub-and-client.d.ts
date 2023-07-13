/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Scaffolding for setting up hubs and clients in tests.
 */
import { MemorelayClient } from '../core/lib/memorelay-client';
import { MemorelayHub } from '../core/lib/memorelay-hub';
import { PluginFn } from '../core/types/plugin-types';
/**
 * Test harness to setup a test hub with one or more plugins under test.
 */
export declare function setupTestHub(...pluginFns: PluginFn<MemorelayHub>[]): MemorelayHub;
/**
 * Test harness to create a client and emit it through the hub.
 * @param hub Hub through which to emit the new client.
 */
export declare function setupTestClient(hub?: MemorelayHub): MemorelayClient;
/**
 * Convenience method for setting up an event emitter hub and a MemorelayClient
 * wrapping a mock WebSocket. This construction is useful for streamlining tests
 * that want to operate on MemorelayClient events.
 * @param pluginFns Functions to invoke before emitting the client. This is
 * where the code under test will generally be ran.
 * @returns An object with both the created hub and memorelayClient.
 */
export declare function setupTestHubAndClient(...pluginFns: PluginFn<MemorelayHub>[]): {
    hub: MemorelayHub;
    memorelayClient: MemorelayClient;
};
