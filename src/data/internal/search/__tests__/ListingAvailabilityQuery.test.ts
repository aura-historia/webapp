import { describe, expect, it } from "vitest";
import {
    mapToListingAvailabilityQuery,
    matchesNoListingAvailability,
} from "@/data/internal/search/ListingAvailabilityQuery.ts";

describe("mapToListingAvailabilityQuery", () => {
    it("sends the complete predicate alongside an availability selection", () => {
        expect(
            mapToListingAvailabilityQuery({
                q: "",
                availability: ["IN_STOCK"],
                orderability: ["ORDERABLE_NOW"],
                includeUnspecifiedAvailability: false,
            }),
        ).toEqual({
            availability: ["IN_STOCK"],
            orderability: ["ORDERABLE_NOW"],
            includeUnspecifiedAvailability: false,
        });
    });

    it("sends orderability without exact values when the selection is empty", () => {
        expect(
            mapToListingAvailabilityQuery({
                q: "",
                availability: [],
                orderability: ["ORDERABLE_NOW"],
                includeUnspecifiedAvailability: false,
            }),
        ).toEqual({ orderability: ["ORDERABLE_NOW"], includeUnspecifiedAvailability: false });
    });

    it("sends nothing without an availability selection, as a saved search persists nothing", () => {
        expect(
            mapToListingAvailabilityQuery({
                q: "",
                orderability: [],
                includeUnspecifiedAvailability: false,
            }),
        ).toEqual({});
    });
});

describe("matchesNoListingAvailability", () => {
    it.each([
        [{ availability: [] }, true],
        [{ availability: [], orderability: [], includeUnspecifiedAvailability: false }, true],
        [{ availability: [], includeUnspecifiedAvailability: true }, false],
        [{ availability: [], orderability: ["NOT_ORDERABLE" as const] }, false],
        [{ availability: ["IN_STOCK" as const] }, false],
        [{ includeUnspecifiedAvailability: false }, false],
    ])("%o matches nothing: %s", (args, expected) => {
        expect(matchesNoListingAvailability({ q: "", ...args })).toBe(expected);
    });
});
