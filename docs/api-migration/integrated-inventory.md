# Final operation and model inventory

Generated with `pnpm exec python scripts/generate_migration_inventory.py` from the pinned integration contract. The September 10 inventories remain historical. See [integration release gate](integration-release-gate.md) for scope decisions and validation.

- Contract bytes SHA-256: `d110a79cd1086186d406db1ad3daa9b366df4c07a1a18475d6ac9077865226b6`.
- Current contract: 104 operations, 192 component schemas; every operation is generated.
- September 10 contract: 87 operations, 163 component schemas.

## Operation-to-feature checklist

Runtime references below exclude tests and generated files. A generated SDK capability is not evidence of an implemented UI. External/protocol operations are intentionally outside browser workflows.

| Operation | Method and path | Since September 10 | Coverage / owner |
|---|---|---|---|
| `addWatchlistProduct` | `POST /api/v1/me/watchlist` | retained | Integrated: `src/features/watchlist/api/useWatchlistMutation.ts` |
| `adminCreateListingSource` | `POST /api/v1/admin/listing-sources` | changed | Integrated: `src/features/admin/listing-source-management/api/useAdminListingSources.ts` |
| `adminCreateOAuthClient` | `POST /api/v1/admin/oauth-clients` | retained | Integrated: `src/features/admin/oauth-client-management/api/useAdminOAuthClients.ts` |
| `adminCreateParty` | `POST /api/v1/admin/parties` | retained | Integrated: `src/features/admin/party-management/api/useAdminParties.ts` |
| `adminDecidePartnershipApplication` | `POST /api/v1/admin/partnership-applications/{partnershipApplicationId}/decision` | retained | Integrated: `src/features/admin/partner-application-management/api/useAdminPartnershipApplications.ts` |
| `adminDeleteListingSource` | `DELETE /api/v1/admin/listing-sources/{listingSourceId}` | retained | Integrated: `src/features/admin/listing-source-management/api/useAdminListingSources.ts` |
| `adminDeleteOAuthClient` | `DELETE /api/v1/admin/oauth-clients/{clientId}` | retained | Integrated: `src/features/admin/oauth-client-management/api/useAdminOAuthClients.ts` |
| `adminDeleteParty` | `DELETE /api/v1/admin/parties/{partyId}` | retained | Integrated: `src/features/admin/party-management/api/useAdminParties.ts` |
| `adminDeleteUser` | `DELETE /api/v1/admin/users/{userId}` | retained | Integrated: `src/features/admin/user-management/api/useAdminUsers.ts` |
| `adminDeleteUserAccessToken` | `DELETE /api/v1/admin/users/{userId}/access-tokens/{accessTokenId}` | retained | Integrated: `src/features/admin/user-management/api/useAdminUserSecurity.ts` |
| `adminDeleteUserAccessTokens` | `DELETE /api/v1/admin/users/{userId}/access-tokens` | retained | Integrated: `src/features/admin/user-management/api/useAdminUserSecurity.ts` |
| `adminDissolvePartnership` | `DELETE /api/v1/admin/partnerships/{partnershipId}` | retained | Integrated: `src/features/admin/partnership-management/api/useAdminPartnerships.ts` |
| `adminGetListingSource` | `GET /api/v1/admin/listing-sources/{listingSourceId}` | retained | Integrated: `src/features/admin/listing-source-management/api/useAdminListingSources.ts` |
| `adminGetOAuthClient` | `GET /api/v1/admin/oauth-clients/{clientId}` | retained | Integrated: `src/features/admin/oauth-client-management/api/useAdminOAuthClients.ts` |
| `adminGetPartnership` | `GET /api/v1/admin/partnerships/{partnershipId}` | retained | Integrated: `src/features/admin/partnership-management/api/useAdminPartnerships.ts` |
| `adminGetPartnershipApplication` | `GET /api/v1/admin/partnership-applications/{partnershipApplicationId}` | retained | Integrated: `src/features/admin/partner-application-management/api/useAdminPartnershipApplications.ts` |
| `adminGetParty` | `GET /api/v1/admin/parties/{partyId}` | retained | Integrated: `src/features/admin/party-management/api/useAdminParties.ts` |
| `adminGetUser` | `GET /api/v1/admin/users/{userId}` | retained | Integrated: `src/features/admin/user-management/api/useAdminUsers.ts` |
| `adminGrantPartnershipListingSource` | `PUT /api/v1/admin/partnerships/{partnershipId}/listing-source-grants/{listingSourceId}` | retained | Integrated: `src/features/admin/partnership-management/api/useAdminPartnerships.ts` |
| `adminGrantPartnershipMembership` | `PUT /api/v1/admin/partnerships/{partnershipId}/members/{userId}` | retained | Integrated: `src/features/admin/partnership-management/api/useAdminPartnerships.ts` |
| `adminListOAuthClients` | `GET /api/v1/admin/oauth-clients` | retained | Integrated: `src/features/admin/oauth-client-management/api/useAdminOAuthClients.ts` |
| `adminListUserAccessTokens` | `GET /api/v1/admin/users/{userId}/access-tokens` | retained | Integrated: `src/features/admin/user-management/api/useAdminUserSecurity.ts` |
| `adminMarkPartnershipApplicationInReview` | `PATCH /api/v1/admin/partnership-applications/{partnershipApplicationId}` | retained | Integrated: `src/features/admin/partner-application-management/api/useAdminPartnershipApplications.ts` |
| `adminPatchOAuthClient` | `PATCH /api/v1/admin/oauth-clients/{clientId}` | retained | Integrated: `src/features/admin/oauth-client-management/api/useAdminOAuthClients.ts` |
| `adminPatchUser` | `PATCH /api/v1/admin/users/{userId}` | retained | Integrated: `src/features/admin/user-management/api/useAdminUsers.ts` |
| `adminRevokePartnershipListingSource` | `DELETE /api/v1/admin/partnerships/{partnershipId}/listing-source-grants/{listingSourceId}` | retained | Integrated: `src/features/admin/partnership-management/api/useAdminPartnerships.ts` |
| `adminRevokePartnershipMembership` | `DELETE /api/v1/admin/partnerships/{partnershipId}/members/{userId}` | retained | Integrated: `src/features/admin/partnership-management/api/useAdminPartnerships.ts` |
| `adminRevokeUserSessions` | `POST /api/v1/admin/users/{userId}/sessions/revoke` | retained | Integrated: `src/features/admin/user-management/api/useAdminUserSecurity.ts` |
| `adminSearchListingSources` | `GET /api/v1/admin/listing-sources` | retained | Integrated: `src/features/admin/listing-source-management/api/useAdminListingSources.ts`, `src/features/admin/auction-management/api/useAdminAuctions.ts` |
| `adminSearchParties` | `GET /api/v1/admin/parties` | retained | Integrated: `src/features/admin/party-management/api/useAdminParties.ts` |
| `adminSearchPartnershipApplications` | `GET /api/v1/admin/partnership-applications` | retained | Integrated: `src/features/admin/partner-application-management/api/useAdminPartnershipApplications.ts` |
| `adminSearchPartnerships` | `GET /api/v1/admin/partnerships` | retained | Integrated: `src/features/admin/partnership-management/api/useAdminPartnerships.ts` |
| `adminSearchUsers` | `GET /api/v1/admin/users` | changed | Integrated: `src/features/admin/user-management/api/useAdminUsers.ts`, `src/features/admin/user-management/lib/adminUserSearch.ts` |
| `adminSuspendUser` | `PUT /api/v1/admin/users/{userId}/suspension` | retained | Integrated: `src/features/admin/user-management/api/useAdminUserSecurity.ts` |
| `adminUnsuspendUser` | `DELETE /api/v1/admin/users/{userId}/suspension` | retained | Integrated: `src/features/admin/user-management/api/useAdminUserSecurity.ts` |
| `adminUpdateListingSource` | `PATCH /api/v1/admin/listing-sources/{listingSourceId}` | changed | Integrated: `src/features/admin/listing-source-management/api/useAdminListingSources.ts` |
| `adminUpdateParty` | `PATCH /api/v1/admin/parties/{partyId}` | retained | Integrated: `src/features/admin/party-management/api/useAdminParties.ts` |
| `confirmNewsletterSubscription` | `POST /api/v1/newsletter-subscriptions/confirm` | added | Integrated: `src/features/newsletter/hooks/useNewsletterConfirmation.ts` |
| `createAdminAuction` | `POST /api/v1/admin/auctions` | added | Integrated: `src/features/admin/auction-management/api/useAdminAuctions.ts` |
| `createUserSearchFilter` | `POST /api/v1/me/search-filters` | retained | Integrated: `src/features/saved-searches/api/useCreateUserSearchFilter.ts` |
| `deleteAsyncPartnerProductListings` | `DELETE /api/v1/listing-sources/{listingSourceId}/product-listings/async` | added | External partner ingestion; synchronous guide/reference (MIG-13), async SDK capability outside that guide |
| `deleteMyAccessToken` | `DELETE /api/v1/me/access-tokens/{accessTokenId}` | retained | Integrated: `src/features/partner/access-token-management/api/useAccessTokens.ts` |
| `deleteNotification` | `DELETE /api/v1/me/notifications/{notificationId}` | retained | Integrated: `src/features/notification-center/api/useDeleteNotification.ts`, `src/features/notification-center/components/NotificationCard.tsx`, `src/features/notification-center/components/NotificationItem.tsx` |
| `deleteNotifications` | `DELETE /api/v1/me/notifications` | retained | Integrated: `src/features/notification-center/api/useDeleteAllNotifications.ts` |
| `deleteOwnPartnershipApplication` | `DELETE /api/v1/me/partnership-applications/{partnershipApplicationId}` | retained | Integrated: `src/features/partner/application-management/api/usePartnerApplications.ts` |
| `deletePartnerProductListings` | `DELETE /api/v1/listing-sources/{listingSourceId}/product-listings` | retained | External partner ingestion; synchronous guide/reference (MIG-13), async SDK capability outside that guide |
| `deleteUser` | `DELETE /api/v1/me` | retained | Integrated: `src/features/account-management/hooks/useDeleteUserAccount.ts` |
| `deleteUserSearchFilter` | `DELETE /api/v1/me/search-filters/{userSearchFilterId}` | retained | Integrated: `src/features/saved-searches/api/useDeleteUserSearchFilter.ts` |
| `deleteWatchlistProduct` | `DELETE /api/v1/me/watchlist/{productListingId}` | retained | Integrated: `src/features/watchlist/api/useWatchlistMutation.ts` |
| `getAdminAuction` | `GET /api/v1/admin/auctions/{auctionId}` | added | Integrated: `src/features/admin/auction-management/api/useAdminAuctions.ts` |
| `getAdminOverview` | `GET /api/v1/admin/overview` | retained | Integrated: `src/features/admin/overview/api/useAdminOverview.ts` |
| `getAuction` | `GET /api/v1/auctions/{auctionId}` | added | Deferred standalone public auction pages — MIG-25; listing auction summaries retained |
| `getAuctionCatalogue` | `GET /api/v1/auctions/{auctionId}/product-listings` | added | Deferred standalone public auction pages — MIG-25; listing auction summaries retained |
| `getHealth` | `GET /api/v1/health` | added | Infrastructure probes; SDK only, no browser workflow |
| `getMyAccessToken` | `GET /api/v1/me/access-tokens/{accessTokenId}` | retained | Own-token detail SDK; UI uses own-token collection (MIG-11) |
| `getMyAccessTokens` | `GET /api/v1/me/access-tokens` | retained | Integrated: `src/features/partner/access-token-management/api/useAccessTokens.ts` |
| `getMyListingSources` | `GET /api/v1/me/listing-sources` | retained | Integrated: `src/features/partner/common/api/useOwnListingSources.ts` |
| `getMyPartnershipApplications` | `GET /api/v1/me/partnership-applications` | retained | Integrated: `src/features/partner/application-management/api/usePartnerApplications.ts` |
| `getOAuthConsentClient` | `GET /api/v1/oauth/clients/{clientId}` | added | Integrated: `src/features/oauth/api/oauthConsentMetadata.ts`, `src/features/oauth/hooks/useOAuthClient.ts` |
| `getOwnPartnershipApplication` | `GET /api/v1/me/partnership-applications/{partnershipApplicationId}` | retained | Integrated: `src/features/partner/application-management/api/usePartnerApplications.ts` |
| `getProductListing` | `GET /api/v1/product-listings/{productListingId}` | changed | Integrated: `src/features/watchlist/api/watchlistCache.ts`, `src/features/authentication/lib/clearViewerScopedQueries.ts` |
| `getProductListingByTitleSlug` | `GET /api/v1/product-listings/by-slug/{productListingTitleSlugId}` | changed | Integrated: `src/routes/$lng.products.$productListingTitleSlugId.tsx`, `src/features/watchlist/api/watchlistCache.ts`, `src/features/authentication/lib/clearViewerScopedQueries.ts` |
| `getProductListingHistory` | `GET /api/v1/product-listings/{productListingId}/history` | changed | Integrated: `src/features/product/detail/api/productListingHistoryQuery.ts` |
| `getPublicListingSourceBySlug` | `GET /api/v1/listing-sources/by-slug/{listingSourceSlugId}` | added | Integrated: `src/routes/$lng.shops.$shopSlugId.index.tsx`, `src/features/admin/listing-source-management/api/useAdminListingSources.ts` |
| `getReadiness` | `GET /api/v1/ready` | added | Infrastructure probes; SDK only, no browser workflow |
| `getSimilarProductListings` | `GET /api/v1/product-listings/{productListingId}/similar` | changed | Integrated: `src/features/product/detail/api/useSimilarProducts.ts` |
| `getUserAccount` | `GET /api/v1/me/account` | retained | Integrated: `src/features/account-management/hooks/useUserAccount.ts` |
| `getUserSearchFilter` | `GET /api/v1/me/search-filters/{userSearchFilterId}` | retained | Integrated: `src/features/saved-searches/api/useUserSearchFilter.ts` |
| `getUserSearchFilters` | `GET /api/v1/me/search-filters` | retained | Integrated: `src/features/saved-searches/api/useUserSearchFilters.ts` |
| `getWatchlistProductListings` | `GET /api/v1/me/watchlist` | changed | Integrated: `src/features/watchlist/api/useWatchlist.ts` |
| `listAuctions` | `GET /api/v1/auctions` | added | Deferred standalone public auction pages — MIG-25; listing auction summaries retained |
| `listNotifications` | `GET /api/v1/me/notifications` | retained | Integrated: `src/features/notification-center/api/useNotifications.ts` |
| `listSearchFilterMatches` | `GET /api/v1/me/search-filters/{userSearchFilterId}/matches` | retained | Integrated: `src/features/saved-searches/api/useSearchFilterMatchedProducts.ts` |
| `oauthAuthorize` | `GET /api/v1/oauth/authorize` | retained | OAuth protocol capability; server/client consumers preserve existing broker/consent contracts (MIG-12) |
| `oauthIntrospect` | `POST /api/v1/oauth/introspect` | retained | OAuth protocol capability; server/client consumers preserve existing broker/consent contracts (MIG-12) |
| `oauthRevoke` | `POST /api/v1/oauth/revoke` | retained | OAuth protocol capability; server/client consumers preserve existing broker/consent contracts (MIG-12) |
| `oauthToken` | `POST /api/v1/oauth/token` | retained | OAuth protocol capability; server/client consumers preserve existing broker/consent contracts (MIG-12) |
| `oauthTokenByThirdPartyCode` | `GET /api/v1/oauth/tokens/by-third-party-code/{thirdPartyCode}` | retained | OAuth protocol capability; server/client consumers preserve existing broker/consent contracts (MIG-12) |
| `patchAsyncPartnerProductListings` | `PATCH /api/v1/listing-sources/{listingSourceId}/product-listings/async` | added | External partner ingestion; synchronous guide/reference (MIG-13), async SDK capability outside that guide |
| `patchMyAccessToken` | `PATCH /api/v1/me/access-tokens` | retained | Integrated: `src/features/partner/access-token-management/api/useAccessTokens.ts` |
| `patchPartnerProductListings` | `PATCH /api/v1/listing-sources/{listingSourceId}/product-listings` | changed | External partner ingestion; synchronous guide/reference (MIG-13), async SDK capability outside that guide |
| `patchWatchlistProduct` | `PATCH /api/v1/me/watchlist/{productListingId}` | retained | Integrated: `src/features/watchlist/api/useWatchlistNotificationMutation.ts`, `src/features/watchlist/api/useWatchlistStateMutation.ts` |
| `postAsyncPartnerProductListings` | `POST /api/v1/listing-sources/{listingSourceId}/product-listings/async` | added | External partner ingestion; synchronous guide/reference (MIG-13), async SDK capability outside that guide |
| `postBillingCheckout` | `POST /api/v1/me/billing/checkout` | retained | Preserved billing SDK contract; browser workflow uses postBillingManage |
| `postBillingManage` | `POST /api/v1/me/billing/manage` | retained | Integrated: `src/features/billing/hooks/useStripeBilling.ts` |
| `postBillingPortal` | `POST /api/v1/me/billing/portal` | retained | Preserved billing SDK contract; browser workflow uses postBillingManage |
| `postMyAccessToken` | `POST /api/v1/me/access-tokens` | changed | Integrated: `src/features/partner/access-token-management/api/useAccessTokens.ts` |
| `postPartnerProductListings` | `POST /api/v1/listing-sources/{listingSourceId}/product-listings` | changed | External partner ingestion; synchronous guide/reference (MIG-13), async SDK capability outside that guide |
| `postPartnershipApplication` | `POST /api/v1/me/partnership-applications` | retained | Integrated: `src/features/partner/application-management/api/usePartnerApplications.ts` |
| `postWoocommerceWebhook` | `POST /api/v1/webhooks/woocommerce/{listingSourceId}` | changed | External partner ingestion; synchronous guide/reference (MIG-13), async SDK capability outside that guide |
| `putAsyncPartnerProductListings` | `PUT /api/v1/listing-sources/{listingSourceId}/product-listings/async` | added | External partner ingestion; synchronous guide/reference (MIG-13), async SDK capability outside that guide |
| `putNewsletterSubscription` | `PUT /api/v1/newsletter-subscriptions` | changed | Integrated: `src/features/newsletter/api/useNewsletterSubscription.ts` |
| `putPartnerProductListings` | `PUT /api/v1/listing-sources/{listingSourceId}/product-listings` | changed | External partner ingestion; synchronous guide/reference (MIG-13), async SDK capability outside that guide |
| `putShopifyListingSourceIngestionConfiguration` | `PUT /api/v1/listing-sources/{listingSourceId}/ingestion-configurations/shopify` | added | External provider setup; SDK and explicit listing-sources:write permission (MIG-11/12), no settings UI |
| `putWoocommerceListingSourceIngestionConfiguration` | `PUT /api/v1/listing-sources/{listingSourceId}/ingestion-configurations/woocommerce` | added | External provider setup; SDK and explicit listing-sources:write permission (MIG-11/12), no settings UI |
| `searchPublicListingSources` | `GET /api/v1/listing-sources` | added | Integrated: `src/features/search/shops/api/useShopSearch.ts`, `src/features/search/products/hooks/useMerchantSearch.tsx`, `src/features/partner/application-management/api/useApplicationListingSourceSearch.ts`, `src/features/admin/listing-source-management/api/useAdminListingSources.ts` |
| `simpleSearchProductListings` | `GET /api/v1/product-listings` | changed | Integrated: `src/features/shop/profile/hooks/useShopProducts.ts`, `src/features/search/products/hooks/useSearch.ts`, `src/features/saved-searches/api/useSearchFilterPreviewProducts.ts`, `src/features/product/detail/api/useDealerProducts.ts`, `src/features/landing/components/recently-added-section/RecentlyAddedClientSection.tsx`, `src/features/authentication/lib/clearViewerScopedQueries.ts` |
| `updateAdminAuction` | `PATCH /api/v1/admin/auctions/{auctionId}` | added | Integrated: `src/features/admin/auction-management/api/useAdminAuctions.ts` |
| `updateAllNotificationsSeen` | `PATCH /api/v1/me/notifications/all` | retained | Integrated: `src/features/notification-center/api/useMarkAllNotificationsSeen.ts` |
| `updateNotificationSeen` | `PATCH /api/v1/me/notifications/{notificationId}` | retained | Integrated: `src/features/notification-center/api/useMarkNotificationSeen.ts` |
| `updateNotificationsSeen` | `PATCH /api/v1/me/notifications` | retained | Integrated: `src/features/notification-center/api/useMarkNotificationsSeen.ts` |
| `updateSearchFilterMatchFeedback` | `PATCH /api/v1/me/search-filters/{userSearchFilterId}/matches/{productListingId}` | retained | Integrated: `src/features/saved-searches/api/useSearchFilterMatchFeedback.ts` |
| `updateUserAccount` | `PATCH /api/v1/me/account` | retained | Integrated: `src/features/account-management/hooks/usePatchUserAccount.ts` |
| `updateUserSearchFilter` | `PATCH /api/v1/me/search-filters/{userSearchFilterId}` | retained | Integrated: `src/features/saved-searches/api/useUpdateUserSearchFilter.ts` |

