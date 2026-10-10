import { describe, expect, it } from "vitest";
import type { ListingSourceData, ListingSourceSearchSummaryData } from "@/client";
import { mapPublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import {
    buildCreateAdminListingSourceData,
    buildUpdateAdminListingSourceData,
    createDefaultConfiguration,
    defaultUpdateConfigurations,
    mapToAdminListingSourceDetail,
    mapToAdminListingSourcePage,
    mapToAdminListingSourceSearchQuery,
    mapToListingSourceReference,
    type AdminListingSourceDetail,
    type AdminListingSourceSummary,
} from "../AdminListingSource.ts";

const summaryDto: ListingSourceSearchSummaryData = {
    listingSourceId: "ls_01SOURCE",
    listingSourceSlugId: "antique-house",
    name: "Antique House",
    operator: { partyId: "party_01", partySlugId: "antique-house", name: "Antique House Ltd" },
    ingestionMethods: ["WEB_CRAWL", "SHOPIFY", "WOOCOMMERCE", "PARTNER_API"],
    presentation: { url: "https://antique.example", image: "https://antique.example/image.jpg" },
    referralConfiguration: { type: "PARTNERIZE", camref: "ref-01" } as const,
    created: "2026-09-01T10:00:00.000Z",
    updated: "2026-09-02T11:00:00.000Z",
};

const detailDto: ListingSourceData = {
    listingSourceId: "ls_01SOURCE",
    listingSourceSlugId: "antique-house",
    name: "Antique House",
    operator: { partyId: "party_01", partySlugId: "antique-house", name: "Antique House Ltd" },
    ingestionMethods: ["WEB_CRAWL", "SHOPIFY", "WOOCOMMERCE", "PARTNER_API"],
    url: "https://antique.example",
    image: "https://antique.example/image.jpg",
    created: "2026-09-01T10:00:00.000Z",
    updated: "2026-09-02T11:00:00.000Z",
};

const detail: AdminListingSourceDetail = mapToAdminListingSourceDetail(detailDto);

describe("admin ListingSource mapping and request builders", () => {
    it("maps supported admin filters and returns the opaque cursor unchanged", () => {
        expect(
            mapToAdminListingSourceSearchQuery(
                {
                    query: " Antique ",
                    name: " House ",
                    listingSourceId: " ls_01SOURCE ",
                    listingSourceSlugId: " antique-house ",
                    operatorPartyId: " party_01 ",
                    ingestionMethod: "SHOPIFY",
                    sort: "updated",
                    order: "desc",
                },
                "opaque/cursor+1",
            ),
        ).toEqual({
            size: 25,
            query: "Antique",
            name: "House",
            listingSourceId: "ls_01SOURCE",
            listingSourceSlugId: "antique-house",
            operatorPartyId: "party_01",
            ingestionMethod: "SHOPIFY",
            sort: "updated",
            order: "desc",
            searchAfter: "opaque/cursor+1",
        });
    });

    it("maps distinct search and detail DTOs without manufacturing private configuration", () => {
        const page = mapToAdminListingSourcePage({ items: [summaryDto], size: 1, total: 8 });
        expect(page.items[0]).toMatchObject({
            listingSourceId: "ls_01SOURCE",
            presentation: {
                url: "https://antique.example",
                image: "https://antique.example/image.jpg",
            },
            referralConfiguration: { type: "PARTNERIZE", camref: "ref-01" },
        } satisfies Partial<AdminListingSourceSummary>);
        expect(page.items[0]?.created).toBeInstanceOf(Date);
        expect(detail).toMatchObject({
            listingSourceId: "ls_01SOURCE",
            operator: { partyId: "party_01" },
            presentation: { url: "https://antique.example" },
        });
        expect(Object.hasOwn(detail, "referralConfiguration")).toBe(false);
        expect(Object.hasOwn(detail, "ingestionConfiguration")).toBe(false);
    });

    it("keeps ingestion details and write-only secrets out of public source models", () => {
        const publicDtoWithUnexpectedPrivateFields = {
            listingSourceId: "ls_public",
            listingSourceSlugId: "public-source",
            name: "Public Source",
            operator: { name: "Public Operator" },
            url: "https://public.example",
            image: "https://public.example/image.jpg",
            ingestionConfiguration: [{ type: "WOOCOMMERCE", webhookSecret: "never-render" }],
            referralConfiguration: { type: "PARTNERIZE", camref: "public-campaign" },
        };
        const mapped = mapPublicListingSource(publicDtoWithUnexpectedPrivateFields);
        expect(mapped).toEqual({
            listingSourceId: "ls_public",
            slugId: "public-source",
            name: "Public Source",
            operatorName: "Public Operator",
            image: "https://public.example/image.jpg",
            url: "https://public.example",
        });
        expect(JSON.stringify(mapped)).not.toContain("never-render");
        expect(mapped).not.toHaveProperty("ingestionConfiguration");
        expect(mapped).not.toHaveProperty("referralConfiguration");
    });

    it("builds create configuration variants and both operator choices", () => {
        const base = {
            name: " Source ",
            operatorType: "NEW" as const,
            operatorPartyId: "",
            operatorName: " New Operator ",
            operatorPhone: " ",
            operatorEmail: " contact@example.test ",
            configurations: [
                { ...createDefaultConfiguration("UNCONFIGURED", "WEB_CRAWL") },
                { ...createDefaultConfiguration("WEB_CRAWL"), fallbackCurrency: " EUR " },
                {
                    ...createDefaultConfiguration("SHOPIFY"),
                    domain: " store.example ",
                    currency: "USD",
                    language: "en",
                },
                {
                    ...createDefaultConfiguration("WOOCOMMERCE"),
                    webhookSecret: " write-only-value ",
                },
                { ...createDefaultConfiguration("PARTNER_API") },
            ],
            url: " https://source.example ",
            image: " ",
            partnerizeCamref: " ref-01 ",
        };
        expect(buildCreateAdminListingSourceData(base)).toEqual({
            name: "Source",
            operator: {
                type: "NEW",
                name: "New Operator",
                email: "contact@example.test",
            },
            ingestionConfiguration: [
                { type: "UNCONFIGURED", ingestionMethod: "WEB_CRAWL" },
                { type: "WEB_CRAWL", fallbackCurrency: "EUR" },
                { type: "SHOPIFY", domain: "store.example", currency: "USD", language: "en" },
                { type: "WOOCOMMERCE", webhookSecret: "write-only-value" },
                { type: "PARTNER_API" },
            ],
            url: "https://source.example",
            referralConfiguration: { type: "PARTNERIZE", camref: "ref-01" },
        });
        expect(
            buildCreateAdminListingSourceData({
                ...base,
                operatorType: "EXISTING",
                operatorPartyId: " party_02 ",
                configurations: [createDefaultConfiguration("PARTNER_API")],
            }).operator,
        ).toEqual({ type: "EXISTING", partyId: "party_02" });
    });

    it("omits unseen configuration by default and preserves a blank WooCommerce secret", () => {
        const values = {
            name: "Renamed Source",
            url: detail.presentation.url ?? "",
            image: "",
            referralAction: "KEEP" as const,
            partnerizeCamref: "",
            replaceIngestionConfiguration: false,
            configurations: defaultUpdateConfigurations(detail.ingestionMethods),
        };
        expect(buildUpdateAdminListingSourceData(detail, values)).toEqual({
            name: "Renamed Source",
            image: null,
        });
        const replacement = {
            ...values,
            replaceIngestionConfiguration: true,
            configurations: defaultUpdateConfigurations(detail.ingestionMethods).map(
                (configuration) =>
                    configuration.ingestionMethod === "SHOPIFY"
                        ? { ...configuration, domain: "store.example" }
                        : configuration,
            ),
        };
        expect(
            buildUpdateAdminListingSourceData(detail, replacement).ingestionConfiguration,
        ).toEqual([
            { type: "WEB_CRAWL" },
            { type: "SHOPIFY", domain: "store.example" },
            { type: "WOOCOMMERCE" },
            { type: "PARTNER_API" },
        ]);
        expect(
            JSON.stringify(buildUpdateAdminListingSourceData(detail, replacement)),
        ).not.toContain("webhookSecret");
    });

    it("only clears nullable values on explicit request and never includes a slug or operator in update", () => {
        const updateValues = {
            name: "Renamed Source",
            url: "",
            image: "",
            referralAction: "CLEAR" as const,
            partnerizeCamref: "",
            replaceIngestionConfiguration: false,
            configurations: defaultUpdateConfigurations(detail.ingestionMethods),
        };
        expect(buildUpdateAdminListingSourceData(detail, updateValues)).toEqual({
            name: "Renamed Source",
            url: null,
            image: null,
            referralConfiguration: null,
        });
        expect(buildUpdateAdminListingSourceData(detail, updateValues)).not.toHaveProperty(
            "listingSourceSlugId",
        );
        expect(buildUpdateAdminListingSourceData(detail, updateValues)).not.toHaveProperty(
            "operator",
        );
    });

    it("rejects replacement configurations that do not match immutable active methods", () => {
        expect(() =>
            buildUpdateAdminListingSourceData(detail, {
                name: detail.name,
                url: detail.presentation.url ?? "",
                image: detail.presentation.image ?? "",
                referralAction: "KEEP",
                partnerizeCamref: "",
                replaceIngestionConfiguration: true,
                configurations: defaultUpdateConfigurations(["SHOPIFY"]),
            }),
        ).toThrow("Replacement configurations must match the source ingestion methods");
    });

    it("maps mutation references without pretending they are full source details", () => {
        const reference = mapToListingSourceReference({
            listingSourceId: "ls_02SOURCE",
            listingSourceSlugId: "immutable-name",
        });
        expect(reference).toEqual({
            listingSourceId: "ls_02SOURCE",
            listingSourceSlugId: "immutable-name",
        });
        expect(Object.hasOwn(reference, "operator")).toBe(false);
    });

    describe("currency configuration", () => {
        const createBase = {
            name: "Source",
            operatorType: "EXISTING" as const,
            operatorPartyId: "party_01",
            operatorName: "",
            operatorPhone: "",
            operatorEmail: "",
            url: "",
            image: "",
            partnerizeCamref: "",
        };
        const allMethods = ["WEB_CRAWL", "SHOPIFY", "WOOCOMMERCE"] as const;
        const multiMethodDetail: AdminListingSourceDetail = {
            ...detail,
            ingestionMethods: [...allMethods],
        };

        function createConfigurations(currencies: readonly [string, string, string]) {
            return [
                {
                    ...createDefaultConfiguration("WEB_CRAWL"),
                    fallbackCurrency: currencies[0],
                },
                {
                    ...createDefaultConfiguration("SHOPIFY", "SHOPIFY"),
                    domain: "store.example",
                    currency: currencies[1],
                },
                {
                    ...createDefaultConfiguration("WOOCOMMERCE", "WOOCOMMERCE"),
                    webhookSecret: "secret",
                    currency: currencies[2],
                },
            ];
        }

        const emptyUpdateFields = {
            fallbackCurrency: "",
            domain: "",
            currency: "",
            language: "",
            webhookSecret: "",
        };

        function updateValues(currencies: readonly [string, string, string]) {
            return {
                name: detail.name,
                url: detail.presentation.url ?? "",
                image: "",
                referralAction: "KEEP" as const,
                partnerizeCamref: "",
                replaceIngestionConfiguration: true,
                configurations: [
                    {
                        ...emptyUpdateFields,
                        ingestionMethod: "WEB_CRAWL" as const,
                        fallbackCurrency: currencies[0],
                    },
                    {
                        ...emptyUpdateFields,
                        ingestionMethod: "SHOPIFY" as const,
                        domain: "store.example",
                        currency: currencies[1],
                    },
                    {
                        ...emptyUpdateFields,
                        ingestionMethod: "WOOCOMMERCE" as const,
                        currency: currencies[2],
                    },
                ],
            };
        }

        it("preserves newly supported codes in create configurations", () => {
            expect(
                buildCreateAdminListingSourceData({
                    ...createBase,
                    configurations: createConfigurations(["SEK", "KRW", "ZAR"]),
                }).ingestionConfiguration,
            ).toEqual([
                { type: "WEB_CRAWL", fallbackCurrency: "SEK" },
                { type: "SHOPIFY", domain: "store.example", currency: "KRW" },
                { type: "WOOCOMMERCE", webhookSecret: "secret", currency: "ZAR" },
            ]);
        });

        it("preserves newly supported codes in update configurations", () => {
            expect(
                buildUpdateAdminListingSourceData(
                    multiMethodDetail,
                    updateValues(["SEK", "KRW", "ZAR"]),
                ).ingestionConfiguration,
            ).toEqual([
                { type: "WEB_CRAWL", fallbackCurrency: "SEK" },
                { type: "SHOPIFY", domain: "store.example", currency: "KRW" },
                { type: "WOOCOMMERCE", currency: "ZAR" },
            ]);
        });

        it("canonicalises lowercase padded codes on create and update", () => {
            expect(
                buildCreateAdminListingSourceData({
                    ...createBase,
                    configurations: createConfigurations([" sek ", " krw", "zar "]),
                }).ingestionConfiguration,
            ).toEqual([
                { type: "WEB_CRAWL", fallbackCurrency: "SEK" },
                { type: "SHOPIFY", domain: "store.example", currency: "KRW" },
                { type: "WOOCOMMERCE", webhookSecret: "secret", currency: "ZAR" },
            ]);
            expect(
                buildUpdateAdminListingSourceData(
                    multiMethodDetail,
                    updateValues([" sek ", " krw", "zar "]),
                ).ingestionConfiguration,
            ).toEqual([
                { type: "WEB_CRAWL", fallbackCurrency: "SEK" },
                { type: "SHOPIFY", domain: "store.example", currency: "KRW" },
                { type: "WOOCOMMERCE", currency: "ZAR" },
            ]);
        });

        it("omits empty or blank currencies on create and update", () => {
            const created = buildCreateAdminListingSourceData({
                ...createBase,
                configurations: createConfigurations(["", " ", ""]),
            }).ingestionConfiguration;
            const updated = buildUpdateAdminListingSourceData(
                multiMethodDetail,
                updateValues([" ", "", " "]),
            ).ingestionConfiguration;
            for (const configuration of [...created, ...(updated ?? [])]) {
                expect(configuration).not.toHaveProperty("currency");
                expect(configuration).not.toHaveProperty("fallbackCurrency");
            }
        });

        it.each([0, 1, 2])(
            "rejects an unsupported code in configuration %i instead of coercing it to EUR",
            (index) => {
                const currencies: [string, string, string] = ["SEK", "KRW", "ZAR"];
                currencies[index] = "XYZ";
                expect(() =>
                    buildCreateAdminListingSourceData({
                        ...createBase,
                        configurations: createConfigurations(currencies),
                    }),
                ).toThrow("Unsupported listing source currency: XYZ");
                expect(() =>
                    buildUpdateAdminListingSourceData(multiMethodDetail, updateValues(currencies)),
                ).toThrow("Unsupported listing source currency: XYZ");
            },
        );
    });
});
