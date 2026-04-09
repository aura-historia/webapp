import { describe, expect, it } from "vitest";
import type { PersonalizedGetProductData, GetProductEventData } from "@/client";
import {
    type ProductCreatedPayload,
    type ProductPriceChangedPayload,
    type ProductStateChangedPayload,
    type ProductEstimatePriceChangedPayload,
    type ProductUrlChangedPayload,
    type ProductImagesChangedPayload,
    type ProductAuctionTimeChangedPayload,
    type ProductOriginYearChangedPayload,
    type ProductAuthenticityChangedPayload,
    type ProductConditionChangedPayload,
    type ProductProvenanceChangedPayload,
    type ProductRestorationChangedPayload,
    mapToDetailProduct,
} from "../ProductDetails.ts";

const baseApiItem: PersonalizedGetProductData["item"] = {
    productId: "item-123",
    eventId: "event-456",
    shopId: "shop-789",
    shopsProductId: "shop-item-101",
    productSlugId: "test-product-slug",
    shopSlugId: "test-shop-slug",
    shopName: "Test Shop",
    sellerName: "",
    shopType: "AUCTION_HOUSE",
    title: { text: "Test Product", language: "de" },
    price: { offer: { amount: 1000, currency: "EUR" } },
    state: "AVAILABLE",
    url: "https://example.com/item",
    images: [],
    authenticity: "UNKNOWN" as const,
    condition: "UNKNOWN" as const,
    provenance: "UNKNOWN" as const,
    restoration: "UNKNOWN" as const,
    created: "2023-01-01T00:00:00Z",
    updated: "2023-01-02T00:00:00Z",
};

function makeEvent(
    overrides: Partial<GetProductEventData> & Pick<GetProductEventData, "eventType" | "payload">,
): GetProductEventData {
    return {
        productId: "item-123",
        eventId: "event-1",
        shopId: "shop-789",
        shopsProductId: "shop-item-101",
        timestamp: "2023-06-01T10:00:00Z",
        ...overrides,
    };
}

