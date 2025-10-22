"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

export function AuthGate() {
	const [showLogin, setShowLogin] = useState(true);

	return (
		<div className="min-h-screen pattern-bg flex items-center justify-center p-4 bg-black">
			<div className="w-full max-w-md space-y-8">
				{/* Logo */}

				{/* Auth Forms */}
				{showLogin ? (
					<LoginForm onSwitchToSignup={() => setShowLogin(false)} />
				) : (
					<SignupForm onSwitchToLogin={() => setShowLogin(true)} />
				)}
			</div>
		</div>
	);
}
