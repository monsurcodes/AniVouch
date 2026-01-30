import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { usernameSignInSchema } from "@repo/types/src/schemas/authValidation";

export async function POST(request: Request) {
	const body = await request.json();

	const result = usernameSignInSchema.safeParse(body);

	if (!result.success) {
		return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
	}

	const { username, password } = result.data;

	try {
		const response = await auth.api.signInUsername({
			body: {
				username,
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
