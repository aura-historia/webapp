import { describe, expect, it } from "vitest";
import {
    getNotificationChangeParts,
    getNotificationPriceDelta,
    getNotificationTypeLabel,
} from "../notificationUtils.ts";
import { notification, watchlistPayload } from "../../__tests__/fixtures.ts";
const t = (key: string) => key;
describe("notification display", () => {
    it("formats immutable source USD prices", () => {
        const payload = notification().payload;
        expect(getNotificationTypeLabel(payload, t)).toBe("notifications.types.priceChange");
        expect(getNotificationChangeParts(payload, t, "en")).toEqual({
            from: "$100.00",
            to: "$80.00",
        });
    });
    it("handles omitted and on-request prices", () => {
        const payload = notification({
            payload: {
                ...watchlistPayload,
                change: { type: "PRICE_CHANGE", newPrice: { type: "ON_REQUEST" } },
            },
        }).payload;
        expect(getNotificationChangeParts(payload, t, "en")).toEqual({
            from: "product.unknownPrice",
            to: "product.history.values.onRequest",
        });
    });
    it("renders ranges and a change of one bound as a price change without a percentage", () => {
        const payload = notification({
            payload: {
                ...watchlistPayload,
                change: {
                    type: "PRICE_CHANGE",
                    oldPrice: { type: "RANGE", currency: "EUR", min: 100000, max: 150000 },
                    newPrice: { type: "RANGE", currency: "EUR", min: 100000, max: 140000 },
                },
            },
        }).payload;
        expect(getNotificationTypeLabel(payload, t)).toBe("notifications.types.priceChange");
        expect(getNotificationChangeParts(payload, t, "en")).toEqual({
            from: "€1,000.00 – €1,500.00",
            to: "€1,000.00 – €1,400.00",
        });
        expect(getNotificationPriceDelta(payload, "en")).toBeNull();
    });
    it("shows no percentage between a single amount and a range", () => {
        const payload = notification({
            payload: {
                ...watchlistPayload,
                change: {
                    type: "PRICE_CHANGE",
                    oldPrice: { type: "MONETARY", currency: "JPY", amount: 150000 },
                    newPrice: { type: "RANGE", currency: "JPY", min: 100000, max: 150000 },
                },
            },
        }).payload;
        expect(getNotificationChangeParts(payload, t, "en")).toEqual({
            from: "¥150,000",
            to: "¥100,000 – ¥150,000",
        });
        expect(getNotificationPriceDelta(payload, "en")).toBeNull();
        expect(getNotificationPriceDelta(notification().payload, "en")).toBe("−20%");
    });
    it("shows a price kind it does not know as an unknown price", () => {
        const payload = notification({
            payload: {
                ...watchlistPayload,
                change: {
                    type: "PRICE_CHANGE",
                    oldPrice: { type: "AUCTION_RESERVE" },
                    newPrice: { type: "MONETARY", amount: 8000, currency: "USD" },
                },
            } as unknown as typeof watchlistPayload,
        }).payload;
        expect(getNotificationChangeParts(payload, t, "en")).toEqual({
            from: "product.unknownPrice",
            to: "$80.00",
        });
    });
    it("handles nullable availability", () => {
        const payload = notification({
            kind: "WATCHLIST_AVAILABILITY_CHANGED",
            payload: {
                ...watchlistPayload,
                change: {
                    type: "AVAILABILITY_CHANGE",
                    newAvailability: "SOLD_OUT",
                },
            },
        }).payload;
        expect(getNotificationTypeLabel(payload, t)).toBe("notifications.types.stateChange");
        expect(getNotificationChangeParts(payload, t, "en")).toEqual({
            from: "product.listingAvailability.unknown",
            to: "product.listingAvailability.soldOut",
        });
    });
    it("renders search filter matches without a change", () => {
        const { change: _change, ...product } = watchlistPayload;
        const payload = notification({
            kind: "SEARCH_FILTER_MATCH",
            payload: { ...product, userSearchFilterId: "filter-1", userSearchFilterName: "Vases" },
        }).payload;
        expect(getNotificationTypeLabel(payload, t)).toBe("notifications.types.newMatch");
        expect(getNotificationChangeParts(payload, t, "en")).toBeNull();
    });
    it.each(["APPROVED", "REJECTED"] as const)("renders partnership %s", (decision) => {
        const payload = notification({
            kind:
                decision === "APPROVED"
                    ? "PARTNERSHIP_APPLICATION_APPROVED"
                    : "PARTNERSHIP_APPLICATION_REJECTED",
            payload: {
                partnershipApplicationId: "application-1",
                decision,
                listingSourceName: "Shop",
            },
        }).payload;
        expect(getNotificationTypeLabel(payload, t)).toBe("notifications.types.partnerApplication");
        expect(getNotificationChangeParts(payload, t, "en")?.to).toBe(
            decision === "APPROVED"
                ? "notifications.types.partnerApplicationStatusApproved"
                : "notifications.types.partnerApplicationStatusRejected",
        );
    });
});
