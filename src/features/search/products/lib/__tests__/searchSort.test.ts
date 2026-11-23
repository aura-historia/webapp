import { describe, expect, it } from "vitest";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SearchLocation } from "@/data/internal/search/SearchLocation.ts";
import {
    applySearchSortSelection,
    getSearchSortSelection,
} from "@/features/search/products/lib/searchSort.ts";

const distanceLocation = {
    kind: "DISTANCE",
    near: { kind: "ADDRESS", addressId: "uaddr_home" },
    radius: { amount: 50, unit: "KILOMETERS" },
    mode: "APPROXIMATE",
} as const;

const plain: SearchFilterArguments = { q: "commode", sortField: "CREATION_DATE", sortOrder: "ASC" };
const byDistance: SearchFilterArguments = {
    ...plain,
    location: { ...distanceLocation, distanceOrder: "DESC" },
};

describe("getSearchSortSelection", () => {
    it("defaults to relevance, descending", () => {
        expect(getSearchSortSelection({ q: "commode" }, false)).toEqual({
            field: "RELEVANCE",
            order: "DESC",
        });
    });

    it("shows the distance order once the starting point is known", () => {
        expect(getSearchSortSelection(byDistance, true)).toEqual({
            field: "DISTANCE",
            order: "DESC",
        });
    });

    it("keeps the ordinary order while the starting point is not known", () => {
        expect(getSearchSortSelection(byDistance, false)).toEqual({
            field: "CREATION_DATE",
            order: "ASC",
        });
    });
});

describe("applySearchSortSelection", () => {
    it("sets a distance order on the distance search", () => {
        const search = { ...plain, location: distanceLocation };
        expect(applySearchSortSelection(search, { field: "DISTANCE", order: "ASC" })).toEqual({
            ...plain,
            location: { ...distanceLocation, distanceOrder: "ASC" },
        });
    });

    it("ignores a distance choice without a distance search", () => {
        expect(
            applySearchSortSelection(plain, { field: "DISTANCE", order: "ASC" }),
        ).toBeUndefined();
    });

    it("clears the distance order when another field is chosen", () => {
        expect(applySearchSortSelection(byDistance, { field: "RELEVANCE", order: "DESC" })).toEqual(
            {
                ...plain,
                sortField: "RELEVANCE",
                sortOrder: "DESC",
                location: { ...distanceLocation, distanceOrder: undefined },
            },
        );
    });

    it("keeps a region search as it is", () => {
        const region = {
            kind: "REGION",
            countries: ["AT"],
            subdivisions: [],
        } as unknown as SearchLocation;
        expect(
            applySearchSortSelection(
                { ...plain, location: region },
                { field: "CREATION_DATE", order: "DESC" },
            ),
        ).toEqual({ ...plain, sortOrder: "DESC", location: region });
    });
});
