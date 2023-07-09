/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin/handler for responding to requests for the
 * information document.
 */

import { RelayInformationDocument } from '../../../lib/relay-information-document';
import { RelayInformationDocumentEvent } from '../events/relay-information-document-event';
import { Disconnectable } from '../../../core/types/disconnectable';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { HttpServerRequestEvent } from '../../../core/events/http-server-request-event';

/**
 * Memorelay plugin for responding to requests for the relay information
 * document.
 * @param hub Memorelay hub instance for which HTTP requests for relay
 * information documents are to be handled.
 * @event RelayInformationDocumentEvent For Memorelay plugins to make changes to
 * the outgoing document.
 * @see https://github.com/nostr-protocol/nips/blob/master/11.md
 */
export function relayInformationDocument(hub: MemorelayHub): Disconnectable {
  return hub.onEvent(
    HttpServerRequestEvent,
    (httpServerRequestEvent: HttpServerRequestEvent) => {
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
        response.write(
          JSON.stringify({ error: 'Bad Request: Method missing' })
        );
        response.end();
        return;
      }

      if (
        request.method !== 'HEAD' &&
        request.method !== 'GET' &&
        request.method !== 'OPTIONS'
      ) {
        response.setHeader('Content-Type', 'application/json');
        response.writeHead(501, 'Not Implemented');
        response.write(
          JSON.stringify({ error: `Not Implemented: Method ${request.method}` })
        );
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
        const relayInformationDocument: RelayInformationDocument = {
          supported_nips: [1, 11],
        };

        hub.emitEvent(
          new RelayInformationDocumentEvent(
            { relayInformationDocument },
            { parentEvent: httpServerRequestEvent, targetEmitter: hub }
          )
        );

        // Deduplicate and sort supported_nips.
        relayInformationDocument.supported_nips = [
          ...new Set(relayInformationDocument.supported_nips),
        ].sort((a, b) => a - b);

        response.setHeader('Content-Type', 'application/nostr+json');
        response.writeHead(200, 'OK');
        response.write(JSON.stringify(relayInformationDocument));
        response.end();
      });
    }
  );
}
