"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Tests for BasicEvent.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const basic_event_1 = require("./basic-event");
describe('BasicEvent', () => {
    it('should have properties match constructor params', () => {
        const eventType = 'abcde';
        const mockOriginatorTag = {};
        const mockParentEvent = {};
        const mockTargetEmitter = {};
        const mockDetails = {};
        const basicEvent = new basic_event_1.BasicEvent(eventType, mockDetails, {
            originatorTag: mockOriginatorTag,
            parentEvent: mockParentEvent,
            targetEmitter: mockTargetEmitter,
        });
        expect(basicEvent.type).toBe(eventType);
        expect(basicEvent.details).toBe(mockDetails);
        expect(basicEvent.originatorTag).toBe(mockOriginatorTag);
        expect(basicEvent.parentEvent).toBe(mockParentEvent);
        expect(basicEvent.targetEmitter).toBe(mockTargetEmitter);
    });
    it('should not have default prevented to begin with', () => {
        const basicEvent = new basic_event_1.BasicEvent('test', undefined);
        expect(basicEvent.defaultPrevented).toBe(false);
    });
    describe('preventDefault()', () => {
        it('should cause default prevented to be true', () => {
            const basicEvent = new basic_event_1.BasicEvent('test', undefined);
            basicEvent.preventDefault();
            expect(basicEvent.defaultPrevented).toBe(true);
        });
        it('should allow multiple calls without further effect', () => {
            const basicEvent = new basic_event_1.BasicEvent('test', undefined);
            basicEvent.preventDefault();
            basicEvent.preventDefault();
            basicEvent.preventDefault();
            expect(basicEvent.defaultPrevented).toBe(true);
        });
    });
});
