import * as z from "zod";

export const emailValidation = z.email({ error: "Please enter a valid email address" });

export const usernameValidation = z
	.string()
	.trim()
	.min(3, "Username must be at least 3 characters long")
	.max(15, "Username must be at most 15 characters long")
	.regex(/^[a-z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export const passwordValidation = z
	.string()
	.min(8, "Password must be at least 8 characters long")
	.max(50, "Password must not exceed 50 character limit");

export const emailSignUpSchema = z.object({
	name: z.string().trim(),
	email: emailValidation,
	password: passwordValidation,
});

export const emailSignInSchema = z.object({
	email: emailValidation,
	password: passwordValidation,
});

export const usernameSignInSchema = z.object({
	username: usernameValidation,
	password: passwordValidation,
});
