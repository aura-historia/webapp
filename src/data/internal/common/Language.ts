import type { LanguageData } from "@/client";

export const LANGUAGES = ["de", "en", "fr", "es", "it"] as const;
export type Language = (typeof LANGUAGES)[number]; // Create something like that: "de" | "en" | ....

export function parseLanguage(language?: string): Language {
    const lowercasedLanguage = language?.toLowerCase() ?? "en";

    switch (lowercasedLanguage) {
        case "de":
        case "en":
        case "fr":
        case "es":
        case "it":
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
        case "it":
            return language;
    }
}

/**
 * Every language the backend accepts for localized source text (`LanguageData`), such as listing
 * titles and descriptions. Wider than the app's own interface languages.
 */
export const SOURCE_TEXT_LANGUAGES = [
    "de",
    "en",
    "es",
    "fr",
    "it",
    "zh",
    "pt",
    "pl",
    "tr",
    "nl",
    "cs",
    "ja",
    "ru",
    "ar",
] as const satisfies readonly LanguageData[];
export type SourceTextLanguage = (typeof SOURCE_TEXT_LANGUAGES)[number];

// Fails to compile when the backend adds a language that is missing above.
const sourceTextLanguagesCoverContract: [Exclude<LanguageData, SourceTextLanguage>] extends [never]
    ? true
    : never = true;
void sourceTextLanguagesCoverContract;

export function isSourceTextLanguage(value: string): value is SourceTextLanguage {
    return (SOURCE_TEXT_LANGUAGES as readonly string[]).includes(value);
}
