/**
 * Authentication API Endpoints
 * All authentication-related API calls
 */

import type { SignUpInput, SignInEmailInput, SignInUsernameInput, AuthResponse } from "@repo/types";

import { apiClient } from "../client";

/**
 * Authentication API
 */
export const authApi = {
	/**
	 * Sign up a new user
	 */
	signUp: async (data: SignUpInput): Promise<AuthResponse> => {
		return apiClient.post("auth/sign-up", { json: data }).json<AuthResponse>();
	},

	/**
	 * Sign in with email and password
	 */
	signInWithEmail: async (data: SignInEmailInput): Promise<AuthResponse> => {
		return apiClient.post("auth/sign-in/email", { json: data }).json<AuthResponse>();
	},

	/**
	 * Sign in with username and password
	 */
	signInWithUsername: async (data: SignInUsernameInput): Promise<AuthResponse> => {
		return apiClient.post("auth/sign-in/username", { json: data }).json<AuthResponse>();
	},

	/**
	 * Sign out current user
	 */
	signOut: async (): Promise<{ message: string }> => {
		return apiClient.post("auth/sign-out").json<{ message: string }>();
	},

	/**
	 * Get OAuth URL for Google
	 */
	getGoogleAuthUrl: async (): Promise<{ data: { url: string } }> => {
		return apiClient.get("auth/google").json<{ data: { url: string } }>();
	},

	/**
	 * Send verification email
	 */
	sendVerificationEmail: async (): Promise<{ message: string }> => {
		return apiClient.get("auth/send-verification-email").json<{ message: string }>();
	},

	/**
	 * Send verification OTP
	 */
	sendVerificationOtp: async (): Promise<{ message: string }> => {
		return apiClient.get("auth/send-verification-otp").json<{ message: string }>();
	},

	/**
	 * Verify email with token
	 */
	verifyEmail: async (token: string): Promise<{ message: string }> => {
		return apiClient.get(`auth/verify-email?token=${token}`).json<{ message: string }>();
	},

	/**
	 * Reset password (requires authentication and OTP)
	 */
	resetPassword: async (data: {
		otp: string;
		password: string;
	}): Promise<{ message: string }> => {
		return apiClient.post("auth/reset-password", { json: data }).json<{ message: string }>();
	},
};