## Baseline SDK operation disposition

Every baseline operation is paired with a current successor or an explicit removal/replacement.

| Baseline operation | Current disposition |
|---|---|
| `addWatchlistProduct` | `addWatchlistProduct` |
| `adminDeleteUser` | `adminDeleteUser` |
| `adminGetPartnerApplication` | `adminGetPartnershipApplication` |
| `adminGetPartnerApplications` | `adminSearchPartnershipApplications` |
| `adminGetUser` | `adminGetUser` |
| `adminPatchPartnerApplication` | `adminMarkPartnershipApplicationInReview` |
| `adminPatchUser` | `adminPatchUser` |
| `adminPostPartnerApplicationDecision` | `adminDecidePartnershipApplication` |
| `adminSearchUsers` | `adminSearchUsers` |
| `complexSearchProducts` | Removed; supported criteria use simpleSearchProductListings (MIG-05) |
| `createUserSearchFilter` | `createUserSearchFilter` |
| `deleteAllNotifications` | `deleteNotifications` |
| `deleteMyAccessToken` | `deleteMyAccessToken` |
| `deleteNotification` | `deleteNotification` |
| `deleteOAuthClient` | `adminDeleteOAuthClient` |
| `deletePartnerApplication` | `deleteOwnPartnershipApplication` |
| `deletePartnerProduct` | `deletePartnerProductListings` |
| `deleteUser` | `deleteUser` |
| `deleteUserSearchFilter` | `deleteUserSearchFilter` |
| `deleteWatchlistProduct` | `deleteWatchlistProduct` |
| `getCategories` | Removed taxonomy capability; unsupported filters retired (MIG-05/07) |
| `getCategoryById` | Removed taxonomy capability; unsupported filters retired (MIG-05/07) |
| `getMyAccessToken` | `getMyAccessToken` |
| `getMyAccessTokens` | `getMyAccessTokens` |
| `getMyPartnerShops` | `getMyListingSources` |
| `getNotifications` | `listNotifications` |
| `getOAuthClient` | `adminGetOAuthClient` |
| `getOAuthClients` | `adminListOAuthClients` |
| `getPartnerApplication` | `getOwnPartnershipApplication` |
| `getPartnerApplications` | `getMyPartnershipApplications` |
| `getPeriodById` | Removed taxonomy capability; unsupported filters retired (MIG-05/07) |
| `getPeriods` | Removed taxonomy capability; unsupported filters retired (MIG-05/07) |
| `getProduct` | `getProductListing` |
| `getProductBySlug` | `getProductListingByTitleSlug` |
| `getProductHistory` | `getProductListingHistory` |
| `getSearchFilterMatches` | `listSearchFilterMatches` |
| `getSearchFilterPreviewProducts` | Removed; supported saved-filter preview uses simpleSearchProductListings (MIG-07) |
| `getShopByDomain` | Removed; source slug lookup uses getPublicListingSourceBySlug (MIG-06) |
| `getShopById` | `adminGetListingSource` |
| `getShopBySlug` | `getPublicListingSourceBySlug` |
| `getSimilarProducts` | `getSimilarProductListings` |
| `getUserAccount` | `getUserAccount` |
| `getUserSearchFilter` | `getUserSearchFilter` |
| `getUserSearchFilters` | `getUserSearchFilters` |
| `getWatchlistProducts` | `getWatchlistProductListings` |
| `oauthAuthorize` | `oauthAuthorize` |
| `oauthIntrospect` | `oauthIntrospect` |
| `oauthRevoke` | `oauthRevoke` |
| `oauthToken` | `oauthToken` |
| `oauthTokenByThirdPartyCode` | `oauthTokenByThirdPartyCode` |
| `patchAllNotifications` | `updateAllNotificationsSeen` |
| `patchMyAccessToken` | `patchMyAccessToken` |
| `patchNotification` | `updateNotificationSeen` |
| `patchOAuthClient` | `adminPatchOAuthClient` |
| `patchPartnerApplication` | Removed; immutable proposal and withdrawal workflow (MIG-15) |
| `patchPartnerProducts` | `patchPartnerProductListings` |
| `patchShopById` | `adminUpdateListingSource` |
| `patchWatchlistProduct` | `patchWatchlistProduct` |
| `postBillingCheckout` | `postBillingCheckout` |
| `postBillingManage` | `postBillingManage` |
| `postBillingPortal` | `postBillingPortal` |
| `postMyAccessToken` | `postMyAccessToken` |
| `postOAuthClient` | `adminCreateOAuthClient` |
| `postPartnerApplication` | `postPartnershipApplication` |
| `postPartnerProducts` | `postPartnerProductListings` |
| `postShop` | `adminCreateListingSource` |
| `postWoocommerceWebhook` | `postWoocommerceWebhook` |
| `putNewsletterSubscription` | `putNewsletterSubscription` |
| `putPartnerProducts` | `putPartnerProductListings` |
| `searchCategories` | Removed taxonomy capability; unsupported filters retired (MIG-05/07) |
| `searchPeriods` | Removed taxonomy capability; unsupported filters retired (MIG-05/07) |
| `searchShops` | Removed; provider-name discovery uses searchPublicListingSources (MIG-06) |
| `simpleSearchProducts` | `simpleSearchProductListings` |
| `simpleSearchShops` | Removed; provider-name discovery uses searchPublicListingSources (MIG-06) |
| `updateSearchFilterMatchFeedback` | `updateSearchFilterMatchFeedback` |
| `updateUserAccount` | `updateUserAccount` |
| `updateUserSearchFilter` | `updateUserSearchFilter` |

