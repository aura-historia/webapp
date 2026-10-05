import { describe, expect, it } from "vitest";
import {
    SEARCH_RESULT_SORT_FIELDS,
    getSortModeFieldLabel,
    mapToBackendSortModeArguments,
    type SortMode,
} from "../SortMode.ts";

describe("listing search sort modes", () => {
    it.each([
        ["RELEVANCE", "score", "relevance"],
        ["CREATION_DATE", "created", "creationDate"],
        ["UPDATE_DATE", "updated", "updateDate"],
    ] as const)("maps %s to the current listing API", (field, backendField, label) => {
        expect(SEARCH_RESULT_SORT_FIELDS).toContain(field);
        expect(getSortModeFieldLabel(field)).toBe(`search.sortMode.${label}`);
        expect(mapToBackendSortModeArguments({ field, order: "ASC" })).toEqual({
            sort: backendField,
            order: "asc",
        });
        expect(mapToBackendSortModeArguments({ field, order: "DESC" })).toEqual({
            sort: backendField,
            order: "desc",
        });
    });
    it("defaults to relevance descending and discards unsupported legacy sorting", () => {
        expect(mapToBackendSortModeArguments()).toEqual({ sort: "score", order: "desc" });
        const legacyField = "PRICE" as SortMode["field"];
        expect(getSortModeFieldLabel(legacyField)).toBe("search.sortMode.relevance");
        expect(mapToBackendSortModeArguments({ field: legacyField, order: "ASC" })).toEqual({
            sort: "score",
            order: "asc",
        });
    });
});
