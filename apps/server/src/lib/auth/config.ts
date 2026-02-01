import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schemas/auth-schema";
import { sendVerificationEmail } from "@/services/email";
import bcrypt from "bcrypt";
import { env } from "../config";

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
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins:
		env.NODE_ENV === "production"
			? [env.WEB_FRONTEND_URL!, env.EXPO_FRONTEND_URL!].filter(Boolean)
			: undefined,

	// email verification configuration
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail(user.email, url);
		},
	},

	// auth configuration
	emailAndPassword: {
		enabled: true,
		password: {
			hash: async (password) => {
				return bcrypt.hash(password, 8);
			},
			verify: async ({ hash, password }) => {
				return bcrypt.compare(password, hash);
			},
		},
	},
	socialProviders: {
		google: {
			prompt: "select_account",
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	plugins: [username()],
});
