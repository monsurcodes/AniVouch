/**
 * Login Page
 * User authentication page
 */

import { LoginForm } from "@/components/forms";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
			<LoginForm />
		</div>
	);
}
