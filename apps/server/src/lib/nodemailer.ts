import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: "smtp-relay.brevo.com",
	port: 587,
	secure: false,
	auth: {
		user: process.env.SMTP_MAIL_USERNAME,
		pass: process.env.SMTP_MAIL_PASS,
	},
});

export default transporter;
