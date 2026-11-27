import { describe, expect, it } from "vitest";
import { LISTING_ENRICHMENT_LAG_MS } from "@/data/internal/product/ListingEnrichment.ts";
import { formatLanguageName, translationNoteKind } from "../translationNote.ts";

const checkedAt = Date.parse("2026-11-27T12:00:00Z");
const hoursAgo = (hours: number) => new Date(checkedAt - hours * 60 * 60 * 1000);

describe("translationNoteKind", () => {
    it("shows nothing when the title is in the page language", () => {
        expect(
            translationNoteKind({ titleLanguage: "de", created: hoursAgo(1) }, "de", checkedAt),
        ).toBeUndefined();
    });

    it("shows nothing when the title language is unknown", () => {
        expect(translationNoteKind({ created: hoursAgo(1) }, "de", checkedAt)).toBeUndefined();
    });

    it("says the listing is still being processed within the enrichment window", () => {
        expect(
            translationNoteKind({ titleLanguage: "fr", created: hoursAgo(2) }, "en", checkedAt),
        ).toBe("processing");
    });

    it("drops the processing claim once the window has passed", () => {
        const created = new Date(checkedAt - LISTING_ENRICHMENT_LAG_MS);
        expect(translationNoteKind({ titleLanguage: "fr", created }, "en", checkedAt)).toBe(
            "unavailable",
        );
    });

    it("makes no processing claim when the load time is unknown", () => {
        expect(
            translationNoteKind({ titleLanguage: "fr", created: hoursAgo(1) }, "en", undefined),
        ).toBe("unavailable");
    });
});

describe("formatLanguageName", () => {
    it("names the language in the page language", () => {
        expect(formatLanguageName("de", "en")).toBe("German");
        expect(formatLanguageName("fr", "de")).toBe("Französisch");
        expect(formatLanguageName("de", "it")).toBe("tedesco");
    });

    it("falls back to the code for an invalid tag", () => {
        expect(formatLanguageName("not a language", "en")).toBe("not a language");
    });
});
