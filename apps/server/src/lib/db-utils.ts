import { db } from "@/db";
import { logger } from "./logger";

/**
 * Type guard to check if an error is a database error with a code
 */
export function isDatabaseError(
	error: unknown
): error is { code: string; detail?: string; constraint?: string } {
	return (
		error !== null &&
		typeof error === "object" &&
		"code" in error &&
		typeof (error as Record<string, unknown>).code === "string"
	);
}

/**
 * Check if error is a unique constraint violation
 */
export function isUniqueViolation(error: unknown): boolean {
	return isDatabaseError(error) && error.code === "23505";
}

/**
 * Check if error is a foreign key violation
 */
export function isForeignKeyViolation(error: unknown): boolean {
	return isDatabaseError(error) && error.code === "23503";
}

/**
 * Safely execute a database operation with retry logic for transient errors
 */
export async function withRetry<T>(
	operation: () => Promise<T>,
	options: {
		maxRetries?: number;
		retryDelay?: number;
		context?: Record<string, unknown>;
	} = {}
): Promise<T> {
	const { maxRetries = 2, retryDelay = 100, context } = options;
	let lastError: unknown;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error;

			// Only retry on transient connection errors
			if (
				isDatabaseError(error) &&
				(error.code === "08000" || error.code === "08006") &&
				attempt < maxRetries
			) {
				logger.warn(`Database operation failed, retrying (${attempt + 1}/${maxRetries})`, {
					...context,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
				continue;
			}

			// Don't retry for other errors
			throw error;
		}
	}

	throw lastError;
}

/**
 * Execute a database transaction with better error handling
 */
export async function executeTransaction<T>(
	callback: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<T>,
	context?: Record<string, unknown>
): Promise<T> {
	try {
		return await db.transaction(callback);
	} catch (error) {
		logger.error("Transaction failed", {
			...context,
			error: error instanceof Error ? error.message : "Unknown error",
		});
		throw error;
	}
}
