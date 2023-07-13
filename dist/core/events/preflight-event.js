"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Preflight event emitted before another (non-preflight) event.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreflightEvent = exports.PREFLIGHT_EVENT_TYPE = void 0;
const basic_event_1 = require("./basic-event");
exports.PREFLIGHT_EVENT_TYPE = 'preflight-event';
/**
 * Just before a non-preflight event will be emitted, a BasicEventEmitter will
 * emit a preflight event containing that event in its details. This allows for
 * meta-event programming, such as logging, to become aware of previously
 * unknown event types.
 */
class PreflightEvent extends basic_event_1.BasicEvent {
    constructor(details, options) {
        super(exports.PREFLIGHT_EVENT_TYPE, details, options);
    }
}
PreflightEvent.type = exports.PREFLIGHT_EVENT_TYPE;
exports.PreflightEvent = PreflightEvent;
