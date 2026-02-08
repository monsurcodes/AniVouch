import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";

import { env } from "@/lib/config";

// Global cache for connection to prevent connection pool exhaustion
// especially during development hot reloads
declare global {
	var dbConnection: NeonDatabase | undefined;
}

let db: NeonDatabase;

if (global.dbConnection) {
	// Reuse existing connection
	db = global.dbConnection;
} else {
	// Create new connection
	const pool = new Pool({ connectionString: env.DATABASE_URL });
	db = drizzle({ client: pool });

	// Cache in global for reuse (only in development)
	if (env.NODE_ENV !== "production") {
		global.dbConnection = db;
	}
}

export { db };
