/**
 * Authentication Hooks
 * Custom hooks for authentication-related functionality
 */

"use client";

import type { SignInEmailInput, SignInUsernameInput, SignUpInput } from "@repo/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authApi } from "@/lib/api";
import { setAuthToken } from "@/lib/api/client";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";

/**
 * Hook for user sign up
 */
export function useSignUp() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: SignUpInput) => authApi.signUp(data),
		onSuccess: (response) => {
			toast.success("Account created successfully!");
			// Store token for API requests (mobile compatibility)
			if (response.session?.token) {
				setAuthToken(response.session.token);
			}
			// Update user cache
			queryClient.setQueryData(QUERY_KEYS.USER.CURRENT, response.user);
			// Redirect to verification
			router.push(ROUTES.VERIFY_EMAIL);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create account");
		},
	});
}

/**
 * Hook for user sign in with email
 */
export function useSignIn() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: SignInEmailInput) => authApi.signInWithEmail(data),
		onSuccess: (response) => {
			toast.success("Signed in successfully!");
			// Store token for API requests (mobile compatibility)
			if (response.session?.token) {
				setAuthToken(response.session.token);
			}
			// Update user cache
			queryClient.setQueryData(QUERY_KEYS.USER.CURRENT, response.user);
			// Redirect to dashboard
			router.push(ROUTES.DASHBOARD);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Invalid credentials");
		},
	});
}

/**
 * Hook for user sign in with username
 */
export function useSignInWithUsername() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: SignInUsernameInput) => authApi.signInWithUsername(data),
		onSuccess: (response) => {
			toast.success("Signed in successfully!");
			// Store token for API requests (mobile compatibility)
			if (response.session?.token) {
				setAuthToken(response.session.token);
			}
			// Update user cache
			queryClient.setQueryData(QUERY_KEYS.USER.CURRENT, response.user);
			// Redirect to dashboard
			router.push(ROUTES.DASHBOARD);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Invalid credentials");
		},
	});
}

/**
 * Hook for user sign out
 */
export function useSignOut() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: authApi.signOut,
		onSuccess: () => {
			// Clear auth token
			setAuthToken(null);
			// Clear all queries
			queryClient.clear();
			toast.success("Signed out successfully");
			// Redirect to login
			router.push(ROUTES.LOGIN);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to sign out");
		},
	});
}

/**
 * Hook for sending verification email
 */
export function useSendVerificationEmail() {
	return useMutation({
		mutationFn: authApi.sendVerificationEmail,
		onSuccess: () => {
			toast.success("Verification email sent!");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to send verification email");
		},
	});
}

/**
 * Hook for verifying email
 */
export function useVerifyEmail() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (token: string) => authApi.verifyEmail(token),
		onSuccess: () => {
			toast.success("Email verified successfully!");
			// Refetch user to update verification status
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.CURRENT });
			// Redirect to dashboard
			router.push(ROUTES.DASHBOARD);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to verify email");
		},
	});
}

/**
 * Hook for sending verification OTP for password reset
 */
export function useSendVerificationOtp() {
	return useMutation({
		mutationFn: authApi.sendVerificationOtp,
		onSuccess: () => {
			toast.success("Verification OTP sent to your email!");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to send verification OTP");
		},
	});
}

/**
 * Hook for resetting password (requires authentication and OTP)
 */
export function useResetPassword() {
	const router = useRouter();

	return useMutation({
		mutationFn: (data: { otp: string; password: string }) => authApi.resetPassword(data),
		onSuccess: () => {
			toast.success("Password reset successfully!");
			router.push(ROUTES.DASHBOARD);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to reset password");
		},
	});
}
