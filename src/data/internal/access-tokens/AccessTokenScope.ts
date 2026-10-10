/**
 * Supported scope contract shared by own-token and OAuth UI. Mirrors the backend
 * `AccessTokenScopeData` enum. Read and write scopes are independent capabilities: a write scope
 * never implies its read sibling, and no scope grants an account role or source access by itself.
 */
export const ACCESS_TOKEN_SCOPES = [
    "users:read",
    "users:write",
    "access-tokens:read",
    "access-tokens:write",
    "search-filters:read",
    "search-filters:write",
    "notifications:read",
    "notifications:write",
    "watchlist:read",
    "watchlist:write",
    "product-listings:write",
    "listing-sources:read",
    "listing-sources:write",
    "partnership-applications:read",
    "partnership-applications:write",
    "auctions:read",
    "auctions:write",
    "parties:read",
    "parties:write",
    "partnerships:read",
    "partnerships:write",
    "admin-overview:read",
] as const;

export type AccessTokenScope = (typeof ACCESS_TOKEN_SCOPES)[number];

/** Display grouping only; selection and wire values stay per scope. */
export const ACCESS_TOKEN_SCOPE_GROUPS = [
    {
        label: "partnerAccessTokens.scopeGroups.account",
        scopes: ["users:read", "users:write", "access-tokens:read", "access-tokens:write"],
    },
    {
        label: "partnerAccessTokens.scopeGroups.collecting",
        scopes: [
            "search-filters:read",
            "search-filters:write",
            "notifications:read",
            "notifications:write",
            "watchlist:read",
            "watchlist:write",
        ],
    },
    {
        label: "partnerAccessTokens.scopeGroups.partner",
        scopes: [
            "product-listings:write",
            "listing-sources:read",
            "listing-sources:write",
            "partnership-applications:read",
            "partnership-applications:write",
        ],
    },
    {
        label: "partnerAccessTokens.scopeGroups.administration",
        scopes: [
            "auctions:read",
            "auctions:write",
            "parties:read",
            "parties:write",
            "partnerships:read",
            "partnerships:write",
            "admin-overview:read",
        ],
    },
] as const satisfies readonly { label: string; scopes: readonly AccessTokenScope[] }[];

export const ACCESS_TOKEN_SCOPE_METADATA = {
    "users:read": scopeMetadata("usersRead"),
    "users:write": scopeMetadata("usersWrite"),
    "access-tokens:read": scopeMetadata("accessTokensRead"),
    "access-tokens:write": scopeMetadata("accessTokensWrite"),
    "search-filters:read": scopeMetadata("searchFiltersRead"),
    "search-filters:write": scopeMetadata("searchFiltersWrite"),
    "notifications:read": scopeMetadata("notificationsRead"),
    "notifications:write": scopeMetadata("notificationsWrite"),
    "watchlist:read": scopeMetadata("watchlistRead"),
    "watchlist:write": scopeMetadata("watchlistWrite"),
    "product-listings:write": scopeMetadata("productListingsWrite"),
    "listing-sources:read": scopeMetadata("listingSourcesRead"),
    "listing-sources:write": scopeMetadata("listingSourcesWrite"),
    "partnership-applications:read": scopeMetadata("partnershipApplicationsRead"),
    "partnership-applications:write": scopeMetadata("partnershipApplicationsWrite"),
    "auctions:read": scopeMetadata("auctionsRead"),
    "auctions:write": scopeMetadata("auctionsWrite"),
    "parties:read": scopeMetadata("partiesRead"),
    "parties:write": scopeMetadata("partiesWrite"),
    "partnerships:read": scopeMetadata("partnershipsRead"),
    "partnerships:write": scopeMetadata("partnershipsWrite"),
    "admin-overview:read": scopeMetadata("adminOverviewRead"),
} as const satisfies Record<AccessTokenScope, { label: string; description: string }>;

function scopeMetadata(key: string) {
    return {
        label: `partnerAccessTokens.scopes.${key}`,
        description: `partnerAccessTokens.create.scopeDescriptions.${key}`,
    };
}
