import { auth, getCurrentUser } from "@/lib/auth";
import { handleError, AppError } from "@/lib";
import { NextResponse } from "next/server";

export async function GET() {
	const { user } = await getCurrentUser();
	if (!user) {
		return handleError(new AppError("Unauthorized", 401));
	}

	try {
		const data = await auth.api.sendVerificationOTP({
			body: {
				email: user.email,
				type: "forget-password",
			},
		});
		if (!data.success) {
			return handleError(new AppError("Failed to send verification OTP", 500));
		}
		return NextResponse.json({ message: "Verification OTP sent" }, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
}
