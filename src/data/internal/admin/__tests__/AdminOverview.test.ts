import { describe, expect, it } from "vitest";
import type { AdminOverviewData } from "@/client";
import { InvalidAdminOverviewError, mapToAdminOverview } from "../AdminOverview.ts";
import { adminOverviewFixture } from "./adminOverviewFixture.ts";

describe("mapToAdminOverview", () => {
    it("maps every aggregate group and keeps zero counts", () => {
        const overview = mapToAdminOverview(adminOverviewFixture);

        expect(overview.users).toEqual({
            total: 12,
            byTier: { free: 9, pro: 2, ultimate: 1 },
            byRole: { user: 11, admin: 1 },
        });
        expect(overview.partnershipApplications.byState.rejected).toBe(0);
        expect(overview.parties.total).toBe(0);
        expect(overview.partnerships.total).toBe(2);
        expect(overview.productListings.activeAvailability.soldOut).toBe(4);
        expect(overview.productListings.activeWithoutAvailability).toBe(2);
    });

    it("keeps overlapping method assignments separate from the distinct source total", () => {
        const overview = mapToAdminOverview(adminOverviewFixture);

        expect(overview.listingSources.total).toBe(3);
        expect(overview.listingSources.withoutIngestionMethod).toBe(1);
        // 4 assignments across 3 sources: values are passed through, never normalised.
        expect(overview.listingSources.methodAssignments).toEqual({
            webCrawl: 2,
            shopify: 1,
            woocommerce: 0,
            partnerApi: 1,
        });
    });

    it("rejects unsupported schema versions", () => {
        expect(() =>
            mapToAdminOverview({
                ...adminOverviewFixture,
                schemaVersion: 2,
            } as unknown as AdminOverviewData),
        ).toThrow(InvalidAdminOverviewError);
    });

    it("rejects counters that are not non-negative integers", () => {
        expect(() =>
            mapToAdminOverview({
                ...adminOverviewFixture,
                parties: { total: -1 },
            }),
        ).toThrow(InvalidAdminOverviewError);
        expect(() =>
            mapToAdminOverview({
                ...adminOverviewFixture,
                users: {
                    ...adminOverviewFixture.users,
                    byTier: { free: 1.5, pro: 0, ultimate: 0 },
                },
            }),
        ).toThrow(InvalidAdminOverviewError);
    });
});
