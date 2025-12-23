import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { resources } from "./resources";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "./languages";

i18n.use(initReactI18next);
i18n.use(LanguageDetector);

i18n.init({
    resources: resources,
    supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.code),
    lng: undefined,
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
