"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for checkSubscriptionId().
 */
Object.defineProperty(exports, "__esModule", { value: true });
const check_subscription_id_1 = require("./check-subscription-id");
describe('checkSubscriptionId()', () => {
    it('should throw if subscription id is empty', () => {
        expect(() => {
            (0, check_subscription_id_1.checkSubscriptionId)('');
        }).toThrow('bad msg: subscription id is empty');
    });
    it('should throw if subscription id is too long', () => {
        expect(() => {
            (0, check_subscription_id_1.checkSubscriptionId)(new Array(65).fill(0).join(''));
        }).toThrow('bad msg: subscription id is too long');
    });
});
