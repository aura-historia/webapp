# OpenAPI migration analysis and GitHub issue drafts

Analysis date: 2026-09-10.

## Sources and reproducibility

- Target: https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml
- Exact downloaded target: [swagger.snapshot.yaml](swagger.snapshot.yaml), SHA-256 `99d2a65d77d32d1d52583181fb5bcd6eb46966f4d0aa0eb7cc542affad46bf36`.
- Baseline: actual checked-in `src/client/sdk.gen.ts`, `types.gen.ts` and generated Query helpers, at webapp commit `07e25a5d1c9d037ed978764327d9fb2e11490031`.
- The raw download was used instead of the web reader's stale cached version. No live backend requests or mutations were used to establish behavior.
- `public/partner-products.openapi.json` includes an older component snapshot, but it differs from the generated client (for example, account preferences). It was useful for reconnaissance and is NOT the authoritative old baseline in the delivered inventories.
- OpenAPI generation was subsequently restored with `@hey-api/openapi-ts 0.0.0-next-20260824173136`; the replacement client was generated in webapp commit `911aedeb7b4ba1367ce287df5178b878fd76b60f`.

This compares what is represented in the generated client with the supplied schema, not two known historical OpenAPI revisions. Old OpenAPI-only constraints discarded by generation cannot be recovered with certainty. An absent endpoint means absent from this schema, not independently verified removal from a deployed backend. Likewise, generated SDK security metadata may omit old anonymous alternatives.

## Deliverables

- [All original issue drafts in one raw Markdown file](all-issues.md): the initial 25-issue planning snapshot. The backend-ready MIG-00 ticket in [issues/00.md](issues/00.md) supersedes its bundled MIG-00 entry.
- [Field differences](field-differences.md): mechanical old-versus-new model fields, enum/union shapes, operation query/path/header/body changes, request requiredness, security metadata and response status/body contracts.
- [Complete operation inventory](operation-inventory.md): every old operation mapped to its successor or explicit absence, every new capability, and exact old generated/new OpenAPI contracts.
- [Complete model inventory](model-inventory.md): every one of the 134 old generated component types and all 163 target schemas, paired where meaningful. Includes unchanged models so omissions can be distinguished from unchanged contracts.
- [Machine-readable contracts](contracts.json): captured generated baseline types/operations, complete target schema and successor mappings.
- Individual issue bodies are in `issues/00.md` through `issues/24.md`.
- [Listing domain contracts](listing-domain-contracts.md): webapp summary/detail models, personalized state, identity/query-key rules, price/availability semantics, and resilient API error mapping.

These are local drafts, not published GitHub issues. MIG IDs are dependency labels, not existing GitHub issue numbers. Copy a file's first heading into the GitHub title field and the remaining Markdown into the issue body.

## Coverage

| Comparison | Count |
|---|---:|
| Existing generated SDK operations | 77 |
| Target operations | 87 |
| Existing operations with same-name or semantic counterparts | 65 |
| Existing operations absent without a direct counterpart | 12 |
| New capabilities after counterpart mapping | 22 |
| Existing generated component types | 134 |
| Target component schemas | 163 |

Counterpart does not mean compatible: public shop lookup becoming authenticated source lookup, applicant/admin workflows and batch deletion all require behavioral changes.

The 12 operations without a direct counterpart are `complexSearchProducts`, `getSearchFilterPreviewProducts`, `simpleSearchShops`, `getShopByDomain`, `searchShops`, `getCategories`, `getCategoryById`, `searchCategories`, `getPeriods`, `getPeriodById`, `searchPeriods`, and `patchPartnerApplication`. Canonical GET listing search can replace only supported search/preview semantics; admin source search cannot replace public shop search.

The 22 additions are admin source search and deletion; five party CRUD/search operations; six user suspension/session/token operations; selected-notification bulk updates; admin overview; and seven partnership listing/detail/dissolution/member/source-grant operations. The operation inventory names every operation individually.

## Material differences and webapp consequences

