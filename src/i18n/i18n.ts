import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";

const isServer = typeof window === "undefined";

i18n.use(initReactI18next);

// Only use browser language detector on client-side
if (!isServer) {
    i18n.use(LanguageDetector);
}

i18n.init({
    resources: resources,
    supportedLngs: ["de", "en"],
    lng: isServer ? "de" : undefined,
    load: "languageOnly",
    fallbackLng: "de",
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
