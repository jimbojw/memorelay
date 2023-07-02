/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay core plugins for implementing NIP-01.
 */

import { BasicEventEmitter } from '../../core/basic-event-emitter';

import { parseIncomingJsonMessages } from './parse-incoming-json-messages';
import { validateIncomingCloseMessages } from './validate-incoming-close-messages';
import { validateIncomingEventMessages } from './validate-incoming-event-messages';
import { validateIncomingReqMessages } from './validate-incoming-req-messages';

export { parseIncomingJsonMessages } from './parse-incoming-json-messages';
export { validateIncomingCloseMessages } from './validate-incoming-close-messages';
export { validateIncomingEventMessages } from './validate-incoming-event-messages';
export { validateIncomingReqMessages } from './validate-incoming-req-messages';

/**
 * Given an event emitter hub (presumed to be a Memorelay instance), attach all
 * component functionality.
 * @param hub Basic event emitter, often a Memorelay instance.
 */
export function basicProtocol(hub: BasicEventEmitter) {
  // Parse incoming WebSocket 'message' buffers as generic Nostr messages.
  parseIncomingJsonMessages(hub);

  // Validate and upgrade incoming EVENT and REQ messages.
  validateIncomingEventMessages(hub);
  validateIncomingReqMessages(hub);
  validateIncomingCloseMessages(hub);
}
