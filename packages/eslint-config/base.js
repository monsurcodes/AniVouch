import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
const baseConfig = [
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		plugins: {
			turbo: turboPlugin,
		},
		rules: {
			"turbo/no-undeclared-env-vars": "warn",
		},
	},
	{
		plugins: {
			"only-warn": onlyWarn,
		},
	},
	{
		ignores: ["dist/**", ".next/**", "node_modules/**"],
	},
	{
		plugins: {
			import: importPlugin,
			"unused-imports": unusedImports,
		},
		settings: {
			"import/resolver": {
				typescript: {
					alwaysTryTypes: true,
					project: "./tsconfig.json",
				},
			},
		},
		rules: {
			// Remove unused imports automatically
			"unused-imports/no-unused-imports": "error",
			"unused-imports/no-unused-vars": [
				"warn",
				{
					vars: "all",
					varsIgnorePattern: "^_",
					args: "after-used",
					argsIgnorePattern: "^_",
				},
			],

			// Enforce import order
			"import/order": [
				"error",
				{
					groups: [
						"builtin", // Node built-in modules
						"external", // npm packages
						"internal", // Aliased modules
						"parent", // Parent imports
						"sibling", // Sibling imports
						"index", // Index imports
					],
					"newlines-between": "always",
					alphabetize: {
						order: "asc",
						caseInsensitive: true,
					},
				},
			],

			// Prevent duplicate imports
			"import/no-duplicates": "error",
		},
	},
	eslintConfigPrettier,
];

export default baseConfig;
