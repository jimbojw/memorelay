/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Plugin to implement NIP-20 Command Results.
 */

import { MemorelayClientCreatedEvent } from '../../../core/events/memorelay-client-created-event';
import { autoDisconnect } from '../../../core/lib/auto-disconnect';
import { MemorelayHub } from '../../../core/lib/memorelay-hub';
import { Disconnectable } from '../../../core/types/disconnectable';
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
  return hub.onEvent(
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
  );
}
