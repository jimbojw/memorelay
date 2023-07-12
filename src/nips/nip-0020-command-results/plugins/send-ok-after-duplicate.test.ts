/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for sendOKAfterDuplicate().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { DuplicateEventMessageEvent } from '../../nip-0001-basic-protocol/events/duplicate-event-message-event';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';
import { sendOKAfterDuplicate } from './send-ok-after-duplicate';

describe('sendOKAfterDuplicate()', () => {
  describe('#DuplicateEventMessageEvent', () => {
    it('should send an outgoing OK message event', async () => {
      const { memorelayClient } = setupTestHubAndClient();
      sendOKAfterDuplicate(memorelayClient);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const duplicateEventMessageEvent = new DuplicateEventMessageEvent({
        event: testEvent,
      });
      memorelayClient.emitEvent(duplicateEventMessageEvent);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingOKMessageEvent = mockHandlerFn.mock.calls[0][0];
      expect(outgoingOKMessageEvent).toBeInstanceOf(OutgoingOKMessageEvent);
      expect(outgoingOKMessageEvent.parentEvent).toBe(
        duplicateEventMessageEvent
      );
      expect(outgoingOKMessageEvent.details.okMessage).toEqual([
        'OK',
        testEvent.id,
        true,
        'duplicate:',
      ]);
    });

    it('should not send when defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient();
      sendOKAfterDuplicate(memorelayClient);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const duplicateEventMessageEvent = new DuplicateEventMessageEvent({
        event: testEvent,
      });
      duplicateEventMessageEvent.preventDefault();
      memorelayClient.emitEvent(duplicateEventMessageEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });
});
