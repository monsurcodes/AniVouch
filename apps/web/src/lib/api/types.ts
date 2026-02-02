/**
 * API Response Types
 * Re-export types from @repo/types and define web-specific API types
 */

// Re-export all shared types from monorepo
export type {
	User,
	AuthResponse,
	VerificationResponse,
	ApiErrorResponse,
	PaginatedResponse,
	HealthCheckResponse,
	ApiResponse,
	QueryOptions,
	AnimeSearchResult,
	AnimeStatus,
	MediaFormat,
	AnimeTitle,
} from "@repo/types";
