"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Entry point for Memorelay server (bin file).
 */
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const commander_1 = require("commander");
const http_1 = require("http");
const memorelay_1 = require("./memorelay");
const logging_plugin_1 = require("./contrib/logging/logging-plugin");
const package_json_1 = require("./lib/package-json");
const packageJson = (0, package_json_1.readPackageJson)();
if (!packageJson.name) {
    throw new Error('name field missing from package.json');
}
if (!packageJson.description) {
    throw new Error('description field missing from package.json');
}
if (!packageJson.version) {
    throw new Error('version field missing from package.json');
}
commander_1.program
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version)
    .option('-p, --port <number>', 'TCP port on which to listen', '3000')
    .option('-l, --log-level <level>', 'minimum log level to report', 'info')
    .option('--no-color', 'disable colorized log output');
commander_1.program.parse();
const options = commander_1.program.opts();
const portNumber = +options.port;
if (!Number.isFinite(portNumber)) {
    throw new Error(`invalid port number: ${options.port}`);
}
const LOG_LEVELS = [
    'error',
    'warn',
    'info',
    'http',
    'verbose',
    'debug',
    'silly',
];
const logLevel = options.logLevel;
if (!LOG_LEVELS.includes(logLevel)) {
    throw new Error(`unrecognized log level: '${logLevel}'`);
}
const formatOptions = [
    winston_1.format.timestamp(),
    winston_1.format.splat(),
    winston_1.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
    }),
];
if (options.color) {
    formatOptions.unshift(winston_1.format.colorize());
}
const logger = (0, winston_1.createLogger)({
    transports: [new winston_1.transports.Console({ level: logLevel })],
    format: winston_1.format.combine(...formatOptions),
});
const memorelay = new memorelay_1.Memorelay();
new logging_plugin_1.LoggingPlugin({ logger, memorelay }).connect();
memorelay.connect();
const httpServer = (0, http_1.createServer)(memorelay.handleRequest());
httpServer.on('upgrade', memorelay.handleUpgrade());
function reportErrorAndExit(error) {
    logger.log('error', error);
    process.exit(1);
}
httpServer.on('error', reportErrorAndExit);
function shutdownAndExit(signalName) {
    logger.log('info', `${signalName} signal received, stopping...`);
    httpServer.closeAllConnections();
    httpServer.close();
    process.exit(0);
}
process.once('SIGBREAK', shutdownAndExit);
process.once('SIGINT', shutdownAndExit);
process.once('SIGTERM', shutdownAndExit);
httpServer.listen({ port: portNumber }, () => {
    const listeningPort = httpServer.address().port;
    logger.log('info', `Memorelay listening on port ${listeningPort}`);
});
