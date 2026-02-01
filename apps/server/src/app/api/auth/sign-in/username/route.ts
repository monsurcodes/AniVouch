import { auth } from "@/lib/auth";
import { usernameSignInSchema } from "@repo/types/src/schemas/authValidation";
import { handleError } from "@/lib/utils";

export async function POST(request: Request) {
	const body = await request.json();

	const result = usernameSignInSchema.safeParse(body);

	if (!result.success) {
		return handleError(result.error);
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
		return handleError(error);
	}
}
