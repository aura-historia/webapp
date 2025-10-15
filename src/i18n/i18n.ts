import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

import translationDE from "../../public/locales/de/translation.json";

const resources = {
    de: {
        translation: translationDE,
    },
};

i18n
    // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
    // learn more: https://github.com/i18next/i18next-http-backend
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: resources,
        fallbackLng: "de",
        debug: true,

        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
