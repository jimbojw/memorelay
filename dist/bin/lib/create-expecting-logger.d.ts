/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function to support unit tests for objects that write
 * to a logger.
 */
import { LogEntry, Logger } from 'winston';
/**
 * Create a fake Logger object which expects to be called exactly as many times
 * as indicated.
 * @param invocations The expected number of invocations.
 * @returns An object containing a fake logger and a promise which will resolve
 * to the actual logs once the expected number of invocations has been reached.
 */
export declare function createExpectingLogger(invocations?: number): {
    fakeLogger: Logger;
    actualLogsPromise: Promise<LogEntry[]>;
};
