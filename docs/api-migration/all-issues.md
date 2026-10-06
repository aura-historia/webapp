# Resolve schema gaps before migrating public discovery and OAuth consent

Planning ID: MIG-00
Priority: P0
Dependencies: None

## Problem

The supplied schema cannot support several existing workflows without a product/backend decision. Resolve each item separately so unrelated migration work can proceed.

## Scope

- Confirm whether authenticated-only getListingSourceBySlug is intentional. No public listing-source search, ID lookup or domain lookup successor is documented. Decide how public shop discovery, profiles, merchant pickers and existing-source applications should work.
- Provide a safe ordinary-user OAuth consent metadata contract, or an approved alternative consent flow. getOAuthClient becomes adminGetOAuthClient, which requires ADMIN and deliberately omits secrets. Do not use admin credentials to supply consent metadata.
- Resolve the malformed extra { name: sort } parameter in adminSearchUsers: it lacks in/schema and duplicates the valid sort parameter.
- Specify searchAfter as one JSON query value consistently with ProductListingSearchCursorData; verify generator serialization instead of flattening the object.
- Resolve ProductListingSearchData/PatchProductListingSearchData exposing orderability and includeUnspecifiedAvailability while GET simpleSearchProductListings omits both. Define saved-search preview semantics for these filters.
- Align optional delegated authentication declarations: watchlist GET describes watchlist:read access tokens but security lists only BearerAuth; similar-listing prose mentions delegated tokens while security lists BearerAuth and anonymous.
- Clarify ProductListingDetailsData title/description versus productTitle/productDescription precedence. All four are optional/nullable.
- Correct partner examples whose monetary prices omit required type: MONETARY. Separate stale introductory asynchronous-ingestion prose from the new synchronous batch contract.
- Decide legacy product/shop URL behavior: old shopId + shopsProductId pairs have no documented public resolver.
- Document how admin source configuration can be edited safely: read DTOs expose ingestionMethods but omit full ingestionConfiguration and webhook secrets. Do not fabricate defaults that overwrite unseen configuration.

## Starting points and ownership

- `docs/api-migration/swagger.snapshot.yaml`
- `src/features/oauth/hooks/useOAuthClient.ts`
- `src/features/search/shops`
- `src/features/shop/profile`
- `src/features/partner/application-management/api/usePartnerApplicationShopSearch.ts`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Each gap has a written decision, corrected schema or explicit unavailable-feature behavior.
- [ ] Corrected schema passes structural validation, including parameter identity and example shape checks.
- [ ] No privileged endpoint is proposed as a public or partner fallback.
- [ ] Only tasks dependent on an unresolved decision remain blocked.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Restore reproducible OpenAPI generation and establish the migration client

Planning ID: MIG-01
Priority: P0
Dependencies: MIG-00: malformed parameter fix; other gap resolutions only when they change generation

## Problem

The checked-in client contains 77 operations; the target contains 87. The installed pnpm exec openapi-ts fails before generation with TypeError reading ts.SyntaxKind.AnyKeyword using @hey-api/openapi-ts 0.99.0 and TypeScript 7.0.2. The partner-spec script also hardcodes a removed path.

## Scope

