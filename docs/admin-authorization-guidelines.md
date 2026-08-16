# Admin Authorization Guidelines

Apply this guide to admin routes, handlers, and features.

## Requirement

- UI visibility, route guards, and hidden controls are not authorization boundaries.
- Enforce authorization on the server for every admin route, API handler, mutation, and sensitive data read.
- Check authorization again where the privileged action executes; do not trust client role state or submitted identifiers.

## Review

- Confirm unauthorized requests fail safely without disclosing admin data.
- Keep secrets, tokens, and admin data out of logs, URLs, analytics, and public caches.
- Treat any authorization-model change as security-sensitive.
