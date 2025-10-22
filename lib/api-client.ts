const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	"https://language-translator-backend-production.up.railway.app";

class APIError extends Error {
	constructor(message: string, public status: number) {
		super(message);
		this.name = "APIError";
	}
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;

	const headers = new Headers({
		"Content-Type": "application/json",
	});

	if (options.headers) {
		new Headers(options.headers).forEach((value, key) => {
			headers.set(key, value);
		});
	}

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers,
	});

	const data = await response.json();

	if (!response.ok) {
		throw new APIError(data.error || "An error occurred", response.status);
	}

	return data;
}

export const api = {
	// Auth endpoints
	auth: {
		signup: async (name: string, email: string, password: string) => {
			const data = await fetchAPI("/auth/signup", {
				method: "POST",
				body: JSON.stringify({ name, email, password }),
			});
			localStorage.setItem("token", data.token);
			return data;
		},

		login: async (email: string, password: string) => {
			const data = await fetchAPI("/auth/login", {
				method: "POST",
				body: JSON.stringify({ email, password }),
			});
			localStorage.setItem("token", data.token);
			return data;
		},

		logout: () => {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
		},
	},

	// Translation endpoints
	translations: {
		translate: async (
			sourceText: string,
			sourceLang: string,
			targetLang: string
		) => {
			return fetchAPI("/translate", {
				method: "POST",
				body: JSON.stringify({ sourceText, sourceLang, targetLang }),
			});
		},

		getHistory: async () => {
			return fetchAPI("/translations");
		},
	},

	// Feedback endpoints
	feedback: {
		submit: async (
			translationId: string,
			rating: number,
			suggestedText?: string
		) => {
			return fetchAPI("/feedback", {
				method: "POST",
				body: JSON.stringify({ translationId, rating, suggestedText }),
			});
		},

		getForTranslation: async (translationId: string) => {
			return fetchAPI(`/feedback/${translationId}`);
		},
	},

	// TTS endpoint
	tts: {
		speak: async (text: string, lang: string) => {
			const token = localStorage.getItem("token");
			const response = await fetch(`${API_BASE_URL}/tts`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({ text, lang }),
			});
			if (!response.ok) {
				let message = "TTS request failed";
				try {
					const data = await response.json();
					message = data.error || message;
				} catch {
					message = await response.text();
				}
				throw new APIError(message, response.status);
			}
			return await response.blob();
		},
	},
};

export { APIError };
