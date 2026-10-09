import { describe, expect, it } from "vitest";
import { mapAdminAuction } from "../AdminAuction.ts";

describe("mapAdminAuction", () => {
    it("keeps nullable auction facts absent and parses timestamps", () => {
        const auction = mapAdminAuction({
            auctionId: "auc_01",
            listingSourceId: "ls_01",
            sourceAuctionId: "sale-42",
            name: null,
            catalogueUrl: null,
            format: null,
            schedule: {
                biddingOpens: null,
                liveStarts: "2026-11-02T10:00:00Z",
                lotsBeginClosing: null,
                scheduledEnd: null,
            },
            reportedStatus: null,
            reportedLotCount: null,
            expectedVersion: 3,
            created: "2026-10-01T08:00:00Z",
            updated: "2026-10-02T09:30:00Z",
        });

        expect(auction).toEqual({
            auctionId: "auc_01",
            listingSourceId: "ls_01",
            sourceAuctionId: "sale-42",
            name: null,
            catalogueUrl: null,
            format: null,
            schedule: {
                biddingOpens: null,
                liveStarts: new Date("2026-11-02T10:00:00Z"),
                lotsBeginClosing: null,
                scheduledEnd: null,
            },
            reportedStatus: null,
            reportedLotCount: null,
            expectedVersion: 3,
            created: new Date("2026-10-01T08:00:00Z"),
            updated: new Date("2026-10-02T09:30:00Z"),
        });
    });
});
