/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for validateIncomingEventMessages().
 */

import { validateIncomingReqMessages } from './validate-incoming-req-messages';
import { IncomingMessageEvent } from '../events/incoming-message-event';
import { setupHubAndMemorelayClient } from './setup-hub-and-memorelay-client';
import { IncomingReqMessageEvent } from '../events/incoming-req-message-event';
import { BadMessageError } from '../../lib/bad-message-error';

describe('validateIncomingEventMessages()', () => {
  it('should validate and re-emit a REQ message', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      validateIncomingReqMessages(hub);
    });

    const mockMessageHandler = jest.fn<unknown, [IncomingReqMessageEvent]>();
    memorelayClient.on(IncomingReqMessageEvent.type, mockMessageHandler);

    const incomingMessageEvent = new IncomingMessageEvent({
      incomingMessage: ['REQ', 'SUBSCRIPTION_ID'],
    });
    memorelayClient.emitBasic(incomingMessageEvent);

    expect(incomingMessageEvent.defaultPrevented).toBe(true);

    expect(mockMessageHandler.mock.calls).toHaveLength(1);
    const incomingReqMessageEvent = mockMessageHandler.mock.calls[0][0];
    expect(incomingReqMessageEvent).toBeInstanceOf(IncomingReqMessageEvent);
    expect(incomingReqMessageEvent.details.reqMessage).toEqual([
      'REQ',
      'SUBSCRIPTION_ID',
    ]);
  });

  it('should ignore a REQ message if defaultPrevented', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      validateIncomingReqMessages(hub);
    });

    const mockMessageHandler = jest.fn<unknown, [IncomingReqMessageEvent]>();
    memorelayClient.on(IncomingReqMessageEvent.type, mockMessageHandler);

    const incomingMessageEvent = new IncomingMessageEvent({
      incomingMessage: ['REQ', 'IGNORE_ME'],
    });
    incomingMessageEvent.preventDefault();
    memorelayClient.emitBasic(incomingMessageEvent);

    expect(mockMessageHandler.mock.calls).toHaveLength(0);
  });

  it('should ignore non-REQ messages', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      validateIncomingReqMessages(hub);
    });

    const mockMessageHandler = jest.fn<unknown, [IncomingReqMessageEvent]>();
    memorelayClient.on(IncomingReqMessageEvent.type, mockMessageHandler);

    const incomingMessageEvent = new IncomingMessageEvent({
      incomingMessage: ['UNKNOWN', 12345],
    });
    memorelayClient.emitBasic(incomingMessageEvent);

    expect(incomingMessageEvent.defaultPrevented).toBe(false);

    expect(mockMessageHandler.mock.calls).toHaveLength(0);
  });

  it('should emit an error when REQ message is malformed', () => {
    const { memorelayClient } = setupHubAndMemorelayClient((hub) => {
      validateIncomingReqMessages(hub);
    });

    const mockErrorHandler = jest.fn<unknown, [BadMessageError]>();
    memorelayClient.on(BadMessageError.type, mockErrorHandler);

    const incomingMessageEvent = new IncomingMessageEvent({
      incomingMessage: ['REQ'], // Omit required subscription id.
    });
    memorelayClient.emitBasic(incomingMessageEvent);

    expect(incomingMessageEvent.defaultPrevented).toBe(true);

    expect(mockErrorHandler.mock.calls).toHaveLength(1);
    const badMessageError = mockErrorHandler.mock.calls[0][0];
    expect(badMessageError).toBeInstanceOf(BadMessageError);
  });
});
