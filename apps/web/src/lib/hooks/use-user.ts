/**
 * User Hooks
 * Custom hooks for user-related functionality
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

/**
 * Hook to get current user
 */
export function useCurrentUser() {
	return useQuery({
		queryKey: QUERY_KEYS.USER.CURRENT,
		queryFn: userApi.getCurrentUser,
		retry: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to get user by identifier
 */
export function useUser(identifier: string) {
	return useQuery({
		queryKey: QUERY_KEYS.USER.BY_ID(identifier),
		queryFn: () => userApi.getUserByIdentifier(identifier),
		enabled: !!identifier,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to update username
 */
export function useUpdateUsername() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (username: string) => userApi.updateUsername(username),
		onSuccess: () => {
			toast.success("Username updated successfully!");
			// Invalidate user cache to refetch updated data
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.CURRENT });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update username");
		},
	});
}
