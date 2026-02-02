/**
 * Authentication Types
 * Common authentication-related types for all frontends
 */

/**
 * User object returned from API
 */
export interface User {
	data: {
		id: string;
		email: string;
		name: string;
		username?: string;
		image?: string;
		emailVerified: boolean;
		createdAt: string;
		updatedAt: string;
	};
}

/**
 * Authentication response
 */
export interface AuthResponse {
	user: User;
	token?: string;
	message?: string;
}

/**
 * Verification response
 */
export interface VerificationResponse {
	success: boolean;
	message: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
	token: string;
	password: string;
}

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
	error: string;
	message: string;
	statusCode: number;
	timestamp?: string;
	details?: Record<string, unknown>;
}
