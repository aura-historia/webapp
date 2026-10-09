import type { AdminOverviewData } from "@/client";

export const SUPPORTED_ADMIN_OVERVIEW_SCHEMA_VERSION = 1;

/** Named counters that belong to one aggregate group. Keys keep the API's order. */
export type AdminOverviewBreakdown<Key extends string> = Readonly<Record<Key, number>>;

export type AdminUserTierKey = "free" | "pro" | "ultimate";
export type AdminUserRoleKey = "user" | "admin";
export type AdminApplicationStateKey =
    | "submitted"
    | "inReview"
    | "approved"
    | "rejected"
    | "withdrawn";
export type AdminIngestionMethodKey = "webCrawl" | "shopify" | "woocommerce" | "partnerApi";
export type AdminListingLifecycleKey = "active" | "withdrawn";
export type AdminListingAvailabilityKey =
    | "available"
    | "inStock"
    | "limitedAvailability"
    | "backOrder"
    | "madeToOrder"
    | "preOrder"
    | "preSale"
    | "unavailable"
    | "reserved"
    | "outOfStock"
    | "soldOut";

export type AdminOverview = {
    readonly users: {
        readonly total: number;
        readonly byTier: AdminOverviewBreakdown<AdminUserTierKey>;
        readonly byRole: AdminOverviewBreakdown<AdminUserRoleKey>;
    };
    readonly partnershipApplications: {
        readonly total: number;
        readonly byState: AdminOverviewBreakdown<AdminApplicationStateKey>;
    };
    readonly parties: { readonly total: number };
    readonly partnerships: { readonly total: number };
    readonly listingSources: {
        readonly total: number;
        readonly withoutIngestionMethod: number;
        /**
         * Source-method assignment rows. A source may have several methods, so these values
         * overlap and must not be summed into a distinct source total.
         */
        readonly methodAssignments: AdminOverviewBreakdown<AdminIngestionMethodKey>;
    };
    readonly productListings: {
        readonly total: number;
        readonly byLifecycle: AdminOverviewBreakdown<AdminListingLifecycleKey>;
        /** Availability counts include ACTIVE listings only. */
        readonly activeAvailability: AdminOverviewBreakdown<AdminListingAvailabilityKey>;
        readonly activeWithoutAvailability: number;
    };
};

/** The response does not match the counter semantics this client understands. */
export class InvalidAdminOverviewError extends Error {}

function count(value: number): number {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new InvalidAdminOverviewError(
            "Admin overview counters must be non-negative integers",
        );
    }
    return value;
}

function breakdown<Key extends string>(
    source: Readonly<Record<Key, number>>,
    keys: readonly Key[],
): AdminOverviewBreakdown<Key> {
    return Object.fromEntries(keys.map((key) => [key, count(source[key])])) as Record<Key, number>;
}

export const ADMIN_USER_TIER_KEYS: readonly AdminUserTierKey[] = ["free", "pro", "ultimate"];
export const ADMIN_USER_ROLE_KEYS: readonly AdminUserRoleKey[] = ["user", "admin"];
export const ADMIN_APPLICATION_STATE_KEYS: readonly AdminApplicationStateKey[] = [
    "submitted",
    "inReview",
    "approved",
    "rejected",
    "withdrawn",
];
export const ADMIN_INGESTION_METHOD_KEYS: readonly AdminIngestionMethodKey[] = [
    "webCrawl",
    "shopify",
    "woocommerce",
    "partnerApi",
];
export const ADMIN_LISTING_LIFECYCLE_KEYS: readonly AdminListingLifecycleKey[] = [
    "active",
    "withdrawn",
];
export const ADMIN_LISTING_AVAILABILITY_KEYS: readonly AdminListingAvailabilityKey[] = [
    "available",
    "inStock",
    "limitedAvailability",
    "backOrder",
    "madeToOrder",
    "preOrder",
    "preSale",
    "unavailable",
    "reserved",
    "outOfStock",
    "soldOut",
];

export function mapToAdminOverview(data: AdminOverviewData): AdminOverview {
    // A newer contract version may change counter semantics; refuse it rather than mislabel it.
    if (data.schemaVersion !== SUPPORTED_ADMIN_OVERVIEW_SCHEMA_VERSION) {
        throw new InvalidAdminOverviewError(
            `Unsupported admin overview schema version: ${String(data.schemaVersion)}`,
        );
    }

    return {
        users: {
            total: count(data.users.total),
            byTier: breakdown(data.users.byTier, ADMIN_USER_TIER_KEYS),
            byRole: breakdown(data.users.byRole, ADMIN_USER_ROLE_KEYS),
        },
        partnershipApplications: {
            total: count(data.partnershipApplications.total),
            byState: breakdown(data.partnershipApplications.byState, ADMIN_APPLICATION_STATE_KEYS),
        },
        parties: { total: count(data.parties.total) },
        partnerships: { total: count(data.partnerships.total) },
        listingSources: {
            total: count(data.listingSources.total),
            withoutIngestionMethod: count(data.listingSources.withoutIngestionMethod),
            methodAssignments: breakdown(
                data.listingSources.methodAssignments,
                ADMIN_INGESTION_METHOD_KEYS,
            ),
        },
        productListings: {
            total: count(data.productListings.total),
            byLifecycle: breakdown(data.productListings.byLifecycle, ADMIN_LISTING_LIFECYCLE_KEYS),
            activeAvailability: breakdown(
                data.productListings.activeAvailability,
                ADMIN_LISTING_AVAILABILITY_KEYS,
            ),
            activeWithoutAvailability: count(data.productListings.activeWithoutAvailability),
        },
    };
}
