import { describe, expect, it } from "vitest";
import { getNotificationTypeLabel, getNotificationChangeParts } from "../notificationUtils.ts";
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
    it("handles null and on-request prices", () => {
        const payload = notification({
            payload: {
                ...watchlistPayload,
                change: { type: "PRICE_CHANGE", oldPrice: null, newPrice: { type: "ON_REQUEST" } },
            },
        }).payload;
        expect(getNotificationChangeParts(payload, t, "en")).toEqual({
            from: "product.unknownPrice",
            to: "product.history.values.onRequest",
        });
    });
    it("handles nullable availability", () => {
        const payload = notification({
            kind: "WATCHLIST_AVAILABILITY_CHANGED",
            payload: {
                ...watchlistPayload,
                change: {
                    type: "AVAILABILITY_CHANGE",
                    oldAvailability: null,
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
                image: null,
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
