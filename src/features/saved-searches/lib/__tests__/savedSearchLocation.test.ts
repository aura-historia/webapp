import type { CountryCode, SubdivisionCode } from "@/data/internal/geography/GeographicCodes.ts";
import { describe, expect, it } from "vitest";
import type { GeographicSearch } from "@/data/internal/geography/GeographicSearch.ts";
import {
    effectiveGeography,
    resolveGeographyChange,
    searchLocationToGeographicSearch,
    toSavedSearchLocation,
} from "@/features/saved-searches/lib/savedSearchLocation.ts";

const POINT = { latitude: 51.34, longitude: 12.37 };
const NEW_POINT = { latitude: 52.52, longitude: 13.4 };

const SAVED_DISTANCE: GeographicSearch = {
    countries: [],
    subdivisions: [],
    origin: POINT,
    radius: { amount: 50, unit: "KILOMETERS" },
    mode: "APPROXIMATE",
};
const SAVED_REGION: GeographicSearch = {
    countries: ["DE", "AT"] as CountryCode[],
    subdivisions: [],
};

describe("toSavedSearchLocation", () => {
    it("starts without a location when none is stored", () => {
        expect(toSavedSearchLocation(undefined)).toBeUndefined();
    });

    it("keeps a stored distance as the saved starting point, in its own unit", () => {
        expect(
            toSavedSearchLocation({ ...SAVED_DISTANCE, radius: { amount: 8000, unit: "METERS" } }),
        ).toEqual({
            kind: "DISTANCE",
            near: { kind: "SAVED", point: POINT },
            radius: { amount: 8000, unit: "METERS" },
        });
    });

    it("reads stored places as a region", () => {
        expect(toSavedSearchLocation(SAVED_REGION)).toEqual({
            kind: "REGION",
            countries: ["DE", "AT"] as CountryCode[],
            subdivisions: [],
        });
    });

    it("cannot edit what the step cannot show", () => {
        expect(toSavedSearchLocation("UNSUPPORTED")).toEqual({ kind: "UNSUPPORTED" });
        // Places and a distance together.
        expect(
            toSavedSearchLocation({ ...SAVED_DISTANCE, countries: ["DE"] as CountryCode[] }),
        ).toEqual({
            kind: "UNSUPPORTED",
        });
        // A distance order without a distance.
        expect(
            toSavedSearchLocation({
                countries: [],
                subdivisions: [],
                origin: POINT,
                distanceOrder: "ASC",
            }),
        ).toEqual({ kind: "UNSUPPORTED" });
    });
});

describe("searchLocationToGeographicSearch", () => {
    it("copies the resolved point, the distance and the approximate mode, not the order", () => {
        expect(
            searchLocationToGeographicSearch(
                {
                    kind: "DISTANCE",
                    near: { kind: "ADDRESS", addressId: "a1" },
                    radius: { amount: 25, unit: "MILES" },
                    distanceOrder: "ASC",
                },
                NEW_POINT,
            ),
        ).toEqual({
            countries: [],
            subdivisions: [],
            origin: NEW_POINT,
            radius: { amount: 25, unit: "MILES" },
            mode: "APPROXIMATE",
        });
    });

    it("has nothing to save for a distance whose starting point is not known", () => {
        expect(
            searchLocationToGeographicSearch(
                {
                    kind: "DISTANCE",
                    near: { kind: "CURRENT" },
                    radius: { amount: 50, unit: "KILOMETERS" },
                },
                undefined,
            ),
        ).toBeUndefined();
    });

    it("copies places as they are", () => {
        expect(
            searchLocationToGeographicSearch(
                { kind: "REGION", countries: [], subdivisions: ["DE-SN"] as SubdivisionCode[] },
                undefined,
            ),
        ).toEqual({ countries: [], subdivisions: ["DE-SN"] as SubdivisionCode[] });
    });
});

