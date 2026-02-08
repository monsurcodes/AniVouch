import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url(),
	BETTER_AUTH_URL: z.url(),
	WEB_FRONTEND_URL: z.url().optional(),
	EXPO_FRONTEND_URL: z.url().optional(),
	MOBILE_DEEP_LINK_SCHEME: z.string().default("anivouch"),
	GOOGLE_CLIENT_ID: z.string().min(1),
	GOOGLE_CLIENT_SECRET: z.string().min(1),
	SMTP_MAIL_USERNAME: z.email(),
	SMTP_MAIL_PASS: z.string().min(1),
	SMTP_SENDER_EMAIL: z.email(),
	ANILIST_GRAPHQL_API: z.url(),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = envSchema.parse(process.env);
