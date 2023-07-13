"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event emitted when a supposedly CBOR payload message could not
 * be decoded.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CborDecodingErrorEvent = exports.CBOR_DECODING_ERROR_EVENT_TYPE = void 0;
const client_event_1 = require("../../../core/events/client-event");
exports.CBOR_DECODING_ERROR_EVENT_TYPE = 'cbor-decoding-error';
/**
 * Event emitted by MemorelayCore when it handles an HTTP upgrade request by
 * having its ws.WebSocketServer upgrade the connection to a ws.WebSocket.
 */
class CborDecodingErrorEvent extends client_event_1.ClientEvent {
    constructor(details, options) {
        super(exports.CBOR_DECODING_ERROR_EVENT_TYPE, details, options);
    }
}
CborDecodingErrorEvent.type = exports.CBOR_DECODING_ERROR_EVENT_TYPE;
exports.CborDecodingErrorEvent = CborDecodingErrorEvent;
