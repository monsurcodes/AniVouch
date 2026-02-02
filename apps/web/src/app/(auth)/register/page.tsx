/**
 * Register Page
 * User registration page
 */

import { RegisterForm } from "@/components/forms";

export default function RegisterPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
			<RegisterForm />
		</div>
	);
}
