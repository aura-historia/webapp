import { describe, expect, it } from "vitest";
import type { AdminProductListingDetail } from "@/data/internal/product/AdminProductListing.ts";
import {
    type AdminProductListingFormValues,
    buildAdminProductListingPatch,
    createAdminProductListingFormSchema,
    formatMinorUnits,
    hasAdminProductListingChanges,
    parseMinorUnits,
    parseUtcInputValue,
    rebaseAdminProductListingDraft,
    toAdminProductListingFormValues,
    validateAdminProductListingForm,
} from "../adminProductListingForm.ts";

const listing: AdminProductListingDetail = {
    productListingId: "pl_01",
    productListingTitleSlugId: "walnut-cabinet-pl01",
    source: { listingSourceId: "ls_01", name: "Galerie Nord", slugId: "galerie-nord" },
    sourceListingId: "SKU 0042",
    title: { text: "Walnut cabinet", language: "en" },
    price: { type: "MONETARY", amount: 125_050, currency: "EUR" },
    priceEstimateMin: { amount: 100_000, currency: "EUR" },
    priceEstimateMax: null,
    availability: "IN_STOCK",
    lifecycle: "ACTIVE",
    auctionId: "auc_01",
    expectedVersion: 7,
    created: new Date("2026-09-01T10:00:00Z"),
    updated: new Date("2026-10-01T12:30:00Z"),
    description: null,
    url: "https://galerie.example/items/42",
    images: ["https://galerie.example/b.jpg", "https://galerie.example/a.jpg"],
    auction: {
        auctionId: "auc_01",
        lotNumber: "12A",
        cataloguePosition: 3,
        biddingOpens: new Date("2026-10-10T08:00:00Z"),
        scheduledCloses: new Date("2026-10-12T18:30:15.250Z"),
        reportedClosedAt: null,
    },
    saleObservation: null,
};

const original = toAdminProductListingFormValues(listing);

function draft(overrides: Partial<AdminProductListingFormValues>): AdminProductListingFormValues {
    return { ...original, images: original.images.map((image) => ({ ...image })), ...overrides };
}

describe("minor-unit conversion", () => {
    it("converts decimal text exactly, without floating-point rounding", () => {
        expect(parseMinorUnits("1250.50", "EUR")).toEqual({ ok: true, amount: 125_050 });
        expect(parseMinorUnits("0.29", "EUR")).toEqual({ ok: true, amount: 29 });
        expect(parseMinorUnits("1,1", "EUR")).toEqual({ ok: true, amount: 110 });
        expect(parseMinorUnits("12.", "HUF")).toEqual({ ok: true, amount: 1200 });
        expect(parseMinorUnits("90071992547409.91", "EUR")).toEqual({
            ok: true,
            amount: 9_007_199_254_740_991,
        });
        expect(parseMinorUnits("5000000", "JPY")).toEqual({ ok: true, amount: 5_000_000 });
    });

    it("rejects ambiguous, imprecise and unrepresentable amounts", () => {
        expect(parseMinorUnits("1,000", "EUR")).toEqual({ ok: false, reason: "precision" });
        expect(parseMinorUnits("10.5", "JPY")).toEqual({ ok: false, reason: "precision" });
        expect(parseMinorUnits("1.234", "EUR")).toEqual({ ok: false, reason: "precision" });
        expect(parseMinorUnits("-1", "EUR")).toEqual({ ok: false, reason: "format" });
        expect(parseMinorUnits("1 000", "EUR")).toEqual({ ok: false, reason: "format" });
        expect(parseMinorUnits("1e3", "EUR")).toEqual({ ok: false, reason: "format" });
        expect(parseMinorUnits("90071992547409.92", "EUR")).toEqual({
            ok: false,
            reason: "range",
        });
    });

    it("formats minor units with the backend exponent", () => {
        expect(formatMinorUnits(125_050, "EUR")).toBe("1250.50");
        expect(formatMinorUnits(5, "EUR")).toBe("0.05");
        expect(formatMinorUnits(0, "EUR")).toBe("0.00");
        expect(formatMinorUnits(5_000_000, "KRW")).toBe("5000000");
        expect(formatMinorUnits(9_007_199_254_740_991, "EUR")).toBe("90071992547409.91");
    });
});

