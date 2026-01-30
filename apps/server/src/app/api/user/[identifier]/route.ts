import { NextResponse } from "next/server";
import { db } from "@/db";
import { user as userTable } from "@/db/schemas/auth-schema";
import { eq, or } from "drizzle-orm";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ identifier: string }> }
) {
	const { identifier } = await params;

	if (!identifier) {
		return NextResponse.json({ error: "Identifier is required" }, { status: 400 });
	}

	try {
		const result = await db
			.select({
				id: userTable.id,
				name: userTable.name,
				username: userTable.username,
				image: userTable.image,
				createdAt: userTable.createdAt,
			})
			.from(userTable)
			.where(
				or(
					eq(userTable.id, identifier),
					eq(userTable.username, identifier.replace("@", ""))
				)
			);
		if (result.length === 0) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}
		const user = result[0];
		return NextResponse.json({ data: user }, { status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
