# Admin partnership membership and source grants

Issue #994 / MIG-19. Route: `/$lng/admin/partnerships`. It is nested under the authenticated
admin route, whose `AdminGuard` provides the UI access check; every operation also relies on
backend admin authorization. The route is noindex and is not included in the static prerender
allowlist.

- `AdminPartnership.ts` maps the admin summary and detail DTOs into feature types. Search uses
  exact `partyId`, `memberUserId`, and `listingSourceId` filters with the API's fixed tuple
  cursor. The `[created, partnershipId]` tuple is JSON encoded when sent as `searchAfter`.
- Search summaries provide the party ID, immutable slug and name, complete member and
  listing-source grant counts, and timestamps. Detail separately provides ordered member and
  listing-source IDs capped at 100 each, alongside the complete counts. The page labels the
  number of loaded partnership summaries separately; it does not treat the response page-size
  field or the loaded ID arrays as complete totals.
- Membership and source grants are explicit operations. The UI does not infer membership or
  source access from an admin role or an approved application. Membership and source mutations
  refresh partnership data, the admin overview, and the viewer's own listing-source access
  query. Clearing that query before refetch prevents an old source selection from remaining
  available after a revocation.
- The source grant UI reads the listing-source detail and enables grant only when the source's
  operator party matches the partnership party. The API remains authoritative; a 409 is shown
  as a party mismatch if the relationship changed or the pre-check became stale.
- Grant and revoke operations are body-less, idempotent 204 requests. They treat the response
  as success without reading JSON, then refetch authoritative state. A conflict also refreshes
  the list and detail. Dissolution is confirmed explicitly; it removes current memberships and
  source grants but retains the partnership history, party, users, sources, listings, and
  applications. Failures and concurrent-change conflicts remain visible in localized UI.
- All partnership list/detail query keys use the `admin` prefix and are removed on viewer
  changes. List and detail reads forward abort signals, API error bodies are not surfaced in
  the UI, and the endpoints' `Cache-Control: no-store` contract remains in force.

The partnership workflow is separate from partnership-application review. Approval or rejection
does not grant membership or listing-source access; those relationships are managed here.
