/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for sendOKAfterDatabaseAdd().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { DidAddEventToDatabaseEvent } from '../events/did-add-event-to-database-event';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';
import { sendOKAfterDatabaseAdd } from './send-ok-after-database-add';

describe('sendOKAfterDatabaseAdd()', () => {
  describe('#DidAddEventToDatabaseEvent', () => {
    it('should send an outgoing OK message event', async () => {
      const { memorelayClient } = setupTestHubAndClient(sendOKAfterDatabaseAdd);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const didAddEventToDatabaseEvent = new DidAddEventToDatabaseEvent({
        event: testEvent,
      });
      memorelayClient.emitEvent(didAddEventToDatabaseEvent);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingOKMessageEvent = mockHandlerFn.mock.calls[0][0];
      expect(outgoingOKMessageEvent).toBeInstanceOf(OutgoingOKMessageEvent);
      expect(outgoingOKMessageEvent.parentEvent).toBe(
        didAddEventToDatabaseEvent
      );
    });

    it('should not send when defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient(sendOKAfterDatabaseAdd);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const testEvent = createSignedTestEvent({ content: 'TEST' });
      const didAddEventToDatabaseEvent = new DidAddEventToDatabaseEvent({
        event: testEvent,
      });
      didAddEventToDatabaseEvent.preventDefault();
      memorelayClient.emitEvent(didAddEventToDatabaseEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });
});
