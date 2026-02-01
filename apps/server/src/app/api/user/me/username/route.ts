import { NextResponse } from "next/server";
import { db } from "@/db";
import { user as userTable } from "@/db/schemas/auth-schema";
import { eq } from "drizzle-orm";
import { usernameValidation } from "@repo/types/src/schemas/authValidation";
import { getCurrentUser } from "@/lib/auth";
import { handleError, AppError } from "@/lib/utils";
import { withRetry } from "@/db/utils";

export async function POST(request: Request) {
	const { user } = await getCurrentUser();

	if (!user) {
		return handleError(new AppError("Unauthorized", 401));
	}

	const body = await request.json();
	if (!body.username) {
		return handleError(new AppError("Username is required", 400));
	}

	const result = usernameValidation.safeParse(body.username as string);

	if (!result.success) {
		return handleError(result.error);
	}

	const username = result.data;

	if (username === user.username) {
		return NextResponse.json(
			{ message: "Username is the same as the current one" },
			{ status: 200 }
		);
	}

	try {
		await withRetry(
			() => db.update(userTable).set({ username }).where(eq(userTable.id, user.id)),
			{ maxRetries: 2, context: { userId: user.id, operation: "updateUsername" } }
		);
		return NextResponse.json({ message: "Username updated successfully" }, { status: 200 });
	} catch (error) {
		return handleError(error, { userId: user.id, requestedUsername: username });
	}
}
