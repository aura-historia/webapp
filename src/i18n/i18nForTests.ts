import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationDE from "@/../public/locales/de/translation.json";

const resources = {
    de: {
        translation: translationDE,
    },
};

// Initialize synchronously for tests
i18n.use(initReactI18next).init({
    lng: "de",
    fallbackLng: "de",
    debug: false, // Disable debug in tests to reduce noise
    interpolation: {
        escapeValue: false,
    },
    resources: resources,
    react: {
        useSuspense: false, // Important for tests
    },
});

export default i18n;
