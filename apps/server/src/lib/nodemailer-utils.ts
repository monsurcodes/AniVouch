import transporter from "./nodemailer";
import type { SendMailOptions, SentMessageInfo } from "nodemailer";
import fs from "fs/promises";
import handlebars from "handlebars";
import path from "path";

/**
 * Generic helper to compile any HTML template from the templates folder
 */
const getHtmlContent = async (templateName: string, data: object): Promise<string> => {
	const templatePath = path.resolve(process.cwd(), "src/templates", `${templateName}.html`);
	const source = await fs.readFile(templatePath, "utf8");

	const template = handlebars.compile(source);
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
		from: `"AniVouch" <${process.env.SMTP_SENDER_EMAIL}>`,
		to,
		subject: "Verify your AniVouch account",
		html,
	};

	return await transporter.sendMail(mailOptions);
};
