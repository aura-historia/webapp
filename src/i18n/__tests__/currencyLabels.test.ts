import { describe, expect, it } from "vitest";
import { resources } from "@/i18n/resources.ts";

const locales = ["de", "en", "es", "fr", "it"] as const;

describe("currency labels", () => {
    it("covers every configured locale", () => {
        expect(Object.keys(resources).sort()).toEqual([...locales].sort());
    });

    it.each(locales)("%s explains unsupported listing source currencies", (locale) => {
        expect(
            resources[locale].translation.adminListingSources.validation.unsupportedCurrency,
        ).toEqual(expect.any(String));
    });
});
