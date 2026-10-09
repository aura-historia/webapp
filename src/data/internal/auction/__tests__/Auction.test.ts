import { describe, expect, it } from "vitest";
import { mapPublicAuction, mapPublicAuctionDirectory, serializeAuctionCursor } from "../Auction.ts";

describe("auction mappings", () => {
    it("preserves a complete directory cursor and leaves terminal cursors absent", () => {
        const cursor = {
            created: "2026-10-08T13:20:00Z",
            auctionId: "auc_01",
            scope: {
                listingSourceId: "ls_01",
                format: "TIMED" as const,
                reportedStatus: "SCHEDULED" as const,
                timeRole: "LIVE_STARTS" as const,
                from: "2026-10-01T00:00:00Z",
                to: "2026-11-01T00:00:00Z",
            },
        };

        expect(serializeAuctionCursor(cursor)).toBe(JSON.stringify(cursor));
        expect(mapPublicAuctionDirectory({ items: [], pageSize: 21 })).toEqual({
            items: [],
            pageSize: 21,
        });
    });

    it("keeps nullable auction facts absent and rejects non-HTTP presentation URLs", () => {
        const auction = mapPublicAuction({
            auctionId: "auc_01",
            listingSource: { listingSourceId: "ls_01", name: "House", slugId: "house" },
            name: null,
            catalogueUrl: "javascript:alert(1)",
            viewUrl: null,
            format: null,
            schedule: {
                biddingOpens: null,
                liveStarts: null,
                lotsBeginClosing: null,
                scheduledEnd: null,
            },
            reportedStatus: null,
            reportedLotCount: null,
            visibleListingCount: 0,
        });

        expect(auction).toMatchObject({
            name: null,
            catalogueUrl: null,
            viewUrl: null,
            format: null,
            schedule: {
                biddingOpens: null,
                liveStarts: null,
                lotsBeginClosing: null,
                scheduledEnd: null,
            },
            reportedStatus: null,
            reportedLotCount: null,
            visibleListingCount: 0,
        });
    });
});
