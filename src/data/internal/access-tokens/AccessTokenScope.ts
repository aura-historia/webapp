/** Supported scope contract shared by own-token and OAuth UI. */
export const ACCESS_TOKEN_SCOPES = [
    "product-listings:write",
    "listing-sources:write",
    "users:read",
    "users:write",
    "access-tokens:read",
    "access-tokens:write",
    "search-filters:write",
    "watchlist:read",
    "watchlist:write",
] as const;

export type AccessTokenScope = (typeof ACCESS_TOKEN_SCOPES)[number];

export const ACCESS_TOKEN_SCOPE_METADATA = {
    "product-listings:write": scopeMetadata("productListingsWrite"),
    "listing-sources:write": scopeMetadata("listingSourcesWrite"),
    "users:read": scopeMetadata("usersRead"),
    "users:write": scopeMetadata("usersWrite"),
    "access-tokens:read": scopeMetadata("accessTokensRead"),
    "access-tokens:write": scopeMetadata("accessTokensWrite"),
    "search-filters:write": scopeMetadata("searchFiltersWrite"),
    "watchlist:read": scopeMetadata("watchlistRead"),
    "watchlist:write": scopeMetadata("watchlistWrite"),
} as const satisfies Record<AccessTokenScope, { label: string; description: string }>;

function scopeMetadata(key: string) {
    return {
        label: `partnerAccessTokens.scopes.${key}`,
        description: `partnerAccessTokens.create.scopeDescriptions.${key}`,
    };
}
