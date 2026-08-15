import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "./languages";
import { getInitialLanguage } from "./initialLanguage";

i18n.use(initReactI18next);

i18n.init({
    resources: resources,
    supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.code),
    lng: getInitialLanguage(),
    load: "languageOnly",
    fallbackLng: DEFAULT_LANGUAGE,
    debug: import.meta.env.DEV,
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
