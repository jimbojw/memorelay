"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event indicating that a Nostr relay information document is
 * about to be served.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayInformationDocumentEvent = exports.RELAY_INFORMATION_DOCUMENT_EVENT_TYPE = void 0;
const relay_event_1 = require("../../../core/events/relay-event");
exports.RELAY_INFORMATION_DOCUMENT_EVENT_TYPE = 'relay-information-document';
/**
 * Event emitted by the relayInformationDocument() handler to allow system
 * components and plugins to modify the outgoing relay information document
 * before it is sent to the HTTP response.
 */
class RelayInformationDocumentEvent extends relay_event_1.RelayEvent {
    constructor(details, options) {
        super(exports.RELAY_INFORMATION_DOCUMENT_EVENT_TYPE, details, options);
    }
}
RelayInformationDocumentEvent.type = exports.RELAY_INFORMATION_DOCUMENT_EVENT_TYPE;
exports.RelayInformationDocumentEvent = RelayInformationDocumentEvent;
