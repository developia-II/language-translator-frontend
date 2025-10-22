"use client";

import { useState, useEffect } from "react";
import { TranslateForm } from "@/components/translate-form";
import { HistoryPanel } from "@/components/history-panel";
import { FeedbackModal } from "@/components/feedback-modal";
import { AuthGate } from "@/components/auth/auth-gate";
import { Button } from "@/components/ui/button";
import { History, X, LogOut, User, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

export interface Translation {
	id: string;
	sourceText: string;
	translatedText: string;
	sourceLang: string;
	targetLang: string;
	timestamp: Date;
}

interface TranslationDTO {
	id: string | number;
	sourceText: string;
	translatedText: string;
	sourceLang: string;
	targetLang: string;
	createdAt: string;
}

export interface Feedback {
	translationId: string;
	rating: number;
	suggestedText?: string;
}

export default function Home() {
	const { user, logout, isLoading } = useAuth();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const [translations, setTranslations] = useState<Translation[]>([]);
	const [showHistory, setShowHistory] = useState(false);
	const [feedbackTranslation, setFeedbackTranslation] =
		useState<Translation | null>(null);
	const [currentTranslation, setCurrentTranslation] =
		useState<Translation | null>(null);
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [loadingHistory, setLoadingHistory] = useState(false);
	console.log(currentTranslation);

	useEffect(() => {
		if (user) {
			loadTranslationHistory();
		}
	}, [user]);

	const loadTranslationHistory = async () => {
		setLoadingHistory(true);
		try {
			const response = (await api.translations.getHistory()) as {
				translations?: TranslationDTO[];
			};
			const historyTranslations: Translation[] =
				(response?.translations ?? []).map((t) => ({
					id: String(t.id),
					sourceText: t.sourceText,
					translatedText: t.translatedText,
					sourceLang: t.sourceLang,
					targetLang: t.targetLang,
					timestamp: new Date(t.createdAt),
				})) || [];
			setTranslations(historyTranslations);
		} catch (err) {
			console.error("Failed to load history:", err);
		} finally {
			setLoadingHistory(false);
		}
	};

	if (isLoading || !isMounted) {
		return (
			<div className="min-h-screen glass-bg flex items-center justify-center">
				<div className="text-center space-y-6 animate-in fade-in duration-500">
					<div className="w-20 h-20 rounded-3xl glass-card glow-primary flex items-center justify-center mx-auto float-animation">
						<span className="text-gradient font-bold text-4xl">L</span>
					</div>
					<div className="space-y-2">
						<p className="text-foreground font-semibold text-lg">
							Loading your workspace...
						</p>
						<div className="flex items-center justify-center gap-1">
							<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
							<div className="w-2 h-2 rounded-full bg-accent animate-pulse delay-150" />
							<div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!user) {
		return <AuthGate />;
	}

	const handleTranslation = (translation: Translation) => {
		setTranslations((prev) => [translation, ...prev]);
		setCurrentTranslation(translation);
	};

	const handleFeedback = async (feedback: Feedback) => {
		try {
			await api.feedback.submit(
				feedback.translationId,
				feedback.rating,
				feedback.suggestedText
			);
		} catch (err) {
			console.error("Failed to submit feedback:", err);
		}
		setFeedbackTranslation(null);
	};

	return (
		<div className="min-h-screen glass-bg">
			<header className="glass-card border-b border-border/30 sticky top-0 z-40 backdrop-blur-xl">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3 group">
						<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary group-hover:scale-105 transition-transform duration-300">
							<span className="text-primary-foreground font-bold text-2xl">
								L
							</span>
						</div>
						<div className="group-hover:translate-x-1 transition-transform duration-300">
							<h1 className="text-xl font-bold text-gradient">LinguaBridge</h1>
							<p className="text-xs text-muted-foreground">
								Multilingual Campus Translator
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => setShowHistory(!showHistory)}
							className="glass-card hover:border-primary hover:glow-primary hover:scale-110 transition-all duration-300"
							disabled={loadingHistory}
						>
							{loadingHistory ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : showHistory ? (
								<X className="h-5 w-5" />
							) : (
								<History className="h-5 w-5" />
							)}
							{translations?.length > 0 && !loadingHistory && (
								<span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs rounded-full flex items-center justify-center animate-in zoom-in duration-300 pulse-glow">
									{translations.length}
								</span>
							)}
						</Button>

						<div className="relative">
							<Button
								variant="outline"
								size="icon"
								onClick={() => setShowUserMenu(!showUserMenu)}
								className="glass-card hover:border-accent hover:glow-accent hover:scale-110 transition-all duration-300"
							>
								<User className="h-5 w-5" />
							</Button>

							{showUserMenu && (
								<>
									<div
										className="fixed inset-0 z-40"
										onClick={() => setShowUserMenu(false)}
									/>
									<div className="absolute right-0 mt-2 w-56 glass-card border-border/50 rounded-xl shadow-2xl z-50 p-2 animate-in slide-in-from-top-2 duration-200">
										<div className="px-3 py-3 border-b border-border/30 mb-2">
											<p className="font-semibold text-sm text-foreground">
												{user.name}
											</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												{user.email}
											</p>
										</div>
										<Button
											variant="ghost"
											className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
											onClick={() => {
												logout();
												setShowUserMenu(false);
											}}
										>
											<LogOut className="h-4 w-4 mr-2" />
											Sign Out
										</Button>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-12 lg:py-16">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
						<div className="inline-block animate-in fade-in slide-in-from-top-4 duration-500">
							<div className="glass-card px-4 py-2 rounded-full mb-4 inline-flex items-center gap-2 hover:border-primary/50 transition-colors duration-300">
								<span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
								<span className="text-sm font-medium text-muted-foreground">
									Powered by AI Translation
								</span>
							</div>
						</div>
						<h2 className="text-5xl lg:text-7xl font-bold text-balance leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
							Bridge Languages,{" "}
							<span className="text-gradient">Connect Cultures</span>
						</h2>
						<p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
							Translate between Yoruba, Igbo, Hausa, and more with accurate
							pronunciation. Built for multilingual campus communities.
						</p>
					</div>

					{/* Translation Interface */}
					<div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
						<TranslateForm
							onTranslate={handleTranslation}
							onRequestFeedback={(translation) =>
								setFeedbackTranslation(translation)
							}
						/>
					</div>

					<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
						<div className="glass-card rounded-2xl p-8 hover:border-primary/50 transition-all hover:glow-primary hover:-translate-y-2 duration-500 group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
							<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
								<span className="text-3xl">🗣️</span>
							</div>
							<h3 className="font-bold text-xl mb-3 text-gradient">
								Text-to-Speech
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Hear accurate pronunciations in all supported languages with
								native voice selection
							</p>
						</div>

						<div className="glass-card rounded-2xl p-8 hover:border-accent/50 transition-all hover:glow-accent hover:-translate-y-2 duration-500 group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
							<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
								<span className="text-3xl">📚</span>
							</div>
							<h3 className="font-bold text-xl mb-3 text-gradient">
								Translation History
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Access your previous translations anytime, anywhere with cloud
								sync
							</p>
						</div>

						<div className="glass-card rounded-2xl p-8 hover:border-primary/50 transition-all hover:glow-primary hover:-translate-y-2 duration-500 group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
							<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
								<span className="text-3xl">💬</span>
							</div>
							<h3 className="font-bold text-xl mb-3 text-gradient">
								Community Feedback
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Help improve translations with your suggestions and ratings
							</p>
						</div>
					</div>
				</div>
			</main>

			{/* History Sidebar */}
			<HistoryPanel
				translations={translations}
				isOpen={showHistory}
				onClose={() => setShowHistory(false)}
				onSelectTranslation={setCurrentTranslation}
			/>

			{/* Feedback Modal */}
			{feedbackTranslation && (
				<FeedbackModal
					translation={feedbackTranslation}
					onSubmit={handleFeedback}
					onClose={() => setFeedbackTranslation(null)}
				/>
			)}
		</div>
	);
}
