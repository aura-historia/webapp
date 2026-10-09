# Admin Authorization Guidelines

Apply this guide to admin routes, handlers, and features.

The admin route renders `AdminLayout` (section sidebar plus the active workflow) only
after `AdminGuard` confirms the ADMIN role. Navigation visibility is not authorization:
authenticated, noindex workflow routes retain `AdminGuard`. Add admin workflows only
with current DTO mapping, tests and the authorization checks below. See
[MIG-24 scope decisions](api-migration/integration-release-gate.md).

Workflows: OAuth client management (MIG-22), partnership application review
(MIG-16, see [admin partnership application review](api-migration/partnership-application-contracts.md#admin-partnership-application-review)),
Party management (MIG-17), listing-source management (MIG-18), partnership membership
and source-grant management (MIG-19, see
[admin partnership management](api-migration/admin-partnership-management.md)), user
management (MIG-20) with security controls (MIG-21), auction management (MIG-25), and
the admin overview (MIG-23). The
overview reads only the `getAdminOverview` aggregate with a `no-store` request under the
private `["admin", "overview"]` query key; it never derives totals from paginated
collections, shows loading and error states instead of zero for unavailable counts, and
labels ingestion method assignments as overlapping rather than summing them into a source
total. Admin mutations that change any aggregate invalidate that key. Auction create and update use
`Cache-Control: no-store`; listing-source association and source auction identity are
immutable on update, and an `expectedVersion` conflict refetches the authoritative
record. Party contacts are available only through the authenticated admin Party
operations. Listing-source search/detail use their separate safe DTOs; the read API
omits full ingestion configuration and never returns the write-only WooCommerce
secret. Preserve unseen configuration by omitting it from updates, and require an
explicit replacement action before sending new settings. The operator and source slug
are immutable on update. User search and detail use separate summary and account DTO
mappings; user reads and mutations use `Cache-Control: no-store` requests and private
query keys. User security controls map suspension, Cognito session revocation, and Aura access-token
metadata/revocation separately. The account detail DTO does not expose suspension state, so show only
the state confirmed by a suspend/unsuspend response. Session revocation does not revoke Aura access
tokens or dissolve partnerships. Admin token metadata must remain secret-free, target-user query keys
must include the selected user ID, and token revocation requests must include that same explicit user
ID. Suspension reasons are required operational-log input: validate the UTF-8 byte limit and do not
retain or log the reason in the client. All OAuth client requests use `Cache-Control: no-store`; list, detail and
update use secret-free DTOs. Creation alone returns a plaintext client secret, shown once
and cleared when the dialog closes. Every workflow route stays protected by `AdminGuard` and
backend authorization; the shared sidebar only links to them.

## Requirement

- UI visibility, route guards, and hidden controls are not authorization boundaries.
- Enforce authorization on the server for every admin route, API handler, mutation, and sensitive data read.
- Check authorization again where the privileged action executes; do not trust client role state or submitted identifiers.

## Review

- Confirm unauthorized requests fail safely without disclosing admin data.
- Keep secrets, tokens, and admin data out of logs, URLs, analytics, and public caches.
- Treat any authorization-model change as security-sensitive.
