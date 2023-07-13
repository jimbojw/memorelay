/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Handle HTTP-to-WebSocket upgrade requests.
 */
import { WebSocketServer } from 'ws';
import { UpgradeHandler } from '../types/upgrade-handler';
import { MemorelayHub } from './memorelay-hub';
/**
 * Return a handler for upgrading HTTP client connections to WebSockets.
 * @param hub Event emitter through which to broadcast upgrades.
 * @param path Optional Express path to match. Defaults to '/'.
 * @param webSocketServer WebSocket server for handling upgrades.
 * @returns Upgrade handler function.
 */
export declare function handleUpgrade(webSocketServer: WebSocketServer, hub: MemorelayHub, path?: string): UpgradeHandler;
