# API Contracts

Apply this guide when generating the API client, adopting backend contract changes, or mapping
API DTOs into app models. Partner ingestion is covered in [partner integration](partner-integration.md);
admin workflows in [admin workflows](admin-workflows.md).

## Pinned contract and generation

- `pnpm openapi-ts` generates `src/client/**` and the public partner reference
  (`public/partner-products.openapi.json`) from the same pinned contract, `openapi/swagger.yaml`.
  Generation never fetches a moving contract. Never hand-edit either output.
- The pinned capture is the complete backend `docs/swagger.yaml` at `develop`
  `8614fdac7dec923134ea399864def4e86ebaf8d1` (2026-10-30). Its last contract change is
  `46997f8d8d` ([backend#2655](https://github.com/aura-historia/backend/pull/2655)). Git blob
  `4aaf2fbc9ee2a88d60d18cdc94d44f13088a2041`; file SHA-256
  `fd1441858b68bfcfc3c79be12ddf9b712ad6de9230a4e449c7d38fb130808321`; canonical parsed-JSON
  SHA-256 (recorded as `x-source-contract-sha256` in the partner reference):
  `c9b2c4b8e6cf05d9a2dc560b0565de1351bfac74dd01b55a15cb86000004af49`. It replaces the
  first-production-release capture (`e7c8d0e393`, 2026-10-24) together with the listing-source
  create schema that [#1179](https://github.com/aura-historia/webapp/issues/1179) had grafted onto
  it.
- Every REST operation lives under `/v1/...` on `https://api.aura-historia.com` (production) and
  `https://api.stage.aura-historia.com`; `/api/v1/...` is gone without aliases
  ([backend#2216](https://github.com/aura-historia/backend/issues/2216)). The generated client and
  every hand-built backend URL (OAuth approval and the broker's authorize, token and revoke calls, the similar-listings
  `Location` check, partner examples) use `/v1`. Webapp-owned `/api/...` routes, such as
  `/api/oauth/authorize/approve`, the OAuth client redirect broker and `/api/oauth/broker/woocommerce/*`, are this app's own routes and
  keep their paths. Release this webapp only with or after a backend that serves `/v1`.
- Without `VITE_API_URL` the app calls the production API (`getApiBaseUrl`); each deployment
  sets its environment's API URL explicitly.
- Changes against the previous pin (`e7c8d0e393`, 2026-10-24), with their decisions:
  - **Mutable listing text** ([backend#2597](https://github.com/aura-historia/backend/issues/2597)):
    the admin and partner single-listing PATCH and the partner batch writes (synchronous and
    async) accept tri-state localized `title`/`description` (omit preserves, `null` clears, a value
    sets). The admin listing edit form consumes the admin PATCH (see
    [admin workflows](admin-workflows.md#product-listing-administration)); the partner
    single-listing operations stay generated-only; the custom integration guide and the partner
    reference describe the batch semantics. History adds `TITLE_CHANGED` and
    `DESCRIPTION_CHANGED` (see **Listing history**).
  - **ListingSource platform technology** ([backend#2567](https://github.com/aura-historia/backend/issues/2567)):
    optional `platformTechnology` on the admin detail and search summaries, create (omit or `null`
    records none) and update (omit preserves, `null` clears), plus an exact `platformTechnology`
    search filter. Admin listing-source management shows, filters and edits it (see
    [admin authorization](admin-authorization-guidelines.md)). It is descriptive only, never
    implies ingestion, an installed app or a partnership, and is absent from public and partner
    representations.
  - **Opaque admin search cursors** ([backend#2623](https://github.com/aura-historia/backend/issues/2623)):
    `adminSearchParties`, `adminSearchUsers` and `adminSearchListingSources` return an opaque
    `searchAfter` bound to the filters and sort that produced it; ID cursors and cursors for other
    filters return `400 BAD_QUERY_PARAMETER_VALUE`. No client change was needed: every consumer
    already resends the cursor unchanged from an infinite query whose key holds each filter and
    the sort, so a changed scope starts without a cursor. A traversal that spans the backend
    release fails its next page and restarts on refresh. The cursor embeds the last item's sort
    value (such as a name or email), so it stays out of URLs, logs and analytics.
  - **Readable slugs** ([backend#2654](https://github.com/aura-historia/backend/issues/2654)): new
    Party and ListingSource slugs are the slugified name (`antiques-and-more`, then `-2`, `-3`, …);
    existing UUID-suffixed slugs are kept. Slugs stay opaque and are never parsed. A slug names
    its current holder: a legacy `/shops/<slug>` link, or a slug freed by deleting an unused
    source, can resolve to a later source with that name. A `409 CONFLICT`
    from `adminCreateParty`, `adminCreateListingSource` (including a new operator) or approving a
    proposed-source application can now also mean that every slug candidate for the name is taken;
    the conflict copy says so.
  - **Listing-source create schema** ([backend#2521](https://github.com/aura-historia/backend/issues/2521)):
    `CreateListingIngestionConfigurationData` has no `UNCONFIGURED` member, and an empty
    `ingestionConfiguration` creates a source without methods. #1179 already consumed this; the
    whole capture now carries it.
  - **WooCommerce webhook** ([backend#2523](https://github.com/aura-historia/backend/issues/2523),
    [backend#2522](https://github.com/aura-historia/backend/issues/2522),
    [backend#2606](https://github.com/aura-historia/backend/issues/2606)): `type: variation`
    events are authorized no-ops, `related_ids` is ignored, every DELETE withdraws the listing
    keyed by the delivered `id`, delivery IDs bind exact retries only, and source order follows
    `date_modified_gmt`; after a deletion, an UPSERT without it fails with
    `CAPTURE_RAW_PROVIDER_SOURCE_ORDER_AMBIGUOUS`. The browser never calls the webhook; the custom integration guide and
    [partner integration](partner-integration.md#woocommerce-webhook) follow the contract.
  - **Bounded search dependencies** ([backend#2625](https://github.com/aura-historia/backend/issues/2625)):
    description only. A slow query embedding falls back to BM25 on a first page; a semantic
    continuation or a stalled index returns `503 PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE` instead
    of `408`. The search results' existing error state and retry cover both. Creating or updating
    a search filter whose text needs an embedding now returns `503
    SEARCH_FILTER_TEMPORARILY_UNAVAILABLE` after the same deadline (not yet declared on those
    operations); `apiErrors` translates the code, so the wizard shows a retryable message.
  - Description-only changes elsewhere, including the admin search cursor examples.
  - Backend changelog entries without a contract change need no client change: REST CORS now
    answers `*`, which forbids `credentials: "include"` (the client never sends it); Cognito
    signing-key refresh can briefly return `503` for unknown keys
    ([backend#2621](https://github.com/aura-historia/backend/issues/2621)), handled like any
    unavailable response; MCP dropped its partner tools
    ([backend#2481](https://github.com/aura-historia/backend/issues/2481)), and `llms.txt` already
    lists only consumer tools; unprocessable queued listing commands are set aside sooner
    ([backend#2548](https://github.com/aura-historia/backend/issues/2548)), with unchanged admission
    responses.
  - Release this webapp only with or after a backend that serves this capture: older backends
    reject the admin listing `title`/`description` and the `platformTechnology` members
    (`additionalProperties: false`), although they are sent only when an administrator changes
    them.
- Changes adopted with the `e7c8d0e393` capture (against `9c9204dfce`, 2026-10-19), with their
  decisions:
  - **Base path:** `/api/v1` → `/v1` (above).
  - **Listing shipping** ([backend#2444](https://github.com/aura-historia/backend/issues/2444)):
    `item.shipping` is optional instead of required nullable and is omitted when nothing is
    asserted. Collections (search, similar, watchlist, saved-search matches, auction catalogues)
    return the bounded `ListingShippingSummaryData`/`PersonalizedShippingSummaryData`; detail and
    the watchlist PATCH return `ListingShippingDetailData`/`PersonalizedShippingDetailData`. The
    watchlist, saved-search matches and auction catalogue therefore use the new
    `PersonalizedProductListingCollectionDetailsData`; `mapPersonalizedProductListingDetails` maps
    that collection shape. Shipping itself stays generated-only (see below).
  - **Optional `userState` sections** ([backend#2213](https://github.com/aura-historia/backend/issues/2213)):
    `watchlist`, `contentVisibility`, `notification` and `searchFilter` are each omitted when the
    credential lacks its read scope. See **Listings** below.
  - **Granted-source pages** ([backend#2249](https://github.com/aura-historia/backend/issues/2249)):
    `getMyListingSources` returns `{ items, next? }` with `size`/`after`; the partner portfolio,
    custom integration page and OAuth source selection request later pages on demand
    ([#1154](https://github.com/aura-historia/webapp/issues/1154)). See **Granted listing
    sources** below.
  - **Listing search availability filters** ([backend#2235](https://github.com/aura-historia/backend/issues/2235)):
    `orderability` and `includeUnspecifiedAvailability` are now documented on
    `simpleSearchProductListings` with saved-search semantics. `mapToListingAvailabilityQuery`
    sends them only alongside an availability selection, as a saved search persists them, and
    `matchesNoListingAvailability` short-circuits a predicate that admits nothing (listing search
    drops empty arrays). Saved-search previews therefore cover every filter; the search page has
    no orderability control yet.
  - **OAuth** ([backend#2228](https://github.com/aura-historia/backend/issues/2228),
    [backend#2214](https://github.com/aura-historia/backend/issues/2214)): authorization input
    and token failures use the standard OAuth JSON error (`OAuthErrorData`); authentication and
    authority failures keep `ApiError`. Responses carry `no-store`/`no-cache`, which the approval
    handler keeps on its redirect and forwarded errors; it forwards error bodies unchanged and
    sends the Cognito access JWT the backend now requires. The backend's RFC 8414 metadata names
    this app's `/en/oauth/authorize` as the authorization endpoint, so the consent page accepts an
    optional `resource` (for example the MCP identifier) and passes it unchanged to
    `/v1/oauth/authorize`; the backend validates and binds it, and the client repeats it at token
    exchange. Without it the grant keeps the shared Aura default. The WooCommerce broker
    classifies token-exchange failures by status and OAuth identifier, logs only the status and
    a known `OAuthErrorData` identifier, and repeats the transaction's stored `resource`, if any,
    at token exchange (protocol v2, `docs/oauth-protocol-guidelines.md`).
    `getOAuthAuthorizationServerMetadata` is generated-only.
  - **Cognito-only credential operations** ([backend#2212](https://github.com/aura-historia/backend/issues/2212),
    [backend#2214](https://github.com/aura-historia/backend/issues/2214)): `postMyAccessToken` and
    `adminCreateOAuthClient` no longer accept `AccessTokenAuth` and may return `403`. The browser
    always sends its Cognito access JWT; errors already go through `mapToInternalApiError`.
  - **`OAuthTokenResponseData`:** `expires_in` is non-nullable (omitted for non-expiring tokens)
    and `token_type` is the literal `Bearer`. The WooCommerce broker reads `access_token`,
    `token_type`, `scope` and `expires_in` and drops `third_party_exchange_code`; it never
    forwards or redeems that code.
  - Description-only changes elsewhere, including the partner batch operations.
- The `9c9204dfce` capture added the public overview and the shipping epic
  ([backend#2146](https://github.com/aura-historia/backend/pull/2146)), renamed the search exclusion
  to `excludeProductListingId`, removed `createdBy`/`updatedBy` from search filters and required a
  Partnership grant for partner batch writes; the decisions are recorded below.
- The `2697cf4f30` capture (for
  [#1111](https://github.com/aura-historia/webapp/issues/1111)) brought the keyless creates of
  [backend#2081](https://github.com/aura-historia/backend/pull/2081) and the `ARS` currency of
  [backend#2096](https://github.com/aura-historia/backend/pull/2096): `createUserAddress` and
  `createPartyLocation` dropped the required `Idempotency-Key` header and no longer deduplicate
  creates (see **Creates** below).
- The #1108 capture replaced a 2026-10-05
  capture that had individual operations and schemas grafted in from later backend commits;
  adopt whole captures, not partial ones.
- Adopting the #1108 capture brought in the changes the previous capture deferred: the own
  access-token DTOs (the list now includes expired tokens) and `AccessTokenAuth` on the own-token
  operations, removal of the search-filter match reasons (`matchReason`, `enhancedMatchReason`),
  account `marketingEmailConsent`, the read-only admin email, the server-to-server Loops webhook,
  the scheduled public-directory cursor with `sort`/`order` on `listAuctions`, the partner
  single-listing operations, `403` responses on the notification operations, description wording
  and the `401 INVALID_CREDENTIALS` examples. Their consumers and decisions are recorded below.
  The extra security scheme and the `403` responses need no client change: the browser sends its
  Cognito bearer, and errors already go through `mapToInternalApiError`.
- Tooling: the pinned `@hey-api/openapi-ts 0.0.0-next-20260824173136` (Dependabot ignores it;
  `0.99.0` fails under TypeScript 7) with Python/PyYAML for the
  partner reference. Keep the `./` prefix on the config input; without it the generator reads
  `openapi/swagger.yaml` as a Hey API registry shorthand. A rerun against an unchanged capture
  must produce no diff (on Windows, ignore CRLF-only changes to the partner reference).

To adopt a backend revision:

1. Replace `openapi/swagger.yaml` deliberately with the exact capture and record its source,
   date and hashes above.
2. Run `pnpm openapi-ts`; the client and partner reference must come from the same input.
3. Review every added, changed and removed operation and schema. Each one needs a consumer,
   a removal, or an explicit decision recorded here. A generated SDK operation is not an
   implemented feature.
4. Update mappers, fixtures, locales and docs, then run `pnpm test`, `pnpm lint`,
   `pnpm exec tsc --noEmit`, `pnpm build` and `python -m unittest discover -s scripts/tests`.

## Known gaps and decisions

- Public auction browsing, detail and catalogue pages are deferred to
  [#1060](https://github.com/aura-historia/webapp/issues/1060); `listAuctions`, `getAuction` and
  `getAuctionCatalogue` are generated only. Listing-level auction summaries and typed history are
  implemented. The contract includes the schedule-ordered directory (`sort`/`order` on
  `listAuctions`, `PublicAuctionDirectoryCursorData.scheduled`) from
  [backend#1991](https://github.com/aura-historia/backend/issues/1991) for that work. The admin auction search
  is consumed by the admin auction directory (see [admin workflows](admin-workflows.md#auction-directory)).
- The geography contract ([backend#2031](https://github.com/aura-historia/backend/pull/2031)) is
  adopted with shared models and mappers ([#1076](https://github.com/aura-historia/webapp/issues/1076)).
  Party-location management (`listPartyLocations`, `createPartyLocation`, `getPartyLocation`,
  `correctPartyLocation`, `setPartyLocationLifecycle`) is consumed by the shared
  `src/features/party-locations` workspace ([#1085](https://github.com/aura-historia/webapp/issues/1085);
  see [admin workflows](admin-workflows.md#party-detail-and-business-locations)). The
  location-management grant and its directory (`setPartyLocationManagementGrant`,
  `listPartyLocationManagers`) are consumed by the admin Party page
  ([#1086](https://github.com/aura-historia/webapp/issues/1086); see
  [admin workflows](admin-workflows.md#party-location-management-grants)). The admin source-default
  operations (`adminGetSourceLocationDefault`, `adminAssignSourceLocationDefault`,
  `adminChangeSourceLocationDefaultApplicability`, `adminClearSourceLocationDefault`) are consumed
  by listing-source management ([#1088](https://github.com/aura-historia/webapp/issues/1088); see
  [admin workflows](admin-workflows.md#listing-source-default-locations)). Every other geography
  operation is generated-only until its feature slice consumes it: the user
  address book (`listUserAddresses`, `createUserAddress`, `getUserAddress`, `updateUserAddress`,
  `deleteUserAddress`), the browsing destination (`getBrowsingDestination`,
  `setBrowsingDestination`), public discovery (`discoverPartyLocations`) and the non-admin source
  defaults (`getSourceLocationDefault`, `assignSourceLocationDefault`,
  `changeSourceLocationDefaultApplicability`, `clearSourceLocationDefault`). Listing search does
  not send `geography` yet. Privacy rules for these slices
  are in [privacy alignment](privacy-policy-alignment.md#geography).
- The admin ProductListing operations (`searchAdminProductListings`, `getAdminProductListing`,
  `updateAdminProductListing`, `withdrawAdminProductListing`, `restoreAdminProductListing`) are
  consumed by the admin product listing workspace
  ([#1101](https://github.com/aura-historia/webapp/issues/1101); see
  [admin workflows](admin-workflows.md#product-listing-administration)).
- Partner async ingestion batches and provider ingestion configuration are external API
  capabilities, not browser workflows (see [partner integration](partner-integration.md)).
- The partner single-listing operations (`listPartnerProductListings`, `getPartnerProductListing`,
  `updatePartnerProductListing`, `withdrawPartnerProductListing`, `restorePartnerProductListing`)
  are generated-only: there is no partner listing workspace yet, and the public partner reference
  still covers only the batch writes and the WooCommerce webhook. They need an active Partnership
  grant for the source; administrator role alone does not grant access.
- `postLoopsPreferenceWebhook` is a signed server-to-server endpoint; the browser never calls it.
- `OwnUserAccountData.marketingEmailConsent` is not mapped; no account view shows consent yet (see
  [privacy alignment](privacy-policy-alignment.md#newsletter-consent)).
- `getHealth`/`getReadiness` drive the maintenance and disruption notice (see
  [service status](service-status.md)). `getMyAccessToken` is unused; the UI reads
  the own-token collection. Billing uses `postBillingManage`; `postBillingCheckout` and
  `postBillingPortal` remain SDK-only.
- `getPublicOverview` drives the hero stat strip (`HeroStats`, through `usePublicOverview` and
  `mapToPublicOverview` in `src/data/internal/overview`). It loads after mount and is never
  prerendered. The operation declares no security, so the client sends no bearer and the
  anonymous response stays edge-cacheable. Invalid counts fail the query and the strip is left
  out. `asOf` and `newObjectsLast7Days` are mapped but not shown.
- Shipping and delivery are generated-only until a shipping slice consumes them: the shipping
  profile, default and listing-delivery operations, listing `shipping` (summary and detail
  shapes; fixtures omit it), `userState.shipping`, the `shipping` search criteria,
  `acceptShippingDestination` and `shippingMatchValuation`. `DELIVERY_CHANGED` history entries
  map to the `UNKNOWN` change.
- Listing search, dealer listings and saved filters send the exclusion as
  `excludeProductListingId`. The internal `SearchFilterArguments.excludeProductId` and the
  `excludeProductId` search URL parameter keep their names, so shared links still work. The
  dealer rail requests one extra listing and also drops the viewed listing itself, so it never
  shows the current listing even if the API filter misses it.
- Legacy product URL routes are intentional redirects. Removed shop metadata, taxonomy,
  seller-name, shop-type and price-sort controls stay retired rather than sent to removed APIs.

## Mapping boundaries

Keep API-to-domain mapping in `src/data/internal`; components never reinterpret generated DTOs.
DTO types belong only in mapper inputs, and timestamp strings become `Date` values at the boundary.

### Listings

- `ProductListing` is the card/search projection: canonical `productListingId`, source-owned
  `sourceListingId`, nested source identity, optional public slug and summary `auctionId`,
  availability, lifecycle, content policy and summary valuation metadata.
- `AdminProductListingSummary`/`AdminProductListingDetail`
  (`src/data/internal/product/AdminProductListing.ts`) are the authoritative admin projection,
  including withdrawn listings: source-currency price and estimates without display conversion,
  original localized text, `expectedVersion`, nullable lot facts that may exist without an
  `auctionId`, and canonical image URLs kept as privileged plain strings. Edits go through
  `AdminProductListingPatch` and `mapToBackendAdminProductListingPatch`, which copies only present
  members (omitted preserves, `null` clears); the detail DTO is never round-tripped.
- `ProductListingDetail` is a distinct detail contract. `pricing` keeps source and display prices
  and the valuation snapshot; `auction` and `lot` are independently nullable, and a lot never
  creates or supplies a parent auction.
- Redacted or missing text, slugs and image URLs stay absent; never invent titles, prices,
  sellers, auctions or sale facts.
- Monetary and on-request prices are separate union members; a missing price stays `null`.
  Valuation keeps `CURRENT` or `SALE_OBSERVATION` with its FX and timestamp metadata.
- Amounts are integer minor units. `CURRENCY_MINOR_UNIT_EXPONENTS` in
  `src/data/internal/common/Currency.ts` is the only scaling policy (JPY and KRW 0, every other
  supported currency, including HUF and TWD, 2); never derive it from `Intl`, which reports cash
  digits for some currencies. Notification prices keep their own currency; the app performs no FX
  conversion. A historical sale that the backend cannot project into a newer currency stays absent
  or surfaces the backend error; never substitute `0`, EUR or another rate.
- `parseCurrency` is a preference helper with an EUR fallback. Validate other inputs, such as
  listing-source currency fields, with `toSupportedCurrency` and reject unsupported codes.
- Availability is the nullable 11-value enum plus `UNKNOWN` for unexpected values. Lifecycle is
  independently `ACTIVE` or `WITHDRAWN` (with an `UNKNOWN` fallback); withdrawal, out-of-stock
  and sale are not equated.
- `mapProductListingUserState` maps the optional `userState` from detail and collection
  responses. Each section is optional and stays absent when the backend omits it (a delegated
  credential without that read scope); the mapper never defaults an omitted section, and
  `patchListingUserState` updates never create one. Display code may fall back to the
  conservative default (not watching, no unseen notifications, sensitive content hidden). `hasUnseenNotification` derives from a non-empty unseen-notification ID array.

### Listing history

- `getProductListingHistory` takes an optional `currency`. The product page requests the preferred
  currency; omitting it returns source values only. `productListingHistoryQueryOptions` forwards the
  currency in the generated query key, so source-only and each currency are separate cache entries
  and a preference change never shows history for another currency.
- Monetary history values keep their source `amount`/`currency` and may carry a backend `display`
  projection (`amount`, `currency`, `fxRateId`, `capturedAt`) from the latest snapshot at or before
  the entry. The mapper keeps both on discovery prices/estimates and both sides of price and
  estimate changes, and drops a malformed or unsupported projection rather than coercing it.
- `TITLE_CHANGED` and `DESCRIPTION_CHANGED` keep the full previous and current original text with
  its language; `null` marks an absent side. The timeline names the change (added, updated or
  removed) under the Details filter and never quotes the source text.
- A missing projection is normal (no snapshot or quote, including snapshots taken before a currency such as ARS was supported).
  The timeline then shows the labelled source amount; converted values show their source amount
  and snapshot capture time. The chart offers one requested-currency series built only from
  `display` values, with gaps for missing projections and on-request or null prices, next to the
  unchanged source-currency series. Never plot source amounts on the requested-currency axis. A
  history priced only in the requested currency shows just its source series.

### Identity, cursors and caches

- Prefixed IDs (listing, source, FX, user, `at_` tokens) are opaque strings. Never parse them as
  UUIDs or extract slugs from them.
- Every query that caches listings (search, detail, landing, similar, dealer, shop, watchlist,
  saved-search matches and previews) uses a `productListingQueryKeys` key under the single
  `["productListings"]` root. Never key listing data with generated `*QueryKey` helpers or ad-hoc
  prefixes. Include a non-secret `viewerCacheKey` when a key is partitioned per account (the
  watchlist), so one viewer's state never shares an entry with another's or with anonymous data.
- Listing `userState` is a copy embedded in every cached listing. Change it only through
  `patchListingUserState` (`src/features/product/catalog/lib/listingUserStateCache.ts`), which
  updates mapped listings, infinite pages and the raw `{ item, userState }` detail DTO alike, and
  skips other viewers' partitions. Apply it after the backend confirms the write, then invalidate
  the listing root.
- Pending watchlist writes are shown through `useListingWatchlistState`, which overlays this
  listing's pending mutations on the cached state; caches are not rewritten optimistically, so a
  failed write has nothing to roll back and cannot undo another listing's change. Writes to one
  listing share a mutation `scope` and run in order.
- The product detail cache keeps the raw personalized DTO so SSR dehydration stays serializable;
  map it at the page boundary.
- Search preserves the complete FX-pinned `searchAfter` object as one JSON query value and resets
  it when criteria or currency change. Watchlist and match cursors are endpoint-specific tuple or
  string formats; there is no universal cursor type. Saved-match pagination stops on an absent
  cursor.
- Sign-in, sign-out and viewer changes remove listing (the whole `["productListings"]` root),
  account, notification, saved-search, own-source, application, access-token and `admin` caches,
  aborting pending private reads so late responses cannot repopulate them. Pending listing writes
  are removed from the mutation cache, and a write that settles after a viewer change does not
  touch the next viewer's caches. See [privacy alignment](privacy-policy-alignment.md).

### Geography

Shared models live in `src/data/internal/geography`; formatting helpers in
`src/features/geography/lib/formatGeography.ts`. Product UI stays in the feature slices.

- **Reference data:** country and subdivision codes are validated against the vendored Debian
  `iso-codes-4.20.1` release (`reference/iso-codes-4.20.1`, the same snapshot and SHA-256 hashes as
  the backend, with its LGPL-2.1-or-later license and notices). `python3
  scripts/generate_geography_reference.py` regenerates
  `src/data/internal/geography/reference/isoCodes.gen.ts` (do not edit it);
  `--check` and the script tests fail when the tables or sources drift. A new release needs a new
  snapshot, not a replacement. Countries are exact uppercase alpha-2 codes and subdivisions
  complete ISO 3166-2 codes; no trimming, case folding, aliases or alpha-3. Country names come from
  `Intl.DisplayNames` with the route language and fall back to the code.
- **Assertions and derived data:** `GeographicAssertions` holds caller-asserted, verbatim text and
  codes; absent and null facts stay absent. A `UserAddress` keeps its asserted `geography`
  separate from `resolution` (status, provider-derived geography and position, attribution). Party
  `geography` and `position` are caller assertions; public discovery keeps its `basis`, and
  listing geography is always `SOURCE_DEFAULT_DERIVED`, never verified custody.
- **Unsupported values:** an unknown release, code, unit, precision, role, scope or kind is never
  coerced. Listing geography with an unknown basis or release is dropped; individual facts are
  omitted. Management views set `hasUnsupportedValues` so replacing writes do not erase omitted
  values. A saved-search predicate with any unrecognized value maps to `UNSUPPORTED_GEOGRAPHY`
  rather than a narrower predicate.
- **Positions and distances:** coordinates must be finite and in range, `(0, 0)` is valid, and a
  point always has explicit precision. Radii keep their supplied amount and unit (positive, at
  most 20,000 km equivalent). `roundDisplayDistanceKm` rounds distance to evidence (0.1 km
  premises, 1 km street, 10 km otherwise); never round a continuation value.
- **Search predicate:** listing search, saved searches and Party-location discovery share one
  `GeographicSearch`; `validateGeographicSearch` mirrors the backend rules (set limits,
  subdivisions within supplied countries, numeric origin for radius or distance order, no origin
  or mode without proximity). Distance ordering replaces the ordinary `sort`. Saved searches map
  `geography` separately from `SearchFilterArguments`: omit it in a patch to keep the private
  snapshot, send `null` to clear and a complete predicate to replace it.
- **Query serialization:** the generated client serializes only one object level, so pass
  `listingGeographyQuerySerializer` (listing search; `searchAfter` stays a JSON string) or
  `partyLocationDiscoveryQuerySerializer` (`geography` and `searchAfter` deep objects) as
  `querySerializer`. They emit indexed brackets, e.g. `geography[countries][0]=DE`, as the backend
  parser expects.
- **Cursors and revisions:** address and Party-location pages return `next` (send as `after`;
  stop when absent). The discovery `searchAfter` is `{ locationId, distanceKm? }` with an
  unrounded distance; send it back unchanged with the same query. Address and destination writes
  carry `expectedVersion`; Party-location and source-default writes `expectedRevision`. A `409
  CONFLICT` means stale state: refetch, never retry blindly.
- **Creates:** `createUserAddress` and `createPartyLocation` (including relocation) take no
  `Idempotency-Key`; the backend ignores the header and assigns a new ID to every accepted create,
  even for equal content. Never resubmit a create automatically: the mutation sets `retry: false`,
  no HTTP helper or interceptor retries, and a submission is ignored while one is pending. Keep
  equal-content resources as distinct IDs; never deduplicate them by label or address. After an
  ambiguous outcome (no response, `408`, `429` or `5xx`), keep the draft, say the create may have
  succeeded and refresh the authoritative collection before offering another deliberate create; a
  failed refresh leaves the outcome unresolved and blocks resubmission until a refresh succeeds.
  Equal content cannot identify the original request. A relocation keeps the old location's
  expected revision; a repeated committed relocation returns `409`, which refreshes the locations
  and keeps the draft, never substitutes a newer revision or resubmits. The upcoming address book
  ([#1078](https://github.com/aura-historia/webapp/issues/1078)) follows the same policy and must
  not change the browsing destination when an address is saved. Backend runtimes older than
  backend#2081 still require the header, so release this webapp only with or after the keyless
  backend.
- **Commands:** source-default evidence is opaque text whose scope follows the field; omitted
  applicability retains, `null` removes. Party-location corrections keep omitted members, `null`
  clears geography, position or evidence, and `roles: []` clears roles. The location-management
  grant is an explicit admin `PUT` of `{ granted }`, independent of partnership membership.
- **Caches:** use `geographyQueryKeys`. Their roots are viewer-scoped and removed on viewer
  changes; private reads use `cache: "no-store"`, the query `signal` and no retries. Geographic
  listing searches and discovery responses are private and `no-store`, including anonymous ones.

### Errors

`mapToInternalApiError` accepts the uppercase source types (`QUERY`, `PATH`, `HEADER`, `BODY`) and
returns a safe unknown-error fallback when an endpoint has no problem body. UI shows translated
stable error codes, never raw server detail.

## Account preferences

- `mapToInternalUserAccount` keeps nullable or absent names, language, currency, measurement units
  and Stripe customer identity. The account has no audit dates or addresses. The email and
  `marketingEmailConsent` are read-only, and the backend truncates names to 64 characters.
- The admin user profile form never edits the email: `PatchAdminUserData` has no email member,
  and the dialog shows the canonical address as read-only text.
- `mapToBackendUserAccountPatch` preserves omitted fields and explicit nulls for clearable
  preferences. `showUnassessedOrSensitiveContent` accepts only a boolean: omission leaves it
  unchanged and null is rejected before sending. Registration sends the chosen value explicitly.
- Content visibility lives in the authenticated account query, separate from browser
  currency/unit preferences and tracking/map consent. Server and first-client rendering use
  deterministic defaults and server-provided preferences.
- Assessments distinguish `ALLOWED`, `REQUIRES_CONSENT` and unassessed content; a returned URL
  alone is not an allowed assessment. Notification images have no assessment and require the
  visibility preference. Public SEO only publishes images assessed `ALLOWED`.

## Own access tokens

- Own-token DTOs are mapped in `src/data/internal/access-tokens`. Admin token metadata uses a
  separate, secret-free DTO and must not reuse the own-token read model.
- Create, read and patch all use `scopes` and `expires`. Create always sends `scopes`, including
  `[]`, and omits `expires` for a token without expiry. On patch, omission preserves state,
  `scopes: []` clears permissions and `expires: null` clears expiry. Null names or scopes are
  rejected before sending. Edits submit only changed fields.
- `OwnAccessTokenData` is secret-free and has no masked value, token type or audit timestamps;
  `AccessToken` keeps only ID, name, scopes and expiry. The list includes expired tokens: the
  section resolves expiry against the clock after mount (never during render), marks expired
  tokens and lists active tokens first, then by name.
  `CreatedAccessTokenData` carries only the ID and the one-time plaintext.
- New tokens default to no scopes; editing scopes replaces the whole grant set. Only the
  supported scope enum is modeled: `ACCESS_TOKEN_SCOPES` mirrors the 23 backend
  `AccessTokenScopeData` values exactly (no aliases or remapping), `ACCESS_TOKEN_SCOPE_METADATA`
  supplies localized labels and descriptions in every locale that disclose deletion, billing,
  dissolution and ingestion-configuration capabilities, and `ACCESS_TOKEN_SCOPE_GROUPS` groups them
  by domain for display only. A registry test fails when the enum and the registry drift.
- Read and write scopes are independent capabilities: a write scope never implies its read
  sibling (for example, `search-filters:write` does not read saved searches; use
  `search-filters:read`). The UI never couples or auto-selects them, and an expanded registry never
  broadens existing tokens or OAuth client registrations.
- A scope only narrows what a credential may do. Administrative scopes (`auctions:*`,
  `parties:*`, `partnerships:*`, `admin-overview:read`, and the administrator parts of
  `product-listings:*`, `listing-sources:*` and `partnership-applications:*`) succeed only for
  accounts that already have administrator access. `product-listings:read` also covers partner
  single-listing reads for sources with an active Partnership grant, so it is grouped with the
  partner scopes;
  ListingSource and Partnership access still applies where an operation requires it (the admin
  ProductListing operations need none). Copy must not imply that a scope grants a role, and the
  frontend never emulates backend authorization.
- `listing-sources:write` enables or replaces WooCommerce/Shopify ingestion configuration, including
  a write-only webhook secret, for sources with partnership write access, and also covers
  administrator ListingSource create/update/delete. `listing-sources:read` covers private
  ListingSource reads. Both are opt-in; the integration guide preselects only
  `product-listings:write`.
- Only the create result contains plaintext. Hold it for the confirmation dialog only: never in the
  token-list cache, logs or storage, and discard it when the dialog closes.

## Granted listing sources

- `OwnListingSource` (`src/data/internal/listing-source/OwnListingSource.ts`) contains only
  `listingSourceId`, `listingSourceSlugId` and `name`. Do not enrich it with admin requests or infer
  ownership, partner status, metadata-edit permission, configuration or token scope from it.
- `getMyListingSources` returns one bounded page, `{ items, next? }`
  (`AdministeredListingSourcesPageData`, at most 100 items); `next` is an opaque, actor-bound
  continuation sent unchanged as `after`, and its absence marks the last page. `mapToOwnListingSourcePage` maps a page and
  `combineOwnListingSourcePages` joins the loaded pages in order by `listingSourceId`: equal names
  stay distinct sources, and a source repeated across live pages (renamed between reads) keeps its
  first entry.
- `useOwnListingSources(enabled)` is one infinite query under `OWN_LISTING_SOURCES_QUERY_KEY` with
  `no-store`, cancellation, zero stale time and inactive retention, and no retries. It loads the
  first page of 100 and requests each later page only on `loadMore()`; consumers say the list is
  incomplete while `hasMore` is true and never present the loaded pages as every grant. A failed
  first page or refresh sets `isError` and withholds every loaded page (`sources` is empty); a
  failed next page keeps the loaded pages, sets `isLoadMoreError` and can be requested again.
  `loadMore()` does nothing while another read runs, since it would cancel a refresh midway.
- The loaded pages are not evidence of authorization for a later write; the backend decides every
  operation. An empty last page means no current access; an empty page that carries `next` does
  not.
  Viewer changes remove the query and abort pending pages (see **Identity, cursors and caches**);
  partnership grant changes reset it, cancelling pending pages and restarting from the first page
  rather than re-walking old cursors.
- A view treats a single source as the only choice only when it is also the last page. A choice is
  used only while its source is among the loaded grants: a source dropped by a refresh or restart
  is no longer selected or submitted, and the custom integration page keeps a choice per viewer.
- Release this webapp only with or after the paged backend
  ([backend#2249](https://github.com/aura-historia/backend/issues/2249)): an older array response
  has no `items` and fails the read closed.
- The partner portfolio (`/$lng/partners/listing-sources`) is read-only. There is no partner
  metadata update contract; do not substitute `adminUpdateListingSource`. OAuth and the custom
  integration page consume the same hook and its cache; OAuth source selection does not scope the
  OAuth grant, and MCP consent (`requires_listing_source_id=false`) never reads sources.

## Own partnership applications

- List, read and create use `/me/partnership-applications`; the own response contains only `id`,
  `state` and `proposal`, mapped in `OwnPartnershipApplication.ts`. Admin data never enriches the
  applicant view, and timestamps, applicant IDs and approval linkage are not inferred.
- Existing-source proposals send the canonical `listingSourceId` chosen via
  `searchPublicListingSources`; public discovery does not establish ownership or a grant. Proposed
  sources send party name with optional phone/email, and source name with optional URL, image and
  ingestion methods. Empty optional values are omitted; there is no address, domain or shop type.
- Proposals are immutable. Applicants can withdraw `SUBMITTED` or `IN_REVIEW` applications; a 204
  sets `WITHDRAWN` and refreshes, a 409 shows a conflict and refetches. Approval is not a source grant.
