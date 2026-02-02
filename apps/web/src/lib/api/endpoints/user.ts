/**
 * User API Endpoints
 * All user-related API calls
 */

import type { User } from "@repo/types";

import { apiClient } from "../client";

/**
 * User API
 */
export const userApi = {
	/**
	 * Get current authenticated user
	 */
	getCurrentUser: async (): Promise<User> => {
		const response = await apiClient.get("user/me").json<{ data: User }>();
		return response.data;
	},

	/**
	 * Get user by identifier (username, email, or ID)
	 */
	getUserByIdentifier: async (identifier: string): Promise<User> => {
		const response = await apiClient.get(`user/${identifier}`).json<{ data: User }>();
		return response.data;
	},

	/**
	 * Update username
	 */
	updateUsername: async (username: string): Promise<{ message: string }> => {
		return apiClient
			.post("user/me/username", { json: { username } })
			.json<{ message: string }>();
	},
};
