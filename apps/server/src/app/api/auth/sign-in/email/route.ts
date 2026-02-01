import { auth } from "@/lib/auth";
import { emailSignInSchema } from "@repo/types/src/schemas/authValidation";
import { handleError } from "@/lib/utils";

export async function POST(request: Request) {
	const body = await request.json();

	const result = emailSignInSchema.safeParse(body);

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
