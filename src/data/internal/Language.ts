import type { LanguageData } from "@/client";

export type Language = "de" | "en" | "fr" | "es";

export function parseLanguage(language?: string): Language {
    const lowercasedLanguage = language?.toLowerCase() ?? "en";

    switch (lowercasedLanguage) {
        case "de":
        case "en":
        case "fr":
        case "es":
            return lowercasedLanguage;
        default:
            return "en";
    }
}

export function mapToBackendLanguage(language?: Language): LanguageData | null {
    if (!language) return null;

    switch (language) {
        case "de":
        case "en":
        case "fr":
        case "es":
            return language;
    }
}