describe("resolveGeographyChange", () => {
    const none = { status: "none" } as const;

    it("omits geography when an edit leaves the location alone", () => {
        expect(
            resolveGeographyChange({
                mode: "edit",
                stored: SAVED_DISTANCE,
                location: toSavedSearchLocation(SAVED_DISTANCE),
                touched: false,
                origin: none,
            }),
        ).toEqual({ kind: "keep" });
    });

    it("keeps a stored predicate the app cannot read unless it is removed", () => {
        expect(
            resolveGeographyChange({
                mode: "edit",
                stored: "UNSUPPORTED",
                location: { kind: "UNSUPPORTED" },
                touched: false,
                origin: none,
            }),
        ).toEqual({ kind: "keep" });
        expect(
            resolveGeographyChange({
                mode: "edit",
                stored: "UNSUPPORTED",
                location: undefined,
                touched: true,
                origin: none,
            }),
        ).toEqual({ kind: "set", geography: null });
    });

    it("clears the stored location with null when an edit removes it", () => {
        expect(
            resolveGeographyChange({
                mode: "edit",
                stored: SAVED_DISTANCE,
                location: undefined,
                touched: true,
                origin: none,
            }),
        ).toEqual({ kind: "set", geography: null });
    });

    it("sends nothing for a new filter without a location", () => {
        expect(
            resolveGeographyChange({
                mode: "create",
                stored: undefined,
                location: undefined,
                touched: true,
                origin: none,
            }),
        ).toEqual({ kind: "keep" });
    });

    it("replaces the whole snapshot when the distance changes, keeping the saved point", () => {
        expect(
            resolveGeographyChange({
                mode: "edit",
                stored: { ...SAVED_DISTANCE, mode: "STRICT" },
                location: {
                    kind: "DISTANCE",
                    near: { kind: "SAVED", point: POINT },
                    radius: { amount: 10, unit: "MILES" },
                },
                touched: true,
                origin: none,
            }),
        ).toEqual({
            kind: "set",
            geography: {
                countries: [],
                subdivisions: [],
                origin: POINT,
                radius: { amount: 10, unit: "MILES" },
                mode: "APPROXIMATE",
            },
        });
    });

    it("copies a new starting point's resolved point, not the address", () => {
        expect(
            resolveGeographyChange({
                mode: "create",
                stored: undefined,
                location: {
                    kind: "DISTANCE",
                    near: { kind: "ADDRESS", addressId: "a1" },
                    radius: { amount: 50, unit: "KILOMETERS" },
                },
                touched: true,
                origin: { status: "ready", point: NEW_POINT },
            }),
        ).toEqual({
            kind: "set",
            geography: {
                countries: [],
                subdivisions: [],
                origin: NEW_POINT,
                radius: { amount: 50, unit: "KILOMETERS" },
                mode: "APPROXIMATE",
            },
        });
    });

    it("waits for a starting point that is loading and stops on one that cannot be used", () => {
        const location = {
            kind: "DISTANCE",
            near: { kind: "CURRENT" },
            radius: { amount: 50, unit: "KILOMETERS" },
        } as const;
        expect(
            resolveGeographyChange({
                mode: "create",
                stored: undefined,
                location,
                touched: true,
                origin: { status: "loading" },
            }),
        ).toEqual({ kind: "blocked", reason: "loading" });
        expect(
            resolveGeographyChange({
                mode: "create",
                stored: undefined,
                location,
                touched: true,
                origin: { status: "unavailable" },
            }),
        ).toEqual({ kind: "blocked", reason: "unavailable" });
    });

    it("copies the stored predicate verbatim when duplicating", () => {
        const stored: GeographicSearch = {
            ...SAVED_DISTANCE,
            mode: "STRICT",
            distanceOrder: "ASC",
        };
        expect(
            resolveGeographyChange({
                mode: "duplicate",
                stored,
                location: toSavedSearchLocation(stored),
                touched: false,
                origin: none,
            }),
        ).toEqual({ kind: "set", geography: stored });
    });
});

describe("effectiveGeography", () => {
    it("is the stored predicate after an edit that keeps it", () => {
        expect(effectiveGeography({ kind: "keep" }, SAVED_REGION, "edit")).toBe(SAVED_REGION);
    });

    it("is the new predicate, or none after clearing", () => {
        expect(
            effectiveGeography({ kind: "set", geography: SAVED_REGION }, SAVED_DISTANCE, "edit"),
        ).toBe(SAVED_REGION);
        expect(
            effectiveGeography({ kind: "set", geography: null }, SAVED_DISTANCE, "edit"),
        ).toBeUndefined();
    });

    it("is none for a new filter that sends none", () => {
        expect(effectiveGeography({ kind: "keep" }, SAVED_REGION, "duplicate")).toBeUndefined();
    });
});
