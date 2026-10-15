# Admin Workflows

Workflow contracts for the admin dashboard. Authorization, caching and data-handling rules shared by
every admin workflow are in [admin authorization guidelines](admin-authorization-guidelines.md).

All admin routes are nested under the authenticated `/$lng/admin` route (`AdminGuard`,
`ssr: "data-only"`, noindex, not prerendered); the backend enforces the ADMIN role on every
operation. Query keys use the `admin` prefix, which is cleared on viewer changes, and list/detail
reads forward abort signals. API error bodies are never surfaced in the UI.

## Partnership application review

Route: `/$lng/admin/partnership-applications`.

- `AdminPartnershipApplication.ts` maps admin DTOs separately from own applications. Detail has
  no timestamps but carries nullable `approvedPartnershipId`/`approvedListingSourceId`; only search
  summaries guarantee `created`/`updated`, so the detail dialog shows timestamps only when the
  opening summary supplies them.
- Search sends repeated `state`/`proposalType`, `applicantUserId`, `listingSourceId`, inclusive UTC
  calendar-day `created`/`updated` ranges, and `sort` with `order` (only together; default
  `created desc`). The JSON-encoded `[timestamp, id]` cursor is resent with unchanged filters.
  Filters live in URL search params; route validation drops impossible days and an incomplete
  sort/order pair, so the form always reflects the order the API applies.
- Review is the body-less `adminMarkPartnershipApplicationInReview` (`SUBMITTED` → `IN_REVIEW`).
  Decisions send only `{ decision: "APPROVE" | "REJECT" }` from `IN_REVIEW` after inline
  confirmation. Proposals, states and decision notes are never editable.
- A 409 shows a conflict and refetches detail and list; a 404 shows an unavailable application.
  Successful transitions store the returned detail and invalidate the application list plus
  `["admin", "overview"]`, `["admin", "partnerships"]` and `["admin", "listing-sources"]`.
- Approved listing-source IDs link to listing-source management. Approval does not create a
  partnership membership or source grant; those are managed below.

## Partnership membership and source grants

Route: `/$lng/admin/partnerships`.

- `src/data/internal/partnership/AdminPartnership.ts` maps summary and detail DTOs. Search uses
  exact `partyId`, `memberUserId` and `listingSourceId` filters with the JSON-encoded
  `[created, partnershipId]` cursor.
- Summaries provide the party, member and source-grant counts, and timestamps. Detail adds member
  and source IDs capped at 100 each beside the complete counts. The page labels loaded summaries
  separately and never treats page size or loaded ID arrays as totals.
- Membership and source grants are explicit operations; they are never inferred from an admin
  role or an approved application. Mutations refresh partnership data, the overview and the
  viewer's own listing-source query, clearing it first so a revoked source cannot stay selectable.
- The source-grant UI enables a grant only when the source's operator party matches the
  partnership party. The API stays authoritative; a 409 is shown as a party mismatch.
- Grant and revoke are body-less, idempotent 204 requests followed by an authoritative refetch.
  Dissolution requires explicit confirmation; it removes memberships and grants but keeps history,
  party, users, sources, listings and applications.

## Auction directory

Routes: `/$lng/admin/auctions` (directory), `/new` (create) and `/$auctionId` (record).

- `adminSearchAuctions` returns every auction regardless of status or visible listings.
  `mapAdminAuctionPage` reuses `mapAdminAuction` and keeps only items and the opaque
  `searchAfter`; the response `size` is the returned item count, never a total.
- Filters live in URL search params: `query` (case-insensitive literal substring of the name or
  `sourceAuctionId`), exact `listingSource` (sent as `listingSourceId`; product search already
  uses that URL key as a list), exact trimmed `sourceAuctionId`, `format`, `reportedStatus`, and
  `size` (1–100, default 25). `sort` (`name`, `created`, `updated`) and `order` are kept and sent
  only together; the default `updated desc` is omitted. Route validation drops unknown values.
- The list query key holds every filter, the sort and the size, so a changed scope starts without
  a cursor. `searchAfter` is resent verbatim with that scope and never shared with the public
  auction directory.
- Rows show the reported name (or a "no name reported" label), source auction ID, listing source
  ID, auction ID, format, reported status and UTC created/updated times, and link to the record.
  Missing schedules, statuses, lot counts and totals are not inferred. There is no open-by-ID
  form; `/$lng/admin/auctions/$auctionId` still opens any record by URL.
- A create `409` links to the directory filtered by the submitted listing source and source
  auction ID. Create, update and their `409` responses invalidate `["admin", "auctions", "list"]`.
  Search `400` (filter or cursor), `401`/`403` and `503` map to localized copy.

## Product listing administration

Routes: `/$lng/admin/product-listings` (directory) and `/$lng/admin/product-listings/$productListingId`
(record).

- The five admin ProductListing operations read and change authoritative facts, including retained
  `WITHDRAWN` listings. They need administrator authority but no Partnership; delegated tokens also
  need `product-listings:read`/`:write`. `AdminProductListing.ts` maps summary, detail, page and
  mutation DTOs separately from public listing models; prices stay in the source currency. Every
  request is `no-store`; reads forward the query signal and are not retried, and
  `["admin", "product-listings", …]` queries have `gcTime: 0`.
