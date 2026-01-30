import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schemas/auth-schema";
import { sendVerificationEmail as sVE } from "./nodemailer-utils";

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

	// backend configuration
	baseURL: process.env.BETTER_AUTH_URL,
	trustedOrigins:
		process.env.NODE_ENV === "production"
			? [process.env.WEB_FRONTEND_URL!, process.env.EXPO_FRONTEND_URL!].filter(Boolean)
			: undefined,

	// email verification configuration
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sVE(user.email, url);
		},
	},

	// auth configuration
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
