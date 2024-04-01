/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for commandResults().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { commandResults } from '.';
import { RelayInformationDocumentEvent } from '../../nip-0011-relay-information-document/events/relay-information-document-event';

describe('commandResults()', () => {
  describe('#RelayInformationDocumentEvent', () => {
    it('should NOT signal support for NIP-20', () => {
      const { hub } = setupTestHubAndClient(commandResults);
      const relayInformationDocumentEvent = new RelayInformationDocumentEvent({
        relayInformationDocument: {},
      });
      hub.emitEvent(relayInformationDocumentEvent);
      const { supported_nips } =
        relayInformationDocumentEvent.details.relayInformationDocument;
      expect(supported_nips).not.toBeDefined();
    });
  });
});
