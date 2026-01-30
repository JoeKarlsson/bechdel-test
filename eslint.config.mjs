import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default [
	js.configs.recommended,
	prettierConfig,
	{
		files: ['**/*.{js,jsx}'],
		plugins: {
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
		},
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				...globals.jest,
				...globals.mocha,
			},
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			// React rules
			...reactPlugin.configs.recommended.rules,
			...reactHooksPlugin.configs.recommended.rules,
			'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }],
			'react/function-component-definition': 'off',
			'react/jsx-props-no-spreading': 'off',
			'react/require-default-props': 'off',
			'react/forbid-prop-types': 'warn',
			'react/no-array-index-key': 'warn',
			'react/no-unstable-nested-components': 'warn',
			'react/no-unescaped-entities': 'warn',
			'react/button-has-type': 'warn',
			'react/prop-types': 'warn',
			'react/jsx-no-constructed-context-values': 'warn',
			'react/react-in-jsx-scope': 'off', // Not needed in React 17+

			// General rules
			'no-underscore-dangle': 'off',
			'no-console': 'off',
			'no-plusplus': 'off',
			'no-use-before-define': 'off',
			'no-param-reassign': 'off',
			'consistent-return': 'off',
			'no-bitwise': 'off',
			'no-shadow': 'off',
			'no-tabs': 'off',
			indent: ['error', 'tab'],
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'no-restricted-exports': 'off',
			'no-unsafe-optional-chaining': 'warn',
			'global-require': 'warn',
			camelcase: 'warn',
			'no-restricted-syntax': 'warn',
			'class-methods-use-this': 'warn',
			'no-useless-escape': 'warn',
			'no-lonely-if': 'warn',
			'no-control-regex': 'warn',
			'no-unused-expressions': 'warn',
			'no-nested-ternary': 'warn',
			'no-promise-executor-return': 'warn',
			'no-await-in-loop': 'warn',
			'no-restricted-globals': 'warn',
			'no-setter-return': 'warn',
			'no-loop-func': 'warn',
			'no-return-await': 'warn',
			'prefer-destructuring': 'warn',
		},
	},
	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'coverage/**',
			'*.min.js',
			'webpack.config*.js',
		],
	},
];
