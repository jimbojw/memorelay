"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for basic logging.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingPlugin = void 0;
const memorelay_client_created_event_1 = require("../../core/events/memorelay-client-created-event");
const connectable_event_emitter_1 = require("../../core/lib/connectable-event-emitter");
const clear_handlers_1 = require("../../core/lib/clear-handlers");
const preflight_event_1 = require("../../core/events/preflight-event");
const memorelay_client_disconnect_event_1 = require("../../core/events/memorelay-client-disconnect-event");
class LoggingPlugin extends connectable_event_emitter_1.ConnectableEventEmitter {
    constructor(options) {
        super();
        this.logger = options.logger;
        this.memorelay = options.memorelay;
        this.levels = Object.assign({}, options.levels);
        this.plugins = [
            () => this.setupRelayLogging(),
            () => this.setupClientLogging(),
        ];
    }
    setupRelayLogging() {
        const hubEventTypes = new Set();
        return this.memorelay.onEvent(preflight_event_1.PreflightEvent, (preflightEvent) => {
            const { event } = preflightEvent.details;
            if (!hubEventTypes.has(event.type)) {
                hubEventTypes.add(event.type);
                this.memorelay.onEvent(event, this.logEvent('silly'));
            }
        });
    }
    setupClientLogging() {
        return this.memorelay.onEvent(memorelay_client_created_event_1.MemorelayClientCreatedEvent, ({ details: { memorelayClient } }) => {
            const clientEventTypes = new Set();
            const handlers = [];
            const disconnect = (0, clear_handlers_1.clearHandlers)(handlers);
            handlers.push(memorelayClient.onEvent(preflight_event_1.PreflightEvent, (preflightEvent) => {
                const { event } = preflightEvent.details;
                if (!clientEventTypes.has(event.type)) {
                    clientEventTypes.add(event.type);
                    handlers.push(memorelayClient.onEvent(event, this.logClientEvent(memorelayClient, 'silly')));
                }
            }), memorelayClient.onEvent(memorelay_client_disconnect_event_1.MemorelayClientDisconnectEvent, disconnect));
            return { disconnect };
        });
    }
    logEvent(defaultLevel) {
        return (event) => {
            var _a;
            const level = (_a = this.levels[event.type]) !== null && _a !== void 0 ? _a : defaultLevel;
            if (level) {
                const key = getRequestKey(getEventRequest(event));
                const depth = '.'.repeat(countAncestors(event));
                this.logger.log(level, `(${key}): ${depth}${event.type}`);
            }
        };
    }
    logClientEvent(memorelayClient, defaultLevel) {
        return (event) => {
            var _a;
            const level = (_a = this.levels[event.type]) !== null && _a !== void 0 ? _a : defaultLevel;
            if (level) {
                const key = getRequestKey(memorelayClient.request);
                const depth = '.'.repeat(countAncestors(event));
                this.logger.log(level, `(${key}): ${depth}${event.type}`);
            }
        };
    }
}
exports.LoggingPlugin = LoggingPlugin;
/**
 * Given an event, search through itself and its parents for the original
 * request that spawned it.
 * @param event The event to search.
 * @returns Found request, or undefined if one couldn't be found.
 */
function getEventRequest(event) {
    var _a, _b, _c;
    const details = event.details;
    return ((_c = (_a = details === null || details === void 0 ? void 0 : details.request) !== null && _a !== void 0 ? _a : (_b = details === null || details === void 0 ? void 0 : details.memorelayClient) === null || _b === void 0 ? void 0 : _b.request) !== null && _c !== void 0 ? _c : (event.parentEvent && getEventRequest(event.parentEvent)));
}
/**
 * Given a request, return the hex-encoded first few bytes of the
 * sec-websocket-key header value, or the defaultValue if the header is
 * undefined.
 * @param request The request to investigate.
 * @param defaultValue Optional default value to use if header is undefined.
 * @returns The sec-websocket-key header or defaultValue.
 */
function getRequestKey(request, defaultValue = 'undefined') {
    const secWebSocketKey = request === null || request === void 0 ? void 0 : request.headers['sec-websocket-key'];
    if (!secWebSocketKey) {
        return defaultValue;
    }
    return Buffer.from(secWebSocketKey, 'base64').subarray(0, 4).toString('hex');
}
/**
 * Determine the number of ancestor events a given event has. An event with an
 * undefined parentEvent has an ancestor count of 0. An event with a parentEvent
 * has its parentEvent's ancestor count plus 1.
 * @param basicEvent
 */
function countAncestors(basicEvent) {
    let ancestorCount = 0;
    let parentEvent = basicEvent.parentEvent;
    while (parentEvent) {
        ancestorCount++;
        parentEvent = parentEvent.parentEvent;
    }
    return ancestorCount;
}
