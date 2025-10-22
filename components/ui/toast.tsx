"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
	id: string;
	title?: string;
	description?: string;
	type?: ToastType;
	duration?: number; // ms
}

interface ToastContextValue {
	notify: (toast: Omit<Toast, "id">) => void;
	success: (message: string, opts?: Partial<Toast>) => void;
	error: (message: string, opts?: Partial<Toast>) => void;
	info: (message: string, opts?: Partial<Toast>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
	return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const remove = useCallback((id: string) => {
		setToasts((t) => t.filter((x) => x.id !== id));
	}, []);

	const notify = useCallback(
		(toast: Omit<Toast, "id">) => {
			const id = Math.random().toString(36).slice(2);
			const next: Toast = {
				id,
				duration: 3500,
				type: "info",
				...toast,
			};
			setToasts((prev) => [next, ...prev]);
			if (next.duration && next.duration > 0) {
				window.setTimeout(() => remove(id), next.duration);
			}
		},
		[remove]
	);

	const api = useMemo<ToastContextValue>(
		() => ({
			notify,
			success: (message, opts) =>
				notify({ description: message, type: "success", ...opts }),
			error: (message, opts) =>
				notify({ description: message, type: "error", ...opts }),
			info: (message, opts) =>
				notify({ description: message, type: "info", ...opts }),
		}),
		[notify]
	);

	return (
		<ToastContext.Provider value={api}>
			{children}
			<ToastViewport toasts={toasts} onClose={remove} />
		</ToastContext.Provider>
	);
}

function badge(type?: ToastType) {
	switch (type) {
		case "success":
			return "bg-green-500/15 text-green-400 border-green-500/30";
		case "error":
			return "bg-red-500/15 text-red-400 border-red-500/30";
		default:
			return "bg-blue-500/15 text-blue-400 border-blue-500/30";
	}
}

export function ToastViewport({
	toasts,
	onClose,
}: {
	toasts: Toast[];
	onClose: (id: string) => void;
}) {
	return (
		<div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
			{toasts.map((t) => (
				<div
					key={t.id}
					className={`glass-card border ${badge(
						t.type
					)} rounded-xl p-4 w-80 shadow-2xl animate-in slide-in-from-bottom-4 duration-200`}
				>
					<div className="flex items-start gap-3">
						<div
							className={`mt-0.5 w-2 h-2 rounded-full ${
								t.type === "success"
									? "bg-green-400"
									: t.type === "error"
									? "bg-red-400"
									: "bg-blue-400"
							}`}
						/>
						<div className="flex-1">
							{t.title && (
								<p className="font-medium text-sm mb-0.5">{t.title}</p>
							)}
							{t.description && (
								<p className="text-sm text-muted-foreground leading-relaxed">
									{t.description}
								</p>
							)}
						</div>
						<button
							className="p-1 rounded-md hover:bg-white/10 transition"
							onClick={() => onClose(t.id)}
							aria-label="Close"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
