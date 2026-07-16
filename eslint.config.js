import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'dist-app/', 'node_modules/', 'server/node_modules/', '.claude/', '*.html'] },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'warn',
      eqeqeq: ['warn', 'always'],
      curly: 'warn',
    },
  },
];
