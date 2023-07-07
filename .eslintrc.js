/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Configuration for ESLint.
 */

const skipWords = `
cbor comparator deduplicate disconnectable dotenv ecma eose fileoverview fs lang
localhost jsx memorelay microtask msg nostr pathname printf pubkey readonly req
sig stateful stderr stdin stdout transformative tsconfig tsx uint unparseable
upgradeable utf ws wss
`.match(/\w+/g);

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  overrides: [
    {
      files: ['**/*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-confusing-void-expression': 'error',
        '@typescript-eslint/no-explicit-any': [
          'error',
          { ignoreRestArgs: true },
        ],
        '@typescript-eslint/prefer-readonly': 'error',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['spellcheck'],
  root: true,
  rules: {
    'spellcheck/spell-checker': [
      'warn',
      {
        comments: true,
        strings: true,
        identifiers: true,
        templates: false,
        lang: 'en_US',
        skipWords: skipWords,
        skipIfMatch: [/TODO\s*\([^)]+\):/, /[a-f0-9]{64}/],
      },
    ],
  },
};
