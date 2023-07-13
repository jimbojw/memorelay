"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for checkClientReqMessage().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const check_client_req_message_1 = require("./check-client-req-message");
describe('checkClientReqMessage()', () => {
    it('should throw if not passed a REQ message', () => {
        expect(() => {
            (0, check_client_req_message_1.checkClientReqMessage)(['FOO']);
        }).toThrow('bad msg: wrong message type');
    });
    it('should throw if subscription id is missing', () => {
        expect(() => {
            (0, check_client_req_message_1.checkClientReqMessage)(['REQ']);
        }).toThrow('bad msg: subscription id missing');
    });
    it('should throw if subscription id is not a string', () => {
        expect(() => {
            (0, check_client_req_message_1.checkClientReqMessage)(['REQ', {}]);
        }).toThrow('bad msg: subscription id is not a string');
    });
    it('should throw if filter is invalid', () => {
        expect(() => {
            (0, check_client_req_message_1.checkClientReqMessage)(['REQ', '1', { invalid: 'filter' }]);
        }).toThrow('bad msg: unexpected filter field');
    });
});
