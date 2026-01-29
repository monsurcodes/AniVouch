import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callbackURL =
      searchParams.get("callbackURL") || "http://localhost:3000";

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
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
