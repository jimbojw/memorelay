/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for commandResults().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { DidAddEventToDatabaseEvent } from '../../nip-0001-basic-protocol/events/did-add-event-to-database-event';
import { OutgoingGenericMessageEvent } from '../../nip-0001-basic-protocol/events/outgoing-generic-message-event';
import { OutgoingOKMessageEvent } from '../events/outgoing-ok-message-event';
import { commandResults } from './command-results';

describe('commandResults()', () => {
  describe('#DidAddEventToDatabaseEvent', () => {
    it('should send an outgoing OK message event', async () => {
      const { memorelayClient } = setupTestHubAndClient(commandResults);

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
      const { memorelayClient } = setupTestHubAndClient(commandResults);

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

  describe('#OutgoingOKMessageEvent', () => {
    it('should send an outgoing generic message event', async () => {
      const { memorelayClient } = setupTestHubAndClient(commandResults);

      const mockHandlerFn = jest.fn<unknown, [OutgoingGenericMessageEvent]>();
      memorelayClient.onEvent(OutgoingGenericMessageEvent, mockHandlerFn);

      const outgoingOKMessageEvent = new OutgoingOKMessageEvent({
        okMessage: ['OK', 'EVENT_ID', true, 'EXPLANATION'],
      });
      memorelayClient.emitEvent(outgoingOKMessageEvent);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingGenericMessageEvent = mockHandlerFn.mock.calls[0][0];
      expect(outgoingGenericMessageEvent).toBeInstanceOf(
        OutgoingGenericMessageEvent
      );
      expect(outgoingGenericMessageEvent.parentEvent).toBe(
        outgoingOKMessageEvent
      );
    });

    it('should not send when defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient(commandResults);

      const mockHandlerFn = jest.fn<unknown, [OutgoingGenericMessageEvent]>();
      memorelayClient.onEvent(OutgoingGenericMessageEvent, mockHandlerFn);

      const outgoingOKMessageEvent = new OutgoingOKMessageEvent({
        okMessage: ['OK', 'EVENT_ID', true, 'EXPLANATION'],
      });
      outgoingOKMessageEvent.preventDefault();
      memorelayClient.emitEvent(outgoingOKMessageEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });
});
