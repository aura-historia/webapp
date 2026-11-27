import { describe, expect, it } from "vitest";
import {
    LISTING_AVAILABILITIES,
    LISTING_AVAILABILITY_TRANSLATION_KEYS,
    parseListingAvailability,
    SEARCHABLE_LISTING_AVAILABILITIES,
} from "@/data/internal/product/ListingAvailability.ts";

const REMOVED_FROM_SEARCH = ["UNAVAILABLE", "OUT_OF_STOCK", "SOLD_OUT"] as const;

describe("SEARCHABLE_LISTING_AVAILABILITIES", () => {
    it.each(REMOVED_FROM_SEARCH)("excludes %s, which search no longer contains", (value) => {
        expect(SEARCHABLE_LISTING_AVAILABILITIES).not.toContain(value);
    });

    it("keeps every other availability, in listing order", () => {
        expect(SEARCHABLE_LISTING_AVAILABILITIES).toEqual(
            LISTING_AVAILABILITIES.filter(
                (value) => !(REMOVED_FROM_SEARCH as readonly string[]).includes(value),
            ),
        );
    });

    it("keeps a label for every listing availability, since listings and admins still show them", () => {
        expect(Object.keys(LISTING_AVAILABILITY_TRANSLATION_KEYS).sort()).toEqual(
            [...LISTING_AVAILABILITIES].sort(),
        );
    });
});

describe("parseListingAvailability", () => {
    it("keeps searchable values once and in order", () => {
        expect(parseListingAvailability(["RESERVED", "IN_STOCK", "RESERVED"])).toEqual([
            "RESERVED",
            "IN_STOCK",
        ]);
    });

    it("drops unknown values and the states search no longer contains", () => {
        expect(
            parseListingAvailability([
                "IN_STOCK",
                "SOLD_OUT",
                "UNAVAILABLE",
                "OUT_OF_STOCK",
                "NOT_A_VALUE",
                42,
            ]),
        ).toEqual(["IN_STOCK"]);
    });

    it("keeps an empty selection when only removed states were chosen", () => {
        expect(parseListingAvailability(["SOLD_OUT"])).toEqual([]);
        expect(parseListingAvailability([])).toEqual([]);
    });

    it.each([undefined, null, "IN_STOCK", {}])("ignores %o, which is not a list", (value) => {
        expect(parseListingAvailability(value)).toBeUndefined();
    });
});
