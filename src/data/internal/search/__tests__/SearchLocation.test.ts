import { describe, expect, it } from "vitest";
import type { CountryCode, SubdivisionCode } from "@/data/internal/geography/GeographicCodes.ts";
import {
    addRegionPlace,
    mapSearchLocationToGeographicSearch,
    parseSearchLocation,
    parseSearchNear,
    removeRegionPlace,
    serializeSearchLocation,
    type SearchLocation,
} from "@/data/internal/search/SearchLocation.ts";

const DE = "DE" as CountryCode;
const AT = "AT" as CountryCode;
const SAXONY = "DE-SN" as SubdivisionCode;
const BAVARIA = "DE-BY" as SubdivisionCode;
const POINT = { latitude: 51.3397, longitude: 12.3731 };

describe("parseSearchNear", () => {
    it("reads references only, never coordinates", () => {
        expect(parseSearchNear("search-location")).toEqual({ kind: "SEARCH_LOCATION" });
        expect(parseSearchNear("current")).toEqual({ kind: "CURRENT" });
        expect(parseSearchNear("address:useraddress_01jd")).toEqual({
            kind: "ADDRESS",
            addressId: "useraddress_01jd",
        });
        expect(parseSearchNear("51.3,12.3")).toBeUndefined();
        expect(parseSearchNear("address:")).toBeUndefined();
        expect(parseSearchNear("address:a b")).toBeUndefined();
    });
});

describe("parseSearchLocation", () => {
    it("reads a region search and drops invalid codes and regions of unchosen countries", () => {
        expect(
            parseSearchLocation({
                countries: ["DE", "XX", "DE"],
                regions: ["DE-SN", "AT-4", "ZZ"],
            }),
        ).toEqual({ kind: "REGION", countries: ["DE"], subdivisions: ["DE-SN"] });
        expect(parseSearchLocation({ regions: "DE-SN" })).toEqual({
            kind: "REGION",
            countries: [],
            subdivisions: ["DE-SN"],
        });
        expect(parseSearchLocation({ countries: "nowhere" })).toBeUndefined();
    });

    it("lets a starting point make it a distance search and ignores places then", () => {
        expect(
            parseSearchLocation({
                countries: "DE",
                near: "search-location",
                radius: "25",
                unit: "MILES",
                proximity: "STRICT",
                sortField: "DISTANCE",
                sortOrder: "DESC",
            }),
        ).toEqual({
            kind: "DISTANCE",
            near: { kind: "SEARCH_LOCATION" },
            radius: { amount: 25, unit: "MILES" },
            mode: "STRICT",
            distanceOrder: "DESC",
        });
    });

    it("falls back to 50 in the given unit and approximate mode for a hand-edited link", () => {
        expect(parseSearchLocation({ near: "current", radius: "-3", unit: "KILOMETERS" })).toEqual({
            kind: "DISTANCE",
            near: { kind: "CURRENT" },
            radius: { amount: 50, unit: "KILOMETERS" },
            mode: "APPROXIMATE",
        });
        expect(parseSearchLocation({ near: "current", radius: "30000", unit: "parsecs" })).toEqual(
            expect.objectContaining({ radius: { amount: 50, unit: "KILOMETERS" } }),
        );
    });

    it("round-trips through the URL parameters", () => {
        const location: SearchLocation = {
            kind: "DISTANCE",
            near: { kind: "ADDRESS", addressId: "useraddress_01" },
            radius: { amount: 12.5, unit: "KILOMETERS" },
            mode: "STRICT",
        };
        const params = serializeSearchLocation(location);
        expect(params).toEqual({
            near: "address:useraddress_01",
            radius: 12.5,
            unit: "KILOMETERS",
            proximity: "STRICT",
        });
        expect(JSON.stringify(params)).not.toMatch(/latitude|longitude|51\./);
        expect(parseSearchLocation(params)).toEqual(location);
    });
});

describe("region places", () => {
    it("keeps places on one level, because the API joins countries and regions with AND", () => {
        const countries = addRegionPlace(addRegionPlace(undefined, DE), AT);
        expect(countries).toEqual({ kind: "REGION", countries: [DE, AT], subdivisions: [] });

        const regions = addRegionPlace(countries, SAXONY);
        expect(regions).toEqual({ kind: "REGION", countries: [], subdivisions: [SAXONY] });

        expect(addRegionPlace(regions, DE)).toEqual({
            kind: "REGION",
            countries: [DE],
            subdivisions: [],
        });
    });

    it("removes a country together with its regions and clears the filter when empty", () => {
        const location: SearchLocation = {
            kind: "REGION",
            countries: [DE],
            subdivisions: [SAXONY, BAVARIA],
        };
        expect(removeRegionPlace(location, "DE")).toBeUndefined();
        expect(removeRegionPlace(location, "DE-BY")).toEqual({
            kind: "REGION",
            countries: [DE],
            subdivisions: [SAXONY],
        });
    });
});

describe("mapSearchLocationToGeographicSearch", () => {
    it("sends a region search as code sets", () => {
        expect(
            mapSearchLocationToGeographicSearch(
                { kind: "REGION", countries: [DE], subdivisions: [] },
                undefined,
            ),
        ).toEqual({ countries: [DE], subdivisions: [] });
    });

    it("sends nothing for a distance search until its starting point is known", () => {
        const location: SearchLocation = {
            kind: "DISTANCE",
            near: { kind: "CURRENT" },
            radius: { amount: 50, unit: "KILOMETERS" },
            mode: "APPROXIMATE",
            distanceOrder: "ASC",
        };
        expect(mapSearchLocationToGeographicSearch(location, undefined)).toBeUndefined();
        expect(mapSearchLocationToGeographicSearch(location, POINT)).toEqual({
            countries: [],
            subdivisions: [],
            origin: POINT,
            radius: { amount: 50, unit: "KILOMETERS" },
            mode: "APPROXIMATE",
            distanceOrder: "ASC",
        });
    });
});
