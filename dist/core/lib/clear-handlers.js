"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function to disconnect and clear an array of Handlers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearHandlers = void 0;
const disconnect_all_1 = require("./disconnect-all");
/**
 * Returns a function which when called will remove all elements from the
 * provided array of handlers and call .disconnect() for each one.
 * @param handlers List of handlers to clear.
 * @returns Function which will clear all handlers.
 */
function clearHandlers(handlers) {
    return () => {
        (0, disconnect_all_1.disconnectAll)(handlers);
    };
}
exports.clearHandlers = clearHandlers;
