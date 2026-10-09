import type { AdminOverviewData } from "@/client";

export const adminOverviewFixture: AdminOverviewData = {
    schemaVersion: 1,
    users: { total: 12, byTier: { free: 9, pro: 2, ultimate: 1 }, byRole: { user: 11, admin: 1 } },
    partnershipApplications: {
        total: 5,
        byState: { submitted: 2, inReview: 1, approved: 1, rejected: 0, withdrawn: 1 },
    },
    parties: { total: 0 },
    listingSources: {
        total: 3,
        withoutIngestionMethod: 1,
        methodAssignments: { webCrawl: 2, shopify: 1, woocommerce: 0, partnerApi: 1 },
    },
    partnerships: { total: 2 },
    productListings: {
        total: 40,
        byLifecycle: { active: 30, withdrawn: 10 },
        activeAvailability: {
            available: 20,
            inStock: 0,
            limitedAvailability: 1,
            backOrder: 0,
            madeToOrder: 0,
            preOrder: 0,
            preSale: 0,
            unavailable: 2,
            reserved: 1,
            outOfStock: 0,
            soldOut: 4,
        },
        activeWithoutAvailability: 2,
    },
};
