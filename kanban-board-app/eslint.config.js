import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-plugin-prettier/recommended';
import jsonc from 'eslint-plugin-jsonc';
import markdown from '@eslint/markdown';
import css from '@eslint/css';
import { tailwind4 } from 'tailwind-csstree';

const eslintConfig = defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    extends: [js.configs.recommended, tseslint.configs.strict, 'react-hooks/recommended', reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      // parserOptions: {
      //   projectService: true,
      //   tsconfigRootDir: import.meta.dirname,
      // },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { ignoreRestSiblings: true, argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.json'],
    extends: [...jsonc.configs['flat/recommended-with-json']],
    rules: {
      'jsonc/no-comments': 'off',
    },
  },
  {
    files: ['**/*.css'],
    plugins: { css, prettier },
    language: 'css/css',
    languageOptions: { tolerant: true, customSyntax: tailwind4 },
    rules: {
      'css/no-empty-blocks': 'error',
    },
  },
  {
    files: ['**/*.md'],
    plugins: { markdown, prettier },
    language: 'markdown/commonmark',
    rules: {
      'markdown/no-html': 'error',
    },
  },
  prettierConfig,
  {
    rules: {
      'no-shadow': [
        'error',
        {
          builtinGlobals: true,
          hoist: 'all',
          allow: [],
          ignoreOnInitialization: false,
          ignoreTypeValueShadow: false,
          ignoreFunctionTypeParameterNameValueShadow: false,
        },
      ],
      'prettier/prettier': ['warn', { usePrettierrc: true }],
    },
  },
]);

export default eslintConfig;
