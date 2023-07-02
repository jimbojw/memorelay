/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for validateIncomingEventMessages().
 */

import { BasicEventEmitter } from '../events/basic-event-emitter';
import { MemorelayClientCreatedEvent } from '../events/memorelay-client-created-event';
import { MemorelayClient } from '../memorelay-client';
import { validateIncomingEventMessages } from './validate-incoming-event-messages';
import { IncomingMessageEvent } from '../events/incoming-message-event';
import { setupHubAndMemorelayClient } from './setup-hub-and-memorelay-client';
import { IncomingEventMessageEvent } from '../events/incoming-event-message-event';
import { createSignedTestEvent } from './signed-test-event';
import { BadMessageError } from '../../lib/bad-message-error';

describe('validateIncomingEventMessages()', () => {
  it('should be a function', () => {
    expect(typeof validateIncomingEventMessages).toBe('function');
  });

  it('should listen for client connections', () => {
    const mockOnFn = jest.fn<unknown, [string, () => void]>();
    const mockHub = { on: mockOnFn } as unknown as BasicEventEmitter;
    validateIncomingEventMessages(mockHub);
    expect(mockOnFn.mock.calls).toHaveLength(1);
    const [type, callback] = mockOnFn.mock.calls[0];
    expect(type).toBe(MemorelayClientCreatedEvent.type);
    expect(typeof callback).toBe('function');
  });

  it('should listen for incoming event messages', () => {
    const hub = new BasicEventEmitter();
    validateIncomingEventMessages(hub);

    const mockOnFn = jest.fn<unknown, [string, () => void]>();
    const mockClient = { on: mockOnFn } as unknown as MemorelayClient;
    hub.emitBasic(
      new MemorelayClientCreatedEvent({ memorelayClient: mockClient })
    );

    expect(mockOnFn.mock.calls).toHaveLength(1);
    const [type, callback] = mockOnFn.mock.calls[0];
    expect(type).toBe(IncomingMessageEvent.type);
    expect(typeof callback).toBe('function');
  });

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
