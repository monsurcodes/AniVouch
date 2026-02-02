import { signInEmailSchema } from "@repo/types";

import { auth } from "@/lib/auth";
import { handleError } from "@/lib/utils";

export async function POST(request: Request) {
	const body = await request.json();

	const result = signInEmailSchema.safeParse(body);

	if (!result.success) {
		return handleError(result.error);
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
		return handleError(error);
	}
}
