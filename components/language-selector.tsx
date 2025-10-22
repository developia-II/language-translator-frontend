"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Language {
	code: string;
	name: string;
	flag: string;
	native: string;
}

interface LanguageSelectorProps {
	value: string;
	onValueChange: (value: string) => void;
	languages: Language[];
}

export function LanguageSelector({
	value,
	onValueChange,
	languages,
}: LanguageSelectorProps) {
	return (
		<Select value={value} onValueChange={onValueChange}>
			<SelectTrigger className="w-full bg-card hover:bg-muted/50 transition-colors">
				<SelectValue />
			</SelectTrigger>
			<SelectContent className="bg-black ">
				{languages.map((lang) => (
					<SelectItem
						key={lang.code}
						value={lang.code}
						className="hover:bg-grey-500 transition-color"
					>
						<span className="flex items-center gap-2">
							<span className="text-lg">{lang.flag}</span>
							<span className="flex flex-col items-start">
								<span className="font-medium">{lang.name}</span>
								<span className="text-xs text-muted-foreground">
									{lang.native}
								</span>
							</span>
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
