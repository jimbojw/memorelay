/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for serializeOutgoingJsonMessages().
 */

import { serializeOutgoingJsonMessages } from './serialize-outgoing-json-messages';
import { OutgoingGenericMessageEvent } from '../events/outgoing-generic-message-event';
import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { WebSocketSendEvent } from '../../../core/events/web-socket-send-event';
import { bufferToGenericMessage } from '../lib/buffer-to-generic-message';

describe('serializeOutgoingJsonMessages()', () => {
  describe('#OutgoingGenericMessageEvent', () => {
    it('should serialize a generic message', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        serializeOutgoingJsonMessages
      );

      const mockHandlerFn = jest.fn<unknown, [WebSocketSendEvent]>();
      memorelayClient.onEvent(WebSocketSendEvent, mockHandlerFn);

      const outgoingGenericMessage = new OutgoingGenericMessageEvent({
        genericMessage: ['OUTGOING', 'MESSAGE'],
      });
      memorelayClient.emitEvent(outgoingGenericMessage);

      expect(outgoingGenericMessage.defaultPrevented).toBe(true);

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const [webSocketSendEvent] = mockHandlerFn.mock.calls[0];
      expect(webSocketSendEvent).toBeInstanceOf(WebSocketSendEvent);
      expect(webSocketSendEvent.parentEvent).toBe(outgoingGenericMessage);

      const { buffer } = webSocketSendEvent.details;
      expect(bufferToGenericMessage(buffer)).toEqual(
        outgoingGenericMessage.details.genericMessage
      );
    });

    it('should not serialize when defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient(
        serializeOutgoingJsonMessages
      );

      const mockHandlerFn = jest.fn<unknown, [WebSocketSendEvent]>();
      memorelayClient.onEvent(WebSocketSendEvent, mockHandlerFn);

      const outgoingGenericMessage = new OutgoingGenericMessageEvent({
        genericMessage: ['OUTGOING', 'MESSAGE'],
      });
      outgoingGenericMessage.preventDefault();
      memorelayClient.emitEvent(outgoingGenericMessage);

      expect(outgoingGenericMessage.defaultPrevented).toBe(true);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });
  });
});
