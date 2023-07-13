/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event used to respond to an http server request.
 */
/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { RelayEvent, RelayEventOptions } from './relay-event';
export declare const HTTP_SERVER_REQUEST = "http-server-request";
/**
 * @see HttpServerRequestEvent
 */
export interface HttpServerRequestEventDetails {
    /**
     * Incoming HTTP request message.
     */
    readonly request: IncomingMessage;
    /**
     * Outgoing HTTP server response object.
     */
    readonly response: ServerResponse;
}
/**
 * Event emitted by Memorelay when the request handler returned by its
 * handleRequest() method is called. A listener for this event type should call
 * preventDefault() to stop any later listeners from attempting to also respond.
 */
export declare class HttpServerRequestEvent extends RelayEvent<typeof HTTP_SERVER_REQUEST, HttpServerRequestEventDetails> {
    static readonly type: typeof HTTP_SERVER_REQUEST;
    constructor(details: HttpServerRequestEventDetails, options?: RelayEventOptions);
}
