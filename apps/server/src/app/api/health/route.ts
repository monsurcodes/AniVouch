import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";

export async function GET() {
	const checks = {
		database: false,
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	};

	try {
		// Check database connection
		await db.execute(sql`SELECT 1`);
		checks.database = true;

		return NextResponse.json({
			status: "healthy",
			checks,
		});
	} catch (error) {
		return NextResponse.json(
			{
				status: "unhealthy",
				checks,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 503 }
		);
	}
}
