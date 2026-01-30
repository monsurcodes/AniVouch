import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { emailSignInSchema } from "@repo/types/src/schemas/authValidation";

export async function POST(request: Request) {
	const body = await request.json();

	const result = emailSignInSchema.safeParse(body);

	if (!result.success) {
		return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
	}

	const { email, password } = result.data;

	try {
		const response = await auth.api.signInEmail({
			body: {
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
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
