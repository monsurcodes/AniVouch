import { env } from "./env";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
	requestId?: string;
	userId?: string;
	path?: string;
	[key: string]: unknown;
}

class Logger {
	private log(level: LogLevel, message: string, context?: LogContext) {
		const timestamp = new Date().toISOString();
		const logObject = {
			timestamp,
			level,
			message,
			...context,
		};

		// In production, send to logging service (e.g., Datadog, Sentry)
		if (env.NODE_ENV === "production") {
			// TODO: Send to external logging service
			console[level === "error" ? "error" : "log"](JSON.stringify(logObject));
		} else {
			// Pretty print in development
			console[level === "error" ? "error" : "log"](
				`[${level.toUpperCase()}] ${message}`,
				context || ""
			);
		}
	}

	info(message: string, context?: LogContext) {
		this.log("info", message, context);
	}

	warn(message: string, context?: LogContext) {
		this.log("warn", message, context);
	}

	error(message: string, context?: LogContext) {
		this.log("error", message, context);
	}

	debug(message: string, context?: LogContext) {
		if (env.NODE_ENV !== "production") {
			this.log("debug", message, context);
		}
	}
}

export const logger = new Logger();
