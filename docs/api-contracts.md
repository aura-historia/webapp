# API Contracts

Apply this guide when generating the API client, adopting backend contract changes, or mapping
API DTOs into app models. Partner ingestion is covered in [partner integration](partner-integration.md);
admin workflows in [admin workflows](admin-workflows.md).

## Pinned contract and generation

- `pnpm openapi-ts` generates `src/client/**` and the public partner reference
  (`public/partner-products.openapi.json`) from the same pinned contract, `openapi/swagger.yaml`.
  Generation never fetches a moving contract. Never hand-edit either output.
- The pinned capture is backend `develop/docs/swagger.yaml` from 2026-10-05 (Git blob
  `39d993e0ed775e65065c61fa885e791ee706d49c`). The newsletter operations and schemas
  (`/api/v1/newsletter-subscriptions`, `/confirm`, `PutNewsletterSubscriptionData`,
  `ConfirmNewsletterSubscriptionData`) were replaced byte-for-byte from backend commit
  `2bb418631263a270becb784352c21b412f05bfea`. The `CurrencyData` schema (29-currency enum and
  descriptions) was replaced byte-for-byte from backend commit
  `9dbbd433ffc0913adec7784b0f0134b448729aef` ([backend#1996](https://github.com/aura-historia/backend/pull/1996)),
  as was the `AccessTokenScopeData` schema (22-scope enum from
  [backend#1991](https://github.com/aura-historia/backend/pull/1991) and
  [backend#1994](https://github.com/aura-historia/backend/pull/1994)); no other schema was taken
  from that revision. The `getProductListingHistory` operation, the history sentence in the API
  description, `ProductListingDiscoveryHistoryPayloadData`, `ProductListingMainPriceHistoryChangeData`,
  `ProductListingPriceHistoryChangeData` and the new `ProductListingHistoryPriceDisplayData`,
  `ProductListingHistoryEstimateData`, `ProductListingHistoryMainPriceData` and
  `ProductListingHistoryPricingData` schemas were replaced byte-for-byte from backend commit
  `c77155fd7872461b41ccedbdd36492bf9595dbb1` (blob `0473dc5ee2529cb4b5378789d152f6111466fda1`,
  [backend#2019](https://github.com/aura-historia/backend/pull/2019)); nothing else was taken from
  that revision. The geography contract was taken byte-for-byte from the merge commit of
  [backend#2031](https://github.com/aura-historia/backend/pull/2031),
  `7684dd41cc5ddb1bb99fec40af4d670f0f5b9830` (`docs/swagger.yaml` blob
  `66ff0170e3262aa0b5cf86914595c7e5eefc1183`, file SHA-256
  `ba3dfa02ef63224b5f4a855506b786dc3abc2a03e47ba3b013b9eb430193fa41`): the path items
  `/api/v1/product-listings` (the `geography` deep-object parameter and description),
  `/api/v1/me/addresses`, `/api/v1/me/addresses/{address_id}`, `/api/v1/me/browsing-destination`,
  `/api/v1/party-locations`, `/api/v1/parties/{party_id}/locations`,
  `/api/v1/parties/{party_id}/locations/{location_id}`, `.../lifecycle`,
  `/api/v1/admin/parties/{party_id}/location-managers/{user_id}` and both
  `/location-default` paths; the changed `ProductListingSearchData`,
  `PatchProductListingSearchData` and `ProductListingSummaryData` schemas; and the 37 new geography
  schemas (`GeographicSearchData` and its origin/radius, `ListingGeographyData`, the `UserAddress*`,
  `BrowsingDestination*`, `PartyLocation*`, `PublicPartyLocationData`, `*SourceLocationDefault*`
  schemas). From the same revision, the `get` operation (`adminSearchAuctions`) of
  `/api/v1/admin/auctions` and the `AdminAuctionSearchCollectionData` schema were added
  byte-for-byte for [#1096](https://github.com/aura-historia/webapp/issues/1096); the sibling
  `post`, the admin auction detail path and their delegated-scope descriptions were left
  unchanged. Nothing else was taken from that revision. File SHA-256:
  `c1a52662a4dbd4f6b806f6c835923a07a96e915b3a47af202095ceddc327599f` (Git blob
  `49e5948574cca9f44579ee0fd650be6d401f1205`); canonical parsed-JSON SHA-256 (recorded as
  `x-source-contract-sha256` in the partner reference):
  `349bb9d38bed276412020c7e396fa8e3e5ecb582853f571e60fda21c44e668a6`.
- Later backend changes are deliberately not adopted yet. Reviewed against `7684dd41`, they are:
  own access-token DTOs (`OwnAccessTokenData`, `CreatedAccessTokenData`, `PostAccessTokenData`
  with `scopes`/`expires`, and `AccessTokenAuth` on the own-token operations), removal of the
  search-filter match reasons (`matchReason`, `enhancedMatchReason`), account
  `marketingEmailConsent` and the read-only admin email, the server-to-server Loops webhook, the
  scheduled public-directory cursor from backend#1991, the `productTitle` description, the `401 INVALID_CREDENTIALS` examples, and the
  per-operation delegated-scope wording and `403` responses from backend#1994 (the backend remains
  authoritative for which scope each operation requires). Adopting the access-token and
  match-reason changes requires mapper and UI work; do it in a separate change.
- Tooling: the pinned `@hey-api/openapi-ts 0.0.0-next-20260824173136` with Python/PyYAML for the
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
  implemented. Ordering the public directory by schedule depends on
  [backend#1991](https://github.com/aura-historia/backend/issues/1991). The admin auction search
  is consumed by the admin auction directory (see [admin workflows](admin-workflows.md#auction-directory)).
- The geography contract ([backend#2031](https://github.com/aura-historia/backend/pull/2031)) is
  adopted with shared models and mappers only ([#1076](https://github.com/aura-historia/webapp/issues/1076)).
  Every geography operation is generated-only until its feature slice consumes it: the user
  address book (`listUserAddresses`, `createUserAddress`, `getUserAddress`, `updateUserAddress`,
  `deleteUserAddress`), the browsing destination (`getBrowsingDestination`,
  `setBrowsingDestination`), Party-location management (`listPartyLocations`,
  `createPartyLocation`, `getPartyLocation`, `correctPartyLocation`, `setPartyLocationLifecycle`,
  `setPartyLocationManagementGrant`), public discovery (`discoverPartyLocations`) and source
  defaults (`getSourceLocationDefault`, `assignSourceLocationDefault`,
  `changeSourceLocationDefaultApplicability`, `clearSourceLocationDefault` and their `admin*`
  counterparts). Listing search does not send `geography` yet. Privacy rules for these slices
  are in [privacy alignment](privacy-policy-alignment.md#geography).
- Partner async ingestion batches and provider ingestion configuration are external API
  capabilities, not browser workflows (see [partner integration](partner-integration.md)).
- `getHealth`/`getReadiness` drive the maintenance and disruption notice (see
  [service status](service-status.md)). `getMyAccessToken` is unused; the UI reads
  the own-token collection. Billing uses `postBillingManage`; `postBillingCheckout` and
  `postBillingPortal` remain SDK-only.
- Legacy product URL routes are intentional redirects. Removed shop metadata, taxonomy,
  seller-name, shop-type and price-sort controls stay retired rather than sent to removed APIs.

## Mapping boundaries

Keep API-to-domain mapping in `src/data/internal`; components never reinterpret generated DTOs.
DTO types belong only in mapper inputs, and timestamp strings become `Date` values at the boundary.

### Listings

- `ProductListing` is the card/search projection: canonical `productListingId`, source-owned
  `sourceListingId`, nested source identity, optional public slug and summary `auctionId`,
  availability, lifecycle, content policy and summary valuation metadata.
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
- `mapProductListingUserState` maps the optional `userState`; `hasUnseenNotification` derives
  from a non-empty unseen-notification ID array.

### Listing history

- `getProductListingHistory` takes an optional `currency`. The product page requests the preferred
  currency; omitting it returns source values only. `productListingHistoryQueryOptions` forwards the
  currency in the generated query key, so source-only and each currency are separate cache entries
  and a preference change never shows history for another currency.
- Monetary history values keep their source `amount`/`currency` and may carry a backend `display`
  projection (`amount`, `currency`, `fxRateId`, `capturedAt`) from the latest snapshot at or before
  the entry. The mapper keeps both on discovery prices/estimates and both sides of price and
  estimate changes, and drops a malformed or unsupported projection rather than coercing it.
- A missing projection is normal (no snapshot or quote, including legacy 19-currency snapshots).
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
- **Idempotency:** `createUserAddress` and `createPartyLocation` require an `Idempotency-Key`.
  Create one with `createIdempotencyKey` per submission, reuse it only for retries of the
  unchanged command and discard it after a definite outcome.
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
  and Stripe customer identity. The account has no audit dates or addresses.
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
- Create and read use `scope` and `expiresAt`; patch uses `scopes` and `expires`. Omission
  preserves state, `scopes: []` clears permissions and `expires: null` clears expiry. Null names
  or scopes are rejected before sending. Edits submit only changed fields.
- New tokens default to no scopes; editing scopes replaces the whole grant set. Only the
  supported scope enum is modeled: `ACCESS_TOKEN_SCOPES` mirrors the 22 backend
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
  `listing-sources:*` and `partnership-applications:*`) succeed only for accounts that already
  have administrator access; ListingSource and Partnership access still applies. Copy must not
  imply that a scope grants a role, and the frontend never emulates backend authorization.
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
- `useOwnListingSources(enabled)` uses `OWN_LISTING_SOURCES_QUERY_KEY`, `no-store`, cancellation,
  zero stale time and inactive retention, and no retries. It is not evidence of authorization for a
  later write. An empty list means no current access. On a failed refresh show the error state;
  never render cached grants or keep removed IDs selectable.
- The partner portfolio (`/$lng/partners/listing-sources`) is read-only. There is no partner
  metadata update contract; do not substitute `adminUpdateListingSource`. OAuth and the custom
  integration page consume the same hook; OAuth source selection does not scope the OAuth grant.

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
