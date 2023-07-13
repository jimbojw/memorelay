"use strict";
/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Types and constants related to the REQ message filters object.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILTER_FIELDS_MAP = exports.FILTER_FIELDS = exports.FILTER_INTEGER_FIELDS_MAP = exports.FILTER_INTEGER_FIELDS = exports.FILTER_INTEGER_ARRAY_FIELDS_MAP = exports.FILTER_INTEGER_ARRAY_FIELDS = exports.FILTER_STRING_ARRAY_FIELDS_MAP = exports.FILTER_STRING_ARRAY_FIELDS = exports.FILTER_ID_ARRAY_FIELDS_MAP = exports.FILTER_ID_ARRAY_FIELDS = void 0;
/**
 * Allowed fields on a filters object whose values are arrays of ID strings.
 * These are strings of hexidecmal characters up to 64 characters in length.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
exports.FILTER_ID_ARRAY_FIELDS = [
    'ids',
    'authors',
    '#e',
    '#p',
];
exports.FILTER_ID_ARRAY_FIELDS_MAP = exports.FILTER_ID_ARRAY_FIELDS.reduce((map, key) => (Object.assign(Object.assign({}, map), { [key]: key })), {});
/**
 * Allowed fields on a filter objects whose values are arrays of arbitrary
 * strings.
 * @see https://github.com/nostr-protocol/nips/blob/master/50.md
 */
exports.FILTER_STRING_ARRAY_FIELDS = ['search'];
exports.FILTER_STRING_ARRAY_FIELDS_MAP = exports.FILTER_ID_ARRAY_FIELDS.reduce((map, key) => (Object.assign(Object.assign({}, map), { [key]: key })), {});
/**
 * Allowed fields on a filters object whose values are arrays of integers.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
exports.FILTER_INTEGER_ARRAY_FIELDS = ['kinds'];
exports.FILTER_INTEGER_ARRAY_FIELDS_MAP = exports.FILTER_INTEGER_ARRAY_FIELDS.reduce((map, key) => (Object.assign(Object.assign({}, map), { [key]: key })), {});
/**
 * Allowed fields on a filters object whose values are integers.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
exports.FILTER_INTEGER_FIELDS = [
    'since',
    'until',
    'limit',
];
exports.FILTER_INTEGER_FIELDS_MAP = exports.FILTER_INTEGER_FIELDS.reduce((map, key) => (Object.assign(Object.assign({}, map), { [key]: key })), {});
/**
 * Allowed keys on a filters object.
 * @see https://github.com/nostr-protocol/nips/blob/master/01.md
 */
exports.FILTER_FIELDS = [
    ...exports.FILTER_ID_ARRAY_FIELDS,
    ...exports.FILTER_INTEGER_ARRAY_FIELDS,
    ...exports.FILTER_INTEGER_FIELDS,
    ...exports.FILTER_STRING_ARRAY_FIELDS,
];
exports.FILTER_FIELDS_MAP = exports.FILTER_FIELDS.reduce((map, key) => (Object.assign(Object.assign({}, map), { [key]: key })), {});
