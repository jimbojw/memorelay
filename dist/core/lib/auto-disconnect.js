"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Convenience method for automatically clearing handlers when the
 * client disconnects.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoDisconnect = void 0;
const memorelay_client_disconnect_event_1 = require("../events/memorelay-client-disconnect-event");
const clear_handlers_1 = require("./clear-handlers");
/**
 * Automatically invoke the disconnect() method of an array of disconnectable
 * handlers when the provided client emits a MemorelayClientDisconnectEvent.
 * @param memorelayClient The client to watch for disconnect.
 * @param handlers The array of disconnectable handlers.
 */
function autoDisconnect(memorelayClient, ...handlers) {
    const disconnect = (0, clear_handlers_1.clearHandlers)(handlers);
    handlers.push(memorelayClient.onEvent(memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent, disconnect));
    return { disconnect };
}
exports.autoDisconnect = autoDisconnect;
