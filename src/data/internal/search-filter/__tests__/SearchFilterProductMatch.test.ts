import { describe, expect, it } from "vitest";
import { mapToInternalSearchFilterProductMatch } from "../SearchFilterProductMatch.ts";
import type { SearchFilterProductMatchData } from "@/client";

const baseMatch: SearchFilterProductMatchData = {
    userId: "user-1",
    userSearchFilterId: "filter-1",
    userSearchFilterName: "Barock",
    productListingId: "listing-1",
    originEventId: "event-1",
    feedback: false,
    created: "2026-09-20T12:00:00Z",
    updated: "2026-09-21T12:00:00Z",
};

describe("mapToInternalSearchFilterProductMatch", () => {
    it("maps listing/event identity and preserves false feedback", () => {
        const result = mapToInternalSearchFilterProductMatch(baseMatch);
        expect(result).toMatchObject({
            productListingId: "listing-1",
            originEventId: "event-1",
            feedback: false,
        });
    });

    it("maps API timestamps to domain dates", () => {
        const result = mapToInternalSearchFilterProductMatch(baseMatch);
        expect(result.created).toEqual(new Date("2026-09-20T12:00:00Z"));
        expect(result.updated).toEqual(new Date("2026-09-21T12:00:00Z"));
    });

    it("leaves omitted feedback unset", () => {
        const { feedback: _feedback, ...withoutFeedback } = baseMatch;
        const result = mapToInternalSearchFilterProductMatch(withoutFeedback);
        expect(result.feedback).toBeUndefined();
    });
});
