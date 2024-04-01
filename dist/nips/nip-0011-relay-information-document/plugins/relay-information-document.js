"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin/handler for responding to requests for the
 * information document.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.relayInformationDocument = void 0;
const relay_information_document_event_1 = require("../events/relay-information-document-event");
const http_server_request_event_1 = require("../../../core/events/http-server-request-event");
/**
 * Memorelay plugin for responding to requests for the relay information
 * document.
 * @param hub Memorelay hub instance for which HTTP requests for relay
 * information documents are to be handled.
 * @event RelayInformationDocumentEvent For Memorelay plugins to make changes to
 * the outgoing document.
 * @see https://github.com/nostr-protocol/nips/blob/master/11.md
 */
function relayInformationDocument(hub) {
    return hub.onEvent(http_server_request_event_1.HttpServerRequestEvent, (httpServerRequestEvent) => {
        if (httpServerRequestEvent.defaultPrevented) {
            return; // Preempted by another handler.
        }
        const { request, response } = httpServerRequestEvent.details;
        if (request.headers.accept !== 'application/nostr+json') {
            return; // Nothing to do, this request wasn't for an info document.
        }
        httpServerRequestEvent.preventDefault();
        if (!request.method) {
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(400, 'Bad Request');
            response.write(JSON.stringify({ error: 'Bad Request: Method missing' }));
            response.end();
            return;
        }
        if (request.method !== 'HEAD' &&
            request.method !== 'GET' &&
            request.method !== 'OPTIONS') {
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(501, 'Not Implemented');
            response.write(JSON.stringify({ error: `Not Implemented: Method ${request.method}` }));
            response.end();
            return;
        }
        if (request.headers['access-control-request-headers']) {
            // TODO(jimbo): Should the list of allowed headers be restricted?
            response.setHeader('Access-Control-Allow-Headers', '*');
        }
        response.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        response.setHeader('Access-Control-Allow-Origin', '*');
        if (request.method === 'OPTIONS') {
            response.writeHead(200, 'OK');
            response.end();
            return;
        }
        queueMicrotask(() => {
            const relayInformationDocument = {
                supported_nips: [11],
            };
            hub.emitEvent(new relay_information_document_event_1.RelayInformationDocumentEvent({ relayInformationDocument }, { parentEvent: httpServerRequestEvent, targetEmitter: hub }));
            // Deduplicate and sort supported_nips.
            relayInformationDocument.supported_nips = [
                ...new Set(relayInformationDocument.supported_nips),
            ].sort((a, b) => a - b);
            response.setHeader('Content-Type', 'application/nostr+json');
            response.writeHead(200, 'OK');
            response.write(JSON.stringify(relayInformationDocument));
            response.end();
        });
    });
}
exports.relayInformationDocument = relayInformationDocument;
