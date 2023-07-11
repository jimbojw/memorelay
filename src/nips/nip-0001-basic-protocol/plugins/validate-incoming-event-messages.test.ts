/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for validateIncomingEventMessages().
 */

import { validateIncomingEventMessages } from './validate-incoming-event-messages';
import { IncomingGenericMessageEvent } from '../events/incoming-generic-message-event';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { IncomingEventMessageEvent } from '../events/incoming-event-message-event';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { BadMessageErrorEvent } from '../events/bad-message-error-event';

describe('validateIncomingEventMessages()', () => {
  describe('#IncomingGenericMessageEvent', () => {
    it('should validate an EVENT message', async () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingEventMessages(hub);
      });

      const mockMessageHandler = jest.fn<
        unknown,
        [IncomingEventMessageEvent]
      >();
      memorelayClient.onEvent(IncomingEventMessageEvent, mockMessageHandler);

      const nostrEvent = createSignedTestEvent({ content: 'HELLO WORLD' });
      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['EVENT', nostrEvent],
      });
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

      expect(mockMessageHandler).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockMessageHandler).toHaveBeenCalledTimes(1);
      const incomingEventMessageEvent = mockMessageHandler.mock.calls[0][0];
      expect(incomingEventMessageEvent).toBeInstanceOf(
        IncomingEventMessageEvent
      );
      expect(incomingEventMessageEvent.details.clientEventMessage).toEqual([
        'EVENT',
        nostrEvent,
      ]);
      expect(incomingEventMessageEvent.parentEvent).toBe(
        incomingGenericMessageEvent
      );
      expect(incomingEventMessageEvent.targetEmitter).toBe(memorelayClient);
    });

    it('should ignore an EVENT message if defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingEventMessages(hub);
      });

      const mockMessageHandler = jest.fn<
        unknown,
        [IncomingEventMessageEvent]
      >();
      memorelayClient.onEvent(IncomingEventMessageEvent, mockMessageHandler);

      const nostrEvent = createSignedTestEvent({ content: 'HELLO WORLD' });
      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['EVENT', nostrEvent],
      });
      incomingGenericMessageEvent.preventDefault();
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      await Promise.resolve();

      expect(mockMessageHandler).not.toHaveBeenCalled();
    });

    it('should ignore non-EVENT messages', async () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingEventMessages(hub);
      });

      const mockMessageHandler = jest.fn<
        unknown,
        [IncomingEventMessageEvent]
      >();
      memorelayClient.onEvent(IncomingEventMessageEvent, mockMessageHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['UNKNOWN', 12345],
      });
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(incomingGenericMessageEvent.defaultPrevented).toBe(false);

      await Promise.resolve();

      expect(mockMessageHandler).not.toHaveBeenCalled();
    });

    it('should emit an error when EVENT message is malformed', async () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingEventMessages(hub);
      });

      const mockHandlerFn = jest.fn<unknown, [BadMessageErrorEvent]>();
      memorelayClient.onEvent(BadMessageErrorEvent, mockHandlerFn);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['EVENT', 12345],
      });
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);
      const badMessageError = mockHandlerFn.mock.calls[0][0];
      expect(badMessageError).toBeInstanceOf(BadMessageErrorEvent);
    });
  });
});
