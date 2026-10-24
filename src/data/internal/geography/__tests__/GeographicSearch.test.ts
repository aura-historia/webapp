import { describe, expect, it } from "vitest";
import type { GeographicSearchData } from "@/client";
import { client } from "@/client/client.gen.ts";
import {
    mapToBackendGeographicSearch,
    mapToGeographicSearch,
    validateGeographicSearch,
    type GeographicSearch,
} from "@/data/internal/geography/GeographicSearch.ts";
import {
    listingGeographyQuerySerializer,
    partyLocationDiscoveryQuerySerializer,
    serializeDeepObjectQuery,
} from "@/data/internal/geography/GeographicQuerySerializer.ts";

function search(data: GeographicSearchData): GeographicSearch {
    const mapped = mapToGeographicSearch(data);
    if (!mapped || mapped === "UNSUPPORTED") throw new Error("Invalid test geography");
    return mapped;
}

describe("mapToGeographicSearch", () => {
    it("round-trips a complete predicate", () => {
        const data: GeographicSearchData = {
            countries: ["DE", "AT"],
            subdivisions: ["DE-BY"],
            origin: { latitude: 48.137, longitude: 11.575 },
            radius: { amount: 10, unit: "NAUTICAL_MILES" },
            mode: "STRICT",
            distanceOrder: "ASC",
        };
        expect(mapToBackendGeographicSearch(search(data))).toEqual(data);
    });

    it("returns undefined for an absent predicate", () => {
        expect(mapToGeographicSearch(undefined)).toBeUndefined();
        expect(mapToGeographicSearch(null)).toBeUndefined();
    });

    it.each<GeographicSearchData>([
        { countries: ["DE", "XX"] },
        { subdivisions: ["BY"] },
        { origin: { latitude: 91, longitude: 0 }, radius: { amount: 1, unit: "KILOMETERS" } },
        { origin: { latitude: 1, longitude: 1 }, radius: { amount: 1, unit: "LEAGUES" as never } },
        { countries: ["DE"], mode: "FUZZY" as never },
        { countries: ["DE"], distanceOrder: "NEAREST" as never },
    ])("marks unrecognized values as unsupported (%j)", (data) => {
        expect(mapToGeographicSearch(data)).toBe("UNSUPPORTED");
    });

    it("omits empty sets when sending", () => {
        expect(
            mapToBackendGeographicSearch({ countries: [], subdivisions: [], distanceOrder: "ASC" }),
        ).toEqual({ distanceOrder: "ASC" });
    });
});

describe("validateGeographicSearch", () => {
    const origin = { latitude: 48.137, longitude: 11.575 };
    const radius = { amount: 25, unit: "KILOMETERS" } as const;

    it.each<[GeographicSearchData, string | undefined]>([
        [{ countries: ["DE"], subdivisions: ["DE-BY"] }, undefined],
        [{ subdivisions: ["FR-IDF"] }, undefined],
        [{ origin, radius, mode: "APPROXIMATE" }, undefined],
        [{ origin, distanceOrder: "DESC" }, undefined],
        [{}, "EMPTY"],
        [{ countries: ["DE"], subdivisions: ["FR-IDF"] }, "SUBDIVISION_OUTSIDE_COUNTRIES"],
        [{ radius }, "ORIGIN_REQUIRED"],
        [{ distanceOrder: "ASC" }, "ORIGIN_REQUIRED"],
        [{ countries: ["DE"], origin }, "PROXIMITY_REQUIRED"],
        [{ countries: ["DE"], mode: "STRICT" }, "PROXIMITY_REQUIRED"],
    ])("validates %j as %s", (data, expected) => {
        expect(validateGeographicSearch(search(data))).toBe(expected);
    });

    it("limits each code set to 100 entries", () => {
        const countries = search({ countries: ["DE"] }).countries;
        expect(
            validateGeographicSearch({
                countries: Array.from({ length: 101 }, () => countries[0]),
                subdivisions: [],
            }),
        ).toBe("TOO_MANY_CODES");
    });

    it("rejects an invalid radius or origin constructed in the UI", () => {
        expect(
            validateGeographicSearch({
                countries: [],
                subdivisions: [],
                origin,
                radius: { amount: 0, unit: "KILOMETERS" },
            }),
        ).toBe("RADIUS_INVALID");
        expect(
            validateGeographicSearch({
                countries: [],
                subdivisions: [],
                origin: { latitude: Number.NaN, longitude: 0 },
                radius,
            }),
        ).toBe("ORIGIN_INVALID");
    });
});

describe("deep-object query serialization", () => {
    it("serializes nested objects and arrays with indexed, literal brackets", () => {
        expect(
            serializeDeepObjectQuery("geography", {
                countries: ["DE", "AT"],
                subdivisions: ["DE-BY"],
                origin: { latitude: 48.137, longitude: 0 },
                radius: { amount: 25, unit: "MILES" },
                mode: undefined,
            }).join("&"),
        ).toBe(
            "geography[countries][0]=DE&geography[countries][1]=AT&geography[subdivisions][0]=DE-BY" +
                "&geography[origin][latitude]=48.137&geography[origin][longitude]=0" +
                "&geography[radius][amount]=25&geography[radius][unit]=MILES",
        );
    });

    it("percent-encodes values", () => {
        expect(serializeDeepObjectQuery("searchAfter", { locationId: "a&b=c" })).toEqual([
            "searchAfter[locationId]=a%26b%3Dc",
        ]);
    });

    it("refuses non-finite numbers rather than sending them", () => {
        expect(() =>
            serializeDeepObjectQuery("geography", { origin: { latitude: Number.NaN } }),
        ).toThrow(RangeError);
    });

    it("keeps the generated serialization for listing parameters and the JSON cursor", () => {
        const url = client.buildUrl({
            baseUrl: "https://api.test",
            url: "/v1/product-listings",
            query: {
                productQuery: ["chair"],
                availability: ["AVAILABLE", "SOLD"],
                price: { min: 100 },
                searchAfter: '{"fxRateId":"fx_1","searchAfter":[1]}',
                geography: { countries: ["DE"] },
            },
            querySerializer: listingGeographyQuerySerializer,
        });
        const query = new URL(url).search.slice(1);
        expect(query).toBe(
            "productQuery=chair&availability=AVAILABLE&availability=SOLD&price[min]=100" +
                "&searchAfter=%7B%22fxRateId%22%3A%22fx_1%22%2C%22searchAfter%22%3A%5B1%5D%7D" +
                "&geography[countries][0]=DE",
        );
    });

    it("serializes the Party-location discovery continuation as a deep object", () => {
        expect(
            partyLocationDiscoveryQuerySerializer({
                geography: { origin: { latitude: 1, longitude: 2 }, distanceOrder: "ASC" },
                size: 21,
                searchAfter: { locationId: "ploc_1", distanceKm: 3.2468 },
            }),
        ).toBe(
            "size=21&geography[origin][latitude]=1&geography[origin][longitude]=2" +
                "&geography[distanceOrder]=ASC&searchAfter[locationId]=ploc_1" +
                "&searchAfter[distanceKm]=3.2468",
        );
    });
});
