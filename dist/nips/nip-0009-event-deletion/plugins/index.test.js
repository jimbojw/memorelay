"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for eventDeletion().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const setup_test_hub_and_client_1 = require("../../../test/setup-test-hub-and-client");
const relay_information_document_event_1 = require("../../nip-0011-relay-information-document/events/relay-information-document-event");
const _1 = require(".");
describe('eventDeletion()', () => {
    describe('#RelayInformationDocumentEvent', () => {
        it('should signal support for NIP-09', () => {
            const { hub } = (0, setup_test_hub_and_client_1.setupTestHubAndClient)(_1.eventDeletion);
            const relayInformationDocumentEvent = new relay_information_document_event_1.RelayInformationDocumentEvent({
                relayInformationDocument: {},
            });
            hub.emitEvent(relayInformationDocumentEvent);
            const { supported_nips } = relayInformationDocumentEvent.details.relayInformationDocument;
            expect(supported_nips).toContain(9);
        });
    });
});
