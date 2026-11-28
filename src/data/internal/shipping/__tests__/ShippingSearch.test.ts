import { describe, expect, it } from "vitest";
import { serializeDeepObjectQuery } from "@/data/internal/geography/GeographicQuerySerializer.ts";
import { listingGeographyQuerySerializer } from "@/data/internal/geography/GeographicQuerySerializer.ts";
import type { CountryCode } from "@/data/internal/geography/GeographicCodes.ts";
import { classifyShippingError, isRetryableShippingError } from "../ShippingErrors.ts";
import { shippingQueryKeys } from "../ShippingQueryKeys.ts";
import {
    mapToBackendAcceptShippingDestination,
    mapToBackendShippingSearch,
    mapToShippingMatchValuation,
    mapToShippingSearch,
    type ShippingSearch,
    shippingSearchQueryKeyPart,
    UNSUPPORTED_SHIPPING_SEARCH,
    validateShippingSearch,
} from "../ShippingSearch.ts";

const DE = "DE" as CountryCode;
const BASE: ShippingSearch = {
    referenceRelease: "iso-codes-4.20.1",
    interpretation: "WHOLE_COUNTRY_PER_ITEM_V1",
};

describe("shipping search predicate", () => {
    it("validates like the backend", () => {
        expect(validateShippingSearch(BASE)).toBe("EMPTY");
        expect(validateShippingSearch({ ...BASE, collectionOffered: true })).toBeUndefined();
        expect(
            validateShippingSearch({ ...BASE, service: "PARCEL", collectionOffered: true }),
        ).toBe("SERVICE_WITHOUT_COUNTRY");
        expect(
            validateShippingSearch({
                ...BASE,
                collectionOffered: true,
                maximumPerItem: { amount: 1000, currency: "EUR" },
            }),
        ).toBe("MAXIMUM_WITHOUT_COUNTRY");
        expect(
            validateShippingSearch({
                ...BASE,
                country: DE,
                interpretation: "WHOLE_COUNTRY_PER_ITEM_FX_V1",
            }),
        ).toBe("FX_WITHOUT_MAXIMUM");
        expect(
            validateShippingSearch({
                ...BASE,
                country: DE,
                maximumPerItem: { amount: 10.5, currency: "EUR" },
            }),
        ).toBe("INVALID_MAXIMUM");
        expect(validateShippingSearch({ ...BASE, country: DE, service: " " })).toBe(
            "INVALID_SERVICE",
        );
    });

    it("sends the complete predicate and reads it back", () => {
        const search: ShippingSearch = {
            ...BASE,
            country: DE,
            interpretation: "WHOLE_COUNTRY_PER_ITEM_FX_V1",
            service: "PARCEL",
            maximumPerItem: { amount: 2500, currency: "USD" },
            collectionOffered: true,
        };
        const data = mapToBackendShippingSearch(search);
        expect(data).toEqual({
            destination: { kind: "COUNTRY", country: "DE" },
            referenceRelease: "iso-codes-4.20.1",
            interpretation: "WHOLE_COUNTRY_PER_ITEM_FX_V1",
            service: "PARCEL",
            maximumPerItem: { amount: 2500, currency: "USD" },
            collectionOffered: true,
        });
        expect(mapToShippingSearch(data)).toEqual(search);
    });

    it("serializes the predicate as an indexed deep object", () => {
        expect(
            listingGeographyQuerySerializer({
                currency: "EUR",
                shipping: mapToBackendShippingSearch({ ...BASE, country: DE, service: "PARCEL" }),
            }),
        ).toBe(
            [
                "currency=EUR",
                "shipping[destination][kind]=COUNTRY",
                "shipping[destination][country]=DE",
                "shipping[referenceRelease]=iso-codes-4.20.1",
                "shipping[interpretation]=WHOLE_COUNTRY_PER_ITEM_V1",
                "shipping[service]=PARCEL",
            ].join("&"),
        );
        expect(serializeDeepObjectQuery("shipping", undefined)).toEqual([]);
    });

    it("reads a stored predicate it cannot reproduce as unsupported, never narrower", () => {
        expect(mapToShippingSearch(undefined)).toBeUndefined();
        expect(mapToShippingSearch(null)).toBeUndefined();
        expect(mapToShippingSearch({ destination: { kind: "NONE" } })).toBeUndefined();
        expect(
            mapToShippingSearch({ destination: { kind: "NONE" }, collectionOffered: true }),
        ).toEqual({
            ...BASE,
            collectionOffered: true,
        });
        for (const data of [
            { destination: { kind: "COUNTRY", country: "XX" } },
            { destination: { kind: "REGION", region: "EU" } },
            { destination: { kind: "COUNTRY", country: "DE" }, interpretation: "CHEAPEST" },
            { destination: { kind: "COUNTRY", country: "DE" }, referenceRelease: "iso-codes-9" },
            {
                destination: { kind: "COUNTRY", country: "DE" },
                maximumPerItem: { amount: 100, currency: "XYZ" },
            },
        ]) {
            expect(mapToShippingSearch(data as never)).toBe(UNSUPPORTED_SHIPPING_SEARCH);
        }
    });

    it("builds a query-key part from every member that changes results", () => {
        const part = shippingSearchQueryKeyPart({ ...BASE, country: DE });
        expect(part).toEqual([
            "DE",
            "iso-codes-4.20.1",
            "WHOLE_COUNTRY_PER_ITEM_V1",
            null,
            null,
            null,
            false,
        ]);
        expect(shippingSearchQueryKeyPart({ ...BASE, country: DE, service: "PARCEL" })).not.toEqual(
            part,
        );
        expect(shippingSearchQueryKeyPart(undefined)).toBeNull();
    });

    it("maps the destination guard without saving the reference", () => {
        expect(
            mapToBackendAcceptShippingDestination({ kind: "ADDRESS", addressId: "uad_01" }),
        ).toEqual({ kind: "ADDRESS", addressId: "uad_01" });
        expect(mapToBackendAcceptShippingDestination({ kind: "PREFERENCE" })).toEqual({
            kind: "PREFERENCE",
        });
    });
});

