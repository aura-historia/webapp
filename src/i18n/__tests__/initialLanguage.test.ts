import { afterEach, describe, expect, it } from "vitest";
import { getInitialLanguage, resolveInitialLanguage } from "@/i18n/initialLanguage.ts";

describe("initial language", () => {
    const originalHtmlLanguage = document.documentElement.lang;

    afterEach(() => {
        document.documentElement.lang = originalHtmlLanguage;
    });

    it("uses the locale rendered into the html element", () => {
        document.documentElement.lang = "fr-FR";

        expect(getInitialLanguage()).toBe("fr");
    });

    it("falls back when the rendered locale is unsupported", () => {
        expect(resolveInitialLanguage("nl-NL")).toBe("en");
        expect(resolveInitialLanguage(undefined)).toBe("en");
    });
});
