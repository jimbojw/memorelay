"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A wrapper around BasicEventEmitter for performing complete
 * connect() and disconnect().
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectableEventEmitter = exports.HANDLERS = void 0;
const basic_event_emitter_1 = require("./basic-event-emitter");
/**
 * Symbol for accessing the internal handlers list in tests.
 */
exports.HANDLERS = Symbol('handlers');
/**
 * Created by a Memorelay instance, a MemorelayClient sits atop a WebSocket. It
 * receives raw message events from the socket, and sends encoded messages back.
 */
class ConnectableEventEmitter extends basic_event_emitter_1.BasicEventEmitter {
    get [exports.HANDLERS]() {
        return this.handlers;
    }
    set [exports.HANDLERS](handlers) {
        this.handlers = handlers;
    }
    get isConnected() {
        return this.handlers !== undefined;
    }
    /**
     * Connect event handlers. This is delayed until connect() is called in order
     * to give others a chance to listen first.
     * @returns this
     */
    connect() {
        var _a;
        if (!this.handlers) {
            this.handlers = [];
            for (const pluginFn of (_a = this.plugins) !== null && _a !== void 0 ? _a : []) {
                this.handlers.push(pluginFn(this));
            }
        }
        return this;
    }
    /**
     * Disconnect all event handlers.
     * @returns this.
     */
    disconnect() {
        if (this.handlers) {
            this.handlers.forEach((handler) => {
                handler.disconnect();
            });
            this.handlers = undefined;
        }
        return this;
    }
}
exports.ConnectableEventEmitter = ConnectableEventEmitter;
