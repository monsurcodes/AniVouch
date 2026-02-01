import fs from "fs/promises";
import path from "path";

import handlebars from "handlebars";
import type { SendMailOptions, SentMessageInfo } from "nodemailer";

import { env } from "@/lib";

import transporter from "./transporter";

const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/**
 * Generic helper to compile any HTML template from the templates folder
 */
const getHtmlContent = async (templateName: string, data: object): Promise<string> => {
	let template = templateCache.get(templateName);

	if (!template) {
		const templatePath = path.resolve(process.cwd(), "src/templates", `${templateName}.html`);
		const source = await fs.readFile(templatePath, "utf8");
		template = handlebars.compile(source);

		// Cache in production, skip in dev for hot reload
		if (env.NODE_ENV === "production") {
			templateCache.set(templateName, template);
		}
	}

	return template(data);
};

/**
 * Service function to send the verification email
 */
export const sendVerificationEmail = async (
	to: string,
	verificationLink: string
): Promise<SentMessageInfo> => {
	const html = await getHtmlContent("verify-email", { verificationLink });

	const mailOptions: SendMailOptions = {
		from: `"AniVouch" <${env.SMTP_SENDER_EMAIL}>`,
		to,
		subject: "Verify your AniVouch account",
		html,
	};

	return await transporter.sendMail(mailOptions);
};

/**
 * Service function to send password reset OTP email
 */
export const sendPasswordResetOTP = async (to: string, otp: string): Promise<SentMessageInfo> => {
	const html = await getHtmlContent("password-reset-otp", { otp });

	const mailOptions: SendMailOptions = {
		from: `"AniVouch" <${env.SMTP_SENDER_EMAIL}>`,
		to,
		subject: "Password Reset OTP for AniVouch",
		html,
	};

	return await transporter.sendMail(mailOptions);
};
