/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for validateIncomingCloseEventMessages().
 */

import { validateIncomingCloseMessages } from './validate-incoming-close-messages';
import { IncomingGenericMessageEvent } from '../events/incoming-generic-message-event';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { IncomingCloseMessageEvent } from '../events/incoming-close-message-event';
import { BadMessageError } from '../errors/bad-message-error';

describe('validateIncomingCloseMessages()', () => {
  describe('#IncomingGenericMessageEvent', () => {
    it('should validate and re-emit a CLOSE message', () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingCloseMessages(hub);
      });

      const mockMessageHandler = jest.fn<
        unknown,
        [IncomingCloseMessageEvent]
      >();
      memorelayClient.onEvent(IncomingCloseMessageEvent, mockMessageHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['CLOSE', 'SUBSCRIPTION_ID'],
      });
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

      expect(mockMessageHandler.mock.calls).toHaveLength(1);
      const incomingCloseMessageEvent = mockMessageHandler.mock.calls[0][0];
      expect(incomingCloseMessageEvent).toBeInstanceOf(
        IncomingCloseMessageEvent
      );
      expect(incomingCloseMessageEvent.details.closeMessage).toEqual([
        'CLOSE',
        'SUBSCRIPTION_ID',
      ]);
      expect(incomingCloseMessageEvent.parentEvent).toBe(
        incomingGenericMessageEvent
      );
      expect(incomingCloseMessageEvent.targetEmitter).toBe(memorelayClient);
    });

    it('should ignore a CLOSE message if defaultPrevented', () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingCloseMessages(hub);
      });

      const mockMessageHandler = jest.fn<
        unknown,
        [IncomingCloseMessageEvent]
      >();
      memorelayClient.onEvent(IncomingCloseMessageEvent, mockMessageHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['CLOSE', 'IGNORE_ME'],
      });
      incomingGenericMessageEvent.preventDefault();
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(mockMessageHandler.mock.calls).toHaveLength(0);
    });

    it('should ignore non-CLOSE messages', () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingCloseMessages(hub);
      });

      const mockMessageHandler = jest.fn<
        unknown,
        [IncomingCloseMessageEvent]
      >();
      memorelayClient.onEvent(IncomingCloseMessageEvent, mockMessageHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['UNKNOWN', 12345],
      });
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(incomingGenericMessageEvent.defaultPrevented).toBe(false);

      expect(mockMessageHandler.mock.calls).toHaveLength(0);
    });

    it('should emit an error when CLOSE message is malformed', () => {
      const { memorelayClient } = setupTestHubAndClient((hub) => {
        validateIncomingCloseMessages(hub);
      });

      const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
      memorelayClient.onError(BadMessageError, mockErrorHandler);

      const incomingGenericMessageEvent = new IncomingGenericMessageEvent({
        genericMessage: ['CLOSE'], // Omit required subscription id.
      });
      memorelayClient.emitEvent(incomingGenericMessageEvent);

      expect(incomingGenericMessageEvent.defaultPrevented).toBe(true);

      expect(mockErrorHandler.mock.calls).toHaveLength(1);
      const badMessageError = mockErrorHandler.mock.calls[0][0];
      expect(badMessageError).toBeInstanceOf(BadMessageError);
    });
  });
});