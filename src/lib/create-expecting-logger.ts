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
export function createExpectingLogger(invocations = 0): {
  fakeLogger: Logger;
  actualLogsPromise: Promise<LogEntry[]>;
} {
  let resolveFn: (actualLogs: LogEntry[]) => void;
  const actualLogsPromise = new Promise<LogEntry[]>((resolve) => {
    resolveFn = resolve;
  });
  const actualLogs: LogEntry[] = [];
  const fakeLogger = {
    log: (level: string, message: string) => {
      actualLogs.push({ level, message });
      if (actualLogs.length >= invocations) {
        resolveFn(actualLogs);
      }
    },
  } as unknown as Logger;
  return { fakeLogger, actualLogsPromise };
}
