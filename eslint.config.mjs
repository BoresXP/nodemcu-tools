// @ts-check

import { FlatCompat } from '@eslint/eslintrc'

import globals from 'globals'
import js from '@eslint/js'
import ts from 'typescript-eslint'
import importX from 'eslint-plugin-import-x'
import optimizeRegex from 'eslint-plugin-optimize-regex'
import promise from 'eslint-plugin-promise'
import react from 'eslint-plugin-react'
// import reactHooks from 'eslint-plugin-react-hooks'
import sonarjs from 'eslint-plugin-sonarjs'
import stylistic from '@stylistic/eslint-plugin'

const compat = new FlatCompat()

export default ts.config(
	js.configs.recommended,
	ts.configs.recommendedTypeChecked,
	ts.configs.stylisticTypeChecked,
	stylistic.configs['recommended-flat'],
	promise.configs['flat/recommended'],
	sonarjs.configs.recommended,
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
	compat.extends('plugin:react-hooks/recommended'),

	{
		ignores: ['out/*', 'eslint.config.mjs'],
	},

	{
		name: 'extension:node',
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
		plugins: {
			'optimize-regex': optimizeRegex,
			react: react,
			'@stylistic': stylistic,
		},
		languageOptions: {
			globals: {
				...globals.node,
			},
			parser: ts.parser,
			parserOptions: {
				ecmaVersion: 2022,
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		settings: {
			react: {
				version: 'detect',
			},
			'import-x/extensions': ['.ts', '.tsx'],
			'import-x/parsers': {
				'@typescript-eslint/parser': ['.ts', '.tsx'],
			},
			'import-x/resolver': {
				typescript: {
					alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
				},
				node: {
					extensions: ['.js', '.jsx', '.ts', '.tsx'],
					moduleDirectory: ['node_modules', 'src/'],
				},
			},
		},
		rules: {
			'@stylistic/no-extra-semi': 'warn', // Require or disallow semicolons instead of ASI
			'@stylistic/semi': ['error', 'never'], // Require or disallow semicolons instead of ASI
			'@stylistic/no-tabs': ['error', { allowIndentationTabs: true }], // This rule looks for tabs anywhere inside a file: code, comments or anything else.
			'@stylistic/indent': ['error', 'tab', { SwitchCase: 1 }], // Enforce consistent indentation
			'@stylistic/indent-binary-ops': ['error', 'tab'], // Indentation for binary operators in multiline expressions.
			'@stylistic/jsx-indent-props': [1, 'tab'], // Enforce props indentation in JSX.
			'@stylistic/brace-style': ['error', '1tbs'], // Enforce consistent brace style for blocks
			'@stylistic/arrow-parens': ['error', 'as-needed'], // Arrow functions can omit parentheses when they have exactly one parameter.
			'@stylistic/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }], // This rule enforces a consistent linebreak style for operators.
			'@stylistic/multiline-ternary': ['error', 'always-multiline', { ignoreJSX: true }], // This rule enforces or disallows newlines between operands of a ternary expression.
			'@stylistic/jsx-curly-brace-presence': [
				'error',
				{ props: 'ignore', children: 'always', propElementValues: 'always' },
			], // Disallow unnecessary JSX expressions when literals alone are sufficient or enforce JSX expressions on literals in JSX children or attributes.
			'@stylistic/member-delimiter-style': ['error', { multiline: { delimiter: 'none' } }], // Require a specific member delimiter style for interfaces and type literals
			'@stylistic/quotes': ['error', 'single', { avoidEscape: true }], // Enforce the consistent use of either backticks, double, or single quotes
			'@stylistic/func-call-spacing': ['error', 'never'], // Require or disallow spacing between function identifiers and their invocations

			'import-x/no-named-as-default': 'off', // Forbid use of exported name as identifier of default export.

			'no-shadow': ['error', { builtinGlobals: true }], // disallow variable declarations from shadowing variables declared in the outer scope
			'no-duplicate-imports': ['error', { includeExports: true }], // disallow duplicate module imports
			'no-template-curly-in-string': 'error', // disallow template literal placeholder syntax in regular strings
			'block-scoped-var': 'error', // enforce the use of variables within the scope they are defined
			curly: ['error', 'all'], // enforce consistent brace style for all control statements
			eqeqeq: 'error', // equire the use of === and !==
			'max-classes-per-file': ['error', 1], // enforce a maximum number of classes per file
			'no-alert': 'warn', // disallow the use of alert, confirm, and prompt
			'no-console': 'warn', // disallow the use of console
			'no-else-return': ['error', { allowElseIf: false }], // disallow else blocks after return statements in if statements
			'no-implicit-coercion': 'error', // disallow shorthand type conversions
			'no-labels': 'error', // disallow labeled statements
			'no-lone-blocks': 'error', // disallow unnecessary nested blocks
			'no-multi-spaces': 'error', // disallow multiple spaces
			'no-new': 'error', // disallow new operators outside of assignments or comparisons
			'no-new-func': 'error', // disallow new operators with the Function object
			'no-new-wrappers': 'error', // disallow new operators with the String, Number, and Boolean objects
			'no-self-compare': 'error', // disallow comparisons where both sides are exactly the same
			'no-sequences': 'error', // disallow comma operators
			'no-throw-literal': 'error', // disallow throwing literals as exceptions
			'no-unused-expressions': 'error', // disallow unused expressions
			'no-useless-call': 'error', // disallow unnecessary calls to .call() and .apply()
			'no-useless-concat': 'error', // disallow unnecessary concatenation of literals or template literals
			'no-useless-return': 'error', // disallow redundant return statements
			'prefer-promise-reject-errors': 'off', // require using Error objects as Promise rejection reasons
			radix: 'error', // enforce the consistent use of the radix argument when using parseInt()
			'no-undefined': 'error', // disallow the use of undefined as an identifier
			'array-bracket-newline': ['error', { multiline: true }], // enforce linebreaks after opening and before closing array brackets
			'comma-dangle': ['error', 'always-multiline'], // require or disallow trailing commas
			'comma-style': 'error', // enforce consistent comma style
			'eol-last': 'error', // require or disallow newline at the end of files
			'key-spacing': 'error', // enforce consistent spacing between keys and values in object literal properties
			'keyword-spacing': 'error', // enforce consistent spacing before and after keywords
			'new-parens': 'error', // enforce or disallow parentheses when invoking a constructor with no arguments
			'no-bitwise': 'warn', // disallow bitwise operators
			'no-lonely-if': 'warn', // disallow if statements as the only statement in else blocks
			'no-multiple-empty-lines': 'error', // disallow multiple empty lines
			'no-nested-ternary': 'error', // disallow nested ternary expressions
			'no-new-object': 'error', // disallow Object constructors
			'no-tabs': ['warn', { allowIndentationTabs: true }], // disallow all tabs
			'no-trailing-spaces': 'error', // disallow trailing whitespace at the end of lines
			'no-unneeded-ternary': 'error', // disallow ternary operators when simpler alternatives exist
			'no-whitespace-before-property': 'error', // disallow whitespace before properties
			'object-curly-newline': 'error', // enforce consistent line breaks inside braces
			'object-curly-spacing': ['error', 'always'], // enforce consistent spacing inside braces
			'semi-spacing': 'error', // enforce consistent spacing before and after semicolons
			'space-before-blocks': 'error', // enforce consistent spacing before blocks
			'space-before-function-paren': [
				'error',
				{
					anonymous: 'always',
					named: 'never',
					asyncArrow: 'always',
				},
			], // enforce consistent spacing before function definition opening parenthesis
			'space-in-parens': 'error', // enforce consistent spacing inside parentheses
			'space-infix-ops': 'error', // require spacing around infix operators
			'space-unary-ops': 'error', // enforce consistent spacing before or after unary operators
			'spaced-comment': ['error', 'always'], // enforce consistent spacing after the // or /* in a comment
			'switch-colon-spacing': 'error', // enforce spacing around colons of switch statements
			'arrow-body-style': ['error', 'as-needed'], // require braces around arrow function bodies
			'arrow-parens': ['error', 'as-needed'], // require parentheses around arrow function arguments
			'arrow-spacing': 'error', // enforce consistent spacing before and after the arrow in arrow functions
			'generator-star-spacing': ['error', 'after'], // enforce consistent spacing around * operators in generator functions
			'no-useless-computed-key': 'error', // disallow unnecessary computed property keys in object literals
			'no-useless-rename': 'error', // disallow renaming import, export, and destructured assignments to the same name
			'object-shorthand': ['error', 'always'], // require or disallow method and property shorthand syntax for object literals
			'prefer-arrow-callback': 'warn', // require using arrow functions for callbacks
			'prefer-destructuring': 'warn', // require destructuring from arrays and/or objects
			'rest-spread-spacing': ['error', 'never'], // enforce spacing between rest and spread operators and their expressions
			'sort-imports': 'error', // enforce sorted import declarations within modules
			'template-curly-spacing': 'error', // require or disallow spacing around embedded expressions of template strings

			'promise/prefer-await-to-then': 'error', // prefer await to then() for reading Promise values,
			// TODO: Waiting this rule to be fixed
			// "promise/prefer-await-to-callbacks": "error", // Prefer async/await to the callback pattern
			// https://github.com/xjamundx/eslint-plugin-promise/issues/175

			'optimize-regex/optimize-regex': 'warn', // Optimize regex literals

			'@typescript-eslint/member-ordering': 'warn', // Require a consistent member declaration order
			'@typescript-eslint/no-non-null-assertion': 'error', //Disallow non-null assertions using the ! postfix operator
			'@typescript-eslint/no-useless-constructor': 'error', // Disallow unnecessary constructors
			'@typescript-eslint/prefer-for-of': 'warn', // Prefer a ‘for-of’ loop over a standard ‘for’ loop if the index is only used to access the array being iterated
			'@typescript-eslint/no-unnecessary-type-arguments': 'warn', // Warns if an explicitly specified type argument is the default for that type parameter
			'@typescript-eslint/prefer-function-type': 'warn', // Use function types instead of interfaces with call signatures
			'@typescript-eslint/prefer-readonly': 'warn', // Requires that private members are marked as readonly if they're never modified outside of the constructor
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'default',
					format: ['camelCase'],
				},
				{
					selector: 'variable',
					format: ['camelCase'],
				},
				{
					selector: 'typeLike',
					format: ['PascalCase'],
				},
				{
					selector: 'property',
					modifiers: ['private'],
					format: ['camelCase'],
					leadingUnderscore: 'require',
				},
				{
					selector: 'parameter',
					format: ['camelCase'],
					leadingUnderscore: 'allow',
				},
				{
					selector: 'import',
					format: ['PascalCase', 'camelCase'],
				},
				{
					selector: 'objectLiteralMethod',
					format: null,
					modifiers: ['requiresQuotes'],
				},
			], // Enforces naming conventions for everything across a codebase
			'@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
			'@typescript-eslint/explicit-module-boundary-types': 'off', // Require explicit return and argument types on exported functions' and classes' public class methods
			'@typescript-eslint/interface-name-prefix': 'off',
			'@typescript-eslint/restrict-template-expressions': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_$', caughtErrorsIgnorePattern: '^ignore' },
			],
			'@typescript-eslint/no-invalid-this': 'error', // disallow this keywords outside of classes or class-like objects

			'react/no-access-state-in-setstate': 'error', // Prevent using this.state inside this.setState
			'react/no-danger': 'error', // Prevent usage of dangerous JSX properties
			'react/no-multi-comp': 'error', // Prevent multiple component definition per file
			'react/no-this-in-sfc': 'error', // Prevent using this in stateless functional components
			'react/prefer-stateless-function': 'error', // Enforce stateless React Components to be written as a pure function
			'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
			'react/jsx-no-bind': 'error', // Prevent usage of .bind() and arrow functions in JSX props
			'react/jsx-no-literals': 'warn', //  Prevent usage of unwrapped JSX strings
			'react/jsx-no-useless-fragment': 'error', // Disallow unnecessary fragments,
			'react/jsx-pascal-case': 'error', // Enforce PascalCase for user-defined JSX components

			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			'react/prop-types': 'off',
		},
	},

	{
		name: 'web',
		files: ['**/*.tsx'],
		// Keep in sync with `src/terminal/content/tsconfig.json`
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parser: ts.parser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
				ecmaFeatures: {
					impliedStrict: true,
				},
				projectService: true,
			},
		},
		rules: {
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'default',
					format: ['camelCase'],
				},
				{
					selector: 'variable',
					format: ['camelCase'],
				},
				{
					selector: 'typeLike',
					format: ['PascalCase'],
				},
				{
					selector: 'property',
					modifiers: ['private'],
					format: ['camelCase'],
					leadingUnderscore: 'require',
				},
				{
					selector: 'parameter',
					format: ['camelCase'],
					leadingUnderscore: 'allow',
				},
				{
					selector: 'variable',
					modifiers: ['const'],
					types: ['function'],
					format: ['PascalCase', 'camelCase'],
				},
				{
					selector: 'import',
					format: ['PascalCase', 'camelCase'],
				},
			], // Enforces naming conventions for everything across a codebase
		},
	},
)
