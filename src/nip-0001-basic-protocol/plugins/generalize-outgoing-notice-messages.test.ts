/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for generalizeOutgoingNoticeMessages().
 */

import { generalizeOutgoingNoticeMessages } from './generalize-outgoing-notice-messages';
import { setupTestHubAndClient } from '../../test/setup-hub-and-memorelay-client';
import { OutgoingGenericMessageEvent } from '../events/outgoing-generic-message-event';
import { MemorelayClientDisconnectEvent } from '../../core/events/memorelay-client-disconnect-event';
import { OutgoingNoticeMessageEvent } from '../events/outgoing-notice-message-event';

describe('generalizeOutgoingNoticeMessages()', () => {
  describe('#OutgoingNoticeMessageEvent', () => {
    it('should send an OutgoingNoticeMessageEvent', async () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        generalizeOutgoingNoticeMessages(hub);
      });

      const mockMessageHandler = jest.fn<
        unknown,
        [OutgoingGenericMessageEvent]
      >();
      memorelayClient.onEvent(OutgoingGenericMessageEvent, mockMessageHandler);

      const outgoingNoticeMessageEvent = new OutgoingNoticeMessageEvent({
        relayNoticeMessage: ['NOTICE', 'IMPORTANT ANNOUNCEMENT'],
      });
      memorelayClient.emitEvent(outgoingNoticeMessageEvent);

      await Promise.resolve();

      expect(outgoingNoticeMessageEvent.defaultPrevented).toBe(true);

      expect(mockMessageHandler.mock.calls).toHaveLength(1);
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
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        generalizeOutgoingNoticeMessages(hub);
      });

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
  describe('#MemorelayClientDisconnectEvent', () => {
    it('should trigger disconnect', async () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        generalizeOutgoingNoticeMessages(hub);
      });

      const mockMessageHandler = jest.fn<
        unknown,
        [OutgoingGenericMessageEvent]
      >();
      memorelayClient.onEvent(OutgoingGenericMessageEvent, mockMessageHandler);

      memorelayClient.emitEvent(
        new MemorelayClientDisconnectEvent({ memorelayClient })
      );

      memorelayClient.emitEvent(
        new OutgoingNoticeMessageEvent({
          relayNoticeMessage: ['NOTICE', 'IMPORTANT ANNOUNCEMENT'],
        })
      );

      await Promise.resolve();

      expect(mockMessageHandler.mock.calls).toHaveLength(0);
    });
  });
});
