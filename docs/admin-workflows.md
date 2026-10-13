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

## Other workflows

Party management, listing-source management (`/$lng/admin/listing-sources`), user management and
security controls, OAuth client management and the aggregate overview are described in the
[admin authorization guidelines](admin-authorization-guidelines.md).
