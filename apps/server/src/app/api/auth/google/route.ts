import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleError } from "@/lib/error-handler";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const callbackURL = searchParams.get("callbackURL") || "http://localhost:3000";

		const authResponse = await auth.api.signInSocial({
			body: {
				provider: "google",
				callbackURL: callbackURL,
			},
			asResponse: true,
		});

		/**
		 * Better-Auth returns a 302 redirect by default.
		 * We extract the 'location' header and send it to the frontend.
		 */
		const redirectUrl = authResponse.headers.get("location");

		return NextResponse.json(
			{
				data: { url: redirectUrl },
			},
			{ status: 200 }
		);
	} catch (error) {
		return handleError(error);
	}
}