- Filters live in URL search params: `query` (literal substring of the original title or source
  listing ID, at most 512 bytes), `listingSource`, exact `sourceListingId`, `lifecycle` (absent
  includes both states), `availabilityCode`, `auction`, `sort` (`created`, `updated`) with `order`
  (sent only together; the default `updated desc` is omitted) and `size` (1–100, default 25).
  `listingSource`, `auction` and `availabilityCode` map to `listingSourceId`, `auctionId` and
  `availability`; product search declares those keys as lists. The list query key holds every
  filter, sort and size, so a changed scope starts without a cursor; `searchAfter` is resent
  verbatim. No total is shown, and the source listing ID is labelled as unique only within its
  source.
- Rows show the title (or "no title recorded"), lifecycle, source name and ID, source listing ID,
  listing ID, availability, source-currency price and estimates, and UTC timestamps, and link to
  the record. The record adds the slug, version, original title and description with their
  language, sale observation and original URL as read-only facts; active listings link to their
  public page.
- The edit form covers only price (amount, on request or cleared), estimates, availability, URL,
  ordered images and auction membership with lot facts. The PATCH contains only groups that differ
  from the record as the draft began: omitted groups are kept, cleared optional values are `null`,
  an empty image list empties the collection, detaching sends only `auctionId: null`, and each
  timing instant clears on its own. Decimal input converts exactly to minor units with
  `CURRENCY_MINOR_UNIT_EXPONENTS`; extra decimals, thousands separators and unsafe integers are
  rejected, not rounded, and a new amount needs an explicit currency unless the listing already
  has one. Only changed groups are validated. Auctions are chosen from `adminSearchAuctions` scoped
  to the listing's source; the backend still rejects a missing (`AUCTION_NOT_FOUND`) or
  cross-source (`409 CONFLICT`) reference.
- Every command submits the version its form or confirmation was loaded with. A `409
  PRODUCT_LISTING_CONCURRENCY_CONFLICT`, `409 PRODUCT_LISTING_WITHDRAWN`, `404` or an unknown
  outcome (no response, `408`, `429`, `5xx`) refetches the record before the command settles;
  nothing is resubmitted automatically. While a newer version is loaded and the draft has changes,
  saving waits for an explicit "keep my changes" (reapply only the edited groups to the latest
  version) or "discard"; a form without changes adopts the newer record. After a lost response,
  keeping a draft that already committed produces no changes. Success uses the returned version
  and outcome (`CHANGED`/`UNCHANGED`) and invalidates the directory and `["admin", "overview"]`.
- Withdraw (`DELETE` with `expectedVersion` in the query, `204`) and restore (`POST` with
  `expectedVersion` in the body) each need confirmation showing the version captured when it
  opened. Withdrawal retains the listing, history, watchlist state and sale observation and clears
  availability; restoration returns it to active with unspecified availability. Withdrawn or
  unrecognized lifecycles lock editing; the draft stays until the listing is restored.
- Canonical image URLs are privileged and carry no assessment in this contract. They are listed as
  URLs; each preview loads only on an explicit request for the URL entered at that moment, with
  `no-referrer`. Editing that URL hides the preview, and nothing renders automatically.
- A success confirms the authoritative commit only. Public search, listing pages, notifications
  and caches converge asynchronously, and later accepted ingestion can overwrite edits or restore a
  withdrawal. The UI says so and never presents these actions as permanent overrides or
  takedowns. Creation, bulk actions and permanent purge are not part of this workflow.
- Errors use fixed copy chosen by status and stable error code; problem details are never shown.
  `401`/`403`, `404` and invalid IDs hide previously loaded content.

## Party detail and business locations

Routes: `/$lng/admin/parties` (directory) and `/$lng/admin/parties/$partyId` (organization page).

- Directory rows link to the organization page; creating an organization opens its page. The page
  shows the identity and contact details with edit (dialog) and delete (confirmation dialog;
  success returns to the directory), followed by every business location. Recorded locations
  block deletion; the `409` copy says so.
- Administrators use the same protected Party-location operations as authorized Party managers;
  there are no admin-specific location reads or writes. The workspace, location cards, editor
  and active-location selector live in `src/features/party-locations` and take a
  `{ viewerCacheKey, partyId }` scope. The route has no loader: location reads run on the client
  with `no-store`, the query signal and no retries under the viewer-scoped `partyLocations` root.
  List pages carry every protected field, so cards render from the list and saved locations
  replace their loaded entry before the list refetches.
- Locations may be partial or unresolved. The editor keeps address and postal text verbatim,
  offers ISO countries and subdivisions from the pinned release, requires explicit precision for
  a point, and stores evidence as an opaque reference. Roles describe business use only. The
  `publicPartyLocation` disclosure appears on every form, and each card states whether the
  location is publicly eligible.
