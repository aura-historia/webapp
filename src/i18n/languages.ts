import { DE, ES, FR, IT, US } from "country-flag-icons/react/3x2";

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
    {
        code: "it",
        region_locale: "it-IT",
        flag: IT,
        name: "Italiano",
    },
];

export const DEFAULT_LANGUAGE = "en";