| Domain | Contract difference | Required adaptation | Owner |
|---|---|---|---|
| Identity and detail addressing | shop/product pairs become productListingId; public listing slug lookup takes only productListingTitleSlugId; source uses listingSourceId/sourceListingId and nested source metadata | Separate canonical IDs, source-owned IDs and optional public slugs; resolve legacy URLs explicitly | MIG-02, MIG-03 |
| Listing DTOs | Summary/detail split changes; summary lacks auction/created; detail has optional title/description plus productTitle/productDescription; old shopType/seller/address/audit fields disappear | Distinct adapters and reduced UI; clarify text aliases rather than guessing | MIG-00, MIG-02, MIG-03 |
| Pricing | MONETARY/ON_REQUEST union; summary displayPrice/priceValuation; detail source/display pricing plus CURRENT/SALE_OBSERVATION FX metadata | Preserve unknown/on-request and source/display/sale-time distinctions in cards, detail, charts and SEO | MIG-02–04 |
| Availability | Old product state replaced by 11 nullable availability codes; lifecycle ACTIVE/WITHDRAWN; separate orderability schema | No synthetic available/sold state; new badges/filter behavior | MIG-02, MIG-03, MIG-05 |
| Content and user state | Per-image classification disappears; image URL can be null; contentPolicy and contentVisibility replace prohibited content; notification.seen/originEventId becomes unseenNotificationIds | Safe redaction, optional links and array-based unread state; account preference alignment | MIG-02, MIG-03, MIG-09, MIG-10 |
| History | Two event kinds with typed change arrays instead of separate legacy event payloads; canonical ID addressing; no language/currency query | Rebuild timeline/chart mappings, including withdrawal/restoration and sale-observation retraction | MIG-04 |
| Search | GET listing search; no complex POST; source-ID rather than shop/seller name filters; no shop-type/location/taxonomy filters; score/created/updated only | Rework controls/URLs and retire unsupported sorts/autocomplete; do not lose meaning silently | MIG-05, MIG-06 |
| Search paging | searchAfter becomes an FX-pinned object that must be sent as one JSON query value | Preserve fxRateId through a chain, reset on changed criteria/currency; do not use default object flattening | MIG-00, MIG-05 |
| Public discovery | Shop list/search/domain routes absent; source slug lookup declares authentication; no public source search | Product/backend decision, then remove/gate or replace public discovery/profile links | MIG-00, MIG-06 |
| Saved searches | Embedded new search DTO; no preview endpoint; saved-filter sort/order absent; match sort/order absent; feedback path uses listing ID | Supported-criteria previews only, deliberate legacy-filter handling; keep saved-filter offset-shaped collection separate | MIG-07 |
| Match/watchlist paging | String query containing JSON tuple; tuple response cursor; fixed ordering | Explicit per-endpoint serializers; no universal cursor type | MIG-07, MIG-08 |
| Watchlist | Add body and mutation paths use productListingId; add/patch return WatchlistEntryData; GET no total contract | Update entry state instead of replacing listing DTO caches | MIG-08 |
| Notifications | kind plus canonical payload; ID-based individual actions; PATCH collection means selected IDs; mark-all moves to /all; mutations 204 | Rebuild mapping, bulk actions and cache updates; remove currency conversion, preserve event source prices | MIG-09 |
| Account | Own/admin account split; showUnassessedOrSensitiveContent replaces consent; timestamps/address/audit fields removed | Remove invalid Date/address reads; no null visibility patch; maintain locale/unit defaults | MIG-10 |
| Errors | sourceType lowercase becomes type uppercase; many domain-specific stable error keys/status declarations change, including no-body errors | Shared source adapter and resilient fallback; feature-specific conflicts tested; full status matrix in inventories | MIG-02 and each feature owner |
| Token scopes | products:write and shops:manage disappear; eight supported capabilities listed in MIG-11 | Explicit least-privilege scope labels/selection; no automatic privilege expansion | MIG-11, MIG-12, MIG-22 |
| Token edit | PATCH scopes/expires versus create/read scope/expiresAt; null name/scopes rejected | Separate create/read/edit mappers and omission/null/empty-array tests | MIG-11 |
| OAuth consent | Protocol paths remain; metadata read successor requires ADMIN | Safe ordinary-user consent metadata decision; preserve PKCE, state and redirects | MIG-00, MIG-12 |
| Partner ingestion | POST/PATCH/PUT and new batch DELETE use source paths; 202 queueing becomes synchronous 200; max 100, [] allowed; structured failures | Rewrite generated reference/examples and empty/partial/all-failure semantics | MIG-13 |
| Ingestion updates | Null now clears supported facts; PUT omitted images preserve, [] clears and null is invalid; withdrawn listings can restore | Correct examples and avoid destructive legacy upsert assumptions | MIG-13 |
| WooCommerce | listingSourceId; signature required; delivery ID optional; name/permalink now optional; date_modified_gmt added; 204 plus ordering/digest conflicts | Integration/reference update; no browser secret exposure | MIG-13 |
| Partner portfolio | /me/listing-sources gives minimal granted-source references; no partner source PATCH | Read-only granted-source UX; remove unsupported editing | MIG-14 |
| Own applications | Partnership proposals with party/source variants; id/state/proposal only; applicant PATCH removed; WITHDRAWN state | Rebuild form and withdrawal UI; no execution/audit fiction | MIG-15 |
| Admin applications | /admin/partnership-applications; paginated summaries vs detail; body-less review PATCH; APPROVE/REJECT decision | Domain transitions rather than arbitrary editing | MIG-16 |
| Parties | New name/contact entity and admin CRUD/search | Private party management and source-operator picker | MIG-17 |
| Admin sources | Admin-only CRUD/search; operator union, ingestion config, write-only webhook secret/referral config; create/update references only | Replace shop forms and response caching; do not overwrite unreturned config | MIG-18 |
| Partnerships | New party association, members, source grants and dissolution | Dedicated authorization-management UX, separate from applications | MIG-19 |
| Admin users | /admin prefix; summary/detail split; score sort becomes name; string cursor; email patch added; stripeCustomerId patch removed; role/tier null invalid | Rebuild mapping; separate profile, role and tier requests; last-admin conflicts | MIG-20 |
| User security | Suspend/unsuspend, global sign-out, token metadata and scoped revocation | Distinct actions/effects, explicit target, no secret metadata | MIG-21 |
| Admin OAuth | /admin/oauth-clients; paged secret-free list/detail/patch; create secret only; patch null invalid | Separate create/read models and pagination | MIG-22 |
| Admin overview | Dedicated aggregate endpoint | Stop counting loaded collection rows; handle overlapping ingestion assignments | MIG-23 |
| Cross-cutting | Generated export/Query helper renames, changed fixtures, links, locales and docs | Single generation owner; integration/release gate | MIG-01, MIG-24 |

