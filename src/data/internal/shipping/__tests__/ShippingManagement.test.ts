import { describe, expect, it } from "vitest";
import type {
    AdvertisedDeliveryTermsData,
    ProductListingDeliveryViewData,
    ShippingProfileData,
} from "@/client";
import {
    mapToBackendListingDeliveryCommand,
    mapToListingDeliveryResult,
    mapToListingDeliveryView,
} from "../ListingDelivery.ts";
import {
    mapToBackendAssignShippingDefault,
    mapToBackendClearShippingDefault,
    mapToBackendCreateShippingProfile,
    mapToBackendReplaceShippingProfile,
    mapToBackendShippingProfileLifecycle,
    mapToShippingDefault,
    mapToShippingProfile,
    mapToShippingProfilePage,
} from "../ShippingProfile.ts";
import {
    type AdvertisedDeliveryTerms,
    mapToAdvertisedDeliveryTerms,
    mapToBackendAdvertisedDeliveryTerms,
    UNCONDITIONAL_SHIPPING_APPLICABILITY,
} from "../ShippingTerms.ts";

const UNCONDITIONAL = { class: null, variants: null, quantity: null, threshold: null } as const;
const NO_LEAD_TIMES = { handling: null, transit: null, total: null } as const;

/** Strict `SHIP_TERMS_V1`: every member present, `null` for an absent assertion. */
const TERMS_DATA: AdvertisedDeliveryTermsData = {
    schema: "SHIP_TERMS_V1",
    shipping: {
        kind: "COVERAGE",
        coverage: {
            reference_release: "iso-codes-4.20.1",
            completeness: "COMPLETE",
            applicability: UNCONDITIONAL,
            exclusions: [
                {
                    kind: "POSTAL",
                    version: "POSTAL_RULE_V1",
                    country: "DE",
                    reference_release: "iso-codes-4.20.1",
                    form: { kind: "GERMAN_RANGE", first: "18565", last: "18569" },
                },
            ],
            zones: [
                {
                    areas: [{ kind: "DOMESTIC" }],
                    applicability: UNCONDITIONAL,
                    services: [
                        {
                            code: "PAINTING",
                            applicability: { ...UNCONDITIONAL, class: "painting" },
                            eligibility: "OFFERED",
                            rate: {
                                price: {
                                    kind: "FIXED",
                                    amount: { amount_minor: 9500, currency: "EUR" },
                                },
                                basis: "PER_ITEM",
                                qualifying_scope: null,
                                components: { INSURANCE: "INCLUDED" },
                            },
                            lead_times: {
                                handling: {
                                    minimum: 1,
                                    maximum: 3,
                                    unit: "DAYS",
                                    basis: "BUSINESS",
                                    trigger: "PAYMENT",
                                },
                                transit: null,
                                total: null,
                            },
                            features: ["TRACKING", "INSURED"],
                            arranger: { kind: "LISTING_SOURCE" },
                            performer: { kind: "PARTY", party_id: "pty_01carrier" },
                        },
                        {
                            code: "CABINET",
                            applicability: { ...UNCONDITIONAL, class: "cabinet" },
                            eligibility: "NOT_OFFERED",
                            rate: null,
                            lead_times: NO_LEAD_TIMES,
                            features: [],
                            arranger: null,
                            performer: null,
                        },
                    ],
                },
                {
                    areas: [
                        { kind: "COUNTRY", code: "AT", reference_release: "iso-codes-4.20.1" },
                        {
                            kind: "SUBDIVISION",
                            code: "CH-ZH",
                            reference_release: "iso-codes-4.20.1",
                        },
                    ],
                    applicability: {
                        ...UNCONDITIONAL,
                        threshold: {
                            minimum: { amount_minor: 50000, currency: "EUR" },
                            scope: "SELLER_ORDER",
                        },
                    },
                    services: [
                        {
                            code: "FREIGHT",
                            applicability: UNCONDITIONAL,
                            eligibility: "SUBJECT_TO_CONFIRMATION",
                            rate: {
                                price: { kind: "ON_REQUEST", currency: null },
                                basis: null,
                                qualifying_scope: null,
                                components: {},
                            },
                            lead_times: NO_LEAD_TIMES,
                            features: ["WHITE_GLOVE"],
                            arranger: { kind: "BUYER" },
                            performer: null,
                        },
                    ],
                },
            ],
            dispatch_origin: { kind: "PARTY_LOCATION", party_location_id: "loc_01gallery" },
        },
    },
    collection: {
        applicability: UNCONDITIONAL,
        dependency: "INDEPENDENT",
        eligibility: "OFFERED",
        site: {
            kind: "ASSERTED",
            geography: {
                reference_release: "iso-codes-4.20.1",
                address_text: null,
                country: "DE",
                subdivision: "DE-BE",
                postal_code: "10115",
            },
            position: null,
        },
        arrangement: { kind: "CONTACT_TO_ARRANGE" },
    },
};