describe("mapToDetailProduct", () => {
    it("should map product without history", () => {
        const apiData: PersonalizedGetProductData = { item: baseApiItem };

        const result = mapToDetailProduct(apiData, undefined, "de");

        expect(result.productId).toBe("item-123");
        expect(result.history).toBeUndefined();
    });

    it("should map state event correctly", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "STATE_CHANGED",
                payload: { oldState: "LISTED" as const, newState: "AVAILABLE" as const },
                timestamp: "2023-01-01T10:00:00Z",
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        expect(result.history).toHaveLength(1);

        const firstEvent = result.history?.[0];
        expect(firstEvent?.eventType).toBe("STATE_CHANGED");

        const payload = firstEvent?.payload as ProductStateChangedPayload;
        expect(payload.oldState).toBe("LISTED");
        expect(payload.newState).toBe("AVAILABLE");
        expect(firstEvent?.timestamp).toEqual(new Date("2023-01-01T10:00:00Z"));
    });

    it("should map price event correctly", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "PRICE_CHANGED",
                eventId: "event-2",
                payload: {
                    oldPrice: { amount: 1000, currency: "EUR" },
                    newPrice: { amount: 900, currency: "EUR" },
                },
                timestamp: "2023-01-02T10:00:00Z",
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        expect(result.history).toHaveLength(1);

        const firstEvent = result.history?.[0];
        expect(firstEvent?.eventType).toBe("PRICE_CHANGED");
        expect(typeof firstEvent?.payload).toBe("object");

        const payload = firstEvent?.payload as ProductPriceChangedPayload;
        expect(payload.oldPrice.amount).toBe(1000);
        expect(payload.newPrice.amount).toBe(900);
        expect(payload.newPrice.currency).toBe("EUR");
    });

    it("should map created event correctly", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "CREATED",
                eventId: "event-0",
                payload: { state: "LISTED" as const, price: { amount: 1000, currency: "EUR" } },
                timestamp: "2023-01-01T08:00:00Z",
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        expect(result.history).toHaveLength(1);

        const firstEvent = result.history?.[0];
        expect(firstEvent?.eventType).toBe("CREATED");

        const payload = firstEvent?.payload as ProductCreatedPayload;
        expect(payload.state).toBe("LISTED");
        expect(payload.price?.amount).toBe(1000);
        expect(payload.price?.currency).toBe("EUR");
    });

    it("should map created event without price", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "CREATED",
                eventId: "event-0",
                payload: { state: "LISTED" as const },
                timestamp: "2023-01-01T08:00:00Z",
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        expect(result.history).toHaveLength(1);

        const firstEvent = result.history?.[0];
        const payload = firstEvent?.payload as ProductCreatedPayload;
        expect(payload.state).toBe("LISTED");
        expect(payload.price).toBeUndefined();
    });

    it("should map multiple events in correct order", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "CREATED",
                eventId: "event-0",
                payload: { state: "LISTED" as const, price: { amount: 1000, currency: "EUR" } },
                timestamp: "2023-01-01T08:00:00Z",
            }),
            makeEvent({
                eventType: "STATE_CHANGED",
                eventId: "event-1",
                payload: { oldState: "LISTED" as const, newState: "AVAILABLE" as const },
                timestamp: "2023-01-01T10:00:00Z",
            }),
            makeEvent({
                eventType: "PRICE_CHANGED",
                eventId: "event-2",
                payload: {
                    oldPrice: { amount: 1000, currency: "EUR" },
                    newPrice: { amount: 800, currency: "EUR" },
                },
                timestamp: "2023-01-02T10:00:00Z",
            }),
            makeEvent({
                eventType: "STATE_CHANGED",
                eventId: "event-3",
                payload: { oldState: "AVAILABLE" as const, newState: "SOLD" as const },
                timestamp: "2023-01-03T10:00:00Z",
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        expect(result.history).toHaveLength(4);
        expect(result.history?.[0]?.eventType).toBe("CREATED");
        expect(result.history?.[1]?.eventType).toBe("STATE_CHANGED");
        expect(result.history?.[2]?.eventType).toBe("PRICE_CHANGED");
        expect(result.history?.[3]?.eventType).toBe("STATE_CHANGED");
    });

    it("should map ESTIMATE_PRICE_CHANGED event with min and max", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "ESTIMATE_PRICE_CHANGED",
                payload: {
                    priceEstimateMin: { amount: 500, currency: "EUR" },
                    priceEstimateMax: { amount: 1500, currency: "EUR" },
                },
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        expect(result.history).toHaveLength(1);
        const payload = result.history?.[0]?.payload as ProductEstimatePriceChangedPayload;
        expect(payload.priceEstimateMin?.amount).toBe(500);
        expect(payload.priceEstimateMax?.amount).toBe(1500);
        expect(payload.priceEstimateMax?.currency).toBe("EUR");
    });

    it("should map ESTIMATE_PRICE_CHANGED event with only min", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "ESTIMATE_PRICE_CHANGED",
                payload: { priceEstimateMin: { amount: 300, currency: "EUR" } },
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        const payload = result.history?.[0]?.payload as ProductEstimatePriceChangedPayload;
        expect(payload.priceEstimateMin?.amount).toBe(300);
        expect(payload.priceEstimateMax).toBeUndefined();
    });

    it("should map ESTIMATE_PRICE_CHANGED event with no prices (both absent)", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "ESTIMATE_PRICE_CHANGED",
                payload: {},
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        const payload = result.history?.[0]?.payload as ProductEstimatePriceChangedPayload;
        expect(payload.priceEstimateMin).toBeUndefined();
        expect(payload.priceEstimateMax).toBeUndefined();
    });

    it("should map URL_CHANGED event", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "URL_CHANGED",
                payload: { url: "https://example.com/new-url" },
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        expect(result.history).toHaveLength(1);
        const payload = result.history?.[0]?.payload as ProductUrlChangedPayload;
        expect(payload.url).toBe("https://example.com/new-url");
    });

    it("should map IMAGES_CHANGED event and set imageCount from images array length", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "IMAGES_CHANGED",
                payload: {
                    images: [
                        { url: "https://example.com/img1.jpg", prohibitedContent: "NONE" },
                        { url: "https://example.com/img2.jpg", prohibitedContent: "NONE" },
                        { url: "https://example.com/img3.jpg", prohibitedContent: "NONE" },
                    ],
                },
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        const payload = result.history?.[0]?.payload as ProductImagesChangedPayload;
        expect(payload.imageCount).toBe(3);
    });

    it("should map IMAGES_CHANGED event with empty images array", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "IMAGES_CHANGED",
                payload: { images: [] },
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        const payload = result.history?.[0]?.payload as ProductImagesChangedPayload;
        expect(payload.imageCount).toBe(0);
    });

    it("should map AUCTION_TIME_CHANGED event with both start and end", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "AUCTION_TIME_CHANGED",
                payload: {
                    auctionStart: "2023-06-15T10:00:00Z",
                    auctionEnd: "2023-06-30T20:00:00Z",
                },
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        const payload = result.history?.[0]?.payload as ProductAuctionTimeChangedPayload;
        expect(payload.auctionStart).toEqual(new Date("2023-06-15T10:00:00Z"));
        expect(payload.auctionEnd).toEqual(new Date("2023-06-30T20:00:00Z"));
    });

    it("should map AUCTION_TIME_CHANGED event with absent start and end", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "AUCTION_TIME_CHANGED",
                payload: {},
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        const payload = result.history?.[0]?.payload as ProductAuctionTimeChangedPayload;
        expect(payload.auctionStart).toBeUndefined();
        expect(payload.auctionEnd).toBeUndefined();
    });

    it("should map ORIGIN_YEAR_CHANGED event with an exact year", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "ORIGIN_YEAR_CHANGED",
                payload: { originYear: { year: 1890 } },
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        const payload = result.history?.[0]?.payload as ProductOriginYearChangedPayload;
        expect(payload.originYear).toBe(1890);
        expect(payload.originYearMin).toBeUndefined();
        expect(payload.originYearMax).toBeUndefined();
    });

    it("should map ORIGIN_YEAR_CHANGED event with a min/max range", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "ORIGIN_YEAR_CHANGED",
                payload: { originYear: { min: 1850, max: 1900 } },
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        const payload = result.history?.[0]?.payload as ProductOriginYearChangedPayload;
        expect(payload.originYear).toBeUndefined();
        expect(payload.originYearMin).toBe(1850);
        expect(payload.originYearMax).toBe(1900);
    });

    it("should map AUTHENTICITY_CHANGED event", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "AUTHENTICITY_CHANGED",
                payload: { authenticity: "ORIGINAL" as const },
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        const payload = result.history?.[0]?.payload as ProductAuthenticityChangedPayload;
        expect(payload.authenticity).toBe("ORIGINAL");
    });

    it("should map CONDITION_CHANGED event", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "CONDITION_CHANGED",
                payload: { condition: "EXCELLENT" as const },
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        const payload = result.history?.[0]?.payload as ProductConditionChangedPayload;
        expect(payload.condition).toBe("EXCELLENT");
    });

    it("should map PROVENANCE_CHANGED event", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "PROVENANCE_CHANGED",
                payload: { provenance: "COMPLETE" as const },
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        const payload = result.history?.[0]?.payload as ProductProvenanceChangedPayload;
        expect(payload.provenance).toBe("COMPLETE");
    });

    it("should map RESTORATION_CHANGED event", () => {
        const historyData: GetProductEventData[] = [
            makeEvent({
                eventType: "RESTORATION_CHANGED",
                payload: { restoration: "MINOR" as const },
            }),
        ];

        const result = mapToDetailProduct({ item: baseApiItem }, historyData, "de");

        const payload = result.history?.[0]?.payload as ProductRestorationChangedPayload;
        expect(payload.restoration).toBe("MINOR");
    });
});
