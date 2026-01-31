import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "@/lib/env";

export default defineConfig({
	out: "./drizzle",
	schema: ["./src/db/schemas/auth-schema.ts"],
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
