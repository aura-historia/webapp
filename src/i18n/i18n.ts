import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "./languages";

const isServer = typeof window === "undefined";

i18n.use(initReactI18next);

// Only use browser language detector on client-side
if (!isServer) {
    i18n.use(LanguageDetector);
}

i18n.init({
    resources: resources,
    supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.code),
    lng: isServer ? DEFAULT_LANGUAGE : undefined,
    load: "languageOnly",
    fallbackLng: DEFAULT_LANGUAGE,
    debug: import.meta.env.DEV,
    interpolation: {
        escapeValue: false,
    },
    detection: {
        order: ["querystring", "localStorage", "navigator", "htmlTag"],
        lookupQuerystring: "lng",
        lookupLocalStorage: "i18nextLng",
        caches: ["localStorage"],
    },
});

export default i18n;
