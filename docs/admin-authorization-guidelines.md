# Admin Authorization Guidelines

Apply this guide to admin routes, handlers, and features.

The endpoint migration defers the shared admin dashboard shell and navigation to
MIG-24. Authenticated, noindex workflow routes retain `AdminGuard`; legacy feature
implementations and DTOs are removed rather than compiled against incompatible
endpoints. The generated admin SDK is not an implemented dashboard. Restore workflows
only with current DTO mapping, tests and the authorization checks below. See
[MIG-24 scope decisions](api-migration/integration-release-gate.md).

Restored workflows: partnership application review (MIG-16, see
[admin partnership application review](api-migration/partnership-application-contracts.md#admin-partnership-application-review))
Party management (MIG-17), and user management (MIG-20). Party contacts are
available only through authenticated admin Party operations. User search and detail
use separate summary and account DTO mappings; user reads and mutations use
`Cache-Control: no-store` requests and private query keys. The shared admin shell and
navigation remain deferred to MIG-24; individual workflow routes stay protected by
`AdminGuard` and backend authorization.

## Requirement

- UI visibility, route guards, and hidden controls are not authorization boundaries.
- Enforce authorization on the server for every admin route, API handler, mutation, and sensitive data read.
- Check authorization again where the privileged action executes; do not trust client role state or submitted identifiers.

## Review

- Confirm unauthorized requests fail safely without disclosing admin data.
- Keep secrets, tokens, and admin data out of logs, URLs, analytics, and public caches.
- Treat any authorization-model change as security-sensitive.