describe("saved-match shipping FX valuation", () => {
    it("keeps the immutable basis and drops an unreadable one", () => {
        const data = {
            interpretation: "WHOLE_COUNTRY_PER_ITEM_FX_V1",
            fxRateId: "fx_01",
            capturedAt: "2026-11-20T08:00:00Z",
            maximumPerItem: { amount: 2500, currency: "USD" },
        } as const;
        expect(mapToShippingMatchValuation(data)).toEqual({
            interpretation: "WHOLE_COUNTRY_PER_ITEM_FX_V1",
            fxRateId: "fx_01",
            capturedAt: new Date("2026-11-20T08:00:00Z"),
            maximumPerItem: { amount: 2500, currency: "USD" },
        });
        expect(mapToShippingMatchValuation(undefined)).toBeUndefined();
        expect(
            mapToShippingMatchValuation({ ...data, interpretation: "OTHER" as never }),
        ).toBeUndefined();
        expect(mapToShippingMatchValuation({ ...data, capturedAt: "soon" })).toBeUndefined();
    });
});

describe("shipping errors and query keys", () => {
    it("classifies the contract's shipping codes", () => {
        const error = (code: string, status = 409) => ({ status, title: "", error: code });
        expect(classifyShippingError(error("SHIPPING_STALE_REVISION"))).toBe("STALE");
        expect(classifyShippingError(error("SHIPPING_PROFILE_RETIRED"))).toBe("INELIGIBLE");
        expect(classifyShippingError(error("SHIPPING_IMPORT_OUT_OF_ORDER"))).toBe("IMPORT");
        expect(classifyShippingError(error("NOT_FOUND", 404))).toBe("OTHER");
        expect(isRetryableShippingError(error("SHIPPING_TEMPORARILY_UNAVAILABLE", 503))).toBe(true);
        expect(isRetryableShippingError(error("SHIPPING_STORAGE_ERROR", 500))).toBe(false);
    });

    it("partitions every shipping read by viewer and source", () => {
        expect(shippingQueryKeys.profileList("viewer-1", "ls_1")).toEqual([
            "shipping",
            "viewer-1",
            "ls_1",
            "profiles",
            "list",
            null,
            null,
        ]);
        expect(shippingQueryKeys.profile("viewer-1", "ls_1", "shp_1").slice(0, 3)).toEqual(
            shippingQueryKeys.source("viewer-1", "ls_1"),
        );
        expect(shippingQueryKeys.listingDelivery("viewer-2", "ls_1", "src-7")).toEqual([
            "shipping",
            "viewer-2",
            "ls_1",
            "delivery",
            "src-7",
        ]);
        expect(shippingQueryKeys.sourceDefault("viewer-1", "ls_1")).not.toEqual(
            shippingQueryKeys.sourceDefault("viewer-2", "ls_1"),
        );
    });
});
