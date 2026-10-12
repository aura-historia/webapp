import { describe, expect, it } from "vitest";
import { mapToGeographyAttribution } from "@/data/internal/geography/GeographyAttribution.ts";

describe("mapToGeographyAttribution", () => {
    it("maps the provider name and attribution URL from the contract", () => {
        expect(
            mapToGeographyAttribution({
                provider: "Amazon Location Service",
                attributionUrl: "https://example.test/attribution",
            }),
        ).toEqual({
            provider: "Amazon Location Service",
            url: "https://example.test/attribution",
        });
    });

    it.each([null, undefined])("returns undefined for a missing attribution (%s)", (input) => {
        expect(mapToGeographyAttribution(input)).toBeUndefined();
    });

    it.each(["http://example.test/attribution", "javascript:alert(1)", "not a url"])(
        "rejects a non-HTTPS attribution URL (%s)",
        (attributionUrl) => {
            expect(
                mapToGeographyAttribution({ provider: "Provider", attributionUrl }),
            ).toBeUndefined();
        },
    );

    it("rejects a blank provider name", () => {
        expect(
            mapToGeographyAttribution({
                provider: "  ",
                attributionUrl: "https://example.test/attribution",
            }),
        ).toBeUndefined();
    });
});