function profileData(terms: unknown = TERMS_DATA): ShippingProfileData {
    return {
        shippingProfileId: "shp_01gallery",
        listingSourceId: "ls_01gallery",
        managementRevision: 7,
        termsRevision: 4,
        lifecycle: "ACTIVE",
        content: { name: "Gallery", attributedPartyId: null, terms: terms as never },
    };
}

describe("advertised delivery terms", () => {
    it("round-trips the strict protocol, keeping order, opaque IDs and every null", () => {
        const terms = mapToAdvertisedDeliveryTerms(TERMS_DATA);
        expect(terms).toBeDefined();
        expect(mapToBackendAdvertisedDeliveryTerms(terms as AdvertisedDeliveryTerms)).toEqual(
            TERMS_DATA,
        );
        if (terms?.shipping?.kind !== "COVERAGE") throw new Error("expected coverage");
        expect(
            terms.shipping.coverage.zones.map((zone) => zone.services.map((s) => s.code)),
        ).toEqual([["PAINTING", "CABINET"], ["FREIGHT"]]);
        expect(terms.shipping.coverage.zones[0].services[1]).toMatchObject({
            eligibility: "NOT_OFFERED",
            rate: null,
            arranger: null,
        });
    });

    it("keeps absence, prohibition and assertion distinct", () => {
        const empty = { schema: "SHIP_TERMS_V1", shipping: null, collection: null } as const;
        expect(mapToAdvertisedDeliveryTerms(empty)).toEqual({ shipping: null, collection: null });
        expect(mapToBackendAdvertisedDeliveryTerms({ shipping: null, collection: null })).toEqual(
            empty,
        );
        expect(
            mapToBackendAdvertisedDeliveryTerms({
                shipping: { kind: "PROHIBITED" },
                collection: null,
            }),
        ).toEqual({ schema: "SHIP_TERMS_V1", shipping: { kind: "PROHIBITED" }, collection: null });
    });

    it("refuses terms with any value it cannot read", () => {
        const withUnknownArea = structuredClone(TERMS_DATA) as unknown as {
            shipping: { coverage: { zones: { areas: unknown[] }[] } };
        };
        withUnknownArea.shipping.coverage.zones[0].areas.push({ kind: "CONTINENT", code: "EU" });
        expect(mapToAdvertisedDeliveryTerms(withUnknownArea as never)).toBeUndefined();

        const withUnknownFeature = structuredClone(TERMS_DATA) as unknown as {
            shipping: { coverage: { zones: { services: { features: string[] }[] }[] } };
        };
        withUnknownFeature.shipping.coverage.zones[0].services[0].features.push("DRONE");
        expect(mapToAdvertisedDeliveryTerms(withUnknownFeature as never)).toBeUndefined();

        expect(
            mapToAdvertisedDeliveryTerms({ ...TERMS_DATA, schema: "SHIP_TERMS_V2" } as never),
        ).toBeUndefined();
    });
});

