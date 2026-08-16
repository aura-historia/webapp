# Landing-Page Prerendering Guidelines

Public landing pages may be prerendered, with this exception.

## Recently Added Products

- Keep recently added products client-only. Do not embed this frequently changing inventory in prerendered or build-time HTML.
- Prerender a matching skeleton or stable placeholder to reserve layout and avoid layout shift.
- Load current products after mount. Do not turn this exception into a route loader merely to improve first paint.

## Review

- Confirm prerendered HTML contains no product inventory that must wait for the next deployment to refresh.
- Keep the client result and prerendered placeholder structurally compatible.
