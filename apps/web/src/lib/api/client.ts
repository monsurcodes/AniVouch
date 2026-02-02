import ky, { type KyInstance, type Options } from "ky";

/**
 * API Client Configuration
 * Centralized HTTP client with authentication, error handling, and retry logic
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001/api/";

/**
 * Base API client with configured defaults
 */
export const apiClient: KyInstance = ky.create({
	prefixUrl: API_BASE_URL,
	timeout: 30000, // 30 seconds
	credentials: "include", // Include cookies for session management
	retry: {
		limit: 2,
		methods: ["get", "post", "put", "patch", "delete"],
		statusCodes: [408, 413, 429, 500, 502, 503, 504],
		backoffLimit: 3000,
	},
	hooks: {
		beforeRequest: [
			(request) => {
				// Add any custom headers here
				// e.g., CSRF tokens, custom auth headers
				const token = getAuthToken();
				if (token) {
					request.headers.set("Authorization", `Bearer ${token}`);
				}
			},
		],
		afterResponse: [
			async (_request, _options, response) => {
				// Handle global response scenarios
				if (response.status === 401) {
					// Unauthorized - redirect to login or refresh token
					handleUnauthorized();
				}
				return response;
			},
		],
		beforeError: [
			(error) => {
				// Enhanced error information
				const { response } = error;
				if (response?.body) {
					error.name = "APIError";
					error.message = `${response.status}: ${response.statusText}`;
				}
				return error;
			},
		],
	},
});

/**
 * Get authentication token from storage
 * Modify based on your auth strategy (localStorage, cookies, etc.)
 */
function getAuthToken(): string | null {
	if (typeof window === "undefined") return null;

	// For now, using localStorage. You can switch to cookies or other methods
	return localStorage.getItem("auth_token");
}

/**
 * Handle unauthorized responses
 * Clear auth state and redirect to login
 */
function handleUnauthorized(): void {
	if (typeof window === "undefined") return;

	// Clear auth token
	localStorage.removeItem("auth_token");

	// Redirect to login if not already there
	if (!window.location.pathname.startsWith("/login")) {
		window.location.href = "/login";
	}
}

/**
 * Set authentication token
 */
export function setAuthToken(token: string | null): void {
	if (typeof window === "undefined") return;

	if (token) {
		localStorage.setItem("auth_token", token);
	} else {
		localStorage.removeItem("auth_token");
	}
}

/**
 * Create a custom client with different options
 * Useful for specific endpoints that need different configurations
 */
export function createApiClient(options: Options): KyInstance {
	return apiClient.extend(options);
}

/**
 * Helper for GET requests with better error handling
 */
export async function get<T>(url: string, options?: Options): Promise<T> {
	return apiClient.get(url, options).json<T>();
}

/**
 * Helper for POST requests with better error handling
 */
export async function post<T>(url: string, data?: unknown, options?: Options): Promise<T> {
	return apiClient.post(url, { json: data, ...options }).json<T>();
}

/**
 * Helper for PUT requests with better error handling
 */
export async function put<T>(url: string, data?: unknown, options?: Options): Promise<T> {
	return apiClient.put(url, { json: data, ...options }).json<T>();
}

/**
 * Helper for PATCH requests with better error handling
 */
export async function patch<T>(url: string, data?: unknown, options?: Options): Promise<T> {
	return apiClient.patch(url, { json: data, ...options }).json<T>();
}

/**
 * Helper for DELETE requests with better error handling
 */
export async function del<T>(url: string, options?: Options): Promise<T> {
	return apiClient.delete(url, options).json<T>();
}
