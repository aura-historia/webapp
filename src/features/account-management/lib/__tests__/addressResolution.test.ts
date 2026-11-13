import { describe, expect, it } from "vitest";
import { parseCountryCode } from "@/data/internal/geography/GeographicCodes.ts";
import { resolutionCopyKeys } from "../addressResolution.ts";

const bare = { hasUnsupportedValues: false };
const withCountry = { hasUnsupportedValues: false, country: parseCountryCode("DE") };

describe("resolutionCopyKeys", () => {
    it("suggests a country or postal code only when none was given", () => {
        expect(resolutionCopyKeys("AMBIGUOUS", bare)).toEqual({
            hint: "account.addresses.status.AMBIGUOUS.hint",
            note: "account.addresses.status.AMBIGUOUS.note",
        });
        expect(resolutionCopyKeys("AMBIGUOUS", withCountry)).toEqual({
            hint: "account.addresses.status.AMBIGUOUS.hintDetailed",
            note: "account.addresses.status.AMBIGUOUS.noteDetailed",
        });
        expect(resolutionCopyKeys("NO_MATCH", withCountry).hint).toBe(
            "account.addresses.status.NO_MATCH.hintDetailed",
        );
    });

    it("gives no row hint for an accepted or unknown status", () => {
        expect(resolutionCopyKeys("ACCEPTED", withCountry)).toEqual({
            note: "account.addresses.status.ACCEPTED.note",
        });
        expect(resolutionCopyKeys("UNKNOWN", bare).hint).toBeUndefined();
    });
});
