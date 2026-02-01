import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { handleError } from "@/lib/utils";

export async function POST() {
	try {
		const response = await auth.api.signOut({
			headers: await headers(),
			asResponse: true,
		});
		return response;
	} catch (error) {
		return handleError(error);
	}
}