## Current component model and field inventory

Each model is retained, changed, or added relative to September 10. The pinned YAML provides full field types, requiredness, enum members, discriminators, security and response contracts; historical field differences describe the baseline migration.

| Component | Disposition | Current properties | Required | Changed top-level contract fields |
|---|---|---|---|---|
| `AccessTokenScopeData` | changed | — | — | `enum` |
| `AccessTokenTypeData` | retained | — | — | — |
| `ActorData` | retained | — | — | — |
| `AdminAccessTokenCollectionData` | changed | `items`, `searchAfter`, `size` | `items`, `size` | `properties` |
| `AdminAccessTokenData` | retained | `accessTokenId`, `expires`, `name`, `origin`, `scopes`, `userId` | `accessTokenId`, `name`, `origin`, `scopes`, `userId` | — |
| `AdminOverviewActiveListingAvailabilityCountsData` | retained | `available`, `backOrder`, `inStock`, `limitedAvailability`, `madeToOrder`, `outOfStock`, `preOrder`, `preSale`, `reserved`, `soldOut`, `unavailable` | `available`, `backOrder`, `inStock`, `limitedAvailability`, `madeToOrder`, `outOfStock`, `preOrder`, `preSale`, `reserved`, `soldOut`, `unavailable` | — |
| `AdminOverviewCountData` | retained | `total` | `total` | — |
| `AdminOverviewData` | retained | `listingSources`, `parties`, `partnershipApplications`, `partnerships`, `productListings`, `schemaVersion`, `users` | `listingSources`, `parties`, `partnershipApplications`, `partnerships`, `productListings`, `schemaVersion`, `users` | — |
| `AdminOverviewListingSourceMethodAssignmentCountsData` | retained | `partnerApi`, `shopify`, `webCrawl`, `woocommerce` | `partnerApi`, `shopify`, `webCrawl`, `woocommerce` | — |
| `AdminOverviewListingSourcesData` | retained | `methodAssignments`, `total`, `withoutIngestionMethod` | `methodAssignments`, `total`, `withoutIngestionMethod` | — |
| `AdminOverviewPartnershipApplicationStateCountsData` | retained | `approved`, `inReview`, `rejected`, `submitted`, `withdrawn` | `approved`, `inReview`, `rejected`, `submitted`, `withdrawn` | — |
| `AdminOverviewPartnershipApplicationsData` | retained | `byState`, `total` | `byState`, `total` | — |
| `AdminOverviewProductListingLifecycleCountsData` | retained | `active`, `withdrawn` | `active`, `withdrawn` | — |
| `AdminOverviewProductListingsData` | retained | `activeAvailability`, `activeWithoutAvailability`, `byLifecycle`, `total` | `activeAvailability`, `activeWithoutAvailability`, `byLifecycle`, `total` | — |
| `AdminOverviewUserRoleCountsData` | retained | `admin`, `user` | `admin`, `user` | — |
| `AdminOverviewUserTierCountsData` | retained | `free`, `pro`, `ultimate` | `free`, `pro`, `ultimate` | — |
| `AdminOverviewUsersData` | retained | `byRole`, `byTier`, `total` | `byRole`, `byTier`, `total` | — |
| `AdminPartnershipApplicationCollectionData` | changed | `items`, `searchAfter`, `size`, `total` | `items`, `size` | `properties` |
| `AdminPartnershipApplicationData` | retained | `applicantUserId`, `approvedListingSourceId`, `approvedPartnershipId`, `id`, `proposal`, `state` | `applicantUserId`, `approvedListingSourceId`, `approvedPartnershipId`, `id`, `proposal`, `state` | — |
| `AdminPartnershipApplicationSummaryData` | retained | `applicantUserId`, `approvedListingSourceId`, `approvedPartnershipId`, `created`, `id`, `proposal`, `state`, `updated` | `applicantUserId`, `approvedListingSourceId`, `approvedPartnershipId`, `created`, `id`, `proposal`, `state`, `updated` | — |
| `AdminPartnershipCollectionData` | changed | `items`, `searchAfter`, `size` | `items`, `size` | `properties` |
| `AdminPartnershipDetailsData` | retained | `created`, `listingSourceGrantCount`, `listingSourceIds`, `memberCount`, `memberUserIds`, `partnershipId`, `party`, `updated` | `created`, `listingSourceGrantCount`, `listingSourceIds`, `memberCount`, `memberUserIds`, `partnershipId`, `party`, `updated` | — |
| `AdminPartnershipSummaryData` | retained | `created`, `listingSourceGrantCount`, `memberCount`, `partnershipId`, `party`, `updated` | `created`, `listingSourceGrantCount`, `memberCount`, `partnershipId`, `party`, `updated` | — |
| `AdminUserAccountData` | retained | — | — | — |
| `AdminUserSummaryData` | retained | `email`, `firstName`, `lastName`, `role`, `stripeCustomerId`, `tier`, `userId` | `email`, `role`, `tier`, `userId` | — |
| `AdministeredListingSourceData` | retained | `listingSourceId`, `listingSourceSlugId`, `name` | `listingSourceId`, `listingSourceSlugId`, `name` | — |
| `ApiError` | retained | `detail`, `error`, `source`, `status`, `title` | `error`, `status`, `title` | — |
| `ApiErrorSource` | retained | `field`, `type` | `field`, `type` | — |
| `AsyncProductListingBatchFailure` | added | `error`, `index`, `retryable`, `sourceListingId` | `error`, `index`, `retryable` | — |
| `AsyncProductListingBatchReport` | added | `acceptedCount`, `failures`, `submissionId` | `acceptedCount`, `failures`, `submissionId` | — |
| `AuctionAdminData` | added | `auctionId`, `catalogueUrl`, `created`, `expectedVersion`, `format`, `listingSourceId`, `name`, `reportedLotCount`, `reportedStatus`, `schedule`, `sourceAuctionId`, `updated` | `auctionId`, `catalogueUrl`, `created`, `expectedVersion`, `format`, `listingSourceId`, `name`, `reportedLotCount`, `reportedStatus`, `schedule`, `sourceAuctionId`, `updated` | — |
| `AuctionFormatData` | added | — | — | — |
| `AuctionReportedStatusData` | added | — | — | — |
| `AuctionScheduleData` | added | `biddingOpens`, `liveStarts`, `lotsBeginClosing`, `scheduledEnd` | `biddingOpens`, `liveStarts`, `lotsBeginClosing`, `scheduledEnd` | — |
| `AuctionScheduleInputData` | added | `biddingOpens`, `liveStarts`, `lotsBeginClosing`, `scheduledEnd` | — | — |
| `AuctionSchedulePatchData` | added | `biddingOpens`, `liveStarts`, `lotsBeginClosing`, `scheduledEnd` | — | — |
| `AuctionSummaryData` | added | `auctionId`, `format`, `name`, `reportedStatus`, `schedule` | `auctionId`, `schedule` | — |
| `BillingCycleData` | retained | — | — | — |
| `BillingPlanData` | retained | — | — | — |
| `BillingSessionUrlData` | retained | `url` | `url` | — |
| `ConfirmNewsletterSubscriptionData` | added | `token` | `token` | — |
| `ContentPolicyData` | retained | — | — | — |
| `ContentVisibilityUserStateData` | retained | `showUnassessedOrSensitiveContent` | `showUnassessedOrSensitiveContent` | — |
| `CreateAuctionData` | added | `catalogueUrl`, `format`, `listingSourceId`, `name`, `reportedLotCount`, `reportedStatus`, `schedule`, `sourceAuctionId` | `listingSourceId`, `sourceAuctionId` | — |
| `CreateListingIngestionConfigurationData` | added | — | — | — |
| `CreateListingSourceData` | changed | `image`, `ingestionConfiguration`, `name`, `operator`, `referralConfiguration`, `url` | `ingestionConfiguration`, `name`, `operator` | `additionalProperties`, `properties` |
| `CreatePartyData` | retained | `email`, `name`, `phone` | `name` | — |
| `CreateProductListingData` | changed | `auction`, `availability`, `description`, `images`, `price`, `priceEstimateMax`, `priceEstimateMin`, `sourceListingId`, `title`, `url` | `images`, `sourceListingId`, `url` | `additionalProperties`, `properties`, `required` |
| `CurrencyData` | retained | — | — | — |
| `DecidePartnershipApplicationData` | retained | `decision` | `decision` | — |
| `GetAccessTokenData` | retained | `accessTokenId`, `created`, `createdBy`, `expiresAt`, `expiresIn`, `name`, `scope`, `token`, `tokenType`, `updated`, `updatedBy` | `accessTokenId`, `created`, `createdBy`, `name`, `token`, `tokenType`, `updated`, `updatedBy` | — |
| `LanguageData` | retained | — | — | — |
| `ListingAvailabilityData` | retained | — | — | — |
| `ListingIngestionMethodData` | retained | — | — | — |
| `ListingLifecycleData` | retained | — | — | — |
| `ListingOrderabilityData` | retained | — | — | — |
| `ListingSourceData` | retained | `created`, `image`, `ingestionMethods`, `listingSourceId`, `listingSourceSlugId`, `name`, `operator`, `updated`, `url` | `created`, `ingestionMethods`, `listingSourceId`, `listingSourceSlugId`, `name`, `operator`, `updated` | — |
| `ListingSourceOperatorInputData` | retained | — | — | — |
| `ListingSourcePresentationData` | retained | `image`, `url` | — | — |
| `ListingSourceReferenceData` | retained | `listingSourceId`, `listingSourceSlugId` | `listingSourceId`, `listingSourceSlugId` | — |
| `ListingSourceSearchCollectionData` | changed | `items`, `searchAfter`, `size`, `total` | `items`, `size` | `properties` |
| `ListingSourceSearchSummaryData` | retained | `created`, `ingestionMethods`, `listingSourceId`, `listingSourceSlugId`, `name`, `operator`, `presentation`, `referralConfiguration`, `updated` | `created`, `ingestionMethods`, `listingSourceId`, `listingSourceSlugId`, `name`, `operator`, `presentation`, `updated` | — |
| `LocalizedTextData` | retained | `language`, `text` | `language`, `text` | — |
| `MeasurementUnitData` | retained | — | — | — |
| `NotificationCollectionData` | changed | `items`, `searchAfter`, `size` | `items`, `size` | `properties` |
| `NotificationData` | retained | `created`, `kind`, `notificationId`, `payload`, `seen`, `updated` | `created`, `kind`, `notificationId`, `payload`, `seen`, `updated` | — |
| `NotificationPayloadData` | retained | — | — | — |
| `NotificationUserStateData` | retained | `unseenNotificationIds` | `unseenNotificationIds` | — |
| `OAuthClientAdminCollectionData` | changed | `items`, `searchAfter`, `size`, `total` | `items`, `size` | `properties` |
| `OAuthClientAdminData` | retained | `client_id`, `client_id_issued_at`, `client_name`, `client_uri`, `logo_uri`, `policy_uri`, `redirect_uris`, `scope`, `tos_uri` | `client_id`, `client_id_issued_at`, `client_name`, `client_uri`, `logo_uri`, `policy_uri`, `redirect_uris`, `scope`, `tos_uri` | — |
| `OAuthClientConsentMetadataData` | added | `client_id`, `client_name`, `client_uri`, `logo_uri`, `policy_uri`, `redirect_uris`, `scope`, `tos_uri` | `client_id`, `client_name`, `client_uri`, `logo_uri`, `policy_uri`, `redirect_uris`, `scope`, `tos_uri` | — |
| `OAuthClientMetadataPatchData` | retained | `client_name`, `client_uri`, `logo_uri`, `policy_uri`, `redirect_uris`, `scope`, `tos_uri` | — | — |
| `OAuthClientMetadataRequestData` | retained | `client_name`, `client_uri`, `logo_uri`, `policy_uri`, `redirect_uris`, `scope`, `tos_uri` | `client_name`, `client_uri`, `logo_uri`, `policy_uri`, `redirect_uris`, `tos_uri` | — |
| `OAuthClientMetadataResponseData` | retained | `client_id`, `client_id_issued_at`, `client_name`, `client_secret`, `client_uri`, `logo_uri`, `policy_uri`, `redirect_uris`, `scope`, `tos_uri` | `client_id`, `client_id_issued_at`, `client_name`, `client_secret`, `client_uri`, `logo_uri`, `policy_uri`, `redirect_uris`, `scope`, `tos_uri` | — |
| `OAuthIntrospectionResponseData` | retained | `active`, `client_id`, `exp`, `iat`, `scope`, `sub`, `token_type` | `active` | — |
| `OAuthTokenResponseData` | retained | `access_token`, `expires_in`, `scope`, `third_party_exchange_code`, `token_type` | `access_token`, `scope`, `token_type` | — |
| `OperatorPartyData` | retained | `name`, `partyId`, `partySlugId` | `name`, `partyId`, `partySlugId` | — |
| `OwnPartnershipApplicationData` | retained | `id`, `proposal`, `state` | `id`, `proposal`, `state` | — |
| `OwnUserAccountData` | retained | `currency`, `email`, `firstName`, `language`, `lastName`, `measurementUnit`, `role`, `showUnassessedOrSensitiveContent`, `stripeCustomerId`, `tier`, `userId` | `email`, `role`, `showUnassessedOrSensitiveContent`, `tier`, `userId` | — |
| `PartnerProductListingBatchFailuresResponse` | retained | — | — | — |
| `PartnershipApplicationNotificationPayloadData` | retained | `decision`, `image`, `listingSourceName`, `partnershipApplicationId` | `decision`, `image`, `listingSourceName`, `partnershipApplicationId` | — |
| `PartnershipApplicationProposalData` | retained | — | — | — |
| `PartnershipApplicationStateData` | retained | — | — | — |
| `PartnershipPartySummaryData` | retained | `name`, `partyId`, `partySlugId` | `name`, `partyId`, `partySlugId` | — |
| `PartnershipProposalTypeData` | retained | — | — | — |
| `PartyCollectionData` | changed | `items`, `searchAfter`, `size`, `total` | `items`, `size` | `properties` |
| `PartyContactData` | retained | `email`, `phone` | — | — |
| `PartyData` | retained | `contact`, `created`, `name`, `partyId`, `partySlugId`, `updated` | `contact`, `created`, `name`, `partyId`, `partySlugId`, `updated` | — |
| `PartySummaryData` | retained | `contact`, `created`, `name`, `partyId`, `partySlugId`, `updated` | `contact`, `created`, `name`, `partyId`, `partySlugId`, `updated` | — |
| `PatchAccessTokenData` | retained | `accessTokenId`, `expires`, `name`, `scopes` | `accessTokenId` | — |
| `PatchAdminUserData` | retained | `currency`, `email`, `firstName`, `language`, `lastName`, `measurementUnit`, `role`, `showUnassessedOrSensitiveContent`, `tier` | — | — |
| `PatchProductListingSearchData` | changed | `auctionId`, `availability`, `created`, `currency`, `enhancedSearchDescription`, `excludeListingSourceId`, `includeUnspecifiedAvailability`, `language`, `listingSourceId`, `lotBiddingOpens`, `lotScheduledCloses`, `orderability`, `price`, `productQuery`, `updated` | — | `description`, `properties` |
| `PatchResourceStateData` | retained | — | — | — |
| `PatchUserAccountData` | retained | `currency`, `firstName`, `language`, `lastName`, `measurementUnit`, `showUnassessedOrSensitiveContent` | — | — |
| `PatchUserSearchFilterData` | retained | `name`, `notifications`, `search`, `state` | — | — |
| `PatchUserSearchFilterMatchData` | retained | `feedback` | — | — |
| `PersonalizedProductListingDetailsData` | retained | `item`, `userState` | `item` | — |
| `PersonalizedProductListingSummaryData` | retained | `item`, `userState` | `item` | — |
| `PostAccessTokenData` | retained | `expiresAt`, `name`, `scope` | `name` | — |
| `PostBillingCheckoutData` | retained | `cycle`, `plan` | `cycle`, `plan` | — |
| `PostUserSearchFilterData` | retained | `name`, `search` | `name`, `search` | — |
| `PostWatchlistData` | retained | `notifications`, `productListingId` | `productListingId` | — |
| `PriceData` | retained | `amount`, `currency` | `amount`, `currency` | — |
| `PriceEstimateData` | retained | `max`, `min` | — | — |
| `PricingData` | retained | `estimate`, `offer` | — | — |
| `ProductListingAuctionData` | added | `auctionId`, `cataloguePosition`, `lotNumber`, `timing` | — | — |
| `ProductListingAuctionFactsData` | added | `auctionId`, `biddingOpens`, `cataloguePosition`, `lotNumber`, `reportedClosedAt`, `scheduledCloses` | `biddingOpens`, `cataloguePosition`, `lotNumber`, `reportedClosedAt`, `scheduledCloses` | — |
| `ProductListingAuctionHistoryChangeData` | changed | `current`, `previous`, `type` | `current`, `previous`, `type` | `properties` |
| `ProductListingAuctionTimesData` | added | `biddingOpens`, `reportedClosedAt`, `scheduledCloses` | — | — |
| `ProductListingAvailabilityHistoryChangeData` | retained | `current`, `previous`, `type` | `current`, `previous`, `type` | — |
| `ProductListingChangedHistoryPayloadData` | retained | `changes` | `changes` | — |
| `ProductListingDetailsData` | changed | `auction`, `availability`, `contentPolicy`, `created`, `description`, `eventId`, `images`, `lifecycle`, `lot`, `pricing`, `productDescription`, `productListingId`, `productListingTitleSlugId`, `productTitle`, `source`, `sourceListingId`, `title`, `updated`, `url`, `viewUrl` | `auction`, `availability`, `created`, `eventId`, `images`, `lifecycle`, `lot`, `pricing`, `productListingId`, `source`, `sourceListingId`, `updated`, `url`, `viewUrl` | `properties`, `required` |
| `ProductListingDiscoveryHistoryPayloadData` | changed | `auction`, `availability`, `description`, `imageCount`, `listingSourceId`, `pricing`, `sourceListingId`, `title`, `url` | `auction`, `availability`, `imageCount`, `listingSourceId`, `pricing`, `sourceListingId`, `url` | `properties` |
| `ProductListingHistoryChangeData` | retained | — | — | — |
| `ProductListingHistoryEntryData` | retained | `eventId`, `eventType`, `payload`, `productListingId`, `timestamp` | `eventId`, `eventType`, `payload`, `productListingId`, `timestamp` | — |
| `ProductListingHistoryEntryTypeData` | retained | — | — | — |
| `ProductListingHistoryPayloadData` | retained | — | — | — |
| `ProductListingImageData` | retained | `url` | `url` | — |
| `ProductListingImagesHistoryChangeData` | retained | `currentCount`, `previousCount`, `type` | `currentCount`, `previousCount`, `type` | — |
| `ProductListingLotData` | added | `biddingOpens`, `cataloguePosition`, `lotNumber`, `reportedClosedAt`, `scheduledCloses` | `biddingOpens`, `cataloguePosition`, `lotNumber`, `reportedClosedAt`, `scheduledCloses` | — |
| `ProductListingMainPriceHistoryChangeData` | retained | `current`, `previous`, `type` | `current`, `previous`, `type` | — |
| `ProductListingPriceData` | retained | — | — | — |
| `ProductListingPriceHistoryChangeData` | retained | `current`, `previous`, `type` | `current`, `previous`, `type` | — |
| `ProductListingPricingData` | retained | `price`, `priceEstimateMax`, `priceEstimateMin` | — | — |
| `ProductListingPricingValuationData` | retained | — | — | — |
| `ProductListingRestorationHistoryChangeData` | retained | `type` | `type` | — |
| `ProductListingSaleObservationHistoryChangeData` | retained | `observation`, `type` | `observation`, `type` | — |
| `ProductListingSearchCursorData` | retained | `fxRateId`, `searchAfter` | `fxRateId`, `searchAfter` | — |
| `ProductListingSearchData` | changed | `auctionId`, `availability`, `created`, `currency`, `enhancedSearchDescription`, `excludeListingSourceId`, `excludeProductId`, `includeUnspecifiedAvailability`, `language`, `listingSourceId`, `lotBiddingOpens`, `lotScheduledCloses`, `orderability`, `price`, `productQuery`, `updated` | — | `properties` |
| `ProductListingSearchResultData` | changed | `items`, `searchAfter`, `size`, `total` | `items`, `size` | `properties` |
| `ProductListingSourceData` | retained | `listingSourceId`, `name`, `slugId` | `listingSourceId`, `name`, `slugId` | — |
| `ProductListingSummaryData` | changed | `auctionId`, `availability`, `contentPolicy`, `displayPrice`, `eventId`, `images`, `lifecycle`, `priceValuation`, `productListingId`, `productListingTitleSlugId`, `source`, `sourceListingId`, `title`, `updated`, `url`, `viewUrl` | `availability`, `eventId`, `images`, `lifecycle`, `priceValuation`, `productListingId`, `source`, `sourceListingId`, `updated`, `url`, `viewUrl` | `properties` |
| `ProductListingSummaryPriceValuationData` | retained | — | — | — |
| `ProductListingUrlHistoryChangeData` | retained | `current`, `previous`, `type` | `current`, `previous`, `type` | — |
| `ProductListingUserStateData` | retained | `contentVisibility`, `notification`, `searchFilter`, `watchlist` | `contentVisibility`, `notification`, `searchFilter`, `watchlist` | — |
| `ProductListingWithdrawalHistoryChangeData` | retained | `previousAvailability`, `type` | `previousAvailability`, `type` | — |
| `ProposedListingSourceData` | retained | `image`, `name`, `requestedIngestionMethods`, `url` | `name`, `requestedIngestionMethods` | — |
| `ProposedPartyData` | retained | `email`, `name`, `phone` | `name` | — |
| `PublicAuctionCatalogueCursorData` | added | `auctionId`, `cataloguePosition`, `productListingId` | `auctionId`, `cataloguePosition`, `productListingId` | — |
| `PublicAuctionCatalogueData` | added | `items`, `pageSize`, `searchAfter` | `items`, `pageSize` | — |
| `PublicAuctionData` | added | `auctionId`, `catalogueUrl`, `format`, `listingSource`, `name`, `reportedLotCount`, `reportedStatus`, `schedule`, `viewUrl`, `visibleListingCount` | `auctionId`, `catalogueUrl`, `format`, `listingSource`, `name`, `reportedLotCount`, `reportedStatus`, `schedule`, `viewUrl`, `visibleListingCount` | — |
| `PublicAuctionDirectoryCursorData` | added | `auctionId`, `created`, `scope` | `auctionId`, `created`, `scope` | — |
| `PublicAuctionDirectoryCursorScopeData` | added | `format`, `from`, `listingSourceId`, `reportedStatus`, `timeRole`, `to` | `format`, `from`, `listingSourceId`, `reportedStatus`, `timeRole`, `to` | — |
| `PublicAuctionDirectoryData` | added | `items`, `pageSize`, `searchAfter` | `items`, `pageSize` | — |
| `PublicAuctionDirectoryItemData` | added | `auctionId`, `created`, `format`, `listingSource`, `name`, `reportedStatus`, `schedule` | `auctionId`, `created`, `format`, `listingSource`, `name`, `reportedStatus`, `schedule` | — |
| `PublicAuctionSourceData` | added | `listingSourceId`, `name`, `slugId` | `listingSourceId`, `name`, `slugId` | — |
| `PublicListingSourceData` | added | `image`, `listingSourceId`, `listingSourceSlugId`, `name`, `operator`, `url` | `listingSourceId`, `listingSourceSlugId`, `name`, `operator` | — |
| `PublicListingSourceOperatorData` | added | `name` | `name` | — |
| `PublicListingSourceSearchCollectionData` | added | `items`, `searchAfter`, `size` | `items`, `size` | — |
| `PutNewsletterSubscriptionData` | changed | `currency`, `email`, `firstName`, `language`, `lastName` | `email` | `description` |
| `PutShopifyListingSourceIngestionConfigurationData` | added | `currency`, `domain`, `language` | `domain` | — |
| `PutWoocommerceListingSourceIngestionConfigurationData` | added | `currency`, `language`, `webhookSecret` | `webhookSecret` | — |
| `RangeQueryDateTime` | retained | `max`, `min` | — | — |
| `RangeQueryUInt64` | retained | `max`, `min` | — | — |
| `ReferralConfigurationData` | retained | `camref`, `type` | `camref`, `type` | — |
| `ResourceStateData` | retained | — | — | — |
| `SearchFilterMatchProductCollectionData` | changed | `items`, `searchAfter`, `size`, `total` | `items`, `size` | `properties` |
| `SearchFilterNotificationPayloadData` | retained | `image`, `listingSourceId`, `listingSourceName`, `listingSourceSlugId`, `productListingId`, `productListingTitleSlugId`, `sourceListingId`, `title`, `url`, `userSearchFilterId`, `userSearchFilterName`, `viewUrl` | `image`, `listingSourceId`, `listingSourceName`, `listingSourceSlugId`, `productListingId`, `productListingTitleSlugId`, `sourceListingId`, `title`, `url`, `userSearchFilterId`, `userSearchFilterName`, `viewUrl` | — |
| `SearchFilterProductMatchData` | retained | `created`, `enhancedMatchReason`, `feedback`, `originEventId`, `productListingId`, `updated`, `userId`, `userSearchFilterId`, `userSearchFilterName` | `created`, `originEventId`, `productListingId`, `updated`, `userId`, `userSearchFilterId` | — |
| `SearchFilterUserStateData` | retained | `hidden`, `matchFeedback`, `matchReason`, `matched`, `userSearchFilterId`, `userSearchFilterName` | `hidden`, `matched` | — |
| `SortListingSourceFieldData` | retained | — | — | — |
| `SortPartyFieldData` | retained | — | — | — |
| `SortProductListingFieldData` | retained | — | — | — |
| `SortUserFieldData` | retained | — | — | — |
| `SubmitPartnershipApplicationData` | retained | `proposal` | `proposal` | — |
| `SuspendUserData` | retained | `reason` | `reason` | — |
| `SuspendUserResponseData` | retained | `suspended`, `userId` | `suspended`, `userId` | — |
| `UnsuspendUserResponseData` | retained | `suspended`, `userId` | `suspended`, `userId` | — |
| `UpdateAuctionData` | added | `catalogueUrl`, `expectedVersion`, `format`, `name`, `reportedLotCount`, `reportedStatus`, `schedule` | `expectedVersion` | — |
| `UpdateListingIngestionConfigurationData` | added | — | — | — |
| `UpdateListingSourceData` | changed | `image`, `ingestionConfiguration`, `name`, `referralConfiguration`, `url` | — | `additionalProperties`, `description`, `properties` |
| `UpdateNotificationSeenData` | retained | `seen` | `seen` | — |
| `UpdateNotificationsSeenData` | retained | `notificationIds`, `seen` | `notificationIds`, `seen` | — |
| `UpdatePartyData` | retained | `email`, `name`, `phone` | — | — |
| `UpdateProductListingData` | changed | `auction`, `availability`, `images`, `price`, `priceEstimateMax`, `priceEstimateMin`, `sourceListingId`, `url` | `sourceListingId` | `additionalProperties`, `description`, `properties` |
| `UpsertProductListingData` | changed | `auction`, `availability`, `description`, `images`, `price`, `priceEstimateMax`, `priceEstimateMin`, `sourceListingId`, `title`, `url` | `sourceListingId` | `additionalProperties`, `description`, `properties` |
| `UserCollectionData` | changed | `items`, `searchAfter`, `size`, `total` | `items`, `size` | `properties` |
| `UserRoleData` | retained | — | — | — |
| `UserSearchFilterCollectionData` | changed | `from`, `items`, `size`, `total` | `from`, `items`, `size` | `properties` |
| `UserSearchFilterData` | retained | `created`, `createdBy`, `name`, `notifications`, `search`, `state`, `updated`, `updatedBy`, `userId`, `userSearchFilterId` | `created`, `createdBy`, `name`, `notifications`, `search`, `state`, `updated`, `updatedBy`, `userId`, `userSearchFilterId` | — |
| `UserTierData` | retained | — | — | — |
| `WatchlistEntryData` | retained | `created`, `notifications`, `productListingId`, `state`, `updated`, `userId` | `notifications`, `productListingId`, `state`, `userId` | — |
| `WatchlistNotificationAvailabilityChangeData` | retained | `newAvailability`, `oldAvailability`, `type` | `newAvailability`, `oldAvailability`, `type` | — |
| `WatchlistNotificationChangeData` | retained | — | — | — |
| `WatchlistNotificationPayloadData` | retained | `change`, `image`, `listingSourceId`, `listingSourceName`, `listingSourceSlugId`, `productListingId`, `productListingTitleSlugId`, `sourceListingId`, `title`, `url`, `viewUrl` | `change`, `image`, `listingSourceId`, `listingSourceName`, `listingSourceSlugId`, `productListingId`, `productListingTitleSlugId`, `sourceListingId`, `title`, `url`, `viewUrl` | — |
| `WatchlistNotificationPriceChangeData` | retained | `newPrice`, `oldPrice`, `type` | `newPrice`, `oldPrice`, `type` | — |
| `WatchlistProductPatch` | retained | `notifications`, `state` | — | — |
| `WatchlistUserStateData` | retained | `notifications`, `watching` | `notifications`, `watching` | — |
| `WithdrawProductListingData` | retained | `sourceListingId` | `sourceListingId` | — |
| `WoocommerceProductWebhookDeleteData` | retained | `date_modified_gmt`, `id` | `id` | — |
| `WoocommerceProductWebhookImageData` | retained | `src` | `src` | — |
| `WoocommerceProductWebhookUpsertData` | changed | `date_modified_gmt`, `description`, `id`, `images`, `name`, `permalink`, `price`, `short_description`, `status`, `stock_status` | `id` | `properties` |

