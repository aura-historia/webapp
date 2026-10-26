import { describe, expect, it } from "vitest";
import {
    combineOwnListingSourcePages,
    mapToOwnListingSourcePage,
} from "@/data/internal/listing-source/OwnListingSource.ts";

const first = { listingSourceId: "ls_first", listingSourceSlugId: "first", name: "Dealer" };
const namesake = { listingSourceId: "ls_namesake", listingSourceSlugId: "other", name: "Dealer" };

describe("own listing-source pages", () => {
    it("maps the reference fields and keeps the continuation unchanged", () => {
        const next = "eyJhZnRlciI6IkRlYWxlciJ9+/=";
        expect(
            mapToOwnListingSourcePage({
                items: [{ ...first, operator: { private: true } } as typeof first],
                next,
            }),
        ).toEqual({ items: [first], next });
    });

    it("marks the last page by omitting the continuation", () => {
        expect(mapToOwnListingSourcePage({ items: [] })).toStrictEqual({ items: [] });
    });

    it("combines pages in order by source ID, keeping equal names and first entries", () => {
        expect(
            combineOwnListingSourcePages([
                { items: [first], next: "cursor" },
                { items: [{ ...first, name: "Renamed" }, namesake] },
            ]),
        ).toEqual([first, namesake]);
    });
});
