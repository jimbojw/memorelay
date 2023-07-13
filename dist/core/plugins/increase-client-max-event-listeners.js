"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugin for increasing the maximum allowable
 * number of listeners on clients.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.increaseClientMaxEventListeners = void 0;
const memorelay_client_created_event_1 = require("../events/memorelay-client-created-event");
const memorelay_client_disconnect_event_1 = require("../events/memorelay-client-disconnect-event");
/**
 * Memorelay core plugin for increasing the maximum number of allowed listeners
 * on connected clients.
 */
function increaseClientMaxEventListeners(increaseCount) {
    if (!Number.isInteger(increaseCount) || increaseCount < 1) {
        throw new RangeError('increase count must be a positive integer');
    }
    return (hub) => {
        return hub.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, (memorelayClientCreatedEvent) => {
            if (memorelayClientCreatedEvent.defaultPrevented) {
                return; // Preempted by another listener.
            }
            const { memorelayClient } = memorelayClientCreatedEvent.details;
            memorelayClient.maxEventListeners += increaseCount;
            const handler = memorelayClient.onEvent(memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent, (memorelayClientDisconnectEvent) => {
                if (memorelayClientDisconnectEvent.defaultPrevented) {
                    return; // Preempted by another listener.
                }
                handler.disconnect();
                memorelayClient.maxEventListeners -= increaseCount;
            });
        });
    };
}
exports.increaseClientMaxEventListeners = increaseClientMaxEventListeners;