describe("toAdminProductListingFormValues", () => {
    it("fills the form from authoritative facts in UTC and keeps image order", () => {
        expect(original).toEqual({
            title: "Walnut cabinet",
            titleLanguage: "en",
            description: "",
            descriptionLanguage: "en",
            priceKind: "MONETARY",
            priceAmount: "1250.50",
            priceCurrency: "EUR",
            estimateMinAmount: "1000.00",
            estimateMinCurrency: "EUR",
            estimateMaxAmount: "",
            estimateMaxCurrency: "EUR",
            availability: "IN_STOCK",
            url: "https://galerie.example/items/42",
            images: [
                { url: "https://galerie.example/b.jpg" },
                { url: "https://galerie.example/a.jpg" },
            ],
            auctionId: "auc_01",
            lotNumber: "12A",
            cataloguePosition: "3",
            biddingOpens: "2026-10-10T08:00:00",
            scheduledCloses: "2026-10-12T18:30:15",
            reportedClosedAt: "",
        });
    });

    it("never defaults a language the listing does not use", () => {
        expect(
            toAdminProductListingFormValues({ ...listing, title: null, description: null }),
        ).toMatchObject({ title: "", titleLanguage: "", description: "", descriptionLanguage: "" });
    });

    it("never defaults a currency the listing does not use", () => {
        const values = toAdminProductListingFormValues({
            ...listing,
            price: { type: "ON_REQUEST" },
            priceEstimateMin: null,
            availability: null,
            auction: null,
        });

        expect(values).toMatchObject({
            priceKind: "ON_REQUEST",
            priceAmount: "",
            priceCurrency: "",
            estimateMinCurrency: "",
            availability: "",
            auctionId: "",
            lotNumber: "",
            biddingOpens: "",
        });
    });
});

