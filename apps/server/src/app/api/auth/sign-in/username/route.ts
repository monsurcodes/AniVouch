import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";

export async function POST(request: Request) {
  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

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
