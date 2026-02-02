/**
 * React Query Provider
 * Global configuration for TanStack Query (React Query)
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

/**
 * Default query client configuration
 */
function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Stale time: how long data is considered fresh (5 minutes)
				staleTime: 5 * 60 * 1000,
				// Cache time: how long unused data stays in cache (10 minutes)
				gcTime: 10 * 60 * 1000,
				// Retry failed requests
				retry: 2,
				// Refetch on window focus
				refetchOnWindowFocus: true,
				// Refetch on reconnect
				refetchOnReconnect: true,
			},
			mutations: {
				// Retry failed mutations once
				retry: 1,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always make a new query client
		return makeQueryClient();
	} else {
		// Browser: make a new query client if we don't already have one
		if (!browserQueryClient) browserQueryClient = makeQueryClient();
		return browserQueryClient;
	}
}

interface QueryProviderProps {
	children: ReactNode;
}

/**
 * Query Provider Component
 * Wraps the app with React Query functionality
 */
export function QueryProvider({ children }: QueryProviderProps) {
	const [queryClient] = useState(() => getQueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	);
}
