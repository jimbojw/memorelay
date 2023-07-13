"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Utility function for determining the bound port based on the
 * initial log message.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPortFromLogMessage = void 0;
/**
 * Helper function to extract the listening port from the opening log message.
 * Example log message:
 * '[2023-07-08T21:41:12.035Z] info: Memorelay listening on port 35491\n'
 * @param message Log message from which to parse the port number.
 * @throws Error if a port number cannot be determined.
 */
function getPortFromLogMessage(message) {
    const matches = message.trim().match(/\d{4,}$/);
    if (!(matches === null || matches === void 0 ? void 0 : matches.length)) {
        throw new Error('port number missing');
    }
    return Number.parseInt(matches[0]);
}
exports.getPortFromLogMessage = getPortFromLogMessage;
