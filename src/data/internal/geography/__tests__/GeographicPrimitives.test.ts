import { describe, expect, it } from "vitest";
import {
    formatCountryName,
    getSubdivisionCountry,
    listCountryCodes,
    listSubdivisionCodes,
    parseCountryCode,
    parseGeographicReferenceRelease,
    parseSubdivisionCode,
    type CountryCode,
} from "@/data/internal/geography/GeographicCodes.ts";
import {
    parseGeographicRadius,
    toKilometres,
} from "@/data/internal/geography/GeographicDistance.ts";
import {
    mapToBackendGeographicPosition,
    mapToGeographicPosition,
    mapToGeographicPositionParts,
    parseGeographicPoint,
    roundDisplayDistanceKm,
} from "@/data/internal/geography/GeographicPosition.ts";
import {
    isBoundedSingleLine,
    mapToGeographicAssertions,
    validateGeographicAssertions,
} from "@/data/internal/geography/GeographicAssertions.ts";

describe("ISO reference codes", () => {
    it("pins the iso-codes 4.20.1 release with 249 current countries", () => {
        expect(parseGeographicReferenceRelease("iso-codes-4.20.1")).toBe("iso-codes-4.20.1");
        expect(parseGeographicReferenceRelease("iso-codes-4.21.0")).toBeUndefined();
        expect(listCountryCodes()).toHaveLength(249);
    });

    it.each(["DE", "GB", "AQ", "BQ"])("accepts current code %s", (code) => {
        expect(parseCountryCode(code)).toBe(code);
    });

    it.each(["de", " DE", "DEU", "UK", "EU", "XK", "", 49, null])(
        "rejects non-canonical country %s",
        (code) => {
            expect(parseCountryCode(code)).toBeUndefined();
        },
    );

    it("accepts complete subdivision codes and keeps their country association", () => {
        const code = parseSubdivisionCode("DE-BY");
        expect(code).toBe("DE-BY");
        expect(code && getSubdivisionCountry(code)).toBe("DE");
        expect(listSubdivisionCodes("DE" as CountryCode)).toContain("DE-BY");
    });

    it.each(["BY", "de-by", "DE-XX", "CA-BC ", "FR-IDF2"])(
        "rejects incomplete or unknown subdivision %s",
        (code) => {
            expect(parseSubdivisionCode(code)).toBeUndefined();
        },
    );

    it("formats country names for the given language with a code fallback", () => {
        expect(formatCountryName("DE" as CountryCode, "en")).toBe("Germany");
        expect(formatCountryName("DE" as CountryCode, "de")).toBe("Deutschland");
        expect(formatCountryName("DE" as CountryCode, "not a locale!")).toBe("DE");
    });
});

describe("positions", () => {
    it("accepts (0, 0) and boundary coordinates", () => {
        expect(parseGeographicPoint(0, 0)).toEqual({ latitude: 0, longitude: 0 });
        expect(parseGeographicPoint(-90, 180)).toEqual({ latitude: -90, longitude: 180 });
    });

    it.each([
        [Number.NaN, 0],
        [0, Number.POSITIVE_INFINITY],
        [91, 0],
        [0, -180.0001],
        ["48.1", 11.5],
    ])("rejects invalid coordinates (%s, %s)", (latitude, longitude) => {
        expect(parseGeographicPoint(latitude, longitude)).toBeUndefined();
    });

    it("requires explicit precision and keeps optional accuracy", () => {
        const position = mapToGeographicPosition({
            latitudeDegrees: 48.137,
            longitudeDegrees: 11.575,
            precision: "PREMISES",
            accuracyMetres: 0,
        });
        expect(position).toEqual({
            point: { latitude: 48.137, longitude: 11.575 },
            precision: "PREMISES",
            accuracyMetres: 0,
        });
        expect(position && mapToBackendGeographicPosition(position)).toEqual({
            latitudeDegrees: 48.137,
            longitudeDegrees: 11.575,
            precision: "PREMISES",
            accuracyMetres: 0,
        });
        expect(
            mapToGeographicPosition({
                latitudeDegrees: 1,
                longitudeDegrees: 1,
                precision: "ROOFTOP" as never,
            }),
        ).toBeUndefined();
        expect(
            mapToGeographicPositionParts({ latitude: 1, longitude: 1 }, undefined),
        ).toBeUndefined();
    });

    it.each([
        [12.345, "PREMISES", 12.3],
        [12.5, "STREET", 13],
        [12.5, "LOCALITY", 10],
        [15, "REPRESENTATIVE", 20],
        [15, undefined, 20],
    ] as const)("rounds %s km with %s precision to %s km", (distance, precision, expected) => {
        expect(roundDisplayDistanceKm(distance, precision)).toBe(expected);
    });
});

