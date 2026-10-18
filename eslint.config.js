import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const nodeGlobals = {
  console: 'readonly',
  process: 'readonly',
  Buffer: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
};

const bannedProperties = [
  'innerHTML',
  'outerHTML',
  'insertAdjacentHTML',
  'localStorage',
  'sessionStorage',
  'cookie',
  'postMessage',
  'writeln',
].map((property) => ({ property, message: `${property} is banned in the widget.` }));

export default [
  { ignores: ['dist/**', 'node_modules/**', 'demo/screenshots/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-properties': ['error', ...bannedProperties],
      'no-restricted-globals': ['error', 'localStorage', 'sessionStorage', 'eval'],
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-eval': 'error',
      'no-script-url': 'error',
    },
  },
  {
    files: ['**/*.mjs', '**/*.js'],
    languageOptions: { globals: nodeGlobals },
  },
];
