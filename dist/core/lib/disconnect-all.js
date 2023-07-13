"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function to disconnect and clear an array of Handlers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectAll = void 0;
/**
 * Disconnect all handlers and empty the array..
 * @param handlers List of handlers to clear.
 */
function disconnectAll(handlers) {
    handlers.splice(0).forEach((handler) => {
        handler.disconnect();
    });
}
exports.disconnectAll = disconnectAll;
