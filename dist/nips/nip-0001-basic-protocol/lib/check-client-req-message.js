"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether an incoming client REQ message is valid.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkClientReqMessage = void 0;
const bad_message_error_1 = require("../errors/bad-message-error");
const check_subscription_id_1 = require("./check-subscription-id");
const verify_filters_1 = require("./verify-filters");
/**
 * Given a GenericMessage, check whether it conforms to the REQ message type.
 * @param maybeClientReqMessage Potential ClientReqMessage to check.
 * @returns The same message, but cast as ClientReqMessage.
 * @throws BadMessageError if the incoming message is malformed.
 */
function checkClientReqMessage(maybeClientReqMessage) {
    if (maybeClientReqMessage[0] !== 'REQ') {
        throw new bad_message_error_1.BadMessageError('wrong message type');
    }
    (0, check_subscription_id_1.checkSubscriptionId)(maybeClientReqMessage[1]);
    try {
        for (let i = 2; i < maybeClientReqMessage.length; i++) {
            (0, verify_filters_1.verifyFilter)(maybeClientReqMessage[i]);
        }
    }
    catch (err) {
        throw new bad_message_error_1.BadMessageError(err.message);
    }
    return maybeClientReqMessage;
}
exports.checkClientReqMessage = checkClientReqMessage;
