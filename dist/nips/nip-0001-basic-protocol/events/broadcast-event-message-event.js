"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Event to signal a Nostr EVENT message being broadcasted from
 * one client to others.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastEventMessageEvent = exports.BROADCAST_EVENT_MESSAGE_EVENT_TYPE = void 0;
const relay_event_1 = require("../../../core/events/relay-event");
exports.BROADCAST_EVENT_MESSAGE_EVENT_TYPE = 'broadcast-event-message';
/**
 * Event emitted to communicate an EVENT message between connected clients.
 * Generally, the client named in the event details will be different from the
 * emitter of the event.
 */
class BroadcastEventMessageEvent extends relay_event_1.RelayEvent {
    constructor(details, options) {
        super(exports.BROADCAST_EVENT_MESSAGE_EVENT_TYPE, details, options);
    }
}
BroadcastEventMessageEvent.type = exports.BROADCAST_EVENT_MESSAGE_EVENT_TYPE;
exports.BroadcastEventMessageEvent = BroadcastEventMessageEvent;
