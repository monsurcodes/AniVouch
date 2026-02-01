import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { env } from "@/lib/config";
import { rateLimit } from "@/lib/utils";

const limiter = rateLimit({ windowMs: 60000, max: 100 });
const authLimiter = rateLimit({ windowMs: 60000, max: 10 });

const allowedOrigins =
	env.NODE_ENV === "production"
		? [env.WEB_FRONTEND_URL, env.EXPO_FRONTEND_URL].filter(Boolean)
		: ["http://localhost:3000", "http://localhost:3001"];

export function proxy(request: NextRequest) {
	const origin = request.headers.get("origin");
	const ip = request.headers.get("x-forwarded-for") || "anonymous";
	const isAuth = request.nextUrl.pathname.startsWith("/api/auth");

	const result = isAuth ? authLimiter(`${ip}:auth`) : limiter(`${ip}:general`);

	if (!result.allowed) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

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

	// Add rate limit info headers for client awareness
	response.headers.set("X-RateLimit-Limit", result.limit.toString());
	response.headers.set("X-RateLimit-Remaining", result.remaining.toString());

	return response;
}

export const config = {
	matcher: "/api/:path*",
};
