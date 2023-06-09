/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for generalizeOutgoingNoticeMessages().
 */

import { generalizeOutgoingNoticeMessages } from './generalize-outgoing-notice-messages';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { OutgoingGenericMessageEvent } from '../events/outgoing-generic-message-event';
import { OutgoingNoticeMessageEvent } from '../events/outgoing-notice-message-event';

describe('generalizeOutgoingNoticeMessages()', () => {
  describe('#OutgoingNoticeMessageEvent', () => {
    it('should send an OutgoingNoticeMessageEvent', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        generalizeOutgoingNoticeMessages
      );

      const mockMessageHandler = jest.fn<
        unknown,
        [OutgoingGenericMessageEvent]
      >();
      memorelayClient.onEvent(OutgoingGenericMessageEvent, mockMessageHandler);

      const outgoingNoticeMessageEvent = new OutgoingNoticeMessageEvent({
        relayNoticeMessage: ['NOTICE', 'IMPORTANT ANNOUNCEMENT'],
      });
      memorelayClient.emitEvent(outgoingNoticeMessageEvent);

      expect(outgoingNoticeMessageEvent.defaultPrevented).toBe(true);

      expect(mockMessageHandler).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockMessageHandler).toHaveBeenCalledTimes(1);
      const outgoingGenericMessageEvent = mockMessageHandler.mock.calls[0][0];
      expect(outgoingGenericMessageEvent).toBeInstanceOf(
        OutgoingGenericMessageEvent
      );
      expect(outgoingGenericMessageEvent.details.genericMessage).toEqual([
        'NOTICE',
        'IMPORTANT ANNOUNCEMENT',
      ]);
      expect(outgoingGenericMessageEvent.parentEvent).toBe(
        outgoingNoticeMessageEvent
      );
      expect(outgoingGenericMessageEvent.targetEmitter).toBe(memorelayClient);
    });

    it('should ignore an outgoing EVENT message if defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        generalizeOutgoingNoticeMessages
      );

      const mockMessageHandler = jest.fn<
        unknown,
        [OutgoingGenericMessageEvent]
      >();
      memorelayClient.onEvent(OutgoingGenericMessageEvent, mockMessageHandler);

      const outgoingNoticeMessageEvent = new OutgoingNoticeMessageEvent({
        relayNoticeMessage: ['NOTICE', 'IMPORTANT ANNOUNCEMENT'],
      });
      outgoingNoticeMessageEvent.preventDefault();
      memorelayClient.emitEvent(outgoingNoticeMessageEvent);

      await Promise.resolve();

      expect(mockMessageHandler.mock.calls).toHaveLength(0);
    });
  });
});
