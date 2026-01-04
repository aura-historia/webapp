import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { resources } from "./resources";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "./languages";
import { I18n } from "aws-amplify/utils";
import { syncAmplifyTranslations } from "@/lib/amplifyI18nBridge.ts";

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
        convertDetectedLanguage: (lang) => lang.split("-")[0],
    },
}).then(() => {
    I18n.setLanguage(i18n.language);
    syncAmplifyTranslations();
});

i18n.on("languageChanged", async (language) => {
    I18n.setLanguage(language);
    syncAmplifyTranslations();
    if ("cookieStore" in globalThis) {
        await globalThis.cookieStore.set({
            name: "i18next",
            value: language,
            path: "/",
            expires: Date.now() + 31536000000,
        });
    } else {
        // biome-ignore lint/suspicious/noDocumentCookie: Not all browsers support cookieStore API yet
        document.cookie = `i18next=${language}; path=/; max-age=31536000; SameSite=Lax`;
    }
});

export default i18n;
