/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for validateIncomingEventMessages().
 */

import { validateIncomingEventMessages } from './validate-incoming-event-messages';
import { IncomingGenericMessageEvent } from '../events/incoming-generic-message-event';
import { setupTestHubAndClient } from '../../../test/setup-hub-and-memorelay-client';
import { IncomingEventMessageEvent } from '../events/incoming-event-message-event';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { BadMessageError } from '../errors/bad-message-error';

describe('validateIncomingEventMessages()', () => {
  describe('#IncomingGenericMessageEvent', () => {
    it('should validate an EVENT message', () => {
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

      expect(mockMessageHandler.mock.calls).toHaveLength(1);
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

    it('should ignore an EVENT message if defaultPrevented', () => {
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

      expect(mockMessageHandler.mock.calls).toHaveLength(0);
    });

    it('should ignore non-EVENT messages', () => {
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

      expect(mockMessageHandler.mock.calls).toHaveLength(0);
    });

    it('should emit an error when EVENT message is malformed', () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingEventMessages(hub);
      });

      const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
      memorelayClient.onError(BadMessageError, mockErrorHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['EVENT', 12345],
      });
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

      expect(mockErrorHandler.mock.calls).toHaveLength(1);
      const badMessageError = mockErrorHandler.mock.calls[0][0];
      expect(badMessageError).toBeInstanceOf(BadMessageError);
    });
  });
});
