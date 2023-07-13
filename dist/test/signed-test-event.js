"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Create a signed event for testing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignedTestEvent = void 0;
const nostr_tools_1 = require("nostr-tools");
const sign_event_1 = require("../nips/nip-0001-basic-protocol/lib/sign-event");
function createSignedTestEvent(templateEvent, secretKey = (0, nostr_tools_1.generatePrivateKey)()) {
    const pubkey = (0, nostr_tools_1.getPublicKey)(secretKey);
    return (0, sign_event_1.signEvent)(Object.assign({
        kind: nostr_tools_1.Kind.Text,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: 'SIMPLE TEXT EVENT',
        pubkey,
    }, templateEvent), secretKey);
}
exports.createSignedTestEvent = createSignedTestEvent;
