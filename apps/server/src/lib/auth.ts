import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schemas/auth-schema";

export const auth = betterAuth({
	// database adapter using Drizzle ORM
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.user,
			account: schema.account,
			session: schema.session,
			verification: schema.verification,
		},
	}),

	// auth configuration
	baseURL: process.env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			prompt: "select_account",
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	plugins: [username()],
});
