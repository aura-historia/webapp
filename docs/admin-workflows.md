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

## Other workflows

Party management, listing-source management (`/$lng/admin/listing-sources`), user management and
security controls, OAuth client management, auction management and the aggregate overview are
described in the [admin authorization guidelines](admin-authorization-guidelines.md). Admin
auctions are opened by ID until an admin auction search exists
([backend#1991](https://github.com/aura-historia/backend/issues/1991)).
