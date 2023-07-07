/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin/handler for responding to requests for the
 * information document.
 */

import { NextFunction, Request, RequestHandler, Response } from 'express';

import { RelayInformationDocument } from '../../lib/relay-information-document';
import { RelayInformationDocumentEvent } from '../events/relay-information-document-event';
import { Memorelay } from '../../memorelay';

/**
 * Produce an Express middleware handler for responding to Nostr NIP-11 relay
 * information document requests.
 * @param memorelay Memorelay instance for which relay information document
 * requests are to be handled.
 * @returns An Express RequestHandler middleware function.
 * @event OutgoingRelayInformationDocumentEvent For Memorelay plugins to make
 * changes to the outgoing document.
 * @see https://github.com/nostr-protocol/nips/blob/master/11.md
 */
export function relayInformationDocument(memorelay: Memorelay): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    if (request.header('Accept') !== 'application/nostr+json') {
      next();
      return;
    }

    if (
      request.method !== 'HEAD' &&
      request.method !== 'GET' &&
      request.method !== 'OPTIONS'
    ) {
      response
        .status(501)
        .send({ error: `Method not implemented: ${request.method}` });
      return;
    }

    if (request.header('Access-Control-Request-Headers')) {
      // TODO(jimbo): Should the list of allowed headers be restricted?
      response.set('Access-Control-Allow-Headers', '*');
    }
    response.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    response.set('Access-Control-Allow-Origin', '*');

    if (request.method === 'OPTIONS') {
      next();
      return;
    }

    const relayInformationDocument: RelayInformationDocument = {
      supported_nips: [1, 11],
    };

    memorelay.emitEvent(
      new RelayInformationDocumentEvent(
        { relayInformationDocument },
        { targetEmitter: memorelay }
      )
    );

    // Deduplicate and sort supported_nips.
    relayInformationDocument.supported_nips = [
      ...new Set(relayInformationDocument.supported_nips),
    ].sort((a, b) => a - b);

    response
      .set('Content-Type', 'application/nostr+json')
      .status(200)
      .send(relayInformationDocument);
  };
}
