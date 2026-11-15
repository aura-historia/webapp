import { describe, expect, it } from "vitest";
import { isListingTextTranslated, mapListingDisplayText } from "../ListingText.ts";

const translated = {
    original: { text: "Antique Imari charger", language: "en" as const },
    localized: { text: "Antike Imari-Platte", language: "de" as const },
};
const fallback = {
    original: { text: "Antique Imari charger", language: "en" as const },
    localized: { text: "Antique Imari charger", language: "en" as const },
};

describe("mapListingDisplayText", () => {
    it("returns the localized text, never the original", () => {
        expect(mapListingDisplayText(translated)).toBe("Antike Imari-Platte");
    });

    it("returns a fallback-language text when that is what the backend chose", () => {
        expect(mapListingDisplayText(fallback)).toBe("Antique Imari charger");
    });

    it("keeps missing text absent", () => {
        expect(mapListingDisplayText(undefined)).toBeUndefined();
        expect(mapListingDisplayText(null)).toBeUndefined();
    });
});

describe("isListingTextTranslated", () => {
    it("is true when the shown text is in another language than the original", () => {
        expect(isListingTextTranslated(translated)).toBe(true);
    });

    it("is false when the original itself is shown", () => {
        expect(isListingTextTranslated(fallback)).toBe(false);
    });

    it("claims no translation without an original to compare with", () => {
        expect(isListingTextTranslated({ localized: translated.localized })).toBe(false);
        expect(isListingTextTranslated(undefined)).toBe(false);
    });
});