describe("radius", () => {
    it("preserves the supplied unit", () => {
        expect(parseGeographicRadius(25, "MILES")).toEqual({ amount: 25, unit: "MILES" });
        expect(toKilometres({ amount: 25, unit: "MILES" })).toBeCloseTo(40.234, 3);
    });

    it("accepts the 20,000 km bound", () => {
        expect(parseGeographicRadius(20_000, "KILOMETERS")).toBeDefined();
    });

    it.each([
        [0, "KILOMETERS"],
        [-1, "MILES"],
        [Number.NaN, "MILES"],
        ["25", "MILES"],
        [25, "km"],
        [20_000, "MILES"],
        [20_000.001, "KILOMETERS"],
    ])("rejects radius %s %s", (amount, unit) => {
        expect(parseGeographicRadius(amount, unit)).toBeUndefined();
    });
});

describe("geographic assertions", () => {
    it("keeps verbatim text and absent facts absent", () => {
        expect(
            mapToGeographicAssertions({
                referenceRelease: "iso-codes-4.20.1",
                addressText: "  Marienplatz 1\n80331 München ",
                postalCode: "08001",
                country: null,
            }),
        ).toEqual({
            referenceRelease: "iso-codes-4.20.1",
            addressText: "  Marienplatz 1\n80331 München ",
            postalCode: "08001",
            hasUnsupportedValues: false,
        });
    });

    it("omits codes it cannot interpret and flags them", () => {
        expect(
            mapToGeographicAssertions({
                referenceRelease: "iso-codes-9.9.9" as never,
                country: "DE",
                postalCode: "80331",
            }),
        ).toEqual({ postalCode: "80331", hasUnsupportedValues: true });
        expect(
            mapToGeographicAssertions({
                referenceRelease: "iso-codes-4.20.1",
                country: "DE",
                subdivision: "FR-IDF",
            }),
        ).toEqual({
            referenceRelease: "iso-codes-4.20.1",
            country: "DE",
            hasUnsupportedValues: true,
        });
    });

    it("validates assertions like the backend constructors", () => {
        const country = "DE" as never;
        expect(validateGeographicAssertions({})).toBe("EMPTY");
        expect(validateGeographicAssertions({ addressText: "  " })).toBe("ADDRESS_TEXT_INVALID");
        expect(validateGeographicAssertions({ addressText: "é".repeat(2049) })).toBe(
            "ADDRESS_TEXT_INVALID",
        );
        expect(validateGeographicAssertions({ postalCode: "80331\n" })).toBe("POSTAL_CODE_INVALID");
        expect(validateGeographicAssertions({ country: "de" as never })).toBe("COUNTRY_INVALID");
        expect(validateGeographicAssertions({ country, subdivision: "FR-IDF" as never })).toBe(
            "SUBDIVISION_COUNTRY_MISMATCH",
        );
        expect(validateGeographicAssertions({ subdivision: "FR-IDF" as never })).toBeUndefined();
    });

    it("measures limits in UTF-8 bytes and rejects line separators in single-line values", () => {
        expect(isBoundedSingleLine("ü".repeat(32), 64)).toBe(true);
        expect(isBoundedSingleLine("ü".repeat(33), 64)).toBe(false);
        expect(isBoundedSingleLine(`a${String.fromCharCode(0x2028)}b`, 64)).toBe(false);
    });
});
