import { describe, expect, it } from "vitest";
import {
    type SortMode,
    getSortModeFieldLabel,
    mapToBackendSortModeArguments,
} from "../SortMode.ts";

describe("getSortModeFieldLabel", () => {
    it("should return correct label for RELEVANCE", () => {
        const sortMode: SortMode = { field: "RELEVANCE", order: "DESC" };
        expect(getSortModeFieldLabel(sortMode.field)).toBe("search.sortMode.relevance");
    });

    it("should return correct label for PRICE", () => {
        const sortMode: SortMode = { field: "PRICE", order: "ASC" };
        expect(getSortModeFieldLabel(sortMode.field)).toBe("search.sortMode.price");
    });

    it("should return correct label for CREATION_DATE", () => {
        const sortMode: SortMode = { field: "CREATION_DATE", order: "DESC" };
        expect(getSortModeFieldLabel(sortMode.field)).toBe("search.sortMode.creationDate");
    });

    it("should return correct label for UPDATE_DATE", () => {
        const sortMode: SortMode = { field: "UPDATE_DATE", order: "ASC" };
        expect(getSortModeFieldLabel(sortMode.field)).toBe("search.sortMode.updateDate");
    });
});

describe("mapToBackendSortModeArguments", () => {
    describe("sort field mapping", () => {
        it("should map RELEVANCE to score", () => {
            const sortMode: SortMode = { field: "RELEVANCE", order: "DESC" };
            const result = mapToBackendSortModeArguments(sortMode);
            expect(result.sort).toBe("score");
        });

        it("should map PRICE to price", () => {
            const sortMode: SortMode = { field: "PRICE", order: "ASC" };
            const result = mapToBackendSortModeArguments(sortMode);
            expect(result.sort).toBe("price");
        });

        it("should map CREATION_DATE to created", () => {
            const sortMode: SortMode = { field: "CREATION_DATE", order: "DESC" };
            const result = mapToBackendSortModeArguments(sortMode);
            expect(result.sort).toBe("created");
        });

        it("should map UPDATE_DATE to updated", () => {
            const sortMode: SortMode = { field: "UPDATE_DATE", order: "ASC" };
            const result = mapToBackendSortModeArguments(sortMode);
            expect(result.sort).toBe("updated");
        });

        it("should default to score when sortMode is undefined", () => {
            const result = mapToBackendSortModeArguments(undefined);
            expect(result.sort).toBe("score");
        });
    });

    describe("order mapping", () => {
        it("should map ASC to asc", () => {
            const sortMode: SortMode = { field: "PRICE", order: "ASC" };
            const result = mapToBackendSortModeArguments(sortMode);
            expect(result.order).toBe("asc");
        });

        it("should map DESC to desc", () => {
            const sortMode: SortMode = { field: "PRICE", order: "DESC" };
            const result = mapToBackendSortModeArguments(sortMode);
            expect(result.order).toBe("desc");
        });

        it("should default to desc when sortMode is undefined", () => {
            const result = mapToBackendSortModeArguments(undefined);
            expect(result.order).toBe("desc");
        });
    });

    describe("combined field and order mapping", () => {
        it("should correctly map RELEVANCE DESC", () => {
            const sortMode: SortMode = { field: "RELEVANCE", order: "DESC" };
            const result = mapToBackendSortModeArguments(sortMode);
            expect(result).toEqual({ sort: "score", order: "desc" });
        });

        it("should correctly map PRICE ASC", () => {
            const sortMode: SortMode = { field: "PRICE", order: "ASC" };
            const result = mapToBackendSortModeArguments(sortMode);
            expect(result).toEqual({ sort: "price", order: "asc" });
        });

        it("should correctly map PRICE DESC", () => {
            const sortMode: SortMode = { field: "PRICE", order: "DESC" };
            const result = mapToBackendSortModeArguments(sortMode);
            expect(result).toEqual({ sort: "price", order: "desc" });
        });

        it("should correctly map CREATION_DATE ASC", () => {
            const sortMode: SortMode = { field: "CREATION_DATE", order: "ASC" };
            const result = mapToBackendSortModeArguments(sortMode);
            expect(result).toEqual({ sort: "created", order: "asc" });
        });

        it("should correctly map UPDATE_DATE DESC", () => {
            const sortMode: SortMode = { field: "UPDATE_DATE", order: "DESC" };
            const result = mapToBackendSortModeArguments(sortMode);
            expect(result).toEqual({ sort: "updated", order: "desc" });
        });
    });
});
