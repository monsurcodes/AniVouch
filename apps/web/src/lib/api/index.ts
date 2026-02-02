/**
 * API Module
 * Main entry point for all API-related functionality
 */

export * from "./client";
export * from "./endpoints";

// Re-export commonly used types from @repo/types to avoid duplicate exports
export type {
	User,
	AuthResponse as SharedAuthResponse,
	VerificationResponse,
	ApiErrorResponse,
	PaginatedResponse,
	HealthCheckResponse,
	AnimeSearchResult,
} from "@repo/types";