describe("shipping profiles and defaults", () => {
    it("maps a profile with its revisions and terms", () => {
        const profile = mapToShippingProfile(profileData());
        expect(profile).toMatchObject({
            shippingProfileId: "shp_01gallery",
            listingSourceId: "ls_01gallery",
            name: "Gallery",
            managementRevision: 7,
            termsRevision: 4,
            lifecycle: "ACTIVE",
            attributedPartyId: null,
            hasUnsupportedValues: false,
        });
        expect(profile.terms).toEqual(mapToAdvertisedDeliveryTerms(TERMS_DATA));
    });

    it("marks a profile with unreadable terms so it is never replaced from a partial model", () => {
        const profile = mapToShippingProfile(
            profileData({ ...TERMS_DATA, collection: { dependency: "TELEPORT" } }),
        );
        expect(profile.hasUnsupportedValues).toBe(true);
        expect(profile.terms).toBeUndefined();
        expect(
            mapToShippingProfile({ ...profileData(), lifecycle: "PAUSED" as never }).lifecycle,
        ).toBe("UNKNOWN");
    });

    it("pages by the last profile ID and stops at an empty page", () => {
        const summary = {
            shippingProfileId: "shp_02",
            listingSourceId: "ls_01gallery",
            name: "Freight",
            managementRevision: 1,
            termsRevision: 1,
            lifecycle: "RETIRED" as const,
        };
        expect(mapToShippingProfilePage([summary])).toEqual({ items: [summary], next: "shp_02" });
        expect(mapToShippingProfilePage([])).toEqual({ items: [] });
    });

    it("keeps a retired or missing default selection without a fallback", () => {
        expect(mapToShippingDefault({ listingSourceId: "ls_1", revision: 1 })).toEqual({
            listingSourceId: "ls_1",
            revision: 1,
        });
        expect(
            mapToShippingDefault({
                listingSourceId: "ls_1",
                revision: 5,
                shippingProfileId: "shp_01",
                eligibility: "RETIRED",
            }),
        ).toEqual({
            listingSourceId: "ls_1",
            revision: 5,
            shippingProfileId: "shp_01",
            eligibility: "RETIRED",
        });
    });

    it("builds commands with the management revision and the required-nullable content", () => {
        const terms = mapToAdvertisedDeliveryTerms(TERMS_DATA) as AdvertisedDeliveryTerms;
        const content = { name: "Gallery", attributedPartyId: null, terms };
        const evidence = [{ reference: "https://example.com/shipping", assertion: "Rates page" }];
        expect(
            mapToBackendCreateShippingProfile({ creationKey: "draft-1", content, evidence }),
        ).toEqual({
            creationKey: "draft-1",
            content: { name: "Gallery", attributedPartyId: null, terms: TERMS_DATA },
            evidence,
        });
        const replacement = mapToBackendReplaceShippingProfile({
            expectedRevision: 7,
            content,
            evidence: [],
        });
        expect(replacement).toEqual({
            expectedRevision: 7,
            content: { name: "Gallery", attributedPartyId: null, terms: TERMS_DATA },
            evidence: [],
        });
        expect(replacement).not.toHaveProperty("import");
        expect(mapToBackendShippingProfileLifecycle(7)).toEqual({ expectedRevision: 7 });
        expect(
            mapToBackendAssignShippingDefault({ expectedRevision: 2, shippingProfileId: "shp_01" }),
        ).toEqual({ expectedRevision: 2, shippingProfileId: "shp_01" });
        expect(mapToBackendClearShippingDefault(3)).toEqual({ expectedRevision: 3 });
    });
});

