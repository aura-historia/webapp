import { describe, expect, it } from "vitest";
import {
    getShopSortModeFieldLabel,
    mapToBackendShopSortModeArguments,
    type SHOP_SEARCH_SORT_FIELDS,
} from "@/data/internal/search/ShopSortMode.ts";

describe("ShopSortMode", () => {
    describe("getShopSortModeFieldLabel", () => {
        it("returns correct label for every sort field", () => {
            expect(getShopSortModeFieldLabel("RELEVANCE")).toBe("search.sortMode.relevance");
            expect(getShopSortModeFieldLabel("NAME")).toBe("search.sortMode.name");
            expect(getShopSortModeFieldLabel("CREATION_DATE")).toBe("search.sortMode.creationDate");
            expect(getShopSortModeFieldLabel("UPDATE_DATE")).toBe("search.sortMode.updateDate");
        });

        it("defaults to relevance for unknown values", () => {
            expect(
                getShopSortModeFieldLabel("BOGUS" as (typeof SHOP_SEARCH_SORT_FIELDS)[number]),
            ).toBe("search.sortMode.relevance");
        });
    });

    describe("mapToBackendShopSortModeArguments", () => {
        it("maps each supported field to the correct backend sort", () => {
            expect(
                mapToBackendShopSortModeArguments({ field: "RELEVANCE", order: "DESC" }),
            ).toEqual({ sort: "score", order: "desc" });
            expect(mapToBackendShopSortModeArguments({ field: "NAME", order: "ASC" })).toEqual({
                sort: "name",
                order: "asc",
            });
            expect(
                mapToBackendShopSortModeArguments({ field: "CREATION_DATE", order: "DESC" }),
            ).toEqual({ sort: "created", order: "desc" });
            expect(
                mapToBackendShopSortModeArguments({ field: "UPDATE_DATE", order: "DESC" }),
            ).toEqual({ sort: "updated", order: "desc" });
        });

        it("defaults to score/desc when no sort mode is provided", () => {
            expect(mapToBackendShopSortModeArguments()).toEqual({ sort: "score", order: "desc" });
        });
    });
});
