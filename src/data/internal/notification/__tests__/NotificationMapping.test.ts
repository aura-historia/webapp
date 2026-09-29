import { describe, expect, it } from "vitest";
import { mapToInternalNotification, mapToInternalNotificationCollection } from "../Notification.ts";
import {
    notificationDto,
    watchlistPayload,
} from "@/features/notification-center/__tests__/fixtures.ts";

describe("notification mapping", () => {
    it("uses notification identity and omits removed audit fields", () => {
        const result = mapToInternalNotification(notificationDto());
        expect(result.notificationId).toBe("notification-1");
        expect(result.created).toEqual(new Date("2026-09-10T10:00:00Z"));
        for (const key of ["originEventId", "external", "createdBy", "updatedBy"])
            expect(result).not.toHaveProperty(key);
    });
    it("copies prices into domain values without changing source currency", () => {
        const result = mapToInternalNotification(notificationDto());
        expect(result.payload).toMatchObject({
            type: "WATCHLIST",
            change: { oldPrice: { type: "MONETARY", amount: 10000, currency: "USD" } },
        });
        if (result.payload.type !== "WATCHLIST" || result.payload.change.type !== "PRICE_CHANGE")
            throw new Error("Wrong kind");
        expect(result.payload.change.oldPrice).not.toBe(watchlistPayload.change.oldPrice);
    });
    it("maps on-request/null price and nullable availability", () => {
        expect(
            mapToInternalNotification(
                notificationDto({
                    payload: {
                        ...watchlistPayload,
                        change: {
                            type: "PRICE_CHANGE",
                            oldPrice: null,
                            newPrice: { type: "ON_REQUEST" },
                        },
                    },
                }),
            ).payload,
        ).toMatchObject({ change: { oldPrice: null, newPrice: { type: "ON_REQUEST" } } });
        expect(
            mapToInternalNotification(
                notificationDto({
                    kind: "WATCHLIST_AVAILABILITY_CHANGED",
                    payload: {
                        ...watchlistPayload,
                        change: {
                            type: "AVAILABILITY_CHANGE",
                            oldAvailability: null,
                            newAvailability: "SOLD_OUT",
                        },
                    },
                }),
            ).payload,
        ).toMatchObject({ change: { oldAvailability: null, newAvailability: "SOLD_OUT" } });
    });
    it("maps search matches and safely preserves redaction", () => {
        const { change: _change, ...product } = watchlistPayload;
        const result = mapToInternalNotification(
            notificationDto({
                kind: "SEARCH_FILTER_MATCH",
                payload: {
                    ...product,
                    title: null,
                    image: null,
                    productListingTitleSlugId: "",
                    userSearchFilterId: "filter-1",
                    userSearchFilterName: "Vases",
                },
            }),
        );
        expect(result.payload).toMatchObject({
            type: "SEARCH_FILTER",
            productListingId: "listing-1",
            userSearchFilterId: "filter-1",
            productTitle: undefined,
            image: undefined,
            productListingTitleSlugId: undefined,
        });
    });
    it.each(["APPROVED", "REJECTED"] as const)("maps partnership %s", (decision) => {
        expect(
            mapToInternalNotification(
                notificationDto({
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
                }),
            ).payload,
        ).toEqual({
            type: "PARTNER_APPLICATION",
            partnershipApplicationId: "application-1",
            decision,
            listingSourceName: "Shop",
            image: undefined,
        });
    });
    it.each(["invalid", "javascript:alert(1)", "data:image/svg+xml,unsafe"])(
        "rejects unsafe image %s",
        (url) => {
            expect(
                mapToInternalNotification(
                    notificationDto({ payload: { ...watchlistPayload, image: { url } } }),
                ).payload,
            ).toMatchObject({ image: undefined });
        },
    );
    it("serializes the tuple cursor losslessly and does not invent totals", () => {
        const cursor: [string, string] = ["2026-09-10T10:00:00Z", "notification-1"];
        const result = mapToInternalNotificationCollection({
            items: [notificationDto()],
            size: 1,
            searchAfter: cursor,
        });
        expect(result.searchAfter).toBe(JSON.stringify(cursor));
        expect(result).not.toHaveProperty("total");
        expect(
            mapToInternalNotificationCollection({ items: [], size: 0, searchAfter: null })
                .searchAfter,
        ).toBeUndefined();
    });
});
