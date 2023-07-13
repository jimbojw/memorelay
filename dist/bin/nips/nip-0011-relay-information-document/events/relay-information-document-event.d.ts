/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event indicating that a Nostr relay information document is
 * about to be served.
 */
import { RelayInformationDocument } from '../types/relay-information-document';
import { RelayEvent, RelayEventOptions } from '../../../core/events/relay-event';
export declare const RELAY_INFORMATION_DOCUMENT_EVENT_TYPE = "relay-information-document";
/**
 * @see RelayInformationDocumentEvent
 */
export interface RelayInformationDocumentEventDetails {
    /**
     * The NIP-11 relay information document that is about to be served. Listeners
     * to this event may modify the document.
     */
    readonly relayInformationDocument: RelayInformationDocument;
}
/**
 * Event emitted by the relayInformationDocument() handler to allow system
 * components and plugins to modify the outgoing relay information document
 * before it is sent to the HTTP response.
 */
export declare class RelayInformationDocumentEvent extends RelayEvent<typeof RELAY_INFORMATION_DOCUMENT_EVENT_TYPE, RelayInformationDocumentEventDetails> {
    static readonly type = "relay-information-document";
    constructor(details: RelayInformationDocumentEventDetails, options?: RelayEventOptions);
}
