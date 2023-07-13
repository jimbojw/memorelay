/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for generalizeOutgoingEOSEMessages().
 */

import { generalizeOutgoingEOSEMessages } from './generalize-outgoing-eose-messages';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { OutgoingGenericMessageEvent } from '../events/outgoing-generic-message-event';
import { OutgoingEOSEMessageEvent } from '../events/outgoing-eose-message-event';

describe('generalizeOutgoingEOSEMessages()', () => {
  describe('#OutgoingEOSEMessageEvent', () => {
    it('should send an OutgoingEOSEMessageEvent', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        generalizeOutgoingEOSEMessages
      );

      const mockMessageHandler = jest.fn<
        unknown,
        [OutgoingGenericMessageEvent]
      >();
      memorelayClient.onEvent(OutgoingGenericMessageEvent, mockMessageHandler);

      const outgoingEOSEMessageEvent = new OutgoingEOSEMessageEvent({
        relayEOSEMessage: ['EOSE', 'SUBSCRIPTION_ID'],
      });
      memorelayClient.emitEvent(outgoingEOSEMessageEvent);

      await Promise.resolve();

      expect(outgoingEOSEMessageEvent.defaultPrevented).toBe(true);

      expect(mockMessageHandler.mock.calls).toHaveLength(1);
      const outgoingGenericMessageEvent = mockMessageHandler.mock.calls[0][0];
      expect(outgoingGenericMessageEvent).toBeInstanceOf(
        OutgoingGenericMessageEvent
      );
      expect(outgoingGenericMessageEvent.details.genericMessage).toEqual([
        'EOSE',
        'SUBSCRIPTION_ID',
      ]);
      expect(outgoingGenericMessageEvent.parentEvent).toBe(
        outgoingEOSEMessageEvent
      );
      expect(outgoingGenericMessageEvent.targetEmitter).toBe(memorelayClient);
    });

    it('should ignore an outgoing EVENT message if defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        generalizeOutgoingEOSEMessages
      );

      const mockMessageHandler = jest.fn<
        unknown,
        [OutgoingGenericMessageEvent]
      >();
      memorelayClient.onEvent(OutgoingGenericMessageEvent, mockMessageHandler);

      const outgoingEOSEMessageEvent = new OutgoingEOSEMessageEvent({
        relayEOSEMessage: ['EOSE', 'SUBSCRIPTION_ID'],
      });
      outgoingEOSEMessageEvent.preventDefault();
      memorelayClient.emitEvent(outgoingEOSEMessageEvent);

      await Promise.resolve();

      expect(mockMessageHandler.mock.calls).toHaveLength(0);
    });
  });
});
