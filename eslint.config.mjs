import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default [
	js.configs.recommended,
	prettierConfig,
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'commonjs',
			globals: { ...globals.node, ...globals.jest },
		},
		rules: {
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			indent: ['error', 'tab'],
		},
	},
	{ ignores: ['node_modules/**', 'site/**', 'coverage/**'] },
];
