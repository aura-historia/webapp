import { describe, expect, it } from "vitest";
import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import type {
    ListingPrice,
    ListingPriceValuation,
    ListingPricing,
} from "@/data/internal/product/ProductListingDomain.ts";
import { generateProductJsonLd, generateProductJsonLdScript } from "../productJsonLd.ts";
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
        const result = generateProductJsonLd(
            makeProduct(),
            "https://aura-historia.com/products/chair",
        );

        expect(result).toMatchObject({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: "Antique Chair",
            sku: "listing-123",
            url: "https://aura-historia.com/products/chair",
            image: ["https://example.com/images/chair.jpg"],
            dateCreated: "2024-01-01T00:00:00.000Z",
            dateModified: "2024-01-20T15:30:00.000Z",
        });
    });

    it("includes a current monetary offer and mapped availability", () => {
        const result = generateProductJsonLd(makeProduct());

        expect(result.offers).toEqual({
            "@type": "Offer",
            priceCurrency: "USD",
            price: 250,
            availability: "https://schema.org/InStock",
            url: "https://affiliate.example.com/chair",
        });
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

    it("serializes a domain model to a JSON-LD script", () => {
        const script = generateProductJsonLdScript(makeProduct());
        const parsed = JSON.parse(script) as ReturnType<typeof generateProductJsonLd>;

        expect(parsed.name).toBe("Antique Chair");
        expect(parsed.offers?.price).toBe(250);
    });
});
