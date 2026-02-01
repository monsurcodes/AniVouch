import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";
import { ZodError, flattenError } from "zod";
import { NeonDbError } from "@neondatabase/serverless";
import { logger } from "@/lib/utils/logger";
import { env } from "@/lib/config/env";

// Postgres error codes for better type safety
const PG_ERROR_CODES = {
	UNIQUE_VIOLATION: "23505",
	FOREIGN_KEY_VIOLATION: "23503",
	NOT_NULL_VIOLATION: "23502",
	CHECK_VIOLATION: "23514",
	CONNECTION_FAILURE: "08000",
	CONNECTION_TIMEOUT: "08006",
} as const;

export class AppError extends Error {
	constructor(
		message: string,
		public statusCode: number = 500,
		public code?: string
	) {
		super(message);
		this.name = "AppError";
	}
}

export function handleError(error: unknown, context?: Record<string, unknown>) {
	// 1. Log the full error for internal debugging
	if (error instanceof Error) {
		logger.error(error.message, { ...context, stack: error.stack });
	} else {
		logger.error("Unknown error occurred", { error, ...context });
	}

	// 2. Handle Zod validation errors (highest priority for UX)
	if (error instanceof ZodError) {
		return NextResponse.json(
			{ error: "Validation failed", details: flattenError(error).fieldErrors },
			{ status: 400 }
		);
	}

	// 3. Handle Better Auth errors
	if (error instanceof APIError) {
		return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
	}

	// 4. Handle Neon/Postgres specific errors (including wrapped errors)
	if (error instanceof NeonDbError || (error && typeof error === "object" && "code" in error)) {
		const dbError = error as {
			code: string;
			detail?: string;
			constraint?: string;
			table?: string;
			column?: string;
		};

		switch (dbError.code) {
			case PG_ERROR_CODES.UNIQUE_VIOLATION: {
				// Extract field name from constraint or detail
				const constraint = dbError.constraint?.toLowerCase() || "";
				const detail = dbError.detail?.toLowerCase() || "";
				let message = "Resource already exists";
				let field: string | undefined;

				// Try to extract field from constraint name (e.g., "user_email_unique")
				if (constraint.includes("email")) {
					message = "This email is already registered";
					field = "email";
				} else if (constraint.includes("username")) {
					message = "This username is already taken";
					field = "username";
				} else if (detail.includes("email")) {
					message = "This email is already registered";
					field = "email";
				} else if (detail.includes("username")) {
					message = "This username is already taken";
					field = "username";
				}

				return NextResponse.json(
					{ error: message, ...(field && { field }) },
					{ status: 409 }
				);
			}
			case PG_ERROR_CODES.FOREIGN_KEY_VIOLATION:
				return NextResponse.json({ error: "Related resource not found" }, { status: 404 });

			case PG_ERROR_CODES.NOT_NULL_VIOLATION:
				return NextResponse.json(
					{ error: "Required field is missing", field: dbError.column },
					{ status: 400 }
				);

			case PG_ERROR_CODES.CONNECTION_FAILURE:
			case PG_ERROR_CODES.CONNECTION_TIMEOUT:
				return NextResponse.json(
					{ error: "Database connection failed. Please try again." },
					{ status: 503 }
				);
		}
	}

	// 5. Handle wrapped database errors (Drizzle wraps Postgres errors)
	if (error && typeof error === "object" && "cause" in error) {
		const cause = (error as { cause: unknown }).cause;
		if (cause && typeof cause === "object" && "code" in cause) {
			// Recursively handle the underlying cause
			return handleError(cause, context);
		}
	}

	// 6. Handle App-specific errors
	if (error instanceof AppError) {
		return NextResponse.json({ error: error.message }, { status: error.statusCode });
	}

	// 7. Generic Fallback (only in development, show more details)
	if (env.NODE_ENV !== "production" && error instanceof Error) {
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 }
		);
	}

	return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