describe("buildAdminProductListingPatch", () => {
    it("sends nothing when only equivalent representations changed", () => {
        const values = draft({
            priceAmount: "1250.5",
            estimateMinAmount: "1000",
            estimateMaxCurrency: "USD",
            url: " https://galerie.example/items/42 ",
            cataloguePosition: "03",
            biddingOpens: "2026-10-10T08:00",
        });

        expect(hasAdminProductListingChanges(values, original)).toBe(false);
        expect(buildAdminProductListingPatch(values, original)).toEqual({});
    });

    it("replaces or clears the original text with its own language", () => {
        expect(
            buildAdminProductListingPatch(
                draft({
                    title: " Nussbaumschrank ",
                    titleLanguage: "de",
                    description: "Two doors.\nOriginal key.",
                }),
                original,
            ),
        ).toEqual({
            title: { text: "Nussbaumschrank", language: "de" },
            description: { text: "Two doors.\nOriginal key.", language: "en" },
        });
        expect(buildAdminProductListingPatch(draft({ title: "  " }), original)).toEqual({
            title: null,
        });
    });

    it("ignores a language choice without text and treats a language switch as a change", () => {
        expect(hasAdminProductListingChanges(draft({ descriptionLanguage: "fr" }), original)).toBe(
            false,
        );
        expect(buildAdminProductListingPatch(draft({ titleLanguage: "de" }), original)).toEqual({
            title: { text: "Walnut cabinet", language: "de" },
        });
    });

    it("serializes only changed groups with explicit clears", () => {
        expect(
            buildAdminProductListingPatch(
                draft({ priceKind: "NONE", estimateMinAmount: "", availability: "" }),
                original,
            ),
        ).toEqual({ price: null, priceEstimateMin: null, availability: null });
        expect(buildAdminProductListingPatch(draft({ priceKind: "ON_REQUEST" }), original)).toEqual(
            { price: { type: "ON_REQUEST" } },
        );
    });

    it("converts changed amounts to minor units in their selected currency", () => {
        expect(
            buildAdminProductListingPatch(
                draft({
                    priceAmount: "980000",
                    priceCurrency: "JPY",
                    estimateMaxAmount: "1500,25",
                }),
                original,
            ),
        ).toEqual({
            price: { type: "MONETARY", amount: 980_000, currency: "JPY" },
            priceEstimateMax: { amount: 150_025, currency: "EUR" },
        });
    });

    it("replaces the ordered image collection and sends an empty array to empty it", () => {
        const reordered = draft({ images: [...original.images].reverse() });
        expect(buildAdminProductListingPatch(reordered, original)).toEqual({
            images: ["https://galerie.example/a.jpg", "https://galerie.example/b.jpg"],
        });
        expect(buildAdminProductListingPatch(draft({ images: [] }), original)).toEqual({
            images: [],
        });
    });

    it("detaches the auction without sending unchanged lot or timing facts", () => {
        expect(buildAdminProductListingPatch(draft({ auctionId: "" }), original)).toEqual({
            auction: { auctionId: null },
        });
    });

    it("clears timing instants individually and keeps the others omitted", () => {
        expect(
            buildAdminProductListingPatch(
                draft({ scheduledCloses: "", reportedClosedAt: "2026-10-12T19:00" }),
                original,
            ),
        ).toEqual({
            auction: {
                timing: {
                    scheduledCloses: null,
                    reportedClosedAt: new Date("2026-10-12T19:00:00Z"),
                },
            },
        });
        expect(
            buildAdminProductListingPatch(
                draft({ lotNumber: " 12B ", cataloguePosition: "" }),
                original,
            ),
        ).toEqual({ auction: { lotNumber: "12B", cataloguePosition: null } });
    });
});

describe("rebaseAdminProductListingDraft", () => {
    it("keeps only the administrator's changed groups on top of the latest values", () => {
        const latest = toAdminProductListingFormValues({
            ...listing,
            url: "https://galerie.example/items/42-new",
            availability: "RESERVED",
            expectedVersion: 8,
        });
        const edited = draft({ availability: "SOLD_OUT", lotNumber: "13" });

        const rebased = rebaseAdminProductListingDraft(edited, original, latest);

        expect(rebased).toMatchObject({
            url: "https://galerie.example/items/42-new",
            availability: "SOLD_OUT",
            lotNumber: "13",
        });
        expect(buildAdminProductListingPatch(rebased, latest)).toEqual({
            availability: "SOLD_OUT",
            auction: { lotNumber: "13" },
        });
    });

    it("keeps an edited title over a newer description and drops untouched text", () => {
        const latest = toAdminProductListingFormValues({
            ...listing,
            description: { text: "Two doors.", language: "en" },
            expectedVersion: 8,
        });
        const edited = draft({ title: "Nussbaumschrank", titleLanguage: "de" });

        const rebased = rebaseAdminProductListingDraft(edited, original, latest);

        expect(rebased).toMatchObject({
            title: "Nussbaumschrank",
            titleLanguage: "de",
            description: "Two doors.",
            descriptionLanguage: "en",
        });
        expect(buildAdminProductListingPatch(rebased, latest)).toEqual({
            title: { text: "Nussbaumschrank", language: "de" },
        });
    });

    it("yields no patch when the latest version already contains the draft", () => {
        const edited = draft({ availability: "SOLD_OUT" });
        const latest = toAdminProductListingFormValues({ ...listing, availability: "SOLD_OUT" });

        expect(
            buildAdminProductListingPatch(
                rebaseAdminProductListingDraft(edited, original, latest),
                latest,
            ),
        ).toEqual({});
    });
});

