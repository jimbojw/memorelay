"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for getPortFromLogMessage().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const get_port_from_log_message_1 = require("./get-port-from-log-message");
describe('getPortFromLogMessage()', () => {
    it('should throw if port number missing', () => {
        const badLogMessages = [
            'STRING WITH NO TRAILING NUMBERS',
            'STRING WITH FEWER THAN FOUR TRAILING NUMBERS: 123',
            'STRING WITH EXTRA TEXT AFTER PORT NUMBER: 1234 <EXTRA>',
        ];
        for (const badLogMessage of badLogMessages) {
            expect(() => {
                (0, get_port_from_log_message_1.getPortFromLogMessage)(badLogMessage);
            }).toThrow('port number missing');
        }
    });
});
