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
    "product-listings:read",
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
            "product-listings:read",
            "product-listings:write",
            "listing-sources:read",
            "listing-sources:write",
            "partnership-applications:read",
            "partnership-applications:write",
        ],
    },
    {
        label: "partnerAccessTokens.scopeGroups.administration",
        administratorLabel: "partnerAccessTokens.scopeGroups.administrationForAdministrators",
        administratorOnly: true,
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
] as const satisfies readonly AccessTokenScopeGroup[];

export interface AccessTokenScopeGroup {
    readonly label: string;
    /** Label shown to administrators, who need no "administrators only" qualifier. */
    readonly administratorLabel?: string;
    /** Scopes that only take effect for administrator accounts; offered to administrators only. */
    readonly administratorOnly?: boolean;
    readonly scopes: readonly AccessTokenScope[];
}

/**
 * Groups offered to an account when it chooses scopes for its own access tokens. UI visibility
 * only: the backend still authorizes every scope against the account's role.
 */
export function accessTokenScopeGroupsFor(
    isAdministrator: boolean,
): readonly AccessTokenScopeGroup[] {
    return ACCESS_TOKEN_SCOPE_GROUPS.filter(
        (group: AccessTokenScopeGroup) => isAdministrator || !group.administratorOnly,
    );
}

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
    "product-listings:read": scopeMetadata("productListingsRead"),
} as const satisfies Record<AccessTokenScope, { label: string; description: string }>;

function scopeMetadata(key: string) {
    return {
        label: `partnerAccessTokens.scopes.${key}`,
        description: `partnerAccessTokens.create.scopeDescriptions.${key}`,
    };
}