- Resolve the observed generator/TypeScript runtime compatibility failure with supported, pinned tooling; verify the cause rather than assuming a schema error.
- Generate src/client/** and TanStack Query helpers from one pinned schema revision. Never hand-edit generated files.
- Let MIG-13 own the partner-spec extractor/content changes; coordinate its script dependency before running the full pnpm openapi-ts command.
- Capture generated export/operation changes and a type-check baseline for downstream owners. Do not hide migration failures with any casts or compatibility aliases that preserve obsolete wire contracts.
- Establish a shared migration integration branch. Generated-client commit is a foundation commit and may temporarily fail application compilation until dependent slices land; it must not be released alone.
- Record the exact schema revision/hash, generator versions and regeneration command in relevant developer guidance.

## Starting points and ownership

- `package.json`
- `pnpm-lock.yaml`
- `openapi-ts.config.ts`
- `src/client/**`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Generator runs reproducibly on the corrected pinned schema; repeated generation has no unexpected diff.
- [ ] All target operations, request/response types and Query helpers are present.
- [ ] No unrelated application migration is folded into this task.
- [ ] Run pnpm exec tsc --noEmit and record downstream failures by issue; MIG-24 must close them before release.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Introduce listing domain models and shared identity, price and error adapters

Planning ID: MIG-02
Priority: P0
Dependencies: MIG-01; MIG-00 for title precedence

## Problem

The existing OverviewProduct/ProductDetail model embeds shop identity, old state and pricing fields. New listing summaries/details have different capabilities and cannot be treated as one old product shape.

## Scope

- Map productListingId, sourceListingId, nested source { listingSourceId, name, slugId }, optional productListingTitleSlugId, and personalized item/userState wrappers at the domain boundary.
- Keep summary and detail models distinct. Summaries lack auction, created, shopType, sellerName and addresses; details add pricing.source/display/valuation and required auction with nullable start/end.
- Model MONETARY, ON_REQUEST and missing price independently. Preserve CURRENT versus SALE_OBSERVATION valuation metadata and original/display currency.
- Model nullable availability with all 11 enum values separately from ACTIVE/WITHDRAWN lifecycle. Do not equate withdrawal, out-of-stock and sale.
- Map contentPolicy, nullable image URLs and contentVisibility.showUnassessedOrSensitiveContent. Replace notification.seen/originEventId with unseenNotificationIds and derive unread state from the array.
- Define stable listing query-key/identity helpers for consumers; keep account-specific keys isolated. Treat prefixed IDs as opaque strings, not UUIDs or parsed slugs.
- Update ApiErrorSource mapping from sourceType lowercase to type QUERY/PATH/HEADER/BODY; retain safe internal error presentation and handle absent error bodies.
- Export documented domain contracts for MIG-03 through MIG-09. MIG-04 owns history-specific mapping; avoid editing that section concurrently.

## Starting points and ownership

- `src/data/internal/product/OverviewProduct.ts`
- `src/data/internal/product/ProductImageData.ts`
- `src/data/internal/product/UserProductData.ts`
- `src/data/internal/product/ProductState.ts`
- `src/data/internal/price`
- `src/data/internal/hooks/ApiError.ts`
- `src/hooks/common/useApiError.ts`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Mapper tests cover minimal summary/detail, missing/redacted text/slug/images, unknown availability, all price variants and both valuation variants.
- [ ] No defaults invent a title, auction, price, seller or sale fact.
- [ ] Error mapping accepts new source keys and body-less failures.
- [ ] Publish shared types/query-key contracts before dependent agents change consumers.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.


---

# Rework listing cards, detail pages and canonical links for the new model

Planning ID: MIG-03
Priority: P0
Dependencies: MIG-02; MIG-00 legacy URL/public-source decisions

## Problem

Product routes currently depend on shopSlugId/productSlugId or shopId/shopsProductId. The backend now resolves detail by productListingId or a globally addressed productListingTitleSlugId. Summary cards also lose fields the existing UI assumes.

## Scope

- Switch detail loaders and generated query helpers to getProductListing/getProductListingByTitleSlug; keep first-paint data in loaders.
- Update cards/detail presentation to MIG-02 models: optional titles, redacted slugs/images, on-request prices, nullable availability, withdrawal and sale-observation valuation. Omit summary auction badges where no auction data exists.
- Use source.name for attribution; remove unsupported seller, shop-type, address and location assumptions. Follow MIG-06 decisions for source-profile links.
- Centralize canonical listing link generation across cards, grids and detail metadata. Keep hidden/redacted cards non-linking when the public locator is withheld; do not derive a slug from title/URL.
- Implement agreed canonical browser routes and legacy behavior. Old pair-based identifiers cannot be converted to a listing ID by string manipulation; do not promise redirects without a resolver.
- Update JSON-LD, canonical/hreflang, social metadata, breadcrumbs and share links. Do not emit a monetary Offer for ON_REQUEST or unknown prices or invent availability.
- Migrate similar listings and more-from-source queries; retain 202 pending handling and implement bounded polling of the documented Location safely, canceling on unmount/identity changes. This response was already handled as pending; preserve it through migration.
- Coordinate shared route registration/test utilities with MIG-06 and MIG-24.

## Starting points and ownership

- `src/routes/$lng.shops.$shopSlugId.products.$productSlugId.tsx`
- `src/routes/$lng.product.$shopId.$shopsProductId.tsx`
- `src/features/product/catalog`
- `src/features/product/detail`
- `src/features/location-display`
- `src/lib/seo`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Detail load by canonical ID/slug, missing listing and redacted summary paths behave deliberately.
- [ ] Source and display prices are not double-converted; on-request/unknown prices render correctly.
- [ ] Similar-listing 202 → 200 and cancellation tests pass.
- [ ] SSR output and SEO remain deterministic across all five locales; pnpm build passes after dependencies land.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Rebuild listing history and price charts around typed change sets

Planning ID: MIG-04
Priority: P1
Dependencies: MIG-02

## Problem

Old history consists of PRODUCT_CREATED and separate product event payloads addressed through a shop/product pair. New history has PRODUCT_LISTING_DISCOVERED and PRODUCT_LISTING_CHANGED entries, and a changed entry can contain several typed changes.

## Scope

- Call getProductListingHistory using productListingId; history no longer accepts localization/currency parameters.
- Introduce dedicated history types/mappers, extracting them from ProductDetails.ts if needed to avoid coupling to detail DTOs.
- Map discovery snapshots and every change variant: MAIN_PRICE_CHANGED, MINIMUM_ESTIMATE_CHANGED, MAXIMUM_ESTIMATE_CHANGED, AVAILABILITY_CHANGED, URL_CHANGED, IMAGES_CHANGED, AUCTION_CHANGED, WITHDRAWN, RESTORED, SALE_OBSERVED and SALE_OBSERVATION_RETRACTED.
- Render all changes within a single event without dropping or duplicating changes.
- Update charts for previous/current nullable monetary/on-request prices; never plot null/on-request as zero or silently compare different source currencies.
- Distinguish a sale observation from a confirmed transaction and withdrawal from sale; preserve timestamps and FX observation provenance.

## Starting points and ownership

- `src/data/internal/product/ProductDetails.ts`
- `src/features/product/detail/components`
- `src/features/product/detail/api`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Tests cover discovery, multi-change events, every discriminant, on-request transitions, absent estimates and sale-observation retraction.
- [ ] Chart series do not fabricate values or mix currencies.
- [ ] Unknown future history kinds fail safely without crashing the entire page.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Replace product search filters and pagination with canonical listing search

Planning ID: MIG-05
Priority: P0
Dependencies: MIG-02; MIG-00 search serialization/filter decisions

## Problem

The current useSearch sends shopName, sellerName, shopType and old state filters. The target only exposes GET /api/v1/product-listings with a smaller filter set and an FX-pinned cursor object.

## Scope

- Replace simpleSearchProducts with simpleSearchProductListings. Remove complex-search POST assumptions even though the current main search hook already uses GET.
- Keep productQuery, enhancedSearchDescription, price/date/auction ranges, excludeProductId and source inclusion/exclusion by listingSourceId/excludeListingSourceId; preserve the schema's excludeProductId spelling.
- Replace old state filters with nullable listing availability. Remove shop/seller name, shop type, category/period and geographic filter assumptions unsupported by the target endpoint.
- Remove price sorting: target sort values are score, updated and created. Normalize obsolete bookmarked query parameters with visible, localized feedback where meaning would otherwise change.
- Replace merchant/seller autocomplete callers that use removed simpleSearchShops. Do not substitute adminSearchListingSources in collector search; use only the approved MIG-00 source-selection behavior.
- Serialize the complete { fxRateId, searchAfter } cursor as one JSON query value. Reset it on query/filter/sort/locale/currency changes and preserve it unchanged across a pagination chain.
- Treat total as optional/nullable and use cursor presence to decide continuation. Preserve price inputs in minor currency units.
- Keep orderability/includeUnspecifiedAvailability controls out of GET search until the parameter mismatch is resolved; coordinate saved-search-specific support with MIG-07.
- Update landing recently-added query consumption and search-specific URL validation/defaults.

## Starting points and ownership

- `src/features/search/products`
- `src/data/internal/search/SearchFilterArguments.ts`
- `src/data/internal/search/SearchResultData.ts`
- `src/data/internal/search/SortMode.ts`
- `src/routes/$lng.search.tsx`
- `src/features/landing/components/recently-added-section`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Tests assert actual serialized query strings including deep ranges, repeated arrays and the full FX cursor.
- [ ] No removed filters/sorts are sent; legacy URLs do not silently change meaning.
- [ ] Paging, optional totals, empty results and changing currency/filter mid-pagination work.
- [ ] Five-locale UI and route build checks pass.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Retire or redesign public shop discovery and unsupported source profiles

Planning ID: MIG-06
Priority: P0
Dependencies: MIG-00 public-source decision; MIG-02/MIG-03 agreed links

## Problem

Public shop search, by-ID/domain lookup and taxonomy endpoints are absent. getListingSourceBySlug requires authentication and the source DTO no longer has shop type, partner status or structured/geographic address. Existing landing and public shop pages cannot be preserved by renaming endpoints.

## Scope

- Apply the documented product decision for search/shops, shop profile routes, source cards, landing shop sections and navigation. If no public contract is supplied, remove/gate those entry points and provide deliberate old-URL behavior.
- Never expose admin source/party search through a public loader or server proxy.
- Remove unsupported partner badges, dealer/auction classifications and address/location UI from source DTO consumers.
- Retain more-from-source listing search where listingSourceId is already known, without requiring private source detail.
- Audit category/period client consumers; no production callers were found in the initial scan, so remove obsolete dependencies rather than invent replacement endpoints.
- Coordinate route/link contracts with MIG-03 and remove stale SEO/prerender/sitemap/navigation references.
- Update affected landing marketing copy and product documentation to match the available discovery experience.

## Starting points and ownership

- `src/features/search/shops`
- `src/features/shop/profile`
- `src/data/internal/shop`
- `src/features/landing/pages/LandingPage.tsx`
- `src/routes/$lng.search_.shops.tsx`
- `src/routes/$lng.shops.$shopSlugId.index.tsx`
- `src/features/app-shell`
- `vite.config.ts`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Anonymous navigation never calls an admin endpoint or leaks protected source/operator data.
- [ ] Removed discovery links and old URLs have explicit behavior.
- [ ] Landing still works without shop search and does not display fictitious counts/data.
- [ ] SSR/prerender and all-locale builds pass.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Rework saved searches, previews and match feedback

Planning ID: MIG-07
Priority: P0
Dependencies: MIG-02/MIG-05; MIG-00 preview/filter decision

## Problem

Saved-search endpoints mostly keep their IDs but embed ProductListingSearchData. The dedicated preview endpoint is absent; matches use listing IDs and a different pagination cursor.

## Scope

- Update saved-search mapping, create/edit wizard, filter summary/detail and persisted search serialization for the new search shape.
- Remove obsolete shop/seller/type/location criteria and preserve supported filters. Handle unsupported legacy saved filters visibly rather than silently broadening them.
- Replace getSearchFilterPreviewProducts with canonical listing search using the saved criteria only where semantics match. Do not label a preview as persisted matches; if orderability/includeUnspecifiedAvailability cannot be expressed through GET, follow MIG-00's decision.
- Use listSearchFilterMatches with fixed ascending match-creation ordering. Serialize the returned [timestamp, productListingId] array as JSON for the string query parameter.
- Address feedback mutations by userSearchFilterId + productListingId. Map productListingId/originEventId in match metadata.
- Remove old match sort/order controls and saved-filter server sort/order parameters, which are no longer declared.
- Keep the saved-filter collection's from/size/total shape; do not force every collection into the new product search cursor model.
- Preserve nullable patch behavior, match hiding and notification preferences; coordinate new card/query-key contracts with MIG-02.

## Starting points and ownership

- `src/features/saved-searches`
- `src/data/internal/search-filter`
- `src/routes/$lng._auth.me.search-filter.$filterId.tsx`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Create/edit/clear supported criteria, preview, saved matches and feedback tests use new fixtures.
- [ ] Legacy criteria cannot disappear without an explicit UX policy.
- [ ] Match pagination, null/false feedback and hidden cards are covered.
- [ ] No requests use the removed preview endpoint or shop/product pair feedback path.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Migrate watchlist identity, mutations and cursor pagination

Planning ID: MIG-08
Priority: P0
Dependencies: MIG-02/MIG-03

## Problem

Watchlist add/update/delete moves from shopId + shopsProductId to productListingId. Mutations return WatchlistEntryData rather than a complete personalized product, and GET has fixed ordering with a tuple cursor.

## Scope

- Use getWatchlistProductListings, PostWatchlistData and productListingId path parameters.
- Preserve notifications and ResourceState mutation behavior while consuming entry-only responses; update cached domain user state explicitly or refetch instead of mapping the entry as a listing detail.
- Serialize the returned [timestamp, productListingId] cursor to the string query value; drop unsupported watchlist sorting and total assumptions.
- Re-key optimistic changes and invalidations across detail, summary, search, related listings and saved matches using MIG-02 helpers.
- Handle add conflict/limits, delete/update failures, rollback and end-of-pagination without duplicating entries.
- Keep authenticated cache state isolated across sign-out/user changes. Do not broaden credential acceptance based on contradictory prose until MIG-00 resolves it.

## Starting points and ownership

- `src/features/watchlist`
- `src/data/internal/product/UserProductData.ts`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Tests cover add, duplicate add, remove, notification toggle, resource-state change and rollback.
- [ ] Entry-only responses never replace listing detail cache objects.
- [ ] Pagination and cross-view state invalidation use canonical listing identity.
- [ ] No watchlist path/body contains the old shop/product pair.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Rebuild notifications around notification IDs, kind and typed changes

Planning ID: MIG-09
Priority: P0
Dependencies: MIG-02/MIG-03; MIG-15 application links

## Problem

The current notification UI uses origin event IDs for mutation paths and old nested payload discriminants. New notifications have notificationId, kind and payload; bulk selected and bulk all operations are separate.

## Scope

- Use listNotifications with language and cursor only; remove currency/sort parameters. Price notifications preserve immutable source currency.
- Map NotificationData.kind and payload for WATCHLIST_PRICE_CHANGED, WATCHLIST_AVAILABILITY_CHANGED, SEARCH_FILTER_MATCH and partnership approval/rejection.
- Replace oldPrice/newPrice and oldState/newState assumptions with typed change objects, nullable MONETARY/ON_REQUEST prices and nullable availability.
- Pass notificationId to updateNotificationSeen/deleteNotification; do not use originEventId or product eventId.
- Call updateAllNotificationsSeen at /me/notifications/all for mark-all. Use updateNotificationsSeen at /me/notifications only for explicit notificationIds + seen; deletion of all remains the collection DELETE.
- Handle mutation 204 responses without trying to map a returned notification; update caches/rollback as appropriate.
- Serialize tuple cursors; remove assumptions about external/createdBy/updatedBy/originEventId fields removed from NotificationData.
- Map unseenNotificationIds and update listing cards, badges, links and unread state consistently. Render redacted text/images safely.

## Starting points and ownership

- `src/features/notification-center`
- `src/data/internal/notification/Notification.ts`
- `src/data/internal/product/UserProductData.ts`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Tests distinguish notification ID from event ID and selected-bulk from mark-all requests.
- [ ] Every notification kind renders, including missing image/title and on-request/null price.
- [ ] Pagination, immutable source-currency display, seen/unseen and 204 cache updates pass.
- [ ] No removed payload audit fields are synthesized.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Migrate account preferences and sensitive-content visibility

Planning ID: MIG-10
Priority: P0
Dependencies: MIG-01/MIG-02

## Problem

GetUserAccountData becomes OwnUserAccountData. The account loses audit timestamps and addresses; prohibitedContentConsent becomes non-nullable showUnassessedOrSensitiveContent in patch payloads. Existing mapping creates Dates from removed fields and sends null for omitted consent.

## Scope

- Update account/registration/preference adapters and consumers to OwnUserAccountData, preserving nullable names/language/currency/measurementUnit and nullable stripeCustomerId.
- Replace prohibitedContentConsent with showUnassessedOrSensitiveContent across account form, preference cache and image/content policy integration. Omit an unchanged preference rather than sending null.
- Remove account structured/geographic address and created/updated/audit assumptions; preserve measurement units, which already exist in the generated baseline.
- Reconcile ALLOWED, REQUIRES_CONSENT and unassessed content presentation with the documented new preference; do not treat unknown content as automatically allowed or recover redacted content from URLs.
- Update auth/account invalidation on preference change and deletion so personalized cached listings are refreshed safely.
- Review privacy guidance and all five locale explanations for the broader content-visibility meaning.
- Verify existing billing manage flow still sends plan/cycle for free and paid users. Its basic request shape is unchanged; do not redesign billing unnecessarily. Preserve account-deletion and newsletter flows against the regenerated client.

## Starting points and ownership

- `src/data/internal/account/UserAccountData.ts`
- `src/features/account-management`
- `src/features/authentication/hooks/useRegistrationAccount.ts`
- `src/features/preferences`
- `src/features/product/catalog/components/media`
- `src/features/billing`
- `src/features/legal/content/privacy`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Tests reject null visibility patches and prove omitted fields stay omitted.
- [ ] No invalid Date construction or missing-address reads remain.
- [ ] Preference changes update redaction-sensitive caches and SSR stays deterministic.
- [ ] Billing/free-paid and deletion regressions are checked; privacy copy matches the implemented behavior.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Update access-token scopes and asymmetric create/edit payloads

Planning ID: MIG-11
Priority: P0
Dependencies: MIG-01/MIG-02

## Problem

Scope values change and token patch uses scopes/expires, while create/read still use scope/expiresAt. A global field rename would break one side of the API.

## Scope

- Replace products:write and shops:manage options with exactly the supported scope enum: product-listings:write, users:read, users:write, access-tokens:read, access-tokens:write, search-filters:write, watchlist:read, watchlist:write.
- Preserve least-privilege defaults; do not automatically grant replacement admin capabilities to previously issued tokens.
- Map create/read scope and expiresAt separately from patch scopes and expires.
- Omitted patch fields preserve state; expires: null clears expiry, scopes: [] clears scopes, and null name/scopes is invalid.
- Treat at_-style token IDs as opaque. Preserve one-time plaintext display on create and masked values on subsequent own-token reads.
- Keep admin token metadata out of this feature; MIG-21 owns its distinct DTO and endpoints.
- Export shared scope metadata for OAuth owners, with localized descriptions in all five locales.

## Starting points and ownership

- `src/features/partner/access-token-management`
- `src/features/partner/common/components/AccessTokenCreateForm.ts`
- `src/features/partner/common/components`
- `src/client/types.gen.ts`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Create/edit tests assert exact asymmetric wire field names and omission/null/empty-array semantics.
- [ ] All supported scopes have accurate labels and no obsolete scope is sent.
- [ ] Secret masking/one-time display and idempotent deletion regressions pass.
- [ ] No scope migration silently expands access.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Rework OAuth consent and WooCommerce selection for listing sources

Planning ID: MIG-12
Priority: P0
Dependencies: MIG-00 consent metadata decision; MIG-11/MIG-14

## Problem

The ordinary-user consent hook calls getOAuthClient, whose target counterpart is now admin-only. OAuthScope is hardcoded to shops:manage/products:write, and selection currently uses partner shops.

## Scope

- Implement the approved ordinary-user metadata/consent flow; do not call adminGetOAuthClient from an ordinary-user screen or proxy it using elevated credentials.
- Use MIG-11 scope metadata for all new capabilities and display exactly what is requested/granted.
- Replace getMyPartnerShops and shopId selection with getMyListingSources and listingSourceId. A selected source is not a grant enforced by the unchanged OAuth authorize parameters; do not claim source-scoped token authorization without a backend contract.
- Update signed/validated broker state, return links and WooCommerce integration selection to canonical source identifiers, with an explicit backward-compatibility policy for existing state.
- Preserve authorization code flow, S256 PKCE, redirect validation, state binding and server-side token exchange. The five OAuth protocol endpoint paths remain unchanged.
- Keep thirdPartyCode UUID handling where explicitly declared; do not globally replace every UUID validator.
- Update docs/oauth-protocol-guidelines.md and relevant consent/integration copy.

## Starting points and ownership

- `src/features/oauth`
- `src/features/oauth-client-broker`
- `src/routes/api.oauth.authorize.approve.ts`
- `src/routes/api.oauth.client_.redirect-broker.woocommerce.ts`
- `docs/oauth-protocol-guidelines.md`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Ordinary users can review trustworthy client metadata without admin credentials.
- [ ] Scope and listing-source selection tests pass, including empty/revoked access and tampered state.
- [ ] PKCE/redirect validation and secret-free responses/logs remain covered.
- [ ] New and intentionally handled legacy broker states have explicit tests.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Update partner API documentation, batch semantics and WooCommerce contract

Planning ID: MIG-13
Priority: P0
Dependencies: MIG-01 tooling; MIG-11/MIG-14 shared token/source models

## Problem

The embedded API extractor hardcodes /shops/{shopId}/products and async 202 semantics. The target uses synchronous 200 batches under /listing-sources/{listingSourceId}/product-listings and adds batch withdrawal.

## Scope

- Update the extractor to include POST/PATCH/PUT/DELETE on the new path; emit the partner subset from the same pinned schema as the client and prune unrelated components/security material where appropriate.
- Update Scalar integration, custom-integration request examples, source selectors and token scope references.
- Document maxItems 100, empty [] success, per-entry transactions, partial-failure objects { listingSourceId, sourceListingId, error }, and all-fail problem responses. Do not report queue acceptance as success.
- Use sourceListingId, tagged MONETARY/ON_REQUEST price, nullable availability, required create title/description/url/images and removal of seller/address fields.
- Explain PATCH null clearing versus invalid null URL/images; PUT omit/preserve, null/clear for availability/prices/auction, omit/preserve images, []/clear images, and omit-or-null/preserve URL. Explain restoration of withdrawn listings.
- Describe DELETE as batch withdrawal, not old single-product deletion; retry only failed entries when appropriate.
- Update WooCommerce path/source IDs, required signature header, optional delivery ID, 204 outcome, source ordering/digest conflict errors and timestamp fields. The browser must never send or expose webhook secrets.
- Fix stale price examples against the actual tagged union, even if upstream examples still lag. Update integration behavior and marketing copy in all five locales.

## Starting points and ownership

- `scripts/generate_partner_products_openapi.py`
- `public/partner-products.openapi.json`
- `src/features/partner/partner-program`
- `docs/product-context.md`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Regenerated partner subset has all four methods, resolves references and contains no old shop/product paths.
- [ ] Example payloads validate against the schema, including type: MONETARY.
- [ ] Documentation covers empty/partial/all-failure and null/omission behavior correctly.
- [ ] Embedded docs and custom integration page build successfully; no webhook secret appears in public output.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Replace partner shop editing with granted listing-source access

Planning ID: MIG-14
Priority: P0
Dependencies: MIG-01/MIG-02; MIG-00 if partner-edit capability is requested

## Problem

getMyListingSources returns only listingSourceId, listingSourceSlugId and name. It does not return full editable shop details. The only source update endpoint is admin-only, so current partner shop editing has no documented replacement.

## Scope

- Introduce shared own-listing-source types/hook for partner portfolio, OAuth and custom integration pages.
- Replace getMyPartnerShops and old ShopDetail mapping with the lightweight administered-source list.
- Remove partner metadata edit actions and usePatchMyPartnerShop unless the backend supplies a separately authorized partner update contract. Do not redirect partners to adminUpdateListingSource.
- Make granted access and empty/revoked-access states clear; do not infer ownership, partner status or edit permission from a source being listed.
- Update relevant partner route labels, navigation and documentation. Retain existing browser URLs only under an explicit compatibility policy.
- Publish the shared hook/type contract before MIG-12/MIG-13 integrate it.

## Starting points and ownership

- `src/features/partner/common/api/usePartnerShops.ts`
- `src/features/partner/shop-management`
- `src/routes/$lng._auth.partners.shops.tsx`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] The minimal three-field DTO renders without requests for missing fields.
- [ ] Partners never invoke an admin update endpoint.
- [ ] Revoked/empty access and integration selection states are tested.
- [ ] Obsolete shop-edit controls, hooks and tests are removed or replaced deliberately.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Rebuild partnership applications as immutable proposals

Planning ID: MIG-15
Priority: P0
Dependencies: MIG-01; MIG-00 existing-source selection decision

## Problem

Old applications carry shop payloads, business/execution states and applicant PATCH editing. New own applications expose only id, state and proposal; applicants can submit, read and withdraw, with no PATCH endpoint.

## Scope

- Replace endpoints under /me/partner-applications with /me/partnership-applications and map OwnPartnershipApplicationData separately from admin DTOs.
- Rebuild create forms for EXISTING_LISTING_SOURCE { listingSourceId } and PROPOSED_LISTING_SOURCE { party, listingSource }; collect only defined party contacts, source name/url/image and requestedIngestionMethods.
- Remove shop type, domains, structured address and execution status fields. Do not fabricate timestamps, approval linkage or applicant metadata absent from the own DTO.
- Remove applicant editing; implement withdrawal through DELETE with explicit WITHDRAWN presentation and 409 handling according to backend responses.
- Replace public shop autocomplete with the approved authorized source-selection UX; do not use admin search.
- Update integration eligibility states and application links for the new ID/state/proposal model. MIG-14 owns the granted-source list itself.
- Review privacy copy for removed address collection and new party/source proposal semantics.

## Starting points and ownership

- `src/features/partner/application-management`
- `src/data/internal/partner-application/PartnerApplication.ts`
- `src/features/partner/partner-program/pages/PartnerCustomIntegrationPage.tsx`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Both proposal variants submit exact schema payloads and render returned minimal own DTOs.
- [ ] No applicant PATCH or old execution-state UI remains.
- [ ] Withdrawal, conflict, missing application and empty lists are tested.
- [ ] Applications never acquire admin-only DTO fields through unsafe fallback requests.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Rebuild admin partnership application review and decisions

Planning ID: MIG-16
Priority: P0
Dependencies: MIG-01/MIG-15 shared proposal types

## Problem

Admin applications move to /admin/partnership-applications and a paginated summary model. The old arbitrary PATCH editor becomes a body-less SUBMITTED → IN_REVIEW transition.

## Scope

- Use adminSearchPartnershipApplications with state/applicantUserId/proposalType/listingSourceId/date filters, created/updated sort, order and JSON-encoded tuple cursor.
- Map admin summaries and detail separately; only summary guarantees created/updated, while detail includes approvedPartnershipId and approvedListingSourceId.
- Replace AdminApplicationEditDialog with the domain-authorized mark-in-review action: PATCH without a body, not arbitrary state or proposal editing.
- Use adminDecidePartnershipApplication with only decision: APPROVE or REJECT; handle 409 transition conflicts and refetch authoritative state.
- Remove execution tracking, old payload editing and old decision enums/notes that are absent from the schema.
- Link approved resources to partnership/source admin areas via returned IDs and invalidate relevant list/overview caches.
- Keep all data behind existing admin authorization boundaries.

## Starting points and ownership

- `src/features/admin/partner-application-management`
- `src/data/internal/partner-application`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Summary/detail fixtures prove missing detail timestamps do not crash rendering.
- [ ] Requests cover allowed review/decision transitions, no-body PATCH and conflicts.
- [ ] Filters and cursor serialization are tested.
- [ ] Review cannot submit arbitrary state/proposal mutations.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Add admin party management for source operators

Planning ID: MIG-17
Priority: P1
Dependencies: MIG-01/MIG-02

## Problem

Parties are new first-class entities with five admin operations. Their contact data replaces part of the former shop model and supplies source operators and partnership identities.

## Scope

- Add a feature slice for adminSearchParties/adminCreateParty/adminGetParty/adminUpdateParty/adminDeleteParty.
- Map PartySummaryData/PartyData, partyId/partySlugId and nested contact. Create accepts name/phone/email; patch null clears phone/email, omitted preserves.
- Implement query/name/phone/email/date filters, declared sorts and string cursor paging; handle optional total.
- Provide a reusable admin party picker for source creation without conflating parties with listing sources or users.
- Handle deletion conflicts without promising cascading deletion of sources or partnerships.
- Add thin admin routes and navigation; coordinate shared shell changes through MIG-24.
- Keep contacts private and review privacy alignment; add no public party directory.

## Starting points and ownership

- `src/features/admin/common`
- `src/features/admin/party-management (new)`
- `src/data/internal/party (new)`
- `src/routes (new admin route)`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] CRUD, filter/pagination, null clearing and conflict behavior have focused tests.
- [ ] Unauthorized access cannot expose contacts.
- [ ] Picker returns canonical party identity and avoids duplicate accidental creation.
- [ ] All five locale strings and admin route build checks pass.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Replace admin shop CRUD with listing-source management

Planning ID: MIG-18
Priority: P0
Dependencies: MIG-01/MIG-17; MIG-00 configuration read/edit decision

## Problem

Shop CRUD is replaced by dedicated admin listing-source APIs, operator parties and ingestion configuration. Create/update return only ListingSourceReferenceData, and read/list DTOs have different shapes.

## Scope

- Replace useAdminShops, postShop, getShopById and patchShopById with adminSearch/Create/Get/Update/DeleteListingSource.
- Build supported query/name/source-ID/slug/operator/ingestion-method filters and sort/pagination.
- Rebuild forms with existing/new operator union on create, ingestionConfiguration variants UNCONFIGURED/WEB_CRAWL/SHOPIFY/WOOCOMMERCE/PARTNER_API, presentation URL/image and optional PARTNERIZE referral config.
- Do not offer operator reassignment in update: UpdateListingSourceData has no operator property.
- Treat woocommerceWebhookSecret as write-only, never prefilled/read back. Omission preserves, null clears only nullable fields; unchanged unseen ingestion config must not be overwritten.
- Respect configuration method constraints and immutable slug semantics on rename; apply the MIG-00 decision for incomplete configuration readback.
- Map create/update reference-only responses and refetch detail/list rather than casting to a full source.
- Remove old shop types, domains, partner status, geo/address fields and endpoint-backed category/period metadata.
- Implement deletion with conflict handling and coordinated source/partnership/overview invalidation.

## Starting points and ownership

- `src/features/admin/shop-management`
- `src/features/shop/common/lib/shopFormUtils.ts`
- `src/data/internal/shop`
- `src/routes/$lng._auth.admin.shops.tsx`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Tests cover each ingestion variant, operator creation/selection, reference-only mutation responses and immutable slug.
- [ ] Secret and config omission/null semantics cannot accidentally clear unseen values.
- [ ] Search/paging/delete conflicts and authorization are covered.
- [ ] No private configuration is rendered into public source pages.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Add admin partnership membership and source-grant management

Planning ID: MIG-19
Priority: P1
Dependencies: MIG-01/MIG-17/MIG-18

## Problem

Partnerships are separate from applications and listing sources. Seven new operations expose list/detail, dissolution and explicit membership/source grants.

## Scope

- Implement adminSearchPartnerships/adminGetPartnership with partyId/memberUserId/listingSourceId filters and tuple-cursor pagination.
- Display party summary, memberUserIds/listingSourceIds, counts and timestamps from the appropriate summary/detail DTOs.
- Implement grant/revoke membership via /members/{userId} and grant/revoke listing-source access via /listing-source-grants/{listingSourceId}.
- Handle 204 without parsing JSON; respect member/source arrays capped at 100 and show backend conflicts.
- Explain and enforce UX around the same-party source-grant constraint; backend remains the authority.
- Add explicit dissolution action using adminDissolvePartnership, with failure/conflict states and downstream invalidation.
- Invalidate own-source access/selection and admin overview where affected; never infer access solely from user role or application approval.
- Keep this distinct from application decisions and source editing.

## Starting points and ownership

- `src/features/admin/partnership-management (new)`
- `src/features/admin/common`
- `src/routes (new admin route)`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Tests cover grant/revoke idempotent outcomes, 204 handling, wrong-party 409 and dissolution failure.
- [ ] Summary and detail display does not confuse counts with loaded page lengths.
- [ ] Revoked access invalidates relevant cached selections.
- [ ] All routes enforce admin access and use localized copy.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Migrate admin user search, detail and segregated updates

Planning ID: MIG-20
Priority: P0
Dependencies: MIG-01/MIG-10

## Problem

Admin users move from /api/v1/users to /api/v1/admin/users. Search returns reduced summaries; own/admin account fields change, cursor semantics change, and PATCH must contain one logical change category.

## Scope

- Use relocated adminSearchUsers/adminGetUser/adminPatchUser/adminDeleteUser and map AdminUserSummaryData versus AdminUserAccountData separately.
- Update search filters to the exact declared query parameters and new name sort; preserve string User-ID continuation cursors and reset on filter/sort changes.
- Remove audit/address fields missing from detail and avoid assuming timestamps/preferences exist on a summary.
- Split profile/preferences, role and tier changes into separate requests; do not submit mixed categories. Surface partial completion if a multi-action workflow is used.
- Replace sensitive-content preference name and update nullable profile fields using MIG-10 contracts. Admin PATCH adds email, removes stripeCustomerId/structuredAddress, and no longer accepts null for tier or role.
- Handle last-active-admin demotion/deletion 409 and no-store private data behavior.
- Leave suspension/session/token controls to MIG-21; provide extension points instead of editing the same component concurrently.

## Starting points and ownership

- `src/features/admin/user-management`
- `src/data/internal/admin/AdminUser.ts`
- `src/routes/$lng._auth.admin.users.tsx`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Search/detail fixtures differ and both render without fabricated fields.
- [ ] Tests prove role, tier and profile are sent in separate PATCH requests.
- [ ] Last-admin 409 and stale cursor/filter changes are covered.
- [ ] User IDs are opaque and admin state is never publicly cached.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.


---

# Add admin suspension, session revocation and token revocation controls

Planning ID: MIG-21
Priority: P1
Dependencies: MIG-20/MIG-11

## Problem

Six new admin operations control suspension, Cognito sessions and Aura access-token metadata/revocation. These are distinct capabilities and must have distinct user-visible effects.

## Scope

- Add suspend/unsuspend controls using adminSuspendUser/adminUnsuspendUser. Validate nonblank reason within the documented 1,000-byte limit; the backend logs this reason, so explain its purpose and keep secrets out.
- Do not claim a suspension state is available from account detail if the schema does not expose it; use confirmed action responses and refetch available authoritative data.
- Add adminRevokeUserSessions separately from Aura token revocation; global sign-out does not revoke Aura tokens or dissolve partnerships.
- Add adminListUserAccessTokens with its own non-secret AdminAccessTokenData mapper: scopes/expires/origin, no token value or invented created timestamp.
- Implement single and all-token revocation scoped to the target user, handling 204 idempotent responses and tuple cursor serialization.
- Handle last-active-admin conflicts and reauthentication after self-targeted actions.
- Review admin authorization/privacy guidance, avoiding storage/logging of token material or sensitive reasons beyond the authorized request.

## Starting points and ownership

- `src/features/admin/user-management (dedicated security components/API slice)`
- `docs/admin-authorization-guidelines.md`
- `docs/privacy-policy-alignment.md`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Tests distinguish suspension, session revocation and token revocation effects.
- [ ] Unicode byte-limit, blank reason, last-admin conflict and 204 outcomes are covered.
- [ ] Admin token views never contain raw, hashed or masked token values.
- [ ] Revocation targets the selected user and cannot reuse another user's cached token list.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Migrate admin OAuth client management to secret-free paginated DTOs

Planning ID: MIG-22
Priority: P0
Dependencies: MIG-01/MIG-11

## Problem

OAuth client management moves under /admin/oauth-clients. Collection, detail and patch now return secret-free DTOs; only create returns client_secret. The list changes from an array to a paginated collection.

## Scope

- Replace get/post/patch/deleteOAuthClient and getOAuthClients with admin-prefixed operations.
- Map OAuthClientAdminCollectionData/OAuthClientAdminData separately from the create-only OAuthClientMetadataResponseData.
- Add clientId/name filters and JSON-encoded tuple pagination without reading total from an array length.
- Remove assumptions that list/detail/edit can display even a masked client_secret. Keep one-time create secret out of query caches, persistence, logs and analytics.
- Update patch omission semantics: every explicit null is invalid, scope: [] clears scopes, redirect_uris remains nonempty and HTTPS validation follows documented requirements.
- Consume shared scope definitions from MIG-11 and preserve no-store/admin authorization behavior.
- MIG-12 owns ordinary-user consent; do not reuse this admin hook there.

## Starting points and ownership

- `src/features/admin/oauth-client-management`
- `src/routes/$lng._auth.admin.oauth-clients.tsx`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Tests prove list/detail/update work with no client_secret property.
- [ ] Only creation shows plaintext once; closing clears local secret state.
- [ ] Pagination, scope clearing, rejected nulls and redirect validation are covered.
- [ ] Admin hooks are not imported into the ordinary-user consent flow.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Use the dedicated admin overview aggregate endpoint

Planning ID: MIG-23
Priority: P1
Dependencies: MIG-01; MIG-16/MIG-18/MIG-19/MIG-20/MIG-22 navigation contracts

## Problem

AdminOverviewPage currently fetches user/application/OAuth collections and derives counts from available rows. getAdminOverview supplies dedicated aggregate counts including new parties, partnerships and listing-source/listing dimensions.

## Scope

- Add a typed mapper/query for getAdminOverview and replace full-collection reads used only for dashboard counts.
- Render the schema's actual aggregate groups and totals, including user tiers/roles, application states, listing-source ingestion assignments and active/withdrawn/availability counts.
- Respect snapshot/count semantics; method assignments may overlap and must not be summed as distinct source totals.
- Display explicit loading/error states rather than replacing unavailable counts with zero.
- Link to the migrated admin sections and coordinate invalidation after administrative mutations.
- Keep aggregate responses private/no-store and avoid deriving totals from paginated results.

## Starting points and ownership

- `src/features/admin/overview/pages/AdminOverviewPage.tsx`
- `src/features/admin/overview/api (new)`
- `src/features/admin/overview/types (new)`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Overview no longer fetches entire collections just to count rows.
- [ ] Zero, unavailable, nonzero and overlapping method counts render correctly.
- [ ] Every link targets the agreed migrated admin route.
- [ ] Focused query/mapper/component tests pass.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.



---

# Integrate migration slices and verify complete contract coverage

Planning ID: MIG-24
Priority: P0
Dependencies: MIG-01 through MIG-23; unresolved MIG-00 decisions closed or explicitly gated

## Problem

Changing the generated client alone leaves UI, routes, mocks, documentation and cross-feature caches inconsistent. This is the release gate after independently owned slices land.

## Scope

- Integrate slices on the shared migration branch; coordinate route/navigation registration and resolve shared locale/test-utility edits.
- Use docs/api-migration/operation-inventory.md and field-differences.md to account for every retained, renamed, removed and new operation/model. New admin capabilities must either be implemented by their owner or explicitly deferred with an approved product decision.
- Search non-generated source, tests, docs and examples for obsolete endpoints/scopes/IDs, removed fields, old cursors and direct DTO assumptions. Distinguish intentional legacy URL support and historical migration docs from active calls.
- Update common fixtures to include prefixed opaque IDs, redacted listings, nullable availability, on-request prices, tuple/string/FX cursors, secret-free OAuth admin records and minimal source/account/application DTOs.
- Confirm unchanged billing/newsletter/OAuth protocol contracts remain functional after client regeneration; do not create needless feature rewrites.
- Run focused tests as slices land, then pnpm lint or pnpm check, pnpm exec tsc --noEmit and pnpm build. No E2E tests unless separately requested.
- Verify SSR/public cache boundaries, no authenticated prerendering, five-locale coverage, and metadata/link consistency.
- Update architecture/product/OAuth/admin/privacy guidance where described behavior changed and record resolved schema revision/tool versions.
- Publish a final operation-to-feature coverage checklist with unresolved gaps explicitly marked. Do not release a partly migrated client.

## Starting points and ownership

- `src/routes`
- `src/features/app-shell`
- `src/test`
- `src/i18n/locales/{de,en,es,fr,it}/translation.json`
- `docs`
- `vite.config.ts`

Own this feature slice and its focused tests/localized copy. Coordinate shared models, route registration and locale-file conflicts with the dependency owners; do not independently regenerate the client.

## Acceptance criteria

- [ ] Every contract difference has an implementation, removal or explicit decision owner.
- [ ] All required checks pass; no obsolete active API calls or type suppressions mask failures.
- [ ] Public pages and ordinary-user/partner/admin flows observe their correct authorization boundaries.
- [ ] No E2E tests were run without authorization; generated files were regenerated, never hand-edited.

## Implementation constraints and validation

Follow AGENTS.md and relevant architecture/design/hydration/privacy guidance. Keep routes thin and DTO mapping outside deep UI. Add user-facing strings to de/en/es/fr/it. Use pnpm only; run focused tests, pnpm lint or pnpm check, and pnpm exec tsc --noEmit. Also run pnpm build for route/SSR/i18n changes. Do not run E2E tests unless requested. Do not hand-edit src/client/** or src/routeTree.gen.ts.

## Contract reference

Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml, captured 2026-09-10; SHA-256 99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36. Baseline client: webapp commit 07e25a5d1c9d037ed978764327d9fb2e11490031. See docs/api-migration/README.md, field-differences.md, operation-inventory.md and model-inventory.md. Recheck this contract if develop has moved; schema absence is not proof of live endpoint removal.


