/**
 * Application Constants
 * Centralized configuration and constant values
 */

/**
 * Application routes
 */
export const ROUTES = {
	HOME: "/",
	LOGIN: "/login",
	REGISTER: "/register",
	VERIFY_EMAIL: "/verify-email",
	RESET_PASSWORD: "/reset-password",
	DASHBOARD: "/dashboard",
	PROFILE: "/profile",
	SETTINGS: "/settings",
} as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
	ROUTES.HOME,
	ROUTES.LOGIN,
	ROUTES.REGISTER,
	ROUTES.VERIFY_EMAIL,
	ROUTES.RESET_PASSWORD,
];

/**
 * Auth routes that should redirect if already authenticated
 */
export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER];

/**
 * API configuration
 */
export const API_CONFIG = {
	BASE_URL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001/api",
	TIMEOUT: 30000,
	RETRY_LIMIT: 2,
} as const;

/**
 * Query keys for React Query
 */
export const QUERY_KEYS = {
	USER: {
		CURRENT: ["user", "current"],
		BY_ID: (id: string) => ["user", id],
	},
	ANIME: {
		SEARCH: (query: string) => ["anime", "search", query],
	},
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
	AUTH_TOKEN: "auth_token",
	THEME: "theme",
} as const;

/**
 * Polling intervals (in milliseconds)
 */
export const POLLING_INTERVALS = {
	EMAIL_VERIFICATION: 3000, // 3 seconds
	USER_STATUS: 5000, // 5 seconds
} as const;
