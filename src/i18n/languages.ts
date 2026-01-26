import { DE, ES, FR, US } from "country-flag-icons/react/3x2";

export const SUPPORTED_LANGUAGES = [
    {
        code: "de",
        region_locale: "de-DE",
        flag: DE,
        name: "Deutsch",
    },
    {
        code: "en",
        region_locale: "en-US",
        flag: US,
        name: "English",
    },
    {
        code: "fr",
        region_locale: "fr-FR",
        flag: FR,
        name: "Français",
    },
    {
        code: "es",
        region_locale: "es-ES",
        flag: ES,
        name: "Español",
    },
];

export const DEFAULT_LANGUAGE = "en";
