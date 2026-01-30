import { auth } from "./auth";
import { headers } from "next/headers";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
	const response = await auth.api.getSession({
		headers: await headers(),
	});

	if (!response) {
		return { session: null, user: null };
	}

	return { session: response.session, user: response.user };
});
