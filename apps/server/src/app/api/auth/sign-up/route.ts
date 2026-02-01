import { auth } from "@/lib/auth";
import { emailSignUpSchema } from "@repo/types/src/schemas/authValidation";
import { handleError } from "@/lib/utils";

export async function POST(request: Request) {
	const body = await request.json();

	const result = emailSignUpSchema.safeParse(body);

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

		return response;
	} catch (error) {
		return handleError(error);
	}
}
