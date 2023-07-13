"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Test harness object for spawning child processes based on the
 * Memorelay main CLI entry point (bin.ts).
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinTestHarness = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const ws_1 = require("ws");
const get_port_from_log_message_1 = require("./get-port-from-log-message");
class BinTestHarness {
    constructor() {
        /**
         * Set of WebSockets opened by this object.
         */
        this.webSockets = new Set();
    }
    /**
     * Set up the child process.
     */
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            const childProcess = (this.childProcess = (0, child_process_1.spawn)('ts-node', [
                path_1.default.join(__dirname, '..', 'bin.ts'),
                '--no-color',
                '--port=0',
            ]));
            // Wait for child process to spawn.
            yield new Promise((resolve, reject) => {
                childProcess.on('spawn', resolve);
                childProcess.on('error', reject);
            });
            childProcess.removeAllListeners('spawn');
            childProcess.removeAllListeners('error');
            const logMessage = (this.logMessage = yield new Promise((resolve, reject) => {
                childProcess.stdout.on('data', (data) => {
                    resolve(data.toString('utf-8'));
                });
                childProcess.on('error', reject);
            }));
            childProcess.stdout.removeAllListeners('data');
            childProcess.removeAllListeners('error');
            this.boundPort = (0, get_port_from_log_message_1.getPortFromLogMessage)(logMessage);
        });
    }
    /**
     * Teardown the child process.
     */
    teardown() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.childProcess) {
                throw new Error('child process missing');
            }
            // Close all open WebSockets.
            yield Promise.all([...this.webSockets.values()].map((webSocket) => this.closeWebSocket(webSocket)));
            const childProcess = this.childProcess;
            // Interrupt child process and wait for exit.
            yield new Promise((resolve, reject) => {
                childProcess.on('error', reject);
                childProcess.on('exit', resolve);
                childProcess.kill('SIGINT');
            });
            childProcess.removeAllListeners('error');
            childProcess.removeAllListeners('exit');
        });
    }
    /**
     * Open a WebSocket to the bound port and return it.
     * @returns The opened WebSocket.
     */
    openWebSocket() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.boundPort === undefined) {
                throw new Error('bound port missing');
            }
            const webSocket = new ws_1.WebSocket(`ws://localhost:${this.boundPort}`);
            this.webSockets.add(webSocket);
            // Wait for WebSocket to connect.
            yield new Promise((resolve, reject) => {
                webSocket.on('open', resolve);
                webSocket.on('error', reject);
            });
            webSocket.removeAllListeners('open');
            webSocket.removeAllListeners('error');
            return webSocket;
        });
    }
    /**
     * Close a previously opened WebSocket.
     * @param webSocket The WebSocket to close.
     */
    closeWebSocket(webSocket) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.webSockets.has(webSocket)) {
                throw new Error('web socket not recognized');
            }
            yield new Promise((resolve, reject) => {
                webSocket.on('close', resolve);
                webSocket.on('error', reject);
                webSocket.close();
            });
            this.webSockets.delete(webSocket);
        });
    }
}
exports.BinTestHarness = BinTestHarness;
