/**
 * Email Verification Page
 * Displays email verification status and allows resending
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { useEmailVerificationPolling, useSendVerificationEmail } from "@/lib/hooks";

export default function VerifyEmailPage() {
	const router = useRouter();
	const [countdown, setCountdown] = useState(0);
	const sendVerificationMutation = useSendVerificationEmail();

	// Poll for verification status
	const { isVerified, attempts } = useEmailVerificationPolling({
		enabled: true,
		onVerified: () => {
			// Redirect to dashboard after verification
			setTimeout(() => {
				router.push(ROUTES.DASHBOARD);
			}, 2000);
		},
	});

	// Countdown timer for resend button
	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	const handleResendEmail = () => {
		sendVerificationMutation.mutate();
		setCountdown(60); // 60 second cooldown
	};

	if (isVerified) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-green-600">✓ Email Verified!</CardTitle>
						<CardDescription>
							Your email has been successfully verified.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">
							Redirecting you to dashboard...
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Verify your email</CardTitle>
					<CardDescription>
						We&apos;ve sent a verification link to your email address.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<p className="text-sm text-blue-900">
							📧 Please check your inbox and click the verification link to continue.
						</p>
					</div>

					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">
							Checking verification status...
						</p>
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
							<span className="text-muted-foreground text-xs">
								Attempt {attempts + 1}
							</span>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-2">
					<Button
						variant="outline"
						className="w-full"
						onClick={handleResendEmail}
						disabled={countdown > 0 || sendVerificationMutation.isPending}
						isLoading={sendVerificationMutation.isPending}
					>
						{countdown > 0 ? `Resend in ${countdown}s` : "Resend verification email"}
					</Button>
					<Button
						variant="ghost"
						className="w-full"
						onClick={() => router.push(ROUTES.LOGIN)}
					>
						Back to login
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
