/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for broadcastIncomingEventMessages().
 */

import { BroadcastEventMessageEvent } from '../../events/broadcast-event-message-event';
import { broadcastIncomingEventMessages } from './broadcast-incoming-event-messages';
import { IncomingEventMessageEvent } from '../../events/incoming-event-message-event';
import { ClientEventMessage } from '../../../lib/message-types';
import { createSignedTestEvent } from '../../test/signed-test-event';
import { MemorelayClientDisconnectEvent } from '../../events/memorelay-client-disconnect-event';
import { setupTestHubAndClient } from '../../test/setup-hub-and-memorelay-client';

describe('broadcastIncomingEventMessages()', () => {
  describe('#IncomingEventMessageEvent', () => {
    it('should broadcast incoming EVENT messages up to the hub', async () => {
      const { hub, memorelayClient } = setupTestHubAndClient(
        broadcastIncomingEventMessages
      );

      const mockHandlerFn = jest.fn<unknown, [BroadcastEventMessageEvent]>();
      hub.onEvent(BroadcastEventMessageEvent, mockHandlerFn);

      const eventMessage: ClientEventMessage = [
        'EVENT',
        createSignedTestEvent({ content: 'testing testing' }),
      ];
      const incomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: eventMessage,
      });
      memorelayClient.emitEvent(incomingEventMessageEvent);

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);
      const broadcastEventMessageEvent = mockHandlerFn.mock.calls[0][0];
      expect(broadcastEventMessageEvent).toBeInstanceOf(
        BroadcastEventMessageEvent
      );
      expect(broadcastEventMessageEvent.details.clientEventMessage).toBe(
        eventMessage
      );
      expect(broadcastEventMessageEvent.details.memorelayClient).toBe(
        memorelayClient
      );
      expect(broadcastEventMessageEvent.parentEvent).toBe(
        incomingEventMessageEvent
      );
      expect(broadcastEventMessageEvent.targetEmitter).toBe(hub);
    });

    it('should NOT broadcast when defaultPrevented', async () => {
      const { hub, memorelayClient } = setupTestHubAndClient(
        broadcastIncomingEventMessages
      );

      const mockHandlerFn = jest.fn<unknown, [BroadcastEventMessageEvent]>();
      hub.onEvent(BroadcastEventMessageEvent, mockHandlerFn);

      const eventMessage: ClientEventMessage = [
        'EVENT',
        createSignedTestEvent({ content: 'testing testing' }),
      ];
      const incomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: eventMessage,
      });
      incomingEventMessageEvent.preventDefault();
      memorelayClient.emitEvent(incomingEventMessageEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });

  describe('#MemorelayClientDisconnectEvent', () => {
    it('should trigger disconnect', async () => {
      const { hub, memorelayClient } = setupTestHubAndClient(
        broadcastIncomingEventMessages
      );

      const mockHandlerFn = jest.fn<unknown, [BroadcastEventMessageEvent]>();
      hub.onEvent(BroadcastEventMessageEvent, mockHandlerFn);

      memorelayClient.emitEvent(
        new MemorelayClientDisconnectEvent({ memorelayClient })
      );

      const eventMessage: ClientEventMessage = [
        'EVENT',
        createSignedTestEvent({ content: 'testing testing' }),
      ];
      memorelayClient.emitEvent(
        new IncomingEventMessageEvent({ clientEventMessage: eventMessage })
      );

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });
});
