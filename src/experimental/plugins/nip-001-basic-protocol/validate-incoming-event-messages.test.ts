/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for validateIncomingEventMessages().
 */

import { validateIncomingEventMessages } from './validate-incoming-event-messages';
import { IncomingMessageEvent } from '../../events/incoming-message-event';
import { setupHubAndMemorelayClient } from '../../test/setup-hub-and-memorelay-client';
import { IncomingEventMessageEvent } from '../../events/incoming-event-message-event';
import { createSignedTestEvent } from '../../test/signed-test-event';
import { BadMessageError } from '../../../lib/bad-message-error';

describe('validateIncomingEventMessages()', () => {
  it('should validate an EVENT message', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      validateIncomingEventMessages(hub);
    });

    const mockMessageHandler = jest.fn<unknown, [IncomingEventMessageEvent]>();
    memorelayClient.on(IncomingEventMessageEvent.type, mockMessageHandler);

    const nostrEvent = createSignedTestEvent({ content: 'HELLO WORLD' });
    const incomingMessageEvent = new IncomingMessageEvent({
      incomingMessage: ['EVENT', nostrEvent],
    });
    memorelayClient.emitBasic(incomingMessageEvent);

    expect(incomingMessageEvent.defaultPrevented).toBe(true);

    expect(mockMessageHandler.mock.calls).toHaveLength(1);
    const incomingEventMessageEvent = mockMessageHandler.mock.calls[0][0];
    expect(incomingEventMessageEvent).toBeInstanceOf(IncomingEventMessageEvent);
    expect(incomingEventMessageEvent.details.eventMessage).toEqual([
      'EVENT',
      nostrEvent,
    ]);
  });

  it('should ignore an EVENT message if defaultPrevented', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      validateIncomingEventMessages(hub);
    });

    const mockMessageHandler = jest.fn<unknown, [IncomingEventMessageEvent]>();
    memorelayClient.on(IncomingEventMessageEvent.type, mockMessageHandler);

    const nostrEvent = createSignedTestEvent({ content: 'HELLO WORLD' });
    const incomingMessageEvent = new IncomingMessageEvent({
      incomingMessage: ['EVENT', nostrEvent],
    });
    incomingMessageEvent.preventDefault();
    memorelayClient.emitBasic(incomingMessageEvent);

    expect(mockMessageHandler.mock.calls).toHaveLength(0);
  });

  it('should ignore non-EVENT messages', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      validateIncomingEventMessages(hub);
    });

    const mockMessageHandler = jest.fn<unknown, [IncomingEventMessageEvent]>();
    memorelayClient.on(IncomingEventMessageEvent.type, mockMessageHandler);

    const incomingMessageEvent = new IncomingMessageEvent({
      incomingMessage: ['UNKNOWN', 12345],
    });
    memorelayClient.emitBasic(incomingMessageEvent);

    expect(incomingMessageEvent.defaultPrevented).toBe(false);

    expect(mockMessageHandler.mock.calls).toHaveLength(0);
  });

  it('should emit an error when EVENT message is malformed', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      validateIncomingEventMessages(hub);
    });

    const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
    memorelayClient.on(BadMessageError.type, mockErrorHandler);

    const incomingMessageEvent = new IncomingMessageEvent({
      incomingMessage: ['EVENT', 12345],
    });
    memorelayClient.emitBasic(incomingMessageEvent);

    expect(incomingMessageEvent.defaultPrevented).toBe(true);

    expect(mockErrorHandler.mock.calls).toHaveLength(1);
    const badMessageError = mockErrorHandler.mock.calls[0][0];
    expect(badMessageError).toBeInstanceOf(BadMessageError);
  });
});
