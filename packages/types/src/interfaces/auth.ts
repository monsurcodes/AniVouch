/**
 * Authentication Types
 * Common authentication-related types for all frontends
 */

/**
 * User object returned from API
 */
export interface User {
	id: string;
	email: string;
	name: string;
	username?: string;
	image?: string;
	emailVerified: boolean;
	createdAt: string;
	updatedAt: string;
}

/**
 * Session object from better-auth
 */
export interface Session {
	id: string;
	token: string;
	expiresAt: string;
}

/**
 * Authentication response (sign up / sign in)
 */
export interface AuthResponse {
	user: User;
	session: Session;
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
