/**
 * Register Form Component
 * Handles user sign up with email/password
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpInput } from "@repo/types";
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
import { useSignUp } from "@/lib/hooks";

export function RegisterForm() {
	const signUpMutation = useSignUp();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpInput>({
		resolver: zodResolver(signUpSchema),
	});

	const onSubmit = (data: SignUpInput) => {
		signUpMutation.mutate(data);
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Create an account</CardTitle>
				<CardDescription>Enter your details to get started</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit(onSubmit)}>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name" required>
							Full Name
						</Label>
						<Input
							id="name"
							type="text"
							placeholder="John Doe"
							error={errors.name?.message}
							{...register("name")}
						/>
					</div>

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
						<Label htmlFor="password" required>
							Password
						</Label>
						<Input
							id="password"
							type="password"
							placeholder="Create a strong password"
							error={errors.password?.message}
							{...register("password")}
						/>
						<p className="text-muted-foreground text-xs">
							At least 8 characters with uppercase, lowercase, and number
						</p>
					</div>
				</CardContent>

				<CardFooter className="flex flex-col gap-4">
					<Button
						type="submit"
						className="w-full"
						isLoading={signUpMutation.isPending}
						disabled={signUpMutation.isPending}
					>
						Create account
					</Button>

					<p className="text-muted-foreground text-center text-sm">
						Already have an account?{" "}
						<Link href="/login" className="text-primary hover:underline">
							Sign in
						</Link>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}
