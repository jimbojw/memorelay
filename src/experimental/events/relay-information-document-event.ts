/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event indicating that a Nostr relay information document is
 * about to be served.
 */

import { RelayInformationDocument } from '../../lib/relay-information-document';
import { RelayEvent } from './relay-event';

export const RELAY_INFORMATION_DOCUMENT_EVENT_TYPE =
  'relay-information-document';

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
export class RelayInformationDocumentEvent extends RelayEvent<
  typeof RELAY_INFORMATION_DOCUMENT_EVENT_TYPE,
  RelayInformationDocumentEventDetails
> {
  static readonly type = RELAY_INFORMATION_DOCUMENT_EVENT_TYPE;
  constructor(details: RelayInformationDocumentEventDetails) {
    super(RELAY_INFORMATION_DOCUMENT_EVENT_TYPE, details);
  }
}
