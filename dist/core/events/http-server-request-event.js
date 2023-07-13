"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event used to respond to an http server request.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServerRequestEvent = exports.HTTP_SERVER_REQUEST = void 0;
const relay_event_1 = require("./relay-event");
exports.HTTP_SERVER_REQUEST = 'http-server-request';
/**
 * Event emitted by Memorelay when the request handler returned by its
 * handleRequest() method is called. A listener for this event type should call
 * preventDefault() to stop any later listeners from attempting to also respond.
 */
class HttpServerRequestEvent extends relay_event_1.RelayEvent {
    constructor(details, options) {
        super(exports.HTTP_SERVER_REQUEST, details, options);
    }
}
HttpServerRequestEvent.type = exports.HTTP_SERVER_REQUEST;
exports.HttpServerRequestEvent = HttpServerRequestEvent;
