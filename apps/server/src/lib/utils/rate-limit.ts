interface RateLimitConfig {
	windowMs: number;
	max: number;
}

interface RateLimitRecord {
	count: number;
	resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

// Cleanup to prevent memory leaks
if (typeof setInterval !== "undefined") {
	setInterval(
		() => {
			const now = Date.now();
			for (const [key, value] of store.entries()) {
				if (now > value.resetTime) {
					store.delete(key);
				}
			}
		},
		5 * 60 * 1000
	); // Every 5 minutes
}

export function rateLimit(config: RateLimitConfig) {
	return (
		identifier: string
	): {
		allowed: boolean;
		remaining: number;
		limit: number;
	} => {
		const now = Date.now();
		const record = store.get(identifier);

		if (!record || now > record.resetTime) {
			store.set(identifier, {
				count: 1,
				resetTime: now + config.windowMs,
			});
			return { allowed: true, remaining: config.max - 1, limit: config.max };
		}

		if (record.count >= config.max) {
			return { allowed: false, remaining: 0, limit: config.max };
		}

		record.count++;
		return {
			allowed: true,
			remaining: config.max - record.count,
			limit: config.max,
		};
	};
}
