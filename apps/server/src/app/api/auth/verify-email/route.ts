import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import { APIError } from "better-auth/api";

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;

	const token = searchParams.get("token");
	const callbackURL = searchParams.get("callbackURL");

	if (!token) {
		return NextResponse.json({ error: "Missing token" }, { status: 400 });
	}

	try {
		const response = await auth.api.verifyEmail({
			query: {
				token: token || "",
				callbackURL: callbackURL || undefined,
			},
			asResponse: true,
		});
		if (!response.status) {
			return NextResponse.json(
				{ error: "Failed to verify email" },
				{ status: response.status }
			);
		}
		return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
	} catch (error) {
		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
		}
		console.error(error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
