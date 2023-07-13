/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Check whether an incoming client REQ message is valid.
 */
import { GenericMessage } from '../types/generic-message';
import { ClientReqMessage } from '../types/client-req-messsage';
/**
 * Given a GenericMessage, check whether it conforms to the REQ message type.
 * @param maybeClientReqMessage Potential ClientReqMessage to check.
 * @returns The same message, but cast as ClientReqMessage.
 * @throws BadMessageError if the incoming message is malformed.
 */
export declare function checkClientReqMessage(maybeClientReqMessage: GenericMessage): ClientReqMessage;
