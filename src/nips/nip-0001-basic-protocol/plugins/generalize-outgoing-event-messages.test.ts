/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for generalizeOutgoingEventMessages().
 */

import { generalizeOutgoingEventMessages } from './generalize-outgoing-event-messages';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { OutgoingGenericMessageEvent } from '../events/outgoing-generic-message-event';
import { OutgoingEventMessageEvent } from '../events/outgoing-event-message-event';

describe('generalizeOutgoingEventMessages()', () => {
  describe('#OutgoingEventMessageEvent', () => {
    it('should send an OutgoingEventMessageEvent', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        generalizeOutgoingEventMessages
      );

      const mockMessageHandler = jest.fn<
        unknown,
        [OutgoingGenericMessageEvent]
      >();
      memorelayClient.onEvent(OutgoingGenericMessageEvent, mockMessageHandler);

      const nostrEvent = createSignedTestEvent({ content: 'HELLO WORLD' });
      const outgoingEventMessageEvent = new OutgoingEventMessageEvent({
        relayEventMessage: ['EVENT', 'SUBSCRIPTION_ID', nostrEvent],
      });
      memorelayClient.emitEvent(outgoingEventMessageEvent);

      await Promise.resolve();

      expect(outgoingEventMessageEvent.defaultPrevented).toBe(true);

      expect(mockMessageHandler.mock.calls).toHaveLength(1);
      const outgoingGenericMessageEvent = mockMessageHandler.mock.calls[0][0];
      expect(outgoingGenericMessageEvent).toBeInstanceOf(
        OutgoingGenericMessageEvent
      );
      expect(outgoingGenericMessageEvent.details.genericMessage).toEqual([
        'EVENT',
        'SUBSCRIPTION_ID',
        nostrEvent,
      ]);
      expect(outgoingGenericMessageEvent.parentEvent).toBe(
        outgoingEventMessageEvent
      );
      expect(outgoingGenericMessageEvent.targetEmitter).toBe(memorelayClient);
    });

    it('should ignore an outgoing EVENT message if defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        generalizeOutgoingEventMessages
      );

      const mockMessageHandler = jest.fn<
        unknown,
        [OutgoingGenericMessageEvent]
      >();
      memorelayClient.onEvent(OutgoingGenericMessageEvent, mockMessageHandler);

      const nostrEvent = createSignedTestEvent({ content: 'HELLO WORLD' });
      const outgoingEventMessageEvent = new OutgoingEventMessageEvent({
        relayEventMessage: ['EVENT', 'SUBSCRIPTION_ID', nostrEvent],
      });
      outgoingEventMessageEvent.preventDefault();
      memorelayClient.emitEvent(outgoingEventMessageEvent);

      await Promise.resolve();

      expect(mockMessageHandler.mock.calls).toHaveLength(0);
    });
  });
});
