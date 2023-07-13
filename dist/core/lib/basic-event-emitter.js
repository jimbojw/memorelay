"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview EventEmitter with an extra capacity for emitting BasicEvents.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicEventEmitter = void 0;
const events_1 = require("events");
const on_with_handler_1 = require("./on-with-handler");
const preflight_event_1 = require("../events/preflight-event");
class BasicEventEmitter {
    constructor() {
        /**
         * Maximum number of event listeners known to be permitted without warning.
         *
         * NOTE: Node v19 introduced the getMaxListeners() module function to support
         * determining the maxListeners of an emitter. In the future, using that would
         * be better than keeping a copy, as it would be impervious to circumvention.
         */
        this.maxEventListenersValue = events_1.defaultMaxListeners;
        this.internalEmitter = new events_1.EventEmitter();
    }
    get maxEventListeners() {
        return this.maxEventListenersValue;
    }
    set maxEventListeners(maxEventListeners) {
        this.maxEventListenersValue = maxEventListeners;
        this.internalEmitter.setMaxListeners(this.maxEventListeners);
    }
    /**
     * Emits the provided BasicEvent then returns it.
     * @param basicEvent The event to emit using its type as eventName.
     * @returns The same provided BasicEvent for chaining.
     */
    emitEvent(basicEvent) {
        if (!(basicEvent instanceof preflight_event_1.PreflightEvent)) {
            const preflightEvent = new preflight_event_1.PreflightEvent({ event: basicEvent });
            this.internalEmitter.emit(preflightEvent.type, preflightEvent);
        }
        this.internalEmitter.emit(basicEvent.type, basicEvent);
        return basicEvent;
    }
    /**
     * Listen for a BasicEvent.
     * @param basicEventType Type of event to listen for.
     * @param callbackFn Callback function to invoke when event is emitted.
     * @returns this.
     */
    onEvent(basicEventType, callbackFn) {
        return (0, on_with_handler_1.onWithHandler)(this.internalEmitter, basicEventType.type, callbackFn);
    }
}
exports.BasicEventEmitter = BasicEventEmitter;
