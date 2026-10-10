import { describe, expect, it } from "vitest";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { resources } from "@/i18n/resources.ts";

const locales = ["de", "en", "es", "fr", "it"] as const;

describe("currency labels", () => {
    it("covers every configured locale", () => {
        expect(Object.keys(resources).sort()).toEqual([...locales].sort());
    });

    it.each(locales)("%s labels exactly the supported currencies", (locale) => {
        const labels: Record<string, unknown> = resources[locale].translation.auth.currencies;

        expect(Object.keys(labels).sort()).toEqual([...CURRENCIES].sort());
        for (const currency of CURRENCIES) {
            expect(labels[currency]).toEqual(expect.stringMatching(new RegExp(`^${currency}\\b`)));
        }
    });

    it.each(locales)("%s explains unsupported listing source currencies", (locale) => {
        expect(
            resources[locale].translation.adminListingSources.validation.unsupportedCurrency,
        ).toEqual(expect.any(String));
    });
});
