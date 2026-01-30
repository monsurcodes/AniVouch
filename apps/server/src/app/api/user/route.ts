import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { APIError } from "better-auth";

export async function GET() {
	try {
		const { user } = await getCurrentUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		return NextResponse.json({ data: user });
	} catch (error) {
		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
		}
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
