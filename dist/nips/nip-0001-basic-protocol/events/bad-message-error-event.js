"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to encapsulate a BadMessageError.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadMessageErrorEvent = exports.BAD_MESSAGE_ERROR_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.BAD_MESSAGE_ERROR_EVENT_TYPE = 'bad-message-error';
/**
 * Event to encapsulate a BadMessageError thrown by some check function.
 */
class BadMessageErrorEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.BAD_MESSAGE_ERROR_EVENT_TYPE, details, options);
    }
}
BadMessageErrorEvent.type = exports.BAD_MESSAGE_ERROR_EVENT_TYPE;
exports.BadMessageErrorEvent = BadMessageErrorEvent;
