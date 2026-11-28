import type { ProductListingUserStateData } from "@/client";
import { describe, expect, it } from "vitest";
import {
    mapCollectionListingUserState,
    mapDetailListingUserState,
    mapProductListingUserState,
} from "../UserProductData.ts";

const state: ProductListingUserStateData = {
    watchlist: { watching: true, notifications: false },
    contentVisibility: { showUnassessedOrSensitiveContent: true },
    notification: { unseenNotificationIds: ["ntf_02", "ntf_01"] },
    searchFilter: { matched: true, hidden: false, userSearchFilterId: "filter_01" },
};

describe("mapProductListingUserState", () => {
    it("maps personalized state and derives unread status from unseen IDs", () => {
        expect(mapProductListingUserState(state)).toEqual({
            watchlist: { watching: true, notifications: false },
            contentVisibility: { showUnassessedOrSensitiveContent: true },
            notification: {
                unseenNotificationIds: ["ntf_02", "ntf_01"],
                hasUnseenNotification: true,
            },
            searchFilter: { matched: true, hidden: false, userSearchFilterId: "filter_01" },
        });
    });

    it("derives read state from an empty unseen ID array", () => {
        const result = mapProductListingUserState({
            ...state,
            notification: { unseenNotificationIds: [] },
        });

        expect(result?.notification?.hasUnseenNotification).toBe(false);
        expect(result?.notification?.unseenNotificationIds).toEqual([]);
    });

    it("keeps sections the backend omitted absent instead of defaulting them", () => {
        expect(mapProductListingUserState({ watchlist: state.watchlist })).toEqual({
            watchlist: { watching: true, notifications: false },
        });
        expect(mapProductListingUserState({})).toEqual({});
    });

    it("preserves omitted and null personalized wrappers", () => {
        expect(mapProductListingUserState(undefined)).toBeUndefined();
        expect(mapProductListingUserState(null)).toBeNull();
    });

    it("maps the saved-match shipping valuation instead of passing the DTO through", () => {
        const result = mapProductListingUserState({
            searchFilter: {
                matched: true,
                hidden: false,
                shippingMatchValuation: {
                    interpretation: "WHOLE_COUNTRY_PER_ITEM_FX_V1",
                    fxRateId: "fx_01",
                    capturedAt: "2026-11-20T08:00:00Z",
                    maximumPerItem: { amount: 2500, currency: "USD" },
                },
            },
        });
        expect(result?.searchFilter).toEqual({
            matched: true,
            hidden: false,
            shippingMatchValuation: {
                interpretation: "WHOLE_COUNTRY_PER_ITEM_FX_V1",
                fxRateId: "fx_01",
                capturedAt: new Date("2026-11-20T08:00:00Z"),
                maximumPerItem: { amount: 2500, currency: "USD" },
            },
        });
    });
});

describe("listing user state shipping", () => {
    it("maps the collection summary and the detail assessment separately", () => {
        expect(
            mapCollectionListingUserState({ shipping: { eligibility: "OFFERED" } })?.shipping,
        ).toEqual({ eligibility: "OFFERED" });
        expect(
            mapDetailListingUserState({
                shipping: {
                    destination: { referenceRelease: "iso-codes-4.20.1", country: "AT" },
                    requiredInputs: ["POSTAL_CODE"],
                },
            })?.shipping,
        ).toEqual({
            destination: { referenceRelease: "iso-codes-4.20.1", country: "AT" },
            requiredInputs: ["POSTAL_CODE"],
        });
    });

    it("keeps the section absent when no destination assessment is disclosed", () => {
        expect(mapCollectionListingUserState({ watchlist: state.watchlist })).toEqual({
            watchlist: { watching: true, notifications: false },
        });
        expect(mapDetailListingUserState({})).toEqual({});
        expect(mapCollectionListingUserState(undefined)).toBeUndefined();
    });
});
