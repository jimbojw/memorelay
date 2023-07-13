"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for singEvent() utility function.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const nostr_tools_1 = require("nostr-tools");
const sign_event_1 = require("./sign-event");
const verify_event_1 = require("./verify-event");
describe('signEvent', () => {
    it('should be a function', () => {
        expect(typeof sign_event_1.signEvent).toBe('function');
    });
    it('should sign an event', () => {
        const secretKey = (0, nostr_tools_1.generatePrivateKey)();
        const pubkey = (0, nostr_tools_1.getPublicKey)(secretKey);
        const textEvent = (0, sign_event_1.signEvent)({
            kind: nostr_tools_1.Kind.Text,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: 'SIMPLE TEXT EVENT',
            pubkey,
        }, secretKey);
        expect(() => {
            (0, verify_event_1.verifyEvent)(textEvent);
        }).not.toThrow();
    });
    it('should ignore unsigned event id if present', () => {
        const secretKey = (0, nostr_tools_1.generatePrivateKey)();
        const pubkey = (0, nostr_tools_1.getPublicKey)(secretKey);
        const textEvent = (0, sign_event_1.signEvent)({
            id: 'INCORRECT ID FIELD VALUE',
            kind: nostr_tools_1.Kind.Text,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: 'SIMPLE TEXT EVENT',
            pubkey,
        }, secretKey);
        expect(() => {
            (0, verify_event_1.verifyEvent)(textEvent);
        }).not.toThrow();
    });
});
