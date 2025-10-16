import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";

i18n.use(initReactI18next).init({
    resources: resources,
    supportedLngs: ["de"],
    load: "languageOnly",
    fallbackLng: "de",
    debug: import.meta.env.DEV,
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
