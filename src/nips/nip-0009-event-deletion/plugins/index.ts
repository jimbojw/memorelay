/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin to implement NIP-09 Event Deletion.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';
import { clearHandlers } from '../../../core/lib/clear-handlers';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { Disconnectable } from '../../../core/types/disconnectable';
import { RelayInformationDocumentEvent } from '../../nip-0011-relay-information-document/events/relay-information-document-event';

/**
 * Attach handlers to implement NIP-09 Event Deletion.
 * @param hub Event hub, often a Memorelay instance.
 * @returns Handler for disconnection.
 */
export function eventDeletion(hub: MemorelayHub): Disconnectable {
  const handlers: Disconnectable[] = [];
  const disconnect = clearHandlers(handlers);

  handlers.push(
    // Signal support for NIP-09 in response to a NIP-11 relay info doc request.
    hub.onEvent(
      RelayInformationDocumentEvent,
      (relayInformationDocumentEvent: RelayInformationDocumentEvent) => {
        const { relayInformationDocument } =
          relayInformationDocumentEvent.details;
        if (!relayInformationDocument.supported_nips) {
          relayInformationDocument.supported_nips = [];
        }
        relayInformationDocument.supported_nips.push(9);
      }
    ),

    // Attach additional handlers to each created client.
    hub.onEvent(
      MemorelayClientCreatedEvent,
      ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
        autoDisconnect(memorelayClient);
      }
    )
  );

  return { disconnect };
}
