import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { handleError, AppError } from "@/lib/utils";

export async function GET() {
	try {
		const { user } = await getCurrentUser();

		if (!user) {
			return handleError(new AppError("Unauthorized", 401));
		}

		return NextResponse.json({ data: user });
	} catch (error) {
		return handleError(error);
	}
}
