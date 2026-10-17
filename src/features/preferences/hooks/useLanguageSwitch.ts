import { useLocation, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { persistLanguagePreference } from "@/i18n/languagePreference.ts";
import { localizeHref } from "@/i18n/routing.ts";

/** Switches the interface language and moves to the same page under the new locale. */
export function useLanguageSwitch(): {
    readonly language: string;
    readonly switchLanguage: (languageCode: string) => Promise<void>;
} {
    const { i18n } = useTranslation();
    const navigate = useNavigate({ from: "/$lng" });
    const href = useLocation({ select: (location) => location.href });

    const switchLanguage = async (languageCode: string) => {
        persistLanguagePreference(languageCode);
        await navigate({ href: localizeHref(href, languageCode) });

        if (i18n.resolvedLanguage !== languageCode) {
            await i18n.changeLanguage(languageCode);
        }
    };

    return { language: i18n.language, switchLanguage };
}
