# Admin Authorization Guidelines

Apply this guide to admin routes, handlers, and features.

The endpoint migration defers the shared admin dashboard shell and navigation to
MIG-24. Authenticated, noindex workflow routes retain `AdminGuard`; legacy feature
implementations and DTOs are removed rather than compiled against incompatible
endpoints. The generated admin SDK is not an implemented dashboard. Restore workflows
only with current DTO mapping, tests and the authorization checks below. See
[MIG-24 scope decisions](api-migration/integration-release-gate.md).

Restored workflows: OAuth client management (MIG-22), partnership application review
(MIG-16, see [admin partnership application review](api-migration/partnership-application-contracts.md#admin-partnership-application-review)),
Party management (MIG-17), listing-source management (MIG-18), partnership membership
and source-grant management (MIG-19, see
[admin partnership management](api-migration/admin-partnership-management.md)), and user
management (MIG-20). Party contacts are available only through the authenticated admin Party
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
and cleared when the dialog closes. The shared admin shell and navigation remain deferred to MIG-24;
individual workflow routes stay protected by `AdminGuard` and backend authorization.

## Requirement

- UI visibility, route guards, and hidden controls are not authorization boundaries.
- Enforce authorization on the server for every admin route, API handler, mutation, and sensitive data read.
- Check authorization again where the privileged action executes; do not trust client role state or submitted identifiers.

## Review

- Confirm unauthorized requests fail safely without disclosing admin data.
- Keep secrets, tokens, and admin data out of logs, URLs, analytics, and public caches.
- Treat any authorization-model change as security-sensitive.