### Preserved contracts and limits of inference

- Language, currency, measurement units, FREE/PRO/ULTIMATE tiers and role enums already exist in the generated client. They are not new features simply because the embedded partner snapshot differs.
- Billing checkout/manage still use plan/cycle and return a URL; portal remains body-less. Existing useStripeBilling already calls manage with a body. Verify this flow after regeneration rather than inventing a migration.
- Newsletter and the five OAuth protocol endpoint paths are retained. Their complete target security/error/form-body contracts are recorded in the operation inventory.
- ResourceState, watchlist notification toggles and saved-search match feedback remain, while their surrounding identity/DTO contracts change.
- Similar-listing 202 pending was already handled by useSimilarProducts. Preserve it while adopting the new address/model; the target documents a polling Location.
- Actor remains SYSTEM or string at the TypeScript level; the documented user identifier meaning changes from UUID to canonical user ID. Do not infer formatting constraints beyond each endpoint's actual schema.
- The target still contains some named schemas not used by the canonical endpoint, such as PersonalizedProductListingSearchResultData. Use each operation's declared response, not whichever similarly named type looks familiar.

## Assignment and integration order

MIG-00 is a set of contract decisions; resolve items individually. Its unresolved OAuth/public-discovery decisions must not block independent notifications/admin work.

1. Foundation: MIG-01 generator and MIG-02 shared listing/error contracts. MIG-13 can prepare extractor changes independently; the full generation script requires that update. Never regenerate separately in every agent branch.
2. Core parallel slices after foundations: MIG-03, MIG-04, MIG-05, MIG-10, MIG-11, MIG-14, MIG-15 and MIG-17. Public/consent work waits only on its relevant MIG-00 decisions.
3. Dependent slices: MIG-06 after agreed public links, MIG-07 after search serialization, MIG-08/MIG-09 after shared listing contracts; MIG-12/MIG-13 after token/source interfaces; MIG-16 after shared proposal model; MIG-18 after party picker; MIG-20 after account contracts; MIG-22 after scope metadata.
4. New capabilities: MIG-19 after source/party interfaces, MIG-21 after admin user interfaces, MIG-23 after admin route contracts.
5. MIG-24 integrates everything and supplies the release gate. No partially migrated generated client should be deployed.

