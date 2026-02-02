import { passwordResetSchema } from "@repo/types";
import { NextResponse } from "next/server";

import { handleError, getCurrentUser, AppError, auth } from "@/lib";

export async function POST(request: Request) {
	const { user } = await getCurrentUser();

	if (!user) {
		return handleError(new AppError("Unauthorized", 401));
	}

	const body = await request.json();

	const result = passwordResetSchema.safeParse(body);

	if (!result.success) {
		return handleError(result.error);
	}

	const { otp, password } = result.data;

	try {
		const data = await auth.api.resetPasswordEmailOTP({
			body: {
				email: user.email,
				otp: otp,
				password: password,
			},
		});
		if (!data.success) {
			return handleError(new AppError("Failed to reset password", 500));
		}
		return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
}
