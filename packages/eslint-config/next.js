import { globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import pluginNext from "@next/eslint-plugin-next";
import baseConfig from "./base.js";

/**
 * A custom ESLint configuration for Next.js apps in AniVouch.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
const nextJsConfig = [
	...baseConfig,
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
	{
		...pluginReact.configs.flat.recommended,
		languageOptions: {
			...pluginReact.configs.flat.recommended.languageOptions,
			globals: {
				...globals.serviceworker,
				...globals.browser,
			},
		},
	},
	{
		plugins: {
			"react-hooks": pluginReactHooks,
		},
		settings: { react: { version: "detect" } },
		rules: {
			...pluginReactHooks.configs.recommended.rules,
			"react/react-in-jsx-scope": "off",
		},
	},
	{
		plugins: {
			"@next/next": pluginNext,
		},
		rules: {
			...pluginNext.configs.recommended.rules,
			...pluginNext.configs["core-web-vitals"].rules,
		},
	},
	eslintConfigPrettier,
];

export default nextJsConfig;
