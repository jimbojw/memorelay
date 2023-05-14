/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A connected Subscriber to a MemorelayServer.
 */

import { IncomingMessage } from 'http';
import { Logger } from 'winston';
import { WebSocket } from 'ws';
import { bufferToMessage } from './buffer-to-message';
import {
  ClientMessage,
  CloseMessage,
  EventMessage,
  ReqMessage,
} from './message-types';
import { Memorelay } from './memorelay';
import { InternalError } from './internal-error';

export class Subscriber {
  /**
   * Mapping from Nostr REQ subscription id string to the Memorelay subscription
   * number.
   */
  private readonly subscriptionIdMap = new Map<string, number>();

  /**
   * @param webSocket The connected socket that spawned this Subscriber.
   * @param incomingMessage Incoming HTTP message details.
   * @param logger
   * @param memorelay Backing Memorelay for handling events.
   */
  constructor(
    private readonly webSocket: WebSocket,
    private readonly incomingMessage: IncomingMessage,
    private readonly logger: Logger,
    private readonly memorelay: Memorelay
  ) {
    const { headers, url: path } = incomingMessage;
    const secWebsocketKey = headers['sec-websocket-key'];
    const url = `${headers.host ?? ''}${path ?? '/'}`;

    this.logger.log('http', 'OPEN (%s) %s', secWebsocketKey, url);

    this.webSocket.on('close', (code) => {
      for (const [, existingSubscriptionNumber] of this.subscriptionIdMap) {
        this.memorelay.unsubscribe(existingSubscriptionNumber);
      }
      this.subscriptionIdMap.clear();
      this.logger.log('http', 'CLOSE (%s) %s', secWebsocketKey, code);
    });

    this.webSocket.on('error', (error) => {
      this.logger.log('error', error);
    });

    this.webSocket.on('message', (data: Buffer) => {
      this.handleMessage(data);
    });
  }

  /**
   * Handle an incoming WebSocket message.
   * @param payloadDataBuffer Buffer of incoming message data.
   */
  handleMessage(payloadDataBuffer: Buffer) {
    if (!(payloadDataBuffer instanceof Buffer)) {
      throw new Error('unexpected message data type');
    }

    let clientMessage: ClientMessage;
    try {
      clientMessage = bufferToMessage(payloadDataBuffer);
    } catch (err) {
      const errorMessage = (err as Error).message;
      this.logger.log('verbose', `${errorMessage}`);
      this.webSocket.send(JSON.stringify(['NOTICE', `ERROR: ${errorMessage}`]));
      return;
    }

    const messageType = clientMessage[0];
    this.logger.log('silly', `MESSAGE (${messageType})`);

    if (messageType === 'EVENT') {
      this.handleEventMessage(clientMessage);
      return;
    }

    if (messageType === 'REQ') {
      this.handleReqMessage(clientMessage);
      return;
    }

    if (messageType === 'CLOSE') {
      this.handleCloseMessage(clientMessage);
      return;
    }
  }

  /**
   * Handle an incoming EVENT message.
   * @param eventMessage Incoming EVENT message to handle.
   */
  handleEventMessage(eventMessage: EventMessage) {
    const event = eventMessage[1];
    if (this.memorelay.hasEvent(event)) {
      this.logger.log('debug', 'EVENT %s (duplicate)', event.id);
      return;
    }

    this.logger.log('verbose', 'EVENT %s', event.id);

    this.memorelay.addEvent(eventMessage[1]);
  }

  /**
   * Handle an incoming REQ message.
   * @param reqMessage Incoming REQ message to handle.
   */
  handleReqMessage(reqMessage: ReqMessage) {
    const [, subscriptionId, ...filters] = reqMessage;

    this.logger.log('verbose', 'REQ %s', subscriptionId);

    const existingSubscriptionNumber =
      this.subscriptionIdMap.get(subscriptionId);
    if (existingSubscriptionNumber !== undefined) {
      this.memorelay.unsubscribe(existingSubscriptionNumber);
      this.subscriptionIdMap.delete(subscriptionId);
    }

    const newSubscriptionNumber = this.memorelay.subscribe((event) => {
      // TODO(jimbo): What if the WebSocket is disconnected?
      this.webSocket.send(
        Buffer.from(JSON.stringify(['EVENT', event]), 'utf-8')
      );
    }, filters);

    this.subscriptionIdMap.set(subscriptionId, newSubscriptionNumber);

    const matchingEvents = this.memorelay.matchFilters(filters);
    for (const event of matchingEvents) {
      this.webSocket.send(
        Buffer.from(JSON.stringify(['EVENT', event]), 'utf-8')
      );
    }
    this.webSocket.send(
      Buffer.from(JSON.stringify(['EOSE', subscriptionId]), 'utf-8')
    );
  }

  /**
   * Handle an incoming CLOSE message.
   * @param closeMessage Incoming CLOSE message to handle.
   */
  handleCloseMessage(closeMessage: CloseMessage) {
    const [, subscriptionId] = closeMessage;

    this.logger.log('verbose', 'CLOSE %s', subscriptionId);

    const existingSubscriptionNumber =
      this.subscriptionIdMap.get(subscriptionId);
    if (existingSubscriptionNumber === undefined) {
      this.webSocket.send(
        Buffer.from(
          JSON.stringify([
            'NOTICE',
            `ERROR: subscription not found: '${subscriptionId}'`,
          ]),
          'utf-8'
        )
      );
      return;
    }

    this.memorelay.unsubscribe(existingSubscriptionNumber);
    this.subscriptionIdMap.delete(subscriptionId);
  }
}
