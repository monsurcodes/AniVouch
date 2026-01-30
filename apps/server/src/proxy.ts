import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins =
	process.env.NODE_ENV === "production"
		? [process.env.WEB_FRONTEND_URL, process.env.EXPO_FRONTEND_URL].filter(Boolean)
		: ["http://localhost:3000", "http://localhost:3001"];

export function proxy(request: NextRequest) {
	const origin = request.headers.get("origin");

	// Handle preflight requests
	if (request.method === "OPTIONS") {
		const response = NextResponse.json({}, { status: 200 });

		if (origin && allowedOrigins.includes(origin)) {
			response.headers.set("Access-Control-Allow-Origin", origin);
			response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
			response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
			response.headers.set("Access-Control-Allow-Credentials", "true");
		}

		return response;
	}

	const response = NextResponse.next();

	// Set CORS headers for actual requests
	if (origin && allowedOrigins.includes(origin)) {
		response.headers.set("Access-Control-Allow-Origin", origin);
		response.headers.set("Access-Control-Allow-Credentials", "true");
	}

	return response;
}

export const config = {
	matcher: "/api/:path*",
};
