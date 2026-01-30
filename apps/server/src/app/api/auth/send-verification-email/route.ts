import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { APIError } from "better-auth/api";

export async function GET() {
	const { user } = await getCurrentUser();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const response = await auth.api.sendVerificationEmail({
			body: {
				email: user.email,
				callbackURL: `${process.env.WEB_FRONTEND_URL}`,
			},
			asResponse: true,
		});

		if (!response.status) {
			return NextResponse.json(
				{ error: "Failed to send verification email" },
				{ status: response.status }
			);
		}
		return NextResponse.json({ message: "Verification email sent" }, { status: 200 });
	} catch (error) {
		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
		}
		console.error(error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
