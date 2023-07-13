"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Create an http server with express and upgrade it with
 * memorelay generated middleware.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const express_1 = __importDefault(require("express"));
const memorelay_1 = require("../memorelay");
const logging_plugin_1 = require("../contrib/logging/logging-plugin");
const cbor_plugin_1 = require("../contrib/cbor/cbor-plugin");
const PORT = 3000;
const LOG_LEVEL = (_a = process.env.LOG_LEVEL) !== null && _a !== void 0 ? _a : 'silly';
const memorelay = new memorelay_1.Memorelay(cbor_plugin_1.cborPlugin);
const logger = (0, winston_1.createLogger)({
    transports: [new winston_1.transports.Console({ level: LOG_LEVEL })],
    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp(), winston_1.format.splat(), winston_1.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
    })),
});
new logging_plugin_1.LoggingPlugin({ logger, memorelay }).connect();
memorelay.connect();
const app = (0, express_1.default)();
app.use('/', memorelay.handleRequest());
app.get('/', (req, res) => {
    res.send('HELLO WORLD');
});
const server = app.listen(PORT, () => {
    console.log(`LISTENING:${PORT}`);
});
server.on('upgrade', memorelay.handleUpgrade());
