import { describe, expect, it } from "vitest";
import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import type {
    ListingPrice,
    ListingPriceValuation,
    ListingPricing,
} from "@/data/internal/product/ProductListingDomain.ts";
import { generateProductJsonLd } from "../productJsonLd.ts";
import { serializeJsonLd } from "@/lib/seo/jsonLd.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";

function makeProduct(overrides: Partial<ProductListingDetail> = {}): ProductListingDetail {
    const price: ListingPrice = { type: "MONETARY", amount: 25_000, currency: "USD" };
    const valuation: ListingPriceValuation = {
        type: "CURRENT",
        fxRateId: "fx-123",
        capturedAt: new Date("2024-01-20T15:30:00Z"),
    };
    const pricing: ListingPricing = {
        source: { price },
        display: { price },
        valuation,
    };

    return {
        productListingId: "listing-123",
        title: "Antique Chair",
        source: { listingSourceId: "source-1", name: "Antique Store", slugId: "antique-store" },
        sourceListingId: "source-listing-456",
        pricing,
        price,
        displayPrice: "$250.00",
        priceValuation: "CURRENT",
        valuation,
        availability: "IN_STOCK",
        lifecycle: "ACTIVE",
        url: new URL("https://example.com/chair"),
        viewUrl: new URL("https://affiliate.example.com/chair"),
        images: [
            { url: new URL("https://example.com/images/chair.jpg"), prohibitedContentType: "NONE" },
        ],
        contentPolicy: { decision: "ALLOWED" },
        auction: null,
        lot: null,
        created: new Date("2024-01-01T00:00:00Z"),
        updated: new Date("2024-01-20T15:30:00Z"),
        ...overrides,
    };
}

