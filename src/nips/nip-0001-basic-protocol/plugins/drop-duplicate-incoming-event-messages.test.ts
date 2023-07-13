/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for dropDuplicateIncomingEventMessages().
 */

import { dropDuplicateIncomingEventMessages } from './drop-duplicate-incoming-event-messages';
import { IncomingEventMessageEvent } from '../events/incoming-event-message-event';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { DuplicateEventMessageEvent } from '../events/duplicate-event-message-event';

describe('dropDuplicateIncomingEventMessages()', () => {
  describe('#IncomingEventMessageEvent', () => {
    it('should drop duplicate incoming EVENT messages', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        dropDuplicateIncomingEventMessages
      );

      const mockHandlerFn = jest.fn<unknown, [DuplicateEventMessageEvent]>();
      memorelayClient.onEvent(DuplicateEventMessageEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'DUPLICATE ME' });
      const firstIncomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      memorelayClient.emitEvent(firstIncomingEventMessageEvent);

      expect(firstIncomingEventMessageEvent.defaultPrevented).toBe(false);

      await Promise.resolve();

      // The first time the testEvent is seen by the plugin, it should allow the
      // message to pass through untouched.
      expect(mockHandlerFn).not.toHaveBeenCalled();

      // Duplicate event message.
      const secondIncomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      memorelayClient.emitEvent(secondIncomingEventMessageEvent);

      expect(secondIncomingEventMessageEvent.defaultPrevented).toBe(true);

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const duplicateEventMessageEvent = mockHandlerFn.mock.calls[0][0];
      expect(duplicateEventMessageEvent).toBeInstanceOf(
        DuplicateEventMessageEvent
      );
      expect(duplicateEventMessageEvent.details.event).toBe(testEvent);
      expect(duplicateEventMessageEvent.parentEvent).toBe(
        secondIncomingEventMessageEvent
      );
    });

    it('should ignore incoming EVENT message when defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        dropDuplicateIncomingEventMessages
      );

      const mockHandlerFn = jest.fn<unknown, [DuplicateEventMessageEvent]>();
      memorelayClient.onEvent(DuplicateEventMessageEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'DUPLICATE ME' });
      const firstIncomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      firstIncomingEventMessageEvent.preventDefault();
      memorelayClient.emitEvent(firstIncomingEventMessageEvent);

      const secondIncomingEventMessageEvent = new IncomingEventMessageEvent({
        clientEventMessage: ['EVENT', testEvent],
      });
      memorelayClient.emitEvent(secondIncomingEventMessageEvent);

      expect(secondIncomingEventMessageEvent.defaultPrevented).toBe(false);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });
});
