import { auth, getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { env } from "@/lib/config";
import { handleError, AppError } from "@/lib/utils";

export async function GET() {
	const { user } = await getCurrentUser();
	if (!user) {
		return handleError(new AppError("Unauthorized", 401));
	}

	try {
		const response = await auth.api.sendVerificationEmail({
			body: {
				email: user.email,
				callbackURL: env.WEB_FRONTEND_URL,
			},
			asResponse: true,
		});

		if (!response.status) {
			return handleError(new AppError("Failed to send verification email", response.status));
		}
		return NextResponse.json({ message: "Verification email sent" }, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
}
