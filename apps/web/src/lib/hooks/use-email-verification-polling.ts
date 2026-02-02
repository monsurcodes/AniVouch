/**
 * Email Verification Polling Hook
 * Polls the server to check if email has been verified
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { userApi } from "@/lib/api";
import { QUERY_KEYS, POLLING_INTERVALS } from "@/lib/constants";

interface UseEmailVerificationPollingOptions {
	enabled?: boolean;
	onVerified?: () => void;
	interval?: number;
}

/**
 * Hook to poll for email verification status
 * Automatically checks if user's email has been verified
 */
export function useEmailVerificationPolling({
	enabled = true,
	onVerified,
	interval = POLLING_INTERVALS.EMAIL_VERIFICATION,
}: UseEmailVerificationPollingOptions = {}) {
	const queryClient = useQueryClient();
	const [isVerified, setIsVerified] = useState(false);
	const [attempts, setAttempts] = useState(0);

	useEffect(() => {
		if (!enabled || isVerified) return;

		const checkVerification = async () => {
			try {
				const user = await userApi.getCurrentUser();
				console.log("Checked email verification status:", user);

				if (user.emailVerified) {
					setIsVerified(true);
					// Update user cache
					queryClient.setQueryData(QUERY_KEYS.USER.CURRENT, user);
					// Call callback
					onVerified?.();
				} else {
					setAttempts((prev) => prev + 1);
				}
			} catch (error) {
				console.error("Failed to check verification status:", error);
			}
		};

		// Initial check
		checkVerification();

		// Set up polling with exponential backoff
		const delays = [3000, 3000, 5000, 5000, 10000, 10000, 15000]; // 3s, 3s, 5s, 5s, 10s, 10s, 15s...
		const currentDelay = delays[Math.min(attempts, delays.length - 1)];

		const intervalId = setInterval(checkVerification, currentDelay);

		// Cleanup
		return () => clearInterval(intervalId);
	}, [enabled, isVerified, attempts, queryClient, onVerified]);

	return {
		isVerified,
		attempts,
	};
}
