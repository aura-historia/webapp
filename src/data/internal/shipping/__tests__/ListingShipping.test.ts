import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type {
    ListingShippingDetailData,
    ListingShippingSummaryData,
    PersonalizedShippingDetailData,
    PersonalizedShippingSummaryData,
} from "@/client";
import {
    mapToListingShippingDetail,
    mapToListingShippingSummary,
    mapToPersonalizedShippingDetail,
    mapToPersonalizedShippingSummary,
    withoutPrivateShipping,
} from "../ListingShipping.ts";

type ShippingFixture = {
    item: { shipping?: unknown };
    userState?: { shipping?: unknown };
};

/** The four merged backend read fixtures (backend `develop` `cb2b1f1`), copied verbatim. */
function readFixture(name: string): ShippingFixture {
    return JSON.parse(
        readFileSync(
            resolve(
                process.cwd(),
                "src/data/internal/shipping/__tests__/fixtures/listing-shipping",
                `${name}.json`,
            ),
            "utf8",
        ),
    );
}

/** Consumer read projections never hold `null`, at any depth. */
function expectNoNulls(value: unknown, path = "$"): void {
    expect(value, path).not.toBeNull();
    if (Array.isArray(value)) {
        for (const [index, entry] of value.entries()) expectNoNulls(entry, `${path}[${index}]`);
    } else if (typeof value === "object" && value !== null && !(value instanceof Date)) {
        for (const [key, entry] of Object.entries(value)) {
            expect(entry, `${path}.${key}`).not.toBeUndefined();
            expectNoNulls(entry, `${path}.${key}`);
        }
    }
}

const PARCEL_EUR_12 = {
    kind: "FIXED",
    amount: { amountMinor: 1200, currency: "EUR" },
} as const;

const DISPLAY = {
    currency: "USD",
    fxRateId: "fx_0cwktgjtwnf4tb6hf2f8zm0x5k",
    capturedAt: "2026-11-20T08:00:00Z",
} as const;

describe("backend listing-shipping fixtures", () => {
    it("maps the anonymous collection summary", () => {
        const fixture = readFixture("anonymous-collection");
        const summary = mapToListingShippingSummary(
            fixture.item.shipping as ListingShippingSummaryData,
        );
        expect(summary).toEqual({
            requiredInputs: ["DESTINATION"],
            collection: { eligibility: "OFFERED" },
        });
        expect(fixture.userState).toBeUndefined();
        expectNoNulls(summary);
    });

    it("maps the anonymous detail with ordered effective terms", () => {
        const fixture = readFixture("anonymous-detail");
        const detail = mapToListingShippingDetail(
            fixture.item.shipping as ListingShippingDetailData,
        );
        expect(detail).toEqual({
            requiredInputs: ["DESTINATION"],
            terms: {
                shipping: {
                    kind: "COVERAGE",
                    coverage: {
                        referenceRelease: "iso-codes-4.20.1",
                        completeness: "PARTIAL",
                        zones: [
                            {
                                areas: [
                                    {
                                        kind: "COUNTRY",
                                        code: "DE",
                                        referenceRelease: "iso-codes-4.20.1",
                                    },
                                ],
                                services: [
                                    {
                                        code: "PARCEL",
                                        eligibility: "OFFERED",
                                        features: ["INSURED"],
                                        rate: { basis: "PER_ITEM", price: PARCEL_EUR_12 },
                                    },
                                ],
                            },
                        ],
                    },
                },
                collection: {
                    dependency: "INDEPENDENT",
                    eligibility: "OFFERED",
                    arrangement: { kind: "BY_APPOINTMENT" },
                },
            },
        });
        // Same-currency reads carry no valuation.
        expect(detail?.display).toBeUndefined();
        expectNoNulls(detail);
    });

    it("maps the personalized collection summary with its price preview", () => {
        const fixture = readFixture("personalized-collection");
        expect(
            mapToListingShippingSummary(fixture.item.shipping as ListingShippingSummaryData),
        ).toEqual({ requiredInputs: ["DESTINATION"], collection: { eligibility: "OFFERED" } });
        const personalized = mapToPersonalizedShippingSummary(
            fixture.userState?.shipping as PersonalizedShippingSummaryData,
        );
        expect(personalized).toEqual({
            eligibility: "OFFERED",
            pricePreview: { service: "PARCEL", basis: "PER_ITEM", price: PARCEL_EUR_12 },
            collection: { eligibility: "OFFERED" },
        });
        expectNoNulls(personalized);
    });

    it("maps the personalized detail with its destination and assessed options", () => {
        const fixture = readFixture("personalized-detail");
        const personalized = mapToPersonalizedShippingDetail(
            fixture.userState?.shipping as PersonalizedShippingDetailData,
        );
        expect(personalized).toEqual({
            destination: { country: "DE", referenceRelease: "iso-codes-4.20.1" },
            eligibility: "OFFERED",
            options: [
                {
                    service: "PARCEL",
                    eligibility: "OFFERED",
                    rate: { basis: "PER_ITEM", price: PARCEL_EUR_12 },
                },
            ],
            collection: { eligibility: "OFFERED" },
        });
        expectNoNulls(personalized);
        expectNoNulls(
            mapToListingShippingDetail(fixture.item.shipping as ListingShippingDetailData),
        );
    });
});

