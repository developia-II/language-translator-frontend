"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import { api, APIError } from "./api-client";

interface User {
	id: string;
	email: string;
	name: string;
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	signup: (email: string, password: string, name: string) => Promise<void>;
	logout: () => void;
	isLoading: boolean;
	error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		const token = localStorage.getItem("token");
		if (storedUser && token) {
			setUser(JSON.parse(storedUser));
		}
		setIsLoading(false);
	}, []);

	const login = async (email: string, password: string) => {
		setError(null);
		try {
			const data = await api.auth.login(email, password);
			const user: User = {
				id: data.user.id,
				email: data.user.email,
				name: data.user.name,
			};
			setUser(user);
			localStorage.setItem("user", JSON.stringify(user));
		} catch (err) {
			if (err instanceof APIError) {
				setError(err.message);
			} else {
				setError("An unexpected error occurred");
			}
			throw err;
		}
	};

	const signup = async (email: string, password: string, name: string) => {
		setError(null);
		try {
			const data = await api.auth.signup(name, email, password);
			const user: User = {
				id: data.user.id,
				email: data.user.email,
				name: data.user.name,
			};
			setUser(user);
			localStorage.setItem("user", JSON.stringify(user));
		} catch (err) {
			if (err instanceof APIError) {
				setError(err.message);
			} else {
				setError("An unexpected error occurred");
			}
			throw err;
		}
	};

	const logout = () => {
		api.auth.logout();
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{ user, login, signup, logout, isLoading, error }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
