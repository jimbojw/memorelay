/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A connected Subscriber to a MemorelayServer.
 */
/// <reference types="node" />
/// <reference types="node" />
import { IncomingMessage } from 'http';
import { Logger } from 'winston';
import { WebSocket } from 'ws';
import { CloseMessage, EventMessage, ReqMessage } from './message-types';
import { MemorelayCoordinator } from './memorelay-coordinator';
export declare class Subscriber {
    private readonly webSocket;
    private readonly incomingMessage;
    private readonly logger;
    private readonly memorelay;
    /**
     * Mapping from Nostr REQ subscription id string to the Memorelay coordinator
     * subscription number. These subscriptions are only created AFTER the sweep
     * of historical events has completed.
     */
    private readonly subscriptionIdMap;
    /**
     * @param webSocket The connected socket that spawned this Subscriber.
     * @param incomingMessage Incoming HTTP message details.
     * @param logger
     * @param memorelay Backing Memorelay for handling events.
     */
    constructor(webSocket: WebSocket, incomingMessage: IncomingMessage, logger: Logger, memorelay: MemorelayCoordinator);
    /**
     * Handle an incoming WebSocket message.
     * @param payloadDataBuffer Buffer of incoming message data.
     */
    handleMessage(payloadDataBuffer: Buffer): void;
    /**
     * Handle an incoming EVENT message.
     * @param eventMessage Incoming EVENT message to handle.
     */
    handleEventMessage(eventMessage: EventMessage): void;
    /**
     * Handle an incoming REQ message.
     * @param reqMessage Incoming REQ message to handle.
     */
    handleReqMessage(reqMessage: ReqMessage): void;
    /**
     * Handle an incoming CLOSE message.
     * @param closeMessage Incoming CLOSE message to handle.
     */
    handleCloseMessage(closeMessage: CloseMessage): void;
}
