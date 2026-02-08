import { signUpSchema } from "@repo/types";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { AppError, handleError } from "@/lib/utils";

export async function POST(request: Request) {
	const body = await request.json();

	const result = signUpSchema.safeParse(body);

	if (!result.success) {
		return handleError(result.error);
	}

	const { name, email, password } = result.data;

	try {
		const response = await auth.api.signUpEmail({
			body: {
				name,
				email,
				password,
			},
			asResponse: true,
		});

		const data = await response.json();

		// If response is not OK, return the error
		if (!response.ok) {
			return NextResponse.json(data, {
				status: response.status,
				headers: response.headers,
			});
		}

		const token = data.session?.token || data.token;

		if (!token) {
			return handleError(new AppError("No token received from sign-up response"));
		}

		return NextResponse.json(
			{
				user: data.user,
				session: data.session,
				token: token, // Mobile clients use this
			},
			{
				status: response.status,
				headers: response.headers,
			}
		);
	} catch (error) {
		return handleError(error);
	}
}