describe("listing shipping read semantics", () => {
    it("keeps missing shipping absent instead of asserting no shipping", () => {
        expect(mapToListingShippingSummary(undefined)).toBeUndefined();
        expect(mapToListingShippingDetail(undefined)).toBeUndefined();
        expect(mapToPersonalizedShippingSummary(undefined)).toBeUndefined();
        expect(mapToPersonalizedShippingDetail(undefined)).toBeUndefined();
        // An object without information is no summary.
        expect(mapToListingShippingSummary({})).toBeUndefined();
        expect(mapToPersonalizedShippingSummary({})).toBeUndefined();
    });

    it("distinguishes unknown eligibility from an explicit NOT_OFFERED", () => {
        expect(mapToListingShippingSummary({ eligibility: "NOT_OFFERED" })).toEqual({
            eligibility: "NOT_OFFERED",
        });
        expect(
            mapToListingShippingSummary({ requiredInputs: ["DESTINATION"] })?.eligibility,
        ).toBeUndefined();
        // An eligibility this app does not know is undetermined, never an offer.
        expect(
            mapToListingShippingSummary({
                eligibility: "MAYBE" as never,
                requiredInputs: ["DESTINATION"],
            }),
        ).toEqual({ requiredInputs: ["DESTINATION"] });
    });

    it("keeps scoped required inputs and explanations and drops unknown vocabulary", () => {
        expect(
            mapToPersonalizedShippingSummary({
                requiredInputs: ["POSTAL_CODE", "QUANTITY", "TELEPATHY" as never],
                explanations: [
                    { code: "QUALIFYING_AMOUNT_REQUIRED", scope: "SELLER_ORDER" },
                    { code: "INCOMPLETE_COVERAGE" },
                    { code: "SOMETHING_NEW" as never },
                ],
                collection: {
                    explanations: [{ code: "SHIPPING_UNDETERMINED" }],
                },
            }),
        ).toEqual({
            requiredInputs: ["POSTAL_CODE", "QUANTITY"],
            explanations: [
                { code: "QUALIFYING_AMOUNT_REQUIRED", scope: "SELLER_ORDER" },
                { code: "INCOMPLETE_COVERAGE" },
            ],
            collection: { explanations: [{ code: "SHIPPING_UNDETERMINED" }] },
        });
    });

    it("keeps independent pickup when shipping is prohibited", () => {
        const detail = mapToListingShippingDetail({
            eligibility: "NOT_OFFERED",
            terms: {
                shipping: { kind: "PROHIBITED" },
                collection: {
                    dependency: "INDEPENDENT",
                    eligibility: "OFFERED",
                    arrangement: {
                        kind: "WINDOW",
                        duration: { minimum: 1, maximum: 14, unit: "DAYS", basis: "BUSINESS" },
                    },
                },
            },
        });
        expect(detail).toEqual({
            eligibility: "NOT_OFFERED",
            terms: {
                shipping: { kind: "PROHIBITED" },
                collection: {
                    dependency: "INDEPENDENT",
                    eligibility: "OFFERED",
                    arrangement: {
                        kind: "WINDOW",
                        duration: { minimum: 1, maximum: 14, unit: "DAYS", basis: "BUSINESS" },
                    },
                },
            },
        });
        expect(
            mapToListingShippingSummary({
                eligibility: "NOT_OFFERED",
                collection: { eligibility: "OFFERED" },
            }),
        ).toEqual({ eligibility: "NOT_OFFERED", collection: { eligibility: "OFFERED" } });
    });

    it("explains unresolved terms without inventing a summary", () => {
        // An unresolved or retired profile resolves no terms; the summary explains why.
        expect(
            mapToListingShippingDetail({ explanations: [{ code: "UNRESOLVED_TERMS" }] }),
        ).toEqual({ explanations: [{ code: "UNRESOLVED_TERMS" }] });
        expect(mapToListingShippingDetail({ explanations: [] })).toBeUndefined();
    });

    it("keeps uninterpretable areas in place so they never widen coverage", () => {
        const detail = mapToListingShippingDetail({
            terms: {
                shipping: {
                    kind: "COVERAGE",
                    coverage: {
                        reference_release: "iso-codes-4.20.1",
                        completeness: "COMPLETE",
                        exclusions: [
                            {
                                kind: "POSTAL",
                                version: "POSTAL_RULE_V1",
                                country: "DE",
                                reference_release: "iso-codes-4.20.1",
                                form: { kind: "GERMAN_PREFIX", prefix: "18" },
                            },
                            { kind: "CONTINENT", code: "EU" } as never,
                        ],
                        zones: [
                            {
                                areas: [
                                    { kind: "UNRESOLVED", assertion: "Mainland only" },
                                    {
                                        kind: "COUNTRY",
                                        code: "XX",
                                        reference_release: "iso-codes-4.20.1",
                                    },
                                    { kind: "ANYWHERE" },
                                ],
                                services: [{ code: "FREIGHT" }],
                            },
                        ],
                    },
                },
            },
        });
        const policy = detail?.terms?.shipping;
        expect(policy?.kind).toBe("COVERAGE");
        if (policy?.kind !== "COVERAGE") return;
        expect(policy.coverage.exclusions).toEqual([
            {
                kind: "POSTAL",
                version: "POSTAL_RULE_V1",
                country: "DE",
                referenceRelease: "iso-codes-4.20.1",
                form: { kind: "GERMAN_PREFIX", prefix: "18" },
            },
            { kind: "UNSUPPORTED" },
        ]);
        expect(policy.coverage.zones[0].areas).toEqual([
            { kind: "UNRESOLVED", assertion: "Mainland only" },
            { kind: "UNSUPPORTED" },
            { kind: "ANYWHERE" },
        ]);
        expect(policy.coverage.zones[0].services).toEqual([{ code: "FREIGHT" }]);
    });

    it("reads an unknown policy kind or release as unsupported, not as terms", () => {
        expect(
            mapToListingShippingDetail({ terms: { shipping: { kind: "DRONE" } as never } }),
        ).toEqual({ terms: { shipping: { kind: "UNSUPPORTED" } } });
        expect(
            mapToListingShippingDetail({
                terms: {
                    shipping: {
                        kind: "COVERAGE",
                        coverage: {
                            reference_release: "iso-codes-9.0" as never,
                            completeness: "PARTIAL",
                            zones: [],
                        },
                    },
                },
            }),
        ).toEqual({ terms: { shipping: { kind: "UNSUPPORTED" } } });
    });

    it("marks unreadable conditions instead of dropping them", () => {
        const detail = mapToListingShippingDetail({
            terms: {
                shipping: {
                    kind: "COVERAGE",
                    coverage: {
                        reference_release: "iso-codes-4.20.1",
                        completeness: "PARTIAL",
                        zones: [
                            {
                                areas: [{ kind: "ANYWHERE" }],
                                services: [
                                    {
                                        code: "PARCEL",
                                        eligibility: "OFFERED",
                                        applicability: {
                                            class: "fragile",
                                            threshold: {
                                                minimum: { amount_minor: 5000, currency: "XYZ" },
                                                scope: "SELLER_ORDER",
                                            } as never,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        });
        const policy = detail?.terms?.shipping;
        if (policy?.kind !== "COVERAGE") throw new Error("expected coverage");
        expect(policy.coverage.zones[0].services[0]).toEqual({
            code: "PARCEL",
            eligibility: "OFFERED",
            applicability: { class: "fragile", hasUnsupportedConditions: true },
        });
    });
});

describe("shipping prices", () => {
    function detailWithRate(rate: unknown, display?: unknown) {
        return mapToListingShippingDetail({
            ...(display ? { display } : {}),
            terms: {
                shipping: {
                    kind: "COVERAGE",
                    coverage: {
                        reference_release: "iso-codes-4.20.1",
                        completeness: "PARTIAL",
                        zones: [
                            {
                                areas: [{ kind: "ANYWHERE" }],
                                services: [{ code: "PARCEL", rate } as never],
                            },
                        ],
                    },
                },
            },
        } as ListingShippingDetailData);
    }

    function serviceRate(detail: ReturnType<typeof detailWithRate>) {
        const policy = detail?.terms?.shipping;
        if (policy?.kind !== "COVERAGE") throw new Error("expected coverage");
        return policy.coverage.zones[0].services[0].rate;
    }

    it("keeps every advertised price kind with minor units and its own currency", () => {
        const cases = [
            [
                { kind: "FREE", currency: "GBP" },
                { kind: "FREE", currency: "GBP" },
            ],
            [{ kind: "FREE" }, { kind: "FREE" }],
            [
                { kind: "FROM", amount: { amount_minor: 4500, currency: "CHF" } },
                { kind: "FROM", amount: { amountMinor: 4500, currency: "CHF" } },
            ],
            [
                {
                    kind: "ESTIMATED_RANGE",
                    minimum: { amount_minor: 3000, currency: "JPY" },
                    maximum: { amount_minor: 9000, currency: "JPY" },
                },
                {
                    kind: "ESTIMATED_RANGE",
                    minimum: { amountMinor: 3000, currency: "JPY" },
                    maximum: { amountMinor: 9000, currency: "JPY" },
                },
            ],
            [{ kind: "EXTERNALLY_CALCULATED" }, { kind: "EXTERNALLY_CALCULATED" }],
            [
                { kind: "ON_REQUEST", currency: "EUR" },
                { kind: "ON_REQUEST", currency: "EUR" },
            ],
        ] as const;
        for (const [price, expected] of cases) {
            expect(serviceRate(detailWithRate({ price }))).toEqual({ price: expected });
        }
    });

    it("keeps charge basis, qualifying scope and known components", () => {
        expect(
            serviceRate(
                detailWithRate({
                    price: { kind: "FIXED", amount: { amount_minor: 0, currency: "EUR" } },
                    basis: "PER_SHIPMENT",
                    qualifying_scope: "SHIPMENT",
                    components: { TRANSPORT: "INCLUDED", IMPORT_DUTY: "EXCLUDED" },
                }),
            ),
        ).toEqual({
            price: { kind: "FIXED", amount: { amountMinor: 0, currency: "EUR" } },
            basis: "PER_SHIPMENT",
            qualifyingScope: "SHIPMENT",
            components: { TRANSPORT: "INCLUDED", IMPORT_DUTY: "EXCLUDED" },
        });
    });

    it("never infers a price from an unreadable one", () => {
        for (const price of [
            { kind: "BARTER" },
            { kind: "FIXED", amount: { amount_minor: -1, currency: "EUR" } },
            { kind: "FIXED", amount: { amount_minor: 1.5, currency: "EUR" } },
            { kind: "FIXED", amount: { amount_minor: 100, currency: "XYZ" } },
            { kind: "FREE", currency: "XYZ" },
            {
                kind: "ESTIMATED_RANGE",
                minimum: { amount_minor: 100, currency: "EUR" },
                maximum: { amount_minor: 200, currency: "USD" },
            },
        ]) {
            expect(serviceRate(detailWithRate({ price, basis: "PER_ITEM" }))).toBeUndefined();
        }
    });

    it("keeps the source price beside a converted price only with its valuation", () => {
        const rate = {
            price: { kind: "FIXED", amount: { amount_minor: 1200, currency: "EUR" } },
            display_price: { kind: "FIXED", amount: { amount_minor: 1302, currency: "USD" } },
            basis: "PER_ITEM",
        };
        const converted = detailWithRate(rate, DISPLAY);
        expect(serviceRate(converted)).toEqual({
            price: PARCEL_EUR_12,
            displayPrice: { kind: "FIXED", amount: { amountMinor: 1302, currency: "USD" } },
            basis: "PER_ITEM",
        });
        expect(converted?.display).toEqual({
            currency: "USD",
            fxRateId: DISPLAY.fxRateId,
            capturedAt: new Date(DISPLAY.capturedAt),
        });

        // Without a readable valuation the converted value is not shown; the source price stays.
        const unvalued = detailWithRate(rate, { ...DISPLAY, capturedAt: "not a date" });
        expect(serviceRate(unvalued)).toEqual({ price: PARCEL_EUR_12, basis: "PER_ITEM" });
        expect(unvalued?.display).toBeUndefined();
        expect(serviceRate(detailWithRate(rate))).toEqual({
            price: PARCEL_EUR_12,
            basis: "PER_ITEM",
        });
    });

    it("keeps a converted preview with its shared valuation", () => {
        expect(
            mapToPersonalizedShippingSummary({
                eligibility: "OFFERED",
                pricePreview: {
                    service: "PARCEL",
                    basis: "PER_ITEM",
                    price: { kind: "FIXED", amount: { amount_minor: 1302, currency: "USD" } },
                },
                display: DISPLAY,
            }),
        ).toEqual({
            eligibility: "OFFERED",
            pricePreview: {
                service: "PARCEL",
                basis: "PER_ITEM",
                price: { kind: "FIXED", amount: { amountMinor: 1302, currency: "USD" } },
            },
            display: {
                currency: "USD",
                fxRateId: DISPLAY.fxRateId,
                capturedAt: new Date(DISPLAY.capturedAt),
            },
        });
    });

    it("omits an ambiguous or unreadable preview rather than guessing", () => {
        // The backend omits a preview when candidates cannot be compared.
        expect(mapToPersonalizedShippingSummary({ eligibility: "OFFERED" })).toEqual({
            eligibility: "OFFERED",
        });
        // A converted preview whose valuation cannot be read cannot be told from a source price.
        expect(
            mapToPersonalizedShippingSummary({
                eligibility: "OFFERED",
                pricePreview: {
                    service: "PARCEL",
                    basis: "PER_ITEM",
                    price: { kind: "FIXED", amount: { amount_minor: 1302, currency: "USD" } },
                },
                display: { ...DISPLAY, currency: "XYZ" as never },
            }),
        ).toEqual({ eligibility: "OFFERED" });
        // A preview without a known basis is dropped.
        expect(
            mapToPersonalizedShippingSummary({
                eligibility: "OFFERED",
                pricePreview: {
                    service: "PARCEL",
                    basis: "PER_PALLET" as never,
                    price: { kind: "FREE", currency: "EUR" },
                },
            }),
        ).toEqual({ eligibility: "OFFERED" });
    });

    it("keeps an option's source-currency charge only for known arithmetic kinds", () => {
        const detail = mapToPersonalizedShippingDetail({
            destination: { referenceRelease: "iso-codes-4.20.1", country: "FR" },
            options: [
                {
                    service: "PARCEL",
                    eligibility: "SUBJECT_TO_CONFIRMATION",
                    charge: { kind: "FIXED", amount: { amount_minor: 2400, currency: "EUR" } },
                },
                { service: "FREIGHT", requiredInputs: ["SHIPMENTS"] },
            ],
        });
        expect(detail?.options).toEqual([
            {
                service: "PARCEL",
                eligibility: "SUBJECT_TO_CONFIRMATION",
                charge: { kind: "FIXED", amount: { amountMinor: 2400, currency: "EUR" } },
            },
            { service: "FREIGHT", requiredInputs: ["SHIPMENTS"] },
        ]);
    });
});

describe("private destination assessments", () => {
    it("keeps minimal destination facts and the required attribution", () => {
        expect(
            mapToPersonalizedShippingDetail({
                destination: {
                    referenceRelease: "iso-codes-4.20.1",
                    country: "DE",
                    subdivision: "DE-BY",
                    postalCode: "80331",
                },
                attribution: {
                    provider: "AMAZON_LOCATION",
                    attributionUrl:
                        "https://docs.aws.amazon.com/location/latest/developerguide/data-attribution.html",
                },
                requiredInputs: ["VARIANT"],
            }),
        ).toEqual({
            destination: {
                referenceRelease: "iso-codes-4.20.1",
                country: "DE",
                subdivision: "DE-BY",
                postalCode: "80331",
            },
            attribution: {
                provider: "Amazon Location Service",
                url: "https://docs.aws.amazon.com/location/latest/developerguide/data-attribution.html",
            },
            requiredInputs: ["VARIANT"],
        });
    });

    it("withholds an assessment whose required attribution or destination cannot be read", () => {
        expect(
            mapToPersonalizedShippingSummary({
                eligibility: "OFFERED",
                attribution: { provider: "AMAZON_LOCATION", attributionUrl: "javascript:alert(1)" },
            }),
        ).toBeUndefined();
        expect(
            mapToPersonalizedShippingDetail({
                destination: { referenceRelease: "iso-codes-9.0" as never, country: "DE" },
                eligibility: "OFFERED",
            }),
        ).toBeUndefined();
    });

    it("drops the private assessment from server-rendered responses only", () => {
        const response = {
            item: { productListingId: "pl_1" },
            userState: { watchlist: { watching: true, notifications: false }, shipping: {} },
        };
        expect(withoutPrivateShipping(response)).toEqual({
            item: { productListingId: "pl_1" },
            userState: { watchlist: { watching: true, notifications: false } },
        });
        expect(response.userState.shipping).toEqual({});
        const anonymous = { item: { productListingId: "pl_1" } };
        expect(withoutPrivateShipping(anonymous)).toBe(anonymous);
    });
});
