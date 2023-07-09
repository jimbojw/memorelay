/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for dropDuplicateIncomingEventMessages().
 */

import { dropDuplicateIncomingEventMessages } from './drop-duplicate-incoming-event-messages';
import { IncomingEventMessageEvent } from '../events/incoming-event-message-event';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { setupTestHubAndClient } from '../../../test/setup-hub-and-memorelay-client';
import { MemorelayClientDisconnectEvent } from '../../../core/events/memorelay-client-disconnect-event';

describe('dropDuplicateIncomingEventMessages()', () => {
  describe('#IncomingEventMessageEvent', () => {
    it('should drop duplicate incoming EVENT messages', () => {
      const { memorelayClient } = setupTestHubAndClient(
        dropDuplicateIncomingEventMessages
      );

      const mockCallbackFn = jest.fn<unknown, [boolean]>();
      memorelayClient.onEvent(
        IncomingEventMessageEvent,
        (incomingEventMessageEvent: IncomingEventMessageEvent) => {
          mockCallbackFn(incomingEventMessageEvent.defaultPrevented);
        }
      );

      const testEvent = createSignedTestEvent({ content: 'DUPLICATE ME' });
      const incomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      memorelayClient.emitEvent(incomingEventMessageEvent);

      // The first time the testEvent is seen by the plugin, it should allow the
      // message to pass through untouched.
      expect(mockCallbackFn).toHaveBeenCalledTimes(1);
      expect(mockCallbackFn).toHaveBeenCalledWith(false);
      expect(incomingEventMessageEvent.defaultPrevented).toBe(false);

      mockCallbackFn.mockReset();
      expect(mockCallbackFn).not.toHaveBeenCalled();

      // Duplicate event message.
      const duplicateIncomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      memorelayClient.emitEvent(duplicateIncomingEventMessageEvent);

      // But subsequent times that the same testEvent is seen by the plugin, it
      // should invoke preventDefault() to signal that the event should be
      // dropped.
      expect(mockCallbackFn).toHaveBeenCalledTimes(1);
      expect(mockCallbackFn).toHaveBeenCalledWith(true);
      expect(duplicateIncomingEventMessageEvent.defaultPrevented).toBe(true);
    });

    it('should incoming EVENT message when defaultPrevented', () => {
      const { memorelayClient } = setupTestHubAndClient(
        dropDuplicateIncomingEventMessages
      );

      const mockCallbackFn = jest.fn<unknown, [boolean]>();
      memorelayClient.onEvent(
        IncomingEventMessageEvent,
        (incomingEventMessageEvent: IncomingEventMessageEvent) => {
          mockCallbackFn(incomingEventMessageEvent.defaultPrevented);
        }
      );

      const testEvent = createSignedTestEvent({ content: 'DUPLICATE ME' });

      // Initial event has preventDefault() called initially.
      const incomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      incomingEventMessageEvent.preventDefault();
      memorelayClient.emitEvent(incomingEventMessageEvent);

      // Duplicate event message, without preventDefault().
      const duplicateIncomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      memorelayClient.emitEvent(duplicateIncomingEventMessageEvent);

      // Since the initial event had defaultPrevented, the duplicate event
      // passed through unchanged.
      expect(mockCallbackFn).toHaveBeenCalledTimes(2);
      expect(mockCallbackFn).toHaveBeenLastCalledWith(false);
      expect(duplicateIncomingEventMessageEvent.defaultPrevented).toBe(false);
    });
  });

  describe('#MemorelayClientDisconnectEvent', () => {
    it('should trigger disconnect', () => {
      const { memorelayClient } = setupTestHubAndClient(
        dropDuplicateIncomingEventMessages
      );

      const mockCallbackFn = jest.fn<unknown, [boolean]>();
      memorelayClient.onEvent(
        IncomingEventMessageEvent,
        (incomingEventMessageEvent: IncomingEventMessageEvent) => {
          mockCallbackFn(incomingEventMessageEvent.defaultPrevented);
        }
      );

      const testEvent = createSignedTestEvent({ content: 'DUPLICATE ME' });
      const incomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      memorelayClient.emitEvent(incomingEventMessageEvent);

      // DISCONNECT.
      memorelayClient.emitEvent(
        new MemorelayClientDisconnectEvent({ memorelayClient })
      );

      // Duplicate event message.
      const duplicateIncomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      memorelayClient.emitEvent(duplicateIncomingEventMessageEvent);

      // Even though the event was duplicated, it is allowed through as though
      // the plugin had never been there.
      expect(mockCallbackFn).toHaveBeenCalledTimes(2);
      expect(mockCallbackFn).toHaveBeenLastCalledWith(false);
      expect(duplicateIncomingEventMessageEvent.defaultPrevented).toBe(false);
    });
  });
});
