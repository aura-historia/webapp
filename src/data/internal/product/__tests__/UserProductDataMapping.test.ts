import type { ProductListingUserStateData } from "@/client";
import { describe, expect, it } from "vitest";
import { mapProductListingUserState } from "../UserProductData.ts";

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

        expect(result?.notification.hasUnseenNotification).toBe(false);
        expect(result?.notification.unseenNotificationIds).toEqual([]);
    });

    it("preserves omitted and null personalized wrappers", () => {
        expect(mapProductListingUserState(undefined)).toBeUndefined();
        expect(mapProductListingUserState(null)).toBeNull();
    });
});
