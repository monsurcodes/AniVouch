import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";

export async function POST() {
	try {
		const response = await auth.api.signOut({
			headers: await headers(),
			asResponse: true,
		});
		return response;
	} catch (error) {
		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
		}
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
