/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for eventDeletion().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { RelayInformationDocumentEvent } from '../../nip-0011-relay-information-document/events/relay-information-document-event';
import { eventDeletion } from '.';

describe('eventDeletion()', () => {
  describe('#RelayInformationDocumentEvent', () => {
    it('should signal support for NIP-09', () => {
      const { hub } = setupTestHubAndClient(eventDeletion);
      const relayInformationDocumentEvent = new RelayInformationDocumentEvent({
        relayInformationDocument: {},
      });
      hub.emitEvent(relayInformationDocumentEvent);
      const { supported_nips } =
        relayInformationDocumentEvent.details.relayInformationDocument;
      expect(supported_nips).toContain(9);
    });
  });
});