## Removed September 10 models

- `AuctionData`: removed/replaced by the current split input/output models; no runtime consumer remains.
- `ListingIngestionConfigurationData`: removed/replaced by the current split input/output models; no runtime consumer remains.
- `PersonalizedProductListingSearchResultData`: removed/replaced by the current split input/output models; no runtime consumer remains.

## Baseline generated model disposition

Baseline generated helper types and operations are not OpenAPI component schemas. Same-name models keep the current generated definition; old aliases map through the original analysis where that successor remains present.

| Baseline type | Current disposition |
|---|---|
| `AccessTokenScopeData` | `AccessTokenScopeData` |
| `AccessTokenTypeData` | `AccessTokenTypeData` |
| `ActorData` | `ActorData` |
| `AddWatchlistProductData` | `AddWatchlistProductData` |
| `AddWatchlistProductError` | `AddWatchlistProductError` |
| `AddWatchlistProductErrors` | `AddWatchlistProductErrors` |
| `AddWatchlistProductResponse` | `AddWatchlistProductResponse` |
| `AddWatchlistProductResponses` | `AddWatchlistProductResponses` |
| `AdminDeleteUserData` | `AdminDeleteUserData` |
| `AdminDeleteUserError` | `AdminDeleteUserError` |
| `AdminDeleteUserErrors` | `AdminDeleteUserErrors` |
| `AdminDeleteUserResponse` | `AdminDeleteUserResponse` |
| `AdminDeleteUserResponses` | `AdminDeleteUserResponses` |
| `AdminGetPartnerApplicationData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminGetPartnerApplicationError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminGetPartnerApplicationErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminGetPartnerApplicationResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminGetPartnerApplicationResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminGetPartnerApplicationsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminGetPartnerApplicationsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminGetPartnerApplicationsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminGetPartnerApplicationsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminGetPartnerApplicationsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminGetUserData` | `AdminGetUserData` |
| `AdminGetUserError` | `AdminGetUserError` |
| `AdminGetUserErrors` | `AdminGetUserErrors` |
| `AdminGetUserResponse` | `AdminGetUserResponse` |
| `AdminGetUserResponses` | `AdminGetUserResponses` |
| `AdminPatchPartnerApplicationData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminPatchPartnerApplicationError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminPatchPartnerApplicationErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminPatchPartnerApplicationResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminPatchPartnerApplicationResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminPatchPartnerShopApplicationData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminPatchUserData` | `AdminPatchUserData` |
| `AdminPatchUserError` | `AdminPatchUserError` |
| `AdminPatchUserErrors` | `AdminPatchUserErrors` |
| `AdminPatchUserResponse` | `AdminPatchUserResponse` |
| `AdminPatchUserResponses` | `AdminPatchUserResponses` |
| `AdminPostPartnerApplicationDecisionData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminPostPartnerApplicationDecisionError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminPostPartnerApplicationDecisionErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminPostPartnerApplicationDecisionResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminPostPartnerApplicationDecisionResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AdminSearchUsersData` | `AdminSearchUsersData` |
| `AdminSearchUsersError` | `AdminSearchUsersError` |
| `AdminSearchUsersErrors` | `AdminSearchUsersErrors` |
| `AdminSearchUsersResponse` | `AdminSearchUsersResponse` |
| `AdminSearchUsersResponses` | `AdminSearchUsersResponses` |
| `ApiError` | `ApiError` |
| `ApiErrorSource` | `ApiErrorSource` |
| `ApprovedPartnerApplicationPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `AuctionData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `BillingCycleData` | `BillingCycleData` |
| `BillingPlanData` | `BillingPlanData` |
| `BillingSessionUrlData` | `BillingSessionUrlData` |
| `CategorySearchData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ClientOptions` | `ClientOptions` |
| `ComplexSearchProductsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ComplexSearchProductsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ComplexSearchProductsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ComplexSearchProductsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ComplexSearchProductsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ContinentData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `CountryCodeData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `CreateUserSearchFilterData` | `CreateUserSearchFilterData` |
| `CreateUserSearchFilterError` | `CreateUserSearchFilterError` |
| `CreateUserSearchFilterErrors` | `CreateUserSearchFilterErrors` |
| `CreateUserSearchFilterResponse` | `CreateUserSearchFilterResponse` |
| `CreateUserSearchFilterResponses` | `CreateUserSearchFilterResponses` |
| `CurrencyData` | `CurrencyData` |
| `DeleteAllNotificationsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeleteAllNotificationsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeleteAllNotificationsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeleteAllNotificationsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeleteAllNotificationsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeleteMyAccessTokenData` | `DeleteMyAccessTokenData` |
| `DeleteMyAccessTokenError` | `DeleteMyAccessTokenError` |
| `DeleteMyAccessTokenErrors` | `DeleteMyAccessTokenErrors` |
| `DeleteMyAccessTokenResponse` | `DeleteMyAccessTokenResponse` |
| `DeleteMyAccessTokenResponses` | `DeleteMyAccessTokenResponses` |
| `DeleteNotificationData` | `DeleteNotificationData` |
| `DeleteNotificationError` | `DeleteNotificationError` |
| `DeleteNotificationErrors` | `DeleteNotificationErrors` |
| `DeleteNotificationResponse` | `DeleteNotificationResponse` |
| `DeleteNotificationResponses` | `DeleteNotificationResponses` |
| `DeleteOAuthClientData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeleteOAuthClientError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeleteOAuthClientErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeleteOAuthClientResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeleteOAuthClientResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeletePartnerApplicationData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeletePartnerApplicationError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeletePartnerApplicationErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeletePartnerApplicationResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeletePartnerApplicationResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeletePartnerProductData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeletePartnerProductError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeletePartnerProductErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeletePartnerProductResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeletePartnerProductResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DeleteUserData` | `DeleteUserData` |
| `DeleteUserError` | `DeleteUserError` |
| `DeleteUserErrors` | `DeleteUserErrors` |
| `DeleteUserResponse` | `DeleteUserResponse` |
| `DeleteUserResponses` | `DeleteUserResponses` |
| `DeleteUserSearchFilterData` | `DeleteUserSearchFilterData` |
| `DeleteUserSearchFilterError` | `DeleteUserSearchFilterError` |
| `DeleteUserSearchFilterErrors` | `DeleteUserSearchFilterErrors` |
| `DeleteUserSearchFilterResponse` | `DeleteUserSearchFilterResponse` |
| `DeleteUserSearchFilterResponses` | `DeleteUserSearchFilterResponses` |
| `DeleteWatchlistProductData` | `DeleteWatchlistProductData` |
| `DeleteWatchlistProductError` | `DeleteWatchlistProductError` |
| `DeleteWatchlistProductErrors` | `DeleteWatchlistProductErrors` |
| `DeleteWatchlistProductResponse` | `DeleteWatchlistProductResponse` |
| `DeleteWatchlistProductResponses` | `DeleteWatchlistProductResponses` |
| `DistanceData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `DistanceUnitData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ExecutionStateData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GeoAddressData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GeoDistanceQueryData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetAccessTokenData` | `GetAccessTokenData` |
| `GetCategoriesData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetCategoriesError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetCategoriesErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetCategoriesResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetCategoriesResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetCategoryByIdData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetCategoryByIdError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetCategoryByIdErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetCategoryByIdResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetCategoryByIdResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetCategoryData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetCategorySummaryData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetMyAccessTokenData` | `GetMyAccessTokenData` |
| `GetMyAccessTokenError` | `GetMyAccessTokenError` |
| `GetMyAccessTokenErrors` | `GetMyAccessTokenErrors` |
| `GetMyAccessTokenResponse` | `GetMyAccessTokenResponse` |
| `GetMyAccessTokenResponses` | `GetMyAccessTokenResponses` |
| `GetMyAccessTokensData` | `GetMyAccessTokensData` |
| `GetMyAccessTokensError` | `GetMyAccessTokensError` |
| `GetMyAccessTokensErrors` | `GetMyAccessTokensErrors` |
| `GetMyAccessTokensResponse` | `GetMyAccessTokensResponse` |
| `GetMyAccessTokensResponses` | `GetMyAccessTokensResponses` |
| `GetMyPartnerShopsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetMyPartnerShopsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetMyPartnerShopsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetMyPartnerShopsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetMyPartnerShopsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetNotificationData` | `NotificationData` |
| `GetNotificationsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetNotificationsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetNotificationsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetNotificationsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetNotificationsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetOAuthClientData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetOAuthClientError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetOAuthClientErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetOAuthClientResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetOAuthClientResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetOAuthClientsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetOAuthClientsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetOAuthClientsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetOAuthClientsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetOAuthClientsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPartnerApplicationData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPartnerApplicationError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPartnerApplicationErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPartnerApplicationResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPartnerApplicationResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPartnerApplicationsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPartnerApplicationsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPartnerApplicationsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPartnerApplicationsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPartnerApplicationsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPartnerShopApplicationData` | `OwnPartnershipApplicationData` |
| `GetPartnerShopApplicationPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPeriodByIdData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPeriodByIdError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPeriodByIdErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPeriodByIdResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPeriodByIdResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPeriodData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPeriodSummaryData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPeriodsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPeriodsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPeriodsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPeriodsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetPeriodsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductBySlugData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductBySlugError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductBySlugErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductBySlugResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductBySlugResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductData` | `ProductListingDetailsData` |
| `GetProductData2` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductEventData` | `ProductListingHistoryEntryData` |
| `GetProductHistoryData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductHistoryError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductHistoryErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductHistoryResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductHistoryResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetProductSummaryData` | `ProductListingSummaryData` |
| `GetSearchFilterMatchesData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSearchFilterMatchesError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSearchFilterMatchesErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSearchFilterMatchesResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSearchFilterMatchesResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSearchFilterPreviewProductsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSearchFilterPreviewProductsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSearchFilterPreviewProductsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSearchFilterPreviewProductsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSearchFilterPreviewProductsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopByDomainData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopByDomainError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopByDomainErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopByDomainResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopByDomainResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopByIdData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopByIdError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopByIdErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopByIdResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopByIdResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopBySlugData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopBySlugError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopBySlugErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopBySlugResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopBySlugResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetShopData` | `ListingSourceData` |
| `GetSimilarProductsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSimilarProductsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSimilarProductsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSimilarProductsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetSimilarProductsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetUserAccountData` | `OwnUserAccountData` |
| `GetUserAccountData2` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetUserAccountError` | `GetUserAccountError` |
| `GetUserAccountErrors` | `GetUserAccountErrors` |
| `GetUserAccountResponse` | `GetUserAccountResponse` |
| `GetUserAccountResponses` | `GetUserAccountResponses` |
| `GetUserSearchFilterData` | `GetUserSearchFilterData` |
| `GetUserSearchFilterError` | `GetUserSearchFilterError` |
| `GetUserSearchFilterErrors` | `GetUserSearchFilterErrors` |
| `GetUserSearchFilterResponse` | `GetUserSearchFilterResponse` |
| `GetUserSearchFilterResponses` | `GetUserSearchFilterResponses` |
| `GetUserSearchFiltersData` | `GetUserSearchFiltersData` |
| `GetUserSearchFiltersError` | `GetUserSearchFiltersError` |
| `GetUserSearchFiltersErrors` | `GetUserSearchFiltersErrors` |
| `GetUserSearchFiltersResponse` | `GetUserSearchFiltersResponse` |
| `GetUserSearchFiltersResponses` | `GetUserSearchFiltersResponses` |
| `GetWatchlistProductsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetWatchlistProductsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetWatchlistProductsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetWatchlistProductsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `GetWatchlistProductsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `LanguageData` | `LanguageData` |
| `LocalizedTextData` | `LocalizedTextData` |
| `MeasurementUnitData` | `MeasurementUnitData` |
| `NotificationCollectionData` | `NotificationCollectionData` |
| `NotificationPayloadData` | `NotificationPayloadData` |
| `NotificationUserStateData` | `NotificationUserStateData` |
| `OAuthClientMetadataPatchData` | `OAuthClientMetadataPatchData` |
| `OAuthClientMetadataRequestData` | `OAuthClientMetadataRequestData` |
| `OAuthClientMetadataResponseData` | `OAuthClientMetadataResponseData` |
| `OAuthIntrospectionResponseData` | `OAuthIntrospectionResponseData` |
| `OAuthTokenResponseData` | `OAuthTokenResponseData` |
| `OauthAuthorizeData` | `OauthAuthorizeData` |
| `OauthAuthorizeError` | `OauthAuthorizeError` |
| `OauthAuthorizeErrors` | `OauthAuthorizeErrors` |
| `OauthIntrospectData` | `OauthIntrospectData` |
| `OauthIntrospectError` | `OauthIntrospectError` |
| `OauthIntrospectErrors` | `OauthIntrospectErrors` |
| `OauthIntrospectResponse` | `OauthIntrospectResponse` |
| `OauthIntrospectResponses` | `OauthIntrospectResponses` |
| `OauthRevokeData` | `OauthRevokeData` |
| `OauthRevokeError` | `OauthRevokeError` |
| `OauthRevokeErrors` | `OauthRevokeErrors` |
| `OauthRevokeResponses` | `OauthRevokeResponses` |
| `OauthTokenByThirdPartyCodeData` | `OauthTokenByThirdPartyCodeData` |
| `OauthTokenByThirdPartyCodeError` | `OauthTokenByThirdPartyCodeError` |
| `OauthTokenByThirdPartyCodeErrors` | `OauthTokenByThirdPartyCodeErrors` |
| `OauthTokenByThirdPartyCodeResponse` | `OauthTokenByThirdPartyCodeResponse` |
| `OauthTokenByThirdPartyCodeResponses` | `OauthTokenByThirdPartyCodeResponses` |
| `OauthTokenData` | `OauthTokenData` |
| `OauthTokenError` | `OauthTokenError` |
| `OauthTokenErrors` | `OauthTokenErrors` |
| `OauthTokenResponse` | `OauthTokenResponse` |
| `OauthTokenResponses` | `OauthTokenResponses` |
| `PartnerApplicationNotificationPayloadData` | `PartnershipApplicationNotificationPayloadData` |
| `PartnerApplicationPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PartnerProductEnqueueFailuresResponse` | `PartnerProductListingBatchFailuresResponse` |
| `PartnerShopApplicationDecisionData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PartnerShopApplicationStateData` | `PartnershipApplicationStateData` |
| `PatchAccessTokenData` | `PatchAccessTokenData` |
| `PatchAdminUserData` | `PatchAdminUserData` |
| `PatchAllNotificationsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchAllNotificationsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchAllNotificationsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchAllNotificationsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchAllNotificationsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchMyAccessTokenData` | `PatchMyAccessTokenData` |
| `PatchMyAccessTokenError` | `PatchMyAccessTokenError` |
| `PatchMyAccessTokenErrors` | `PatchMyAccessTokenErrors` |
| `PatchMyAccessTokenResponse` | `PatchMyAccessTokenResponse` |
| `PatchMyAccessTokenResponses` | `PatchMyAccessTokenResponses` |
| `PatchNotificationData` | `UpdateNotificationSeenData` |
| `PatchNotificationData2` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchNotificationError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchNotificationErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchNotificationResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchNotificationResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchOAuthClientData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchOAuthClientError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchOAuthClientErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchOAuthClientResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchOAuthClientResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchPartnerApplicationData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchPartnerApplicationError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchPartnerApplicationErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchPartnerApplicationResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchPartnerApplicationResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchPartnerProductsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchPartnerProductsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchPartnerProductsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchPartnerProductsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchPartnerProductsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchPartnerShopApplicationData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchProductData` | `UpdateProductListingData` |
| `PatchProductSearchData` | `PatchProductListingSearchData` |
| `PatchResourceStateData` | `PatchResourceStateData` |
| `PatchShopByIdData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchShopByIdError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchShopByIdErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchShopByIdResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchShopByIdResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchShopData` | `UpdateListingSourceData` |
| `PatchShopDataWritable` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PatchUserAccountData` | `PatchUserAccountData` |
| `PatchUserSearchFilterData` | `PatchUserSearchFilterData` |
| `PatchUserSearchFilterMatchData` | `PatchUserSearchFilterMatchData` |
| `PatchWatchlistProductData` | `PatchWatchlistProductData` |
| `PatchWatchlistProductError` | `PatchWatchlistProductError` |
| `PatchWatchlistProductErrors` | `PatchWatchlistProductErrors` |
| `PatchWatchlistProductResponse` | `PatchWatchlistProductResponse` |
| `PatchWatchlistProductResponses` | `PatchWatchlistProductResponses` |
| `PeriodSearchData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PersonalizedGetProductData` | `PersonalizedProductListingDetailsData` |
| `PersonalizedGetProductSummaryData` | `PersonalizedProductListingSummaryData` |
| `PersonalizedProductSearchResultData` | `ProductListingSearchResultData` |
| `PostAccessTokenData` | `PostAccessTokenData` |
| `PostBillingCheckoutData` | `PostBillingCheckoutData` |
| `PostBillingCheckoutData2` | `PostBillingCheckoutData2` |
| `PostBillingCheckoutError` | `PostBillingCheckoutError` |
| `PostBillingCheckoutErrors` | `PostBillingCheckoutErrors` |
| `PostBillingCheckoutResponse` | `PostBillingCheckoutResponse` |
| `PostBillingCheckoutResponses` | `PostBillingCheckoutResponses` |
| `PostBillingManageData` | `PostBillingManageData` |
| `PostBillingManageError` | `PostBillingManageError` |
| `PostBillingManageErrors` | `PostBillingManageErrors` |
| `PostBillingManageResponse` | `PostBillingManageResponse` |
| `PostBillingManageResponses` | `PostBillingManageResponses` |
| `PostBillingPortalData` | `PostBillingPortalData` |
| `PostBillingPortalError` | `PostBillingPortalError` |
| `PostBillingPortalErrors` | `PostBillingPortalErrors` |
| `PostBillingPortalResponse` | `PostBillingPortalResponse` |
| `PostBillingPortalResponses` | `PostBillingPortalResponses` |
| `PostMyAccessTokenData` | `PostMyAccessTokenData` |
| `PostMyAccessTokenError` | `PostMyAccessTokenError` |
| `PostMyAccessTokenErrors` | `PostMyAccessTokenErrors` |
| `PostMyAccessTokenResponse` | `PostMyAccessTokenResponse` |
| `PostMyAccessTokenResponses` | `PostMyAccessTokenResponses` |
| `PostOAuthClientData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostOAuthClientError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostOAuthClientErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostOAuthClientResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostOAuthClientResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostPartnerApplicationData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostPartnerApplicationError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostPartnerApplicationErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostPartnerApplicationResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostPartnerApplicationResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostPartnerProductsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostPartnerProductsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostPartnerProductsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostPartnerProductsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostPartnerProductsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostPartnerShopApplicationDecisionData` | `DecidePartnershipApplicationData` |
| `PostPartnerShopApplicationPayloadData` | `SubmitPartnershipApplicationData` |
| `PostProductData` | `CreateProductListingData` |
| `PostShopData` | `CreateListingSourceData` |
| `PostShopData2` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostShopDataWritable` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostShopError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostShopErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostShopResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostShopResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PostUserSearchFilterData` | `PostUserSearchFilterData` |
| `PostWoocommerceWebhookData` | `PostWoocommerceWebhookData` |
| `PostWoocommerceWebhookError` | `PostWoocommerceWebhookError` |
| `PostWoocommerceWebhookErrors` | `PostWoocommerceWebhookErrors` |
| `PostWoocommerceWebhookResponses` | `PostWoocommerceWebhookResponses` |
| `PriceChangeWatchlistPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PriceData` | `PriceData` |
| `PriceEstimateData` | `PriceEstimateData` |
| `PricingData` | `PricingData` |
| `ProductCreatedEventPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ProductEventAuctionTimeChangedPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ProductEventEstimatePriceChangedPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ProductEventImagesChangedPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ProductEventPayloadData` | `ProductListingHistoryPayloadData` |
| `ProductEventPriceChangedPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ProductEventStateChangedPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ProductEventTypeData` | `ProductListingHistoryEntryTypeData` |
| `ProductEventUrlChangedPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ProductImageData` | `ProductListingImageData` |
| `ProductKeyData` | `PostWatchlistData` |
| `ProductLifecycleData` | `ListingLifecycleData` |
| `ProductSearchData` | `ProductListingSearchData` |
| `ProductStateData` | `ListingAvailabilityData` |
| `ProductUserStateData` | `ProductListingUserStateData` |
| `ProhibitedContentData` | `ContentPolicyData` |
| `ProhibitedContentUserStateData` | `ContentVisibilityUserStateData` |
| `PutNewsletterSubscriptionData` | `PutNewsletterSubscriptionData` |
| `PutNewsletterSubscriptionData2` | `PutNewsletterSubscriptionData2` |
| `PutNewsletterSubscriptionError` | `PutNewsletterSubscriptionError` |
| `PutNewsletterSubscriptionErrors` | `PutNewsletterSubscriptionErrors` |
| `PutNewsletterSubscriptionResponse` | `PutNewsletterSubscriptionResponse` |
| `PutNewsletterSubscriptionResponses` | `PutNewsletterSubscriptionResponses` |
| `PutPartnerProductsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PutPartnerProductsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PutPartnerProductsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PutPartnerProductsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PutPartnerProductsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `PutProductData` | `UpsertProductListingData` |
| `RangeQueryDateTime` | `RangeQueryDateTime` |
| `RangeQueryInt32` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `RangeQueryUInt64` | `RangeQueryUInt64` |
| `RejectedPartnerApplicationPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ResourceStateData` | `ResourceStateData` |
| `SearchCategoriesData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchCategoriesError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchCategoriesErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchCategoriesResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchCategoriesResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchFilterMatchProductCollectionData` | `SearchFilterMatchProductCollectionData` |
| `SearchFilterNotificationPayloadData` | `SearchFilterNotificationPayloadData` |
| `SearchFilterPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchFilterProductMatchData` | `SearchFilterProductMatchData` |
| `SearchFilterUserStateData` | `SearchFilterUserStateData` |
| `SearchPeriodsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchPeriodsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchPeriodsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchPeriodsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchPeriodsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchShopsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchShopsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchShopsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchShopsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SearchShopsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ShopPartnerStatusData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ShopSearchData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `ShopSearchResultData` | `ListingSourceSearchCollectionData` |
| `ShopTypeData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SimpleSearchProductsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SimpleSearchProductsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SimpleSearchProductsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SimpleSearchProductsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SimpleSearchProductsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SimpleSearchShopsData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SimpleSearchShopsError` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SimpleSearchShopsErrors` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SimpleSearchShopsResponse` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SimpleSearchShopsResponses` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SortCategoryFieldData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SortPeriodFieldData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SortProductFieldData` | `SortProductListingFieldData` |
| `SortSearchFilterMatchFieldData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SortShopFieldData` | `SortListingSourceFieldData` |
| `SortUserFieldData` | `SortUserFieldData` |
| `SortUserSearchFilterFieldData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `SortWatchlistProductFieldData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `StateChangeWatchlistPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `StructuredAddressData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `UpdateSearchFilterMatchFeedbackData` | `UpdateSearchFilterMatchFeedbackData` |
| `UpdateSearchFilterMatchFeedbackError` | `UpdateSearchFilterMatchFeedbackError` |
| `UpdateSearchFilterMatchFeedbackErrors` | `UpdateSearchFilterMatchFeedbackErrors` |
| `UpdateSearchFilterMatchFeedbackResponse` | `UpdateSearchFilterMatchFeedbackResponse` |
| `UpdateSearchFilterMatchFeedbackResponses` | `UpdateSearchFilterMatchFeedbackResponses` |
| `UpdateUserAccountData` | `UpdateUserAccountData` |
| `UpdateUserAccountError` | `UpdateUserAccountError` |
| `UpdateUserAccountErrors` | `UpdateUserAccountErrors` |
| `UpdateUserAccountResponse` | `UpdateUserAccountResponse` |
| `UpdateUserAccountResponses` | `UpdateUserAccountResponses` |
| `UpdateUserSearchFilterData` | `UpdateUserSearchFilterData` |
| `UpdateUserSearchFilterError` | `UpdateUserSearchFilterError` |
| `UpdateUserSearchFilterErrors` | `UpdateUserSearchFilterErrors` |
| `UpdateUserSearchFilterResponse` | `UpdateUserSearchFilterResponse` |
| `UpdateUserSearchFilterResponses` | `UpdateUserSearchFilterResponses` |
| `UserCollectionData` | `UserCollectionData` |
| `UserRoleData` | `UserRoleData` |
| `UserSearchData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `UserSearchFilterCollectionData` | `UserSearchFilterCollectionData` |
| `UserSearchFilterData` | `UserSearchFilterData` |
| `UserTierData` | `UserTierData` |
| `WatchlistCollectionData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `WatchlistNotificationPayloadData` | `WatchlistNotificationPayloadData` |
| `WatchlistPayloadData` | Removed legacy DTO/helper; migrated feature/domain mapping |
| `WatchlistProductPatch` | `WatchlistProductPatch` |
| `WatchlistUserStateData` | `WatchlistUserStateData` |
| `WoocommerceProductWebhookDeleteData` | `WoocommerceProductWebhookDeleteData` |
| `WoocommerceProductWebhookImageData` | `WoocommerceProductWebhookImageData` |
| `WoocommerceProductWebhookUpsertData` | `WoocommerceProductWebhookUpsertData` |
