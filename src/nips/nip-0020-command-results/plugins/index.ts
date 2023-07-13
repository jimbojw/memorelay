/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin to implement NIP-20 Command Results.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';
import { clearHandlers } from '../../../core/lib/clear-handlers';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { Disconnectable } from '../../../core/types/disconnectable';
import { RelayInformationDocumentEvent } from '../../nip-0011-relay-information-document/events/relay-information-document-event';
import { generalizeOutgoingOKMessage } from './generalize-outgoing-ok-messages';
import { sendOKAfterBadEvent } from './send-ok-after-bad-event-messages';
import { sendOKAfterDatabaseAdd } from './send-ok-after-database-add';
import { sendOKAfterDuplicate } from './send-ok-after-duplicate';

/**
 * Given an event emitter hub (presumed to be a Memorelay instance), attach
 * handlers to implement NIP-20.
 * @param hub Event hub, often a Memorelay instance.
 * @returns Handler for disconnection.
 */
export function commandResults(hub: MemorelayHub): Disconnectable {
  const handlers: Disconnectable[] = [];
  const disconnect = clearHandlers(handlers);

  handlers.push(
    // Signal support for NIP-20 in response to a NIP-11 relay info doc request.
    hub.onEvent(
      RelayInformationDocumentEvent,
      (relayInformationDocumentEvent: RelayInformationDocumentEvent) => {
        const { relayInformationDocument } =
          relayInformationDocumentEvent.details;
        if (!relayInformationDocument.supported_nips) {
          relayInformationDocument.supported_nips = [];
        }
        relayInformationDocument.supported_nips.push(20);
      }
    ),

    // Attach NIP-20 OK response handlers to each created client.
    hub.onEvent(
      MemorelayClientCreatedEvent,
      ({ details: { memorelayClient } }: MemorelayClientCreatedEvent) => {
        autoDisconnect(
          memorelayClient,
          sendOKAfterDatabaseAdd(memorelayClient),
          sendOKAfterDuplicate(memorelayClient),
          sendOKAfterBadEvent(memorelayClient),
          generalizeOutgoingOKMessage(memorelayClient)
        );
      }
    )
  );

  return { disconnect };
}