- Correction (`SAME_SITE`), relocation, retirement and restoration are separate actions on each
  card. Relocation is a create with `relocates` (new ID; the old location is retired atomically)
  and needs confirmation, as do lifecycle changes. Each action shows its consequence for public
  results, inherited listing geography and source defaults that reference the location; nothing
  selects another default.
- Corrections send only the groups the draft changed relative to the location as it was when
  editing began; a cleared group is `null`, and unchanged groups (including values the app cannot
  display) are omitted. An empty diff is not sent; a response at the same revision is reported as
  unchanged.
- Creates keep one `Idempotency-Key` per unchanged command until the outcome is definite (network
  failure, `408`, `429` and `5xx` keep it). A `409` refetches the Party's locations; the editor
  keeps the draft and requires an explicit "keep draft" (reapply its own changes at the latest
  revision) or "discard draft". `401`/`403`/`404` reset the Party's cached locations and hide
  loaded content.

## Party-location management grants

Route: `/$lng/admin/parties/$partyId` (below the business locations).

- `listPartyLocationManagers` lists the users who can currently manage the Party's locations, each
  once with independent reasons: an explicit grant and/or membership in active Partnerships (with
  their IDs). Suspended/deleted users, revoked grants, dissolved Partnerships and the administrator
  role alone add no row. Reads are `no-store`, cancellable, not retried and keyset-paged under
  `["admin", "partyLocationManagers", partyId]`, which viewer changes clear.
- `setPartyLocationManagementGrant` sends `{ granted: true | false }` for the page's Party and
  either a listed manager (revoke only, shown only for an explicit grant) or a user chosen with
  `AdminUserPicker` (`adminSearchUsers`; free text is never sent as a user ID). For a picked user
  the section reads that user's current access (`userId` filter) and offers only the applicable
  action. Both actions need confirmation and use `Cache-Control: no-store`.
- The grant covers every location of the Party and is independent from active partnership
  membership and listing-source grants. Revocation removes only the explicit grant; the copy never
  says the user lost access, because membership can still permit management. Partnership access is
  changed on the partnership, never here.
- Errors use fixed, status-based copy. Success, `404` and `409` invalidate the Party's manager
  reads and every cached `partyLocations` read of the Party; a `404` also refetches the Party
  detail.
- The control lives in the admin Party feature only; the shared `party-locations` workspace that
  ordinary location managers use never renders it. A link to a manager-facing Party-location
  workspace will be offered once that route exists
  ([#1084](https://github.com/aura-historia/webapp/issues/1084)).

## Listing-source default locations

Route: `/$lng/admin/listing-sources` (the source detail dialog, below the source actions).

- The admin-specific operations (`adminGetSourceLocationDefault`, `adminAssignSourceLocationDefault`,
  `adminChangeSourceLocationDefaultApplicability`, `adminClearSourceLocationDefault`) need
  administrator authority; operator membership or a source grant is not enough. Reads and writes
  are `no-store`; the read forwards the query signal, is not retried and lives under
  `["admin", "sourceLocationDefault", listingSourceId]`, which viewer changes clear.
- The read carries only the location reference, applicability evidence, eligibility and revision,
  never an address or point. The section shows the revision, both assertions and the reference's
  eligibility; the label and region appear only when the operator's loaded Party locations contain
  the location, otherwise just its ID. Absent and retired references are shown as such.
- Assignment chooses from `PartyLocationSelector` scoped to the source's operator Party, which
  offers only active locations; a selection that a refetch shows as retired or missing is rejected
  rather than moved. Creating, correcting, relocating and retiring locations happen on the
  operator's organization page, which the section links to.
- Advertised inventory and associated business are independent assertions, each with its own
  opaque evidence reference (single line, at most 2048 UTF-8 bytes, sent verbatim). Only advertised
  inventory on an active location supplies source-derived listing geography; the copy says that a
  business association alone never places individual listings at the site.
- Assigning or replacing sends the location and both assertions (an unasserted one as `null`); a
  replacement starts with empty assertions. Editing applicability is offered only for an active
  reference and sends only the assertions the draft changed (`null` removes), so evidence the app
  cannot display is kept; an empty diff is not sent. Clearing needs confirmation and stays
  available for retired references.
- Every command sends the revision its form or confirmation was opened with. Any failure other
  than validation refetches the default and the operator's locations; `404` also refetches the
  source detail, whose operator may have changed (`PARTY_NOT_FOUND` reports a missing or foreign
  location). When a newer revision loads, submitting waits for an explicit "keep my draft"
  (applicability reapplies only the draft's own changes) or "discard"; nothing is resubmitted
  automatically. `401`/`403` reset the default and hide loaded content.
- Success stores the returned revision (never over a newer one) and refetches the viewer's own
  source-default read. The copy states that search results and listing geography converge
  asynchronously and that retirement or relocation never moves the default automatically.

## Other workflows

Party management, listing-source management (`/$lng/admin/listing-sources`), user management and
security controls, OAuth client management and the aggregate overview are described in the
[admin authorization guidelines](admin-authorization-guidelines.md).
