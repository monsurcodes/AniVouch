// Example usage in your API routes

import { db } from "@/db";
import { user as userTable } from "@/db/schemas/auth-schema";
import { eq } from "drizzle-orm";
import { handleError } from "@/lib/error-handler";
import { withRetry, isUniqueViolation } from "@/lib/db-utils";

/**
 * EXAMPLE 1: Simple update with automatic error handling
 */
export async function updateUsername(userId: string, newUsername: string) {
	try {
		await db.update(userTable).set({ username: newUsername }).where(eq(userTable.id, userId));

		return { success: true };
	} catch (error) {
		// handleError will automatically catch:
		// - 23505 (unique violation) → 409 "Username already taken"
		// - 08000/08006 (connection errors) → 503 "Database connection failed"
		// - All other errors → 500 "Internal Server Error"
		return handleError(error);
	}
}

/**
 * EXAMPLE 2: Using type guards for custom error handling
 */
export async function updateUsernameWithCustomHandling(userId: string, newUsername: string) {
	try {
		await db.update(userTable).set({ username: newUsername }).where(eq(userTable.id, userId));

		return { success: true };
	} catch (error) {
		// Custom handling before passing to global handler
		if (isUniqueViolation(error)) {
			// You can add custom logic here
			console.log("Username conflict detected");
		}

		return handleError(error);
	}
}

/**
 * EXAMPLE 3: Using retry logic for connection errors
 */
export async function updateUsernameWithRetry(userId: string, newUsername: string) {
	try {
		await withRetry(
			() =>
				db.update(userTable).set({ username: newUsername }).where(eq(userTable.id, userId)),
			{
				maxRetries: 2,
				retryDelay: 100,
				context: { userId, operation: "updateUsername" },
			}
		);

		return { success: true };
	} catch (error) {
		return handleError(error);
	}
}

/**
 * EXAMPLE 4: Transaction with multiple operations
 */
import { executeTransaction } from "@/lib/db-utils";

export async function updateUsernameAndEmail(
	userId: string,
	newUsername: string,
	newEmail: string
) {
	try {
		await executeTransaction(
			async (tx) => {
				// Update username
				await tx
					.update(userTable)
					.set({ username: newUsername })
					.where(eq(userTable.id, userId));

				// Update email
				await tx
					.update(userTable)
					.set({ email: newEmail, emailVerified: false })
					.where(eq(userTable.id, userId));
			},
			{ userId, operation: "updateUsernameAndEmail" }
		);

		return { success: true };
	} catch (error) {
		// If either update fails (e.g., username/email already exists),
		// the entire transaction is rolled back
		return handleError(error);
	}
}
