/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Test harness object for spawning child processes based on the
 * Memorelay main CLI entry point (bin.ts).
 */
/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { WebSocket } from 'ws';
export declare class BinTestHarness {
    /**
     * Port that the child process bound. Determined from log message.
     */
    boundPort?: number;
    /**
     * Reference to the spawned child process.
     */
    childProcess?: ChildProcess;
    /**
     * First logged message after child process startup.
     */
    logMessage?: string;
    /**
     * Set of WebSockets opened by this object.
     */
    readonly webSockets: Set<WebSocket>;
    /**
     * Set up the child process.
     */
    setup(): Promise<void>;
    /**
     * Teardown the child process.
     */
    teardown(): Promise<void>;
    /**
     * Open a WebSocket to the bound port and return it.
     * @returns The opened WebSocket.
     */
    openWebSocket(): Promise<WebSocket>;
    /**
     * Close a previously opened WebSocket.
     * @param webSocket The WebSocket to close.
     */
    closeWebSocket(webSocket: WebSocket): Promise<void>;
}
