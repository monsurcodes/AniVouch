import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { emailSignUpSchema } from "@repo/types/src/schemas/authValidation";

export async function POST(request: Request) {
	const body = await request.json();

	const result = emailSignUpSchema.safeParse(body);

	if (!result.success) {
		return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
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

		return response;
	} catch (error) {
		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
		}
		console.error(error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
