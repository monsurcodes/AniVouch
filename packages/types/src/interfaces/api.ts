/**
 * API Response Types
 * Common API response types for all frontends
 */

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
	status: "healthy" | "unhealthy";
	checks: {
		database: boolean;
		timestamp: string;
		uptime: number;
	};
	error?: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
	data?: T;
	message?: string;
	status: number;
	error?: string;
}

/**
 * Query options for list endpoints
 */
export interface QueryOptions {
	page?: number;
	limit?: number;
	sort?: string;
	order?: "asc" | "desc";
	search?: string;
}
