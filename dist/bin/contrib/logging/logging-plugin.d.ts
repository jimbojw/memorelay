/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Memorelay plugin for basic logging.
 */
import { Logger } from 'winston';
import { Memorelay } from '../../memorelay';
import { MemorelayClient } from '../../core/lib/memorelay-client';
import { Disconnectable } from '../../core/types/disconnectable';
import { MemorelayHub } from '../../core/lib/memorelay-hub';
import { ConnectableEventEmitter } from '../../core/lib/connectable-event-emitter';
import { BasicEvent } from '../../core/events/basic-event';
export interface LoggingPluginOptions {
    /**
     * Instance to use for logging Memorelay events.
     */
    logger: Logger;
    /**
     * Memorelay instance to log.
     */
    memorelay: MemorelayHub;
    /**
     * Mapping from event types to logging levels. Set value to undefined to
     * prevent logging of that event type entirely.
     */
    levels?: Record<string, string | undefined>;
}
export declare class LoggingPlugin extends ConnectableEventEmitter {
    readonly logger: Logger;
    readonly memorelay: Memorelay;
    readonly levels: Record<string, string | undefined>;
    constructor(options: LoggingPluginOptions);
    setupRelayLogging(): Disconnectable;
    setupClientLogging(): Disconnectable;
    logEvent(defaultLevel?: string): (event: BasicEvent) => void;
    logClientEvent(memorelayClient: MemorelayClient, defaultLevel?: string): (event: BasicEvent) => void;
}
