import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import { handleError, AppError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;

	const token = searchParams.get("token");
	const callbackURL = searchParams.get("callbackURL");

	if (!token) {
		return handleError(new AppError("Token is required", 400));
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
			return handleError(new AppError("Failed to verify email", response.status));
		}
		return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
}
