/**
 * Authentication Provider
 * Manages authentication state and provides auth context
 */

"use client";

import type { User } from "@repo/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { authApi, userApi } from "@/lib/api";
import { setAuthToken } from "@/lib/api/client";

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	signOut: () => Promise<void>;
	refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
	const queryClient = useQueryClient();
	const [isInitialized, setIsInitialized] = useState(false);

	// Query current user
	const {
		data: user,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["user", "current"],
		queryFn: userApi.getCurrentUser,
		retry: false,
		enabled: isInitialized,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Sign out mutation
	const signOutMutation = useMutation({
		mutationFn: authApi.signOut,
		onSuccess: () => {
			// Clear auth token
			setAuthToken(null);
			// Clear all queries
			queryClient.clear();
			// Show success message
			toast.success("Signed out successfully");
		},
		onError: () => {
			toast.error("Failed to sign out");
		},
	});

	// Initialize on mount
	useEffect(() => {
		setIsInitialized(true);
	}, []);

	const value: AuthContextType = {
		user: user || null,
		isLoading: !isInitialized || isLoading,
		isAuthenticated: !!user,
		signOut: async () => {
			await signOutMutation.mutateAsync();
		},
		refetchUser: () => {
			refetch();
		},
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
