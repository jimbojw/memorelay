"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for the verifyEvent() utility function.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const verify_event_1 = require("./verify-event");
describe('verifyEvent()', () => {
    it('should be a function', () => {
        expect(typeof verify_event_1.verifyEvent).toBe('function');
    });
    it('should not throw given a valid event', () => {
        expect(() => {
            (0, verify_event_1.verifyEvent)({
                content: 'BRB, turning on the miners',
                created_at: 1683474317,
                id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
                kind: 1,
                pubkey: '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
                sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
                tags: [],
            });
        }).not.toThrow();
    });
    it('should throw given an event missing basic, required fields', () => {
        expect(() => {
            (0, verify_event_1.verifyEvent)({
                content: 'BRB, turning on the miners',
                created_at: 1683474317,
                id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
                /* kind: 1, */
                pubkey: '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
                sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
                tags: [],
            });
        }).toThrow('event invalid');
        expect(() => {
            (0, verify_event_1.verifyEvent)({
                content: 'BRB, turning on the miners',
                /* created_at: 1683474317, */
                id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
                kind: 1,
                pubkey: '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
                sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
                tags: [],
            });
        }).toThrow('event invalid');
    });
    it('should throw given an event with incorrect field value types', () => {
        expect(() => {
            (0, verify_event_1.verifyEvent)({
                content: 'BRB, turning on the miners',
                created_at: 1683474317,
                id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
                kind: 'INCORRECT_KIND_TYPE',
                pubkey: '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
                sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
                tags: [],
            });
        }).toThrow('event invalid');
        expect(() => {
            (0, verify_event_1.verifyEvent)({
                content: 'BRB, turning on the miners',
                created_at: 1683474317,
                id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
                kind: 1,
                pubkey: '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
                sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd',
                tags: 'INCORRECT_TAGS_VALUE_TYPE', // tags: [],
            });
        }).toThrow('event invalid');
    });
    it('should throw given an event without a signature', () => {
        expect(() => {
            (0, verify_event_1.verifyEvent)({
                content: 'BRB, turning on the miners',
                created_at: 1683474317,
                id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
                kind: 1,
                pubkey: '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
                /* sig: 'c84d6e0db72b1b93f7ef95a03ad73519679966d007f030fe3e82fe66e199aa10278da0806109895b62c11f516dff986a59041461c6e26e600fa0f75f4948d8bd', */
                tags: [],
            });
        }).toThrow('event signature missing');
    });
    it('should throw given an event without a bad signature', () => {
        expect(() => {
            (0, verify_event_1.verifyEvent)({
                content: 'BRB, turning on the miners',
                created_at: 1683474317,
                id: 'f9b1990f0c09f2f5bdd2311be939422ab2449f75d5de3a0167ba297bfb9ed9d3',
                kind: 1,
                pubkey: '6140478c9ae12f1d0b540e7c57806649327a91b040b07f7ba3dedc357cab0da5',
                sig: 'INCORRECT_SIGNATURE',
                tags: [],
            });
        }).toThrow('bad signature');
    });
});
