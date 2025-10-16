import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n.use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
        supportedLngs: ["de"],
        load: "languageOnly",
        fallbackLng: "de",
        debug: import.meta.env.DEV,
        interpolation: {
            escapeValue: false,
        },
        react: {
            bindI18n: "languageChanged languageChanging",
            useSuspense: true,
        },
    });

export default i18n;
