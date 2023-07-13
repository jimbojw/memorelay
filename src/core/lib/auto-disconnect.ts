/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Convenience method for automatically clearing handlers when the
 * client disconnects.
 */

import { MemorelayClientDisconnectEvent } from '../events/memorelay-client-disconnect-event';
import { Disconnectable } from '../types/disconnectable';
import { clearHandlers } from './clear-handlers';
import { MemorelayClient } from './memorelay-client';

/**
 * Automatically invoke the disconnect() method of an array of disconnectable
 * handlers when the provided client emits a MemorelayClientDisconnectEvent.
 * @param memorelayClient The client to watch for disconnect.
 * @param handlers The array of disconnectable handlers.
 */
export function autoDisconnect(
  memorelayClient: MemorelayClient,
  ...handlers: Disconnectable[]
): Disconnectable {
  const disconnect = clearHandlers(handlers);
  handlers.push(
    memorelayClient.onEvent(MemorelayClientDisconnectEvent, disconnect)
  );
  return { disconnect };
}