describe("validateAdminProductListingForm", () => {
    it("validates changed groups only", () => {
        const stored = toAdminProductListingFormValues({
            ...listing,
            url: "ftp://legacy.example/42",
        });

        expect(validateAdminProductListingForm(stored, stored)).toEqual([]);
        expect(
            validateAdminProductListingForm({ ...stored, url: "javascript:alert(1)" }, stored),
        ).toEqual([{ path: ["url"], message: "adminProductListings.validation.invalidUrl" }]);
    });

    it("reports amount, currency, image, lot and timing problems on their fields", () => {
        const issues = validateAdminProductListingForm(
            draft({
                priceAmount: "1.234",
                estimateMaxAmount: "10",
                estimateMaxCurrency: "",
                images: [{ url: "https://galerie.example/b.jpg" }, { url: "" }],
                lotNumber: "€".repeat(43),
                cataloguePosition: "0",
                biddingOpens: "2026-02-31T08:00",
            }),
            original,
        );

        expect(issues).toEqual([
            {
                path: ["priceAmount"],
                message: "adminProductListings.validation.amountTwoDecimals",
            },
            {
                path: ["estimateMaxCurrency"],
                message: "adminProductListings.validation.currencyRequired",
            },
            {
                path: ["images", 1, "url"],
                message: "adminProductListings.validation.invalidImageUrl",
            },
            { path: ["lotNumber"], message: "adminProductListings.validation.lotNumber" },
            {
                path: ["cataloguePosition"],
                message: "adminProductListings.validation.cataloguePosition",
            },
            {
                path: ["biddingOpens"],
                message: "adminProductListings.validation.invalidDateTime",
            },
        ]);
        expect(
            validateAdminProductListingForm(
                draft({ priceAmount: "", priceCurrency: "JPY" }),
                original,
            ),
        ).toEqual([
            { path: ["priceAmount"], message: "adminProductListings.validation.amountRequired" },
        ]);
        expect(
            validateAdminProductListingForm(
                draft({ priceAmount: "1.5", priceCurrency: "JPY" }),
                original,
            ),
        ).toEqual([
            { path: ["priceAmount"], message: "adminProductListings.validation.amountNoDecimals" },
        ]);
    });

    it("requires a supported language for new text only", () => {
        const untitled = toAdminProductListingFormValues({
            ...listing,
            title: null,
            description: null,
        });

        expect(
            validateAdminProductListingForm({ ...untitled, title: "Walnut cabinet" }, untitled),
        ).toEqual([
            {
                path: ["titleLanguage"],
                message: "adminProductListings.validation.languageRequired",
            },
        ]);
        expect(
            validateAdminProductListingForm(
                { ...untitled, description: "Two doors.", descriptionLanguage: "xx" },
                untitled,
            ),
        ).toEqual([
            {
                path: ["descriptionLanguage"],
                message: "adminProductListings.validation.languageRequired",
            },
        ]);
        expect(validateAdminProductListingForm(draft({ title: "" }), original)).toEqual([]);
    });

    it("feeds the zod schema used by the form", () => {
        const schema = createAdminProductListingFormSchema(original);
        expect(schema.safeParse(original).success).toBe(true);
        expect(schema.safeParse(draft({ url: "" })).success).toBe(false);
    });
});

describe("parseUtcInputValue", () => {
    it("accepts minute or second precision in UTC and rejects impossible dates", () => {
        expect(parseUtcInputValue("")).toBeNull();
        expect(parseUtcInputValue("2026-10-10T08:00")).toEqual(new Date("2026-10-10T08:00:00Z"));
        expect(parseUtcInputValue("2026-10-10T08:00:05")).toEqual(new Date("2026-10-10T08:00:05Z"));
        expect(parseUtcInputValue("2026-02-30T08:00")).toBeUndefined();
        expect(parseUtcInputValue("10/10/2026")).toBeUndefined();
    });
});
