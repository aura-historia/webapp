import { describe, expect, it } from "vitest";
import type { CountryCode, SubdivisionCode } from "@/data/internal/geography/GeographicCodes.ts";
import type { PartyLocation } from "@/data/internal/geography/PartyLocation.ts";
import {
    buildCorrectPartyLocationInput,
    buildCreatePartyLocationInput,
    type PartyLocationFormValues,
    parseDecimal,
    partyLocationFormSchema,
    toPartyLocationFormValues,
    toRelocationFormValues,
} from "../partyLocationForm.ts";

const site: PartyLocation = {
    id: "ploc_1",
    partyId: "pty_1",
    label: "Showroom",
    roles: ["BUSINESS_PREMISES"],
    geography: {
        referenceRelease: "iso-codes-4.20.1",
        addressText: "Maximilianstraße 1\n  Hinterhaus",
        country: "DE" as CountryCode,
        subdivision: "DE-BY" as SubdivisionCode,
        postalCode: "080 31",
        hasUnsupportedValues: false,
    },
    position: { point: { latitude: 48.139, longitude: 11.58 }, precision: "PREMISES" },
    lifecycle: "ACTIVE",
    revision: 4,
    inputRevision: 2,
    evidence: {
        reference: "doc:register-2026",
        scope: "SITE_DESCRIPTION",
        observedAt: new Date("2026-09-01T14:30:00.000Z"),
    },
    hasUnsupportedValues: false,
};

const values = (patch: Partial<PartyLocationFormValues> = {}): PartyLocationFormValues => ({
    ...toPartyLocationFormValues(),
    label: "Warehouse",
    ...patch,
});

const issues = (input: PartyLocationFormValues) => {
    const result = partyLocationFormSchema.safeParse(input);
    return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe("partyLocationFormSchema", () => {
    it("accepts a label-only site, (0, 0) and a comma decimal separator", () => {
        expect(issues(values())).toEqual([]);
        expect(issues(values({ latitude: "0", longitude: "0", precision: "LOCALITY" }))).toEqual(
            [],
        );
        expect(parseDecimal("48,137")).toBe(48.137);
        expect(parseDecimal("1e3")).toBeUndefined();
    });

    it("requires explicit precision and in-range coordinates for a point", () => {
        expect(issues(values({ latitude: "91", longitude: "10" }))).toEqual([
            "partyLocations.validation.latitudeInvalid",
            "partyLocations.validation.precisionRequired",
        ]);
        expect(issues(values({ precision: "STREET" }))).toEqual([
            "partyLocations.validation.latitudeInvalid",
            "partyLocations.validation.longitudeInvalid",
        ]);
    });

    it("rejects multi-line labels, mismatched regions and dates without evidence", () => {
        expect(
            issues(
                values({
                    label: "A\nB",
                    country: "FR",
                    subdivision: "DE-BY",
                    evidenceObservedOn: "2026-09-01",
                }),
            ),
        ).toEqual([
            "partyLocations.validation.labelInvalid",
            "partyLocations.validation.subdivisionMismatch",
            "partyLocations.validation.evidenceReferenceRequired",
        ]);
    });
});

describe("buildCreatePartyLocationInput", () => {
    it("keeps partial and unresolved sites partial", () => {
        expect(buildCreatePartyLocationInput(values({ label: "  Depot  " }))).toEqual({
            label: "Depot",
            roles: [],
        });
    });

    it("keeps text verbatim and links a relocation to the expected revision", () => {
        expect(
            buildCreatePartyLocationInput(
                values({
                    roles: ["WAREHOUSE", "BUSINESS_PREMISES"],
                    addressText: "  Rue 1 ",
                    country: "FR",
                    postalCode: "07500",
                    latitude: "45,1",
                    longitude: "-0.5",
                    precision: "STREET",
                    accuracyMetres: "25",
                    evidenceReference: "https://example.test/imprint",
                    evidenceScope: "CORRESPONDENCE_ADDRESS",
                    evidenceObservedOn: "2026-10-01",
                }),
                { id: "ploc_1", revision: 4 },
            ),
        ).toEqual({
            label: "Warehouse",
            roles: ["BUSINESS_PREMISES", "WAREHOUSE"],
            geography: { addressText: "  Rue 1 ", country: "FR", postalCode: "07500" },
            position: {
                point: { latitude: 45.1, longitude: -0.5 },
                precision: "STREET",
                accuracyMetres: 25,
            },
            evidence: {
                reference: "https://example.test/imprint",
                scope: "CORRESPONDENCE_ADDRESS",
                observedAt: new Date("2026-10-01T00:00:00.000Z"),
            },
            relocates: { id: "ploc_1", revision: 4 },
        });
    });

    it("starts a relocation with only the label and roles of the old site", () => {
        expect(toRelocationFormValues(site)).toEqual({
            ...toPartyLocationFormValues(),
            label: "Showroom",
            roles: ["BUSINESS_PREMISES"],
        });
    });
});

describe("buildCorrectPartyLocationInput", () => {
    it("sends nothing when the draft matches the site, including the observed day", () => {
        expect(buildCorrectPartyLocationInput(toPartyLocationFormValues(site), site, 4)).toBe(
            undefined,
        );
        expect(
            buildCorrectPartyLocationInput(
                { ...toPartyLocationFormValues(site), latitude: "48.1390" },
                site,
                4,
            ),
        ).toBeUndefined();
    });

    it("sends only changed groups and null for a cleared group", () => {
        expect(
            buildCorrectPartyLocationInput(
                {
                    ...toPartyLocationFormValues(site),
                    label: "Main showroom",
                    latitude: "",
                    longitude: "",
                    precision: "",
                    roles: [],
                },
                site,
                4,
            ),
        ).toEqual({ expectedRevision: 4, label: "Main showroom", roles: [], position: null });
    });

    it("replaces the complete geography assertion when one of its fields changes", () => {
        expect(
            buildCorrectPartyLocationInput(
                { ...toPartyLocationFormValues(site), postalCode: "80331" },
                site,
                4,
            ),
        ).toEqual({
            expectedRevision: 4,
            geography: {
                addressText: "Maximilianstraße 1\n  Hinterhaus",
                country: "DE",
                subdivision: "DE-BY",
                postalCode: "80331",
            },
        });
    });

    it("keeps values it cannot display by omitting unchanged groups", () => {
        const withUnsupported: PartyLocation = {
            ...site,
            geography: { addressText: "Somewhere", hasUnsupportedValues: true },
            hasUnsupportedValues: true,
        };
        expect(
            buildCorrectPartyLocationInput(
                { ...toPartyLocationFormValues(withUnsupported), label: "Renamed" },
                withUnsupported,
                4,
            ),
        ).toEqual({ expectedRevision: 4, label: "Renamed" });
    });

    it("applies a kept draft to a newer revision without reverting concurrent changes", () => {
        // The draft began at revision 4; another manager then changed the position (revision 5).
        const draft = { ...toPartyLocationFormValues(site), label: "Renamed" };
        expect(buildCorrectPartyLocationInput(draft, site, 5)).toEqual({
            expectedRevision: 5,
            label: "Renamed",
        });
    });
});