Issue owners own their feature-specific tests and locale namespaces. MIG-02 owns shared listing/user-state/error types; MIG-04 owns extracted history types; MIG-10 owns account preference mapping; MIG-11 owns shared scope metadata; MIG-14 owns the granted-source hook; MIG-15 owns proposal types. Consumer tasks request interface changes from those owners. MIG-13 owns custom-integration page edits; MIG-15 supplies application hooks/models for it. MIG-24 coordinates shared route/navigation/test utilities and locale-file merge conflicts. Public image rendering belongs to MIG-03; MIG-10 supplies the preference behavior.

## Individual issue index

| ID | Priority | Issue |
|---|---|---|
| MIG-00 | P0 | [Resolve schema gaps before migrating public discovery and OAuth consent](issues/00.md) |
| MIG-01 | P0 | [Restore reproducible OpenAPI generation and establish the migration client](issues/01.md) |
| MIG-02 | P0 | [Introduce listing domain models and shared identity, price and error adapters](issues/02.md) |
| MIG-03 | P0 | [Rework listing cards, detail pages and canonical links for the new model](issues/03.md) |
| MIG-04 | P1 | [Rebuild listing history and price charts around typed change sets](issues/04.md) |
| MIG-05 | P0 | [Replace product search filters and pagination with canonical listing search](issues/05.md) |
| MIG-06 | P0 | [Retire or redesign public shop discovery and unsupported source profiles](issues/06.md) |
| MIG-07 | P0 | [Rework saved searches, previews and match feedback](issues/07.md) |
| MIG-08 | P0 | [Migrate watchlist identity, mutations and cursor pagination](issues/08.md) |
| MIG-09 | P0 | [Rebuild notifications around notification IDs, kind and typed changes](issues/09.md) |
| MIG-10 | P0 | [Migrate account preferences and sensitive-content visibility](issues/10.md) |
| MIG-11 | P0 | [Update access-token scopes and asymmetric create/edit payloads](issues/11.md) |
| MIG-12 | P0 | [Rework OAuth consent and WooCommerce selection for listing sources](issues/12.md) |
| MIG-13 | P0 | [Update partner API documentation, batch semantics and WooCommerce contract](issues/13.md) |
| MIG-14 | P0 | [Replace partner shop editing with granted listing-source access](issues/14.md) |
| MIG-15 | P0 | [Rebuild partnership applications as immutable proposals](issues/15.md) |
| MIG-16 | P0 | [Rebuild admin partnership application review and decisions](issues/16.md) |
| MIG-17 | P1 | [Add admin party management for source operators](issues/17.md) |
| MIG-18 | P0 | [Replace admin shop CRUD with listing-source management](issues/18.md) |
| MIG-19 | P1 | [Add admin partnership membership and source-grant management](issues/19.md) |
| MIG-20 | P0 | [Migrate admin user search, detail and segregated updates](issues/20.md) |
| MIG-21 | P1 | [Add admin suspension, session revocation and token revocation controls](issues/21.md) |
| MIG-22 | P0 | [Migrate admin OAuth client management to secret-free paginated DTOs](issues/22.md) |
| MIG-23 | P1 | [Use the dedicated admin overview aggregate endpoint](issues/23.md) |
| MIG-24 | P0 | [Integrate migration slices and verify complete contract coverage](issues/24.md) |

## Validation performed for this planning work

Parsed the downloaded YAML, enumerated all old SDK exports and generated component declarations, and produced complete operation/model inventories plus a field-level comparison. Traced active consumers in search, listing detail/cards/history, public discovery, watchlist, saved searches, notifications, accounts, OAuth/broker, partner onboarding/integration and admin features. Checked artifact coverage and local links.

The original analysis did not change application code or the generated client. Generation was subsequently completed in webapp commit `911aedeb7b4ba1367ce287df5178b878fd76b60f`; application migration and its compile/build verification remain assigned to MIG-02 through MIG-24.
