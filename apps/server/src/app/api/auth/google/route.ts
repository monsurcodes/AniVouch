import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { handleError } from "@/lib/utils";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const callbackURL = searchParams.get("callbackURL") || "http://localhost:3000/dashboard";

		// Call Better Auth's signInSocial and get the redirect response
		const authResponse = await auth.api.signInSocial({
			body: {
				provider: "google",
				callbackURL: callbackURL,
			},
			asResponse: true,
		});

		// Extract the redirect URL from the location header
		const redirectUrl = authResponse.headers.get("location");

		if (!redirectUrl) {
			throw new Error("No redirect URL from Better Auth");
		}

		// Create a redirect response that preserves cookies
		const response = NextResponse.redirect(redirectUrl);

		// Copy all cookies from Better Auth's response
		authResponse.headers.forEach((value, key) => {
			if (key.toLowerCase() === "set-cookie") {
				response.headers.append(key, value);
			}
		});

		return response;
	} catch (error) {
		return handleError(error);
	}
}
