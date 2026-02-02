import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";

import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
});

export const metadata: Metadata = {
	title: "AniVouch",
	description:
		"AniVouch - Track your anime watching habits with ease with features like watch-lists, already watched lists, and personalized recommendations.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<QueryProvider>
					<AuthProvider>
						{children}
						<Toaster position="top-right" richColors />
					</AuthProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
