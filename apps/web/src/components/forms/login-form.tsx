/**
 * Login Form Component
 * Handles user sign in with email/password
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signInEmailSchema, type SignInEmailInput } from "@repo/types";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn } from "@/lib/hooks";

export function LoginForm() {
	const signInMutation = useSignIn();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInEmailInput>({
		resolver: zodResolver(signInEmailSchema),
	});

	const onSubmit = (data: SignInEmailInput) => {
		signInMutation.mutate(data);
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Welcome back</CardTitle>
				<CardDescription>Sign in to your account to continue</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit(onSubmit)}>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email" required>
							Email
						</Label>
						<Input
							id="email"
							type="email"
							placeholder="john@example.com"
							error={errors.email?.message}
							{...register("email")}
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password" required>
								Password
							</Label>
							<Link
								href="/reset-password"
								className="text-primary text-sm hover:underline"
							>
								Forgot password?
							</Link>
						</div>
						<Input
							id="password"
							type="password"
							placeholder="Enter your password"
							error={errors.password?.message}
							{...register("password")}
						/>
					</div>
				</CardContent>

				<CardFooter className="flex flex-col gap-4">
					<Button
						type="submit"
						className="w-full"
						isLoading={signInMutation.isPending}
						disabled={signInMutation.isPending}
					>
						Sign in
					</Button>

					<p className="text-muted-foreground text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link href="/register" className="text-primary hover:underline">
							Sign up
						</Link>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}
