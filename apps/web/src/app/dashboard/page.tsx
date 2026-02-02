/**
 * Dashboard Page
 * Protected dashboard page for authenticated users
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
	const { user, isLoading, signOut } = useAuth();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Access Denied</CardTitle>
						<CardDescription>You must be logged in to view this page.</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4">
			<div className="mx-auto max-w-4xl space-y-6 py-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Dashboard</h1>
						<p className="text-muted-foreground">Welcome back, {user.name}!</p>
					</div>
					<Button variant="outline" onClick={() => signOut()}>
						Sign out
					</Button>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Profile Information</CardTitle>
							<CardDescription>Your account details</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<div>
								<p className="text-sm font-medium">Name</p>
								<p className="text-muted-foreground text-sm">{user.name}</p>
							</div>
							<div>
								<p className="text-sm font-medium">Email</p>
								<p className="text-muted-foreground text-sm">{user.email}</p>
							</div>
							<div>
								<p className="text-sm font-medium">Username</p>
								<p className="text-muted-foreground text-sm">
									{user.username || "Not set"}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium">Email Verified</p>
								<p className="text-muted-foreground text-sm">
									{user.emailVerified ? "✓ Yes" : "✗ No"}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Quick Stats</CardTitle>
							<CardDescription>Your activity overview</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<div>
								<p className="text-sm font-medium">Watchlist</p>
								<p className="text-muted-foreground text-sm">0 anime</p>
							</div>
							<div>
								<p className="text-sm font-medium">Watched</p>
								<p className="text-muted-foreground text-sm">0 anime</p>
							</div>
							<div>
								<p className="text-sm font-medium">Member since</p>
								<p className="text-muted-foreground text-sm">
									{new Date(user.createdAt).toLocaleDateString()}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
