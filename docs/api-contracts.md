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
  `9dbbd433ffc0913adec7784b0f0134b448729aef` ([backend#1996](https://github.com/aura-historia/backend/pull/1996));
  no other schema was taken from that revision. File SHA-256:
  `c0dd6897f40621e003eb1d45db5841a527bede4b8972526ba2d98ad9ea5f9172`; canonical parsed-JSON SHA-256
  (recorded as `x-source-contract-sha256` in the partner reference):
  `62e6b3187d433235e1f33908bb17143fcebef89f1ff1592a4c3163a46dd0ae2c`.
- Later backend changes are deliberately not adopted yet: own access-token DTOs, search-filter
  match reasons, account `marketingEmailConsent`, and the server-to-server Loops webhook.
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
  implemented. Ordering the public directory by schedule and an admin auction search depend on
  [backend#1991](https://github.com/aura-historia/backend/issues/1991).
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
  digits for some currencies. History and notification prices keep their own currency; the app
  performs no FX conversion. A historical sale that the backend cannot project into a newer
  currency stays absent or surfaces the backend error; never substitute `0`, EUR or another rate.
- `parseCurrency` is a preference helper with an EUR fallback. Validate other inputs, such as
  listing-source currency fields, with `toSupportedCurrency` and reject unsupported codes.
- Availability is the nullable 11-value enum plus `UNKNOWN` for unexpected values. Lifecycle is
  independently `ACTIVE` or `WITHDRAWN` (with an `UNKNOWN` fallback); withdrawal, out-of-stock
  and sale are not equated.
- `mapProductListingUserState` maps the optional `userState`; `hasUnseenNotification` derives
  from a non-empty unseen-notification ID array.

### Identity, cursors and caches

- Prefixed IDs (listing, source, FX, user, `at_` tokens) are opaque strings. Never parse them as
  UUIDs or extract slugs from them.
- Use `productListingQueryKeys`. Include a non-secret `viewerCacheKey` whenever a query can
  contain account-specific state, so one viewer's state never shares an entry with another's or
  with anonymous data.
- Search preserves the complete FX-pinned `searchAfter` object as one JSON query value and resets
  it when criteria or currency change. Watchlist and match cursors are endpoint-specific tuple or
  string formats; there is no universal cursor type. Saved-match pagination stops on an absent
  cursor.
- Sign-in, sign-out and viewer changes remove listing, account, watchlist, match, notification,
  own-source, application, access-token and `admin` caches, aborting pending private reads so late
  responses cannot repopulate them. See [privacy alignment](privacy-policy-alignment.md).

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
  supported scope enum is modeled (`ACCESS_TOKEN_SCOPES`, `ACCESS_TOKEN_SCOPE_METADATA`), with
  localized descriptions in every locale that disclose deletion, billing and ingestion-configuration
  capabilities.
- `listing-sources:write` enables or replaces WooCommerce/Shopify ingestion configuration, including
  a write-only webhook secret, only for sources with partnership write access. It is opt-in; the
  integration guide preselects only `product-listings:write`.
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
