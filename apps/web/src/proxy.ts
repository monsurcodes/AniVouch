/**
 * Middleware
 * Route protection and authentication checks
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/verify-email", "/reset-password"];

// Define auth routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register"];

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if user has auth token (you may need to adjust based on your auth strategy)
	const authToken = request.cookies.get("auth_token")?.value;
	const isAuthenticated = !!authToken;

	// Allow public routes
	const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

	// If authenticated and trying to access auth routes, redirect to dashboard
	if (isAuthenticated && isAuthRoute) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// If not authenticated and trying to access protected route, redirect to login
	if (!isAuthenticated && !isPublicRoute) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (public directory)
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
