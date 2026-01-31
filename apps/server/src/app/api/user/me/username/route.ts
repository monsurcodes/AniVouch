import { NextResponse } from "next/server";
import { db } from "@/db";
import { user as userTable } from "@/db/schemas/auth-schema";
import { eq } from "drizzle-orm";
import { usernameValidation } from "@repo/types/src/schemas/authValidation";
import { getCurrentUser } from "@/lib/auth-utils";
import { treeifyError } from "zod";

export async function POST(request: Request) {
	const { user } = await getCurrentUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	if (!body.username) {
		return NextResponse.json({ error: "Username is required" }, { status: 400 });
	}

	const result = usernameValidation.safeParse(body.username as string);

	if (!result.success) {
		return NextResponse.json({ error: treeifyError(result.error) }, { status: 400 });
	}

	const username = result.data;

	if (username === user.username) {
		return NextResponse.json(
			{ message: "Username is the same as the current one" },
			{ status: 200 }
		);
	}

	try {
		const existingUsername = await db
			.select({
				username: userTable.username,
			})
			.from(userTable)
			.where(eq(userTable.username, username));

		if (existingUsername.length > 0) {
			return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
		}

		await db.update(userTable).set({ username }).where(eq(userTable.id, user.id));
		return NextResponse.json({ message: "Username updated successfully" }, { status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
