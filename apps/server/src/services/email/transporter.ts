import nodemailer from "nodemailer";

import { logger, env } from "@/lib";

const transporter = nodemailer.createTransport({
	host: "smtp-relay.brevo.com",
	port: 587,
	secure: false,
	auth: {
		user: env.SMTP_MAIL_USERNAME,
		pass: env.SMTP_MAIL_PASS,
	},
});

// Verify connection on startup
if (env.NODE_ENV === "production") {
	transporter.verify((error) => {
		if (error) {
			logger.error("SMTP connection failed", { error: error.message });
		} else {
			logger.info("SMTP server ready");
		}
	});
}

export default transporter;