describe("listing delivery configuration", () => {
    const view: ProductListingDeliveryViewData = {
        productListingId: "pl_01",
        expectedVersion: 12,
        delivery: {
            schema: "LISTING_DELIVERY_V1",
            source_id: "ls_01gallery",
            integration: { kind: "PROVIDER", method: "SHOPIFY" },
            selection: { kind: "EXPLICIT", profile_id: "shp_01gallery" },
            rate_inputs: {
                classes: { codes: ["painting"], completeness: "PARTIAL" },
                variants: null,
            },
            shipping: { kind: "INHERIT" },
            collection: {
                kind: "REPLACE",
                value: {
                    applicability: UNCONDITIONAL,
                    dependency: "INDEPENDENT",
                    eligibility: "OFFERED",
                    site: null,
                    arrangement: null,
                },
            },
        },
    };

    it("maps the protected configuration with its revision", () => {
        expect(mapToListingDeliveryView(view)).toEqual({
            productListingId: "pl_01",
            expectedVersion: 12,
            delivery: {
                sourceId: "ls_01gallery",
                integration: { kind: "PROVIDER", method: "SHOPIFY" },
                selection: { kind: "EXPLICIT", profileId: "shp_01gallery" },
                rateInputs: {
                    classes: { codes: ["painting"], completeness: "PARTIAL" },
                    variants: null,
                },
                shipping: { kind: "INHERIT" },
                collection: {
                    kind: "REPLACE",
                    value: {
                        applicability: UNCONDITIONAL_SHIPPING_APPLICABILITY,
                        dependency: "INDEPENDENT",
                        eligibility: "OFFERED",
                        site: null,
                        arrangement: null,
                    },
                },
            },
            hasUnsupportedValues: false,
        });
    });

    it("keeps a listing without configuration apart from an unreadable configuration", () => {
        expect(mapToListingDeliveryView({ productListingId: "pl_01", expectedVersion: 3 })).toEqual(
            { productListingId: "pl_01", expectedVersion: 3, hasUnsupportedValues: false },
        );
        const unreadable = mapToListingDeliveryView({
            ...view,
            delivery: { ...view.delivery, selection: { kind: "ROUND_ROBIN" } } as never,
        });
        expect(unreadable.delivery).toBeUndefined();
        expect(unreadable.hasUnsupportedValues).toBe(true);
    });

    it("sends unchanged, cleared and set members with their own null semantics", () => {
        const terms = mapToAdvertisedDeliveryTerms(TERMS_DATA) as AdvertisedDeliveryTerms;
        expect(
            mapToBackendListingDeliveryCommand({
                expectedVersion: 12,
                delivery: {
                    state: "SET",
                    value: {
                        integration: { kind: "SOURCE" },
                        selection: { state: "SET", value: { kind: "INLINE", terms } },
                        rateInputs: {
                            state: "SET",
                            value: { classes: null, variants: ["oak"] },
                        },
                        shipping: { state: "SET", value: { kind: "CLEAR" } },
                        collection: { state: "UNCHANGED" },
                    },
                },
            }),
        ).toEqual({
            expectedVersion: 12,
            delivery: {
                state: "SET",
                value: {
                    integration: { kind: "SOURCE" },
                    selection: { state: "SET", value: { kind: "INLINE", terms: TERMS_DATA } },
                    rateInputs: { state: "SET", value: { classes: null, variants: ["oak"] } },
                    shipping: { state: "SET", value: { kind: "CLEAR" } },
                    collection: { state: "UNCHANGED" },
                },
            },
        });
        expect(
            mapToBackendListingDeliveryCommand({
                expectedVersion: 4,
                delivery: { state: "CLEAR" },
            }),
        ).toEqual({ expectedVersion: 4, delivery: { state: "CLEAR" } });
    });

    it("maps the command result", () => {
        expect(
            mapToListingDeliveryResult({
                productListingId: "pl_01",
                expectedVersion: 13,
                outcome: "UNCHANGED",
            }),
        ).toEqual({ productListingId: "pl_01", expectedVersion: 13, outcome: "UNCHANGED" });
    });
});