describe("productJsonLd", () => {
    it("generates product metadata from the domain model", () => {
        const result = generateProductJsonLd(makeProduct(), {
            canonicalUrl: "https://aura-historia.com/en/products/chair",
        });

        expect(result).toMatchObject({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: "Antique Chair",
            productID: "listing-123",
            sku: "source-listing-456",
            url: "https://aura-historia.com/en/products/chair",
            image: ["https://example.com/images/chair.jpg"],
            dateCreated: "2024-01-01T00:00:00.000Z",
            dateModified: "2024-01-20T15:30:00.000Z",
        });
    });

    it("uses the source's own listing id as sku only within Google's length limit", () => {
        expect(generateProductJsonLd(makeProduct({ sourceListingId: "  4711 " }))).toMatchObject({
            sku: "4711",
        });
        for (const sourceListingId of ["", "   ", "x".repeat(51)]) {
            const result = generateProductJsonLd(makeProduct({ sourceListingId }));
            expect(result, sourceListingId).not.toHaveProperty("sku");
            expect(result).toMatchObject({ productID: "listing-123" });
        }
        expect(
            generateProductJsonLd(makeProduct({ sourceListingId: "x".repeat(50) })),
        ).toHaveProperty("sku");
    });

    it("includes the description only when the detail model carries one", () => {
        expect(
            generateProductJsonLd(
                makeProduct({ description: "Imari charger,\n\nunderglaze blue." }),
            ).description,
        ).toBe("Imari charger, underglaze blue.");
        expect(generateProductJsonLd(makeProduct({ description: undefined }))).not.toHaveProperty(
            "description",
        );
    });

    it("includes a current monetary offer sold by the listing's source", () => {
        const result = generateProductJsonLd(makeProduct(), {
            canonicalUrl: "https://aura-historia.com/en/products/chair",
            sellerUrl: "https://aura-historia.com/en/shops/antique-store",
        });

        expect(result.offers).toEqual({
            "@type": "Offer",
            priceCurrency: "USD",
            price: 250,
            availability: "https://schema.org/InStock",
            url: "https://aura-historia.com/en/products/chair",
            seller: {
                "@type": "Organization",
                name: "Antique Store",
                url: "https://aura-historia.com/en/shops/antique-store",
            },
        });
    });

    it("never publishes shipping, return policy, rating or review data it does not have", () => {
        const result = generateProductJsonLd(makeProduct());

        expect(result.offers).not.toHaveProperty("shippingDetails");
        expect(result.offers).not.toHaveProperty("hasMerchantReturnPolicy");
        expect(result).not.toHaveProperty("aggregateRating");
        expect(result).not.toHaveProperty("review");
    });

    it("falls back to the source listing URL for the offer without a canonical URL", () => {
        expect(generateProductJsonLd(makeProduct()).offers?.url).toBe(
            "https://affiliate.example.com/chair",
        );
    });

    it("describes a listing without a current offer as an ItemPage, not an invalid Product", () => {
        const result = generateProductJsonLd(makeProduct({ lifecycle: "WITHDRAWN" }), {
            canonicalUrl: "https://aura-historia.com/en/products/chair",
        });

        expect(result).toEqual({
            "@context": "https://schema.org/",
            "@type": "ItemPage",
            name: "Antique Chair",
            image: ["https://example.com/images/chair.jpg"],
            url: "https://aura-historia.com/en/products/chair",
            dateCreated: "2024-01-01T00:00:00.000Z",
            dateModified: "2024-01-20T15:30:00.000Z",
        });
    });

    it("omits offers for zero prices", () => {
        const price: ListingPrice = { type: "MONETARY", amount: 0, currency: "USD" };
        const base = makeProduct();
        const product = makeProduct({
            price,
            pricing: { source: { price }, display: { price }, valuation: base.valuation },
        });

        expect(generateProductJsonLd(product)["@type"]).toBe("ItemPage");
    });

    it("omits offers for on-request prices", () => {
        const price: ListingPrice = { type: "ON_REQUEST" };
        const product = makeProduct({
            price,
            pricing: {
                source: { price },
                display: { price },
                valuation: {
                    type: "CURRENT",
                    fxRateId: "fx-123",
                    capturedAt: new Date("2024-01-20T15:30:00Z"),
                },
            },
        });

        expect(generateProductJsonLd(product).offers).toBeUndefined();
    });

    it("omits offers for sale observations and withdrawn listings", () => {
        const saleValuation: ListingPriceValuation = {
            type: "SALE_OBSERVATION",
            fxRateId: "fx-123",
            observedAt: new Date("2024-01-10T00:00:00Z"),
        };
        const saleObserved = makeProduct({
            valuation: saleValuation,
            priceValuation: "SALE_OBSERVATION",
            pricing: {
                source: { price: makeProduct().price },
                display: { price: makeProduct().price },
                valuation: saleValuation,
            },
        });
        expect(generateProductJsonLd(saleObserved).offers).toBeUndefined();

        expect(
            generateProductJsonLd(makeProduct({ lifecycle: "WITHDRAWN" })).offers,
        ).toBeUndefined();
    });

    it("omits unknown availability and uses the fallback image when no images are present", () => {
        const result = generateProductJsonLd(makeProduct({ availability: "UNKNOWN", images: [] }));

        expect(result.offers?.availability).toBeUndefined();
        expect(result.image).toEqual([BANNER_IMAGE_URL]);
    });

    it("serializes to a script body that cannot close the script element", () => {
        const script = serializeJsonLd(
            generateProductJsonLd(makeProduct({ title: "Chair</script><script>alert(1)" })),
        );
        const parsed = JSON.parse(script) as ReturnType<typeof generateProductJsonLd>;

        expect(script).not.toContain("</script>");
        expect(parsed.name).toBe("Chair</script><script>alert(1)");
        expect(parsed.offers?.price).toBe(250);
    });

    it("excludes sensitive and unassessed images from public structured data", () => {
        const product = makeProduct({
            images: [
                {
                    url: new URL("https://example.com/sensitive.jpg"),
                    prohibitedContentType: "NAZI_GERMANY",
                },
                {
                    url: new URL("https://example.com/unassessed.jpg"),
                    prohibitedContentType: "UNKNOWN",
                },
            ],
        });
        expect(generateProductJsonLd(product).image).toEqual([BANNER_IMAGE_URL]);
    });

    it.each([
        ["KRW", 12_345, 12_345],
        ["SEK", 12_345, 123.45],
        ["HUF", 12_345, 123.45],
    ] as const)(
        "publishes %s offer prices in major units with a matching currency",
        (currency, amount, major) => {
            const source: ListingPrice = { type: "MONETARY", amount: 50_000, currency: "EUR" };
            const display: ListingPrice = { type: "MONETARY", amount, currency };
            const base = makeProduct();
            const product = makeProduct({
                price: display,
                pricing: {
                    source: { price: source },
                    display: { price: display },
                    valuation: base.valuation,
                },
            });

            const offers = generateProductJsonLd(product).offers;
            expect(offers?.priceCurrency).toBe(currency);
            expect(offers?.price).toBe(major);
        },
    );

    it("omits offers when the requested display price is missing instead of using the source price", () => {
        const source: ListingPrice = { type: "MONETARY", amount: 50_000, currency: "EUR" };
        const base = makeProduct();
        for (const displayPrice of [null, undefined]) {
            const product = makeProduct({
                pricing: {
                    source: { price: source },
                    display: { price: displayPrice },
                    valuation: base.valuation,
                },
            });
            expect(generateProductJsonLd(product).offers).toBeUndefined();
        }
    });
});
