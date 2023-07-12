/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for commandResults().
 */

import { setupTestHubAndClient } from '../../../test/setup-test-hub-and-client';
import { createSignedTestEvent } from '../../../test/signed-test-event';
import { BadMessageError } from '../../nip-0001-basic-protocol/errors/bad-message-error';
import { BadMessageErrorEvent } from '../../nip-0001-basic-protocol/events/bad-message-error-event';
import { DidAddEventToDatabaseEvent } from '../../nip-0001-basic-protocol/events/did-add-event-to-database-event';
import { DuplicateEventMessageEvent } from '../../nip-0001-basic-protocol/events/duplicate-event-message-event';
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

  describe('#DuplicateEventMessageEvent', () => {
    it('should send an outgoing OK message event', async () => {
      const { memorelayClient } = setupTestHubAndClient(commandResults);

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
      const { memorelayClient } = setupTestHubAndClient(commandResults);

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

  describe('#BadMessageErrorEvent', () => {
    it('should send an outgoing OK message event', async () => {
      const { memorelayClient } = setupTestHubAndClient(commandResults);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const badMessageErrorEvent = new BadMessageErrorEvent({
        badMessageError: new BadMessageError('REASON'),
        badMessage: ['EVENT', { id: 'EVENT_ID' }],
      });
      memorelayClient.emitEvent(badMessageErrorEvent);

      expect(badMessageErrorEvent.defaultPrevented).toBe(true);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingOKMessageEvent = mockHandlerFn.mock.calls[0][0];
      expect(outgoingOKMessageEvent).toBeInstanceOf(OutgoingOKMessageEvent);
      expect(outgoingOKMessageEvent.parentEvent).toBe(badMessageErrorEvent);
      expect(outgoingOKMessageEvent.details.okMessage).toEqual([
        'OK',
        'EVENT_ID',
        false,
        'invalid: bad msg: REASON',
      ]);
    });

    it('should not send when defaultPrevented', async () => {
      const { memorelayClient } = setupTestHubAndClient(commandResults);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const badMessageErrorEvent = new BadMessageErrorEvent({
        badMessageError: new BadMessageError('REASON'),
        badMessage: ['EVENT', { id: 'EVENT_ID' }],
      });
      badMessageErrorEvent.preventDefault();
      memorelayClient.emitEvent(badMessageErrorEvent);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });

    it('should send an outgoing OK even if EVENT lacks id', async () => {
      const { memorelayClient } = setupTestHubAndClient(commandResults);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const badMessageErrorEvent = new BadMessageErrorEvent({
        badMessageError: new BadMessageError('REASON'),
        badMessage: ['EVENT', null],
      });
      memorelayClient.emitEvent(badMessageErrorEvent);

      expect(badMessageErrorEvent.defaultPrevented).toBe(true);

      expect(mockHandlerFn).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(mockHandlerFn).toHaveBeenCalledTimes(1);

      const outgoingOKMessageEvent = mockHandlerFn.mock.calls[0][0];
      expect(outgoingOKMessageEvent).toBeInstanceOf(OutgoingOKMessageEvent);
      expect(outgoingOKMessageEvent.parentEvent).toBe(badMessageErrorEvent);
      expect(outgoingOKMessageEvent.details.okMessage).toEqual([
        'OK',
        'undefined',
        false,
        'invalid: bad msg: REASON',
      ]);
    });

    it('should not send if not an EVENT message', async () => {
      const { memorelayClient } = setupTestHubAndClient(commandResults);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const badMessageErrorEvent = new BadMessageErrorEvent({
        badMessageError: new BadMessageError('REASON'),
        badMessage: ['UNKNOWN'],
      });
      memorelayClient.emitEvent(badMessageErrorEvent);

      expect(badMessageErrorEvent.defaultPrevented).toBe(false);

      await Promise.resolve();

      expect(mockHandlerFn).not.toHaveBeenCalled();
    });

    it('should not send if payload is not a generic message', async () => {
      const { memorelayClient } = setupTestHubAndClient(commandResults);

      const mockHandlerFn = jest.fn<unknown, [OutgoingOKMessageEvent]>();
      memorelayClient.onEvent(OutgoingOKMessageEvent, mockHandlerFn);

      const badMessageErrorEvent = new BadMessageErrorEvent({
        badMessageError: new BadMessageError('REASON'),
        badMessage: 'NOT_AN_OBJECT',
      });
      memorelayClient.emitEvent(badMessageErrorEvent);

      expect(badMessageErrorEvent.defaultPrevented).toBe(false);

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
