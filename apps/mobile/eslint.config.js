import { config as reactInternalConfig } from "@repo/eslint-config/react-internal";

/**
 * ESLint configuration for the mobile (React Native/Expo) app.
 *
 * @type {import("eslint").Linter.Config[]}
 */
const mobileConfig = [
	...reactInternalConfig,
	{
		ignores: [
			"dist/**",
			".expo/**",
			"node_modules/**",
			"expo-env.d.ts",
			"**/*.config.js",
			"app-example/**",
		],
	},
];

export default mobileConfig;
