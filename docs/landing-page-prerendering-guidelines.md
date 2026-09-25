# Landing-Page Prerendering Guidelines

Public landing pages may be prerendered, with this exception.

## Recently Added Products

- Keep recently added products client-only. Do not embed this frequently changing inventory in prerendered or build-time HTML.
- Prerender a matching skeleton or stable placeholder to reserve layout and avoid layout shift.
- Load current products after mount. Do not turn this exception into a route loader merely to improve first paint.

## Public Listing-Source Discovery

- Keep `/$lng/search/shops` out of static prerendering: its source results are fetched from the public search endpoint and can change independently of a deployment.
- Keep `/$lng/shops/$shopSlugId` as request-time SSR with the exact public slug lookup. The source set is dynamic and the public API does not provide a build-time sitemap feed.
- Keep those dynamic profiles out of the static sitemap until a public source sitemap is available. Never enumerate sources through admin search to build public pages.
- Do not render source totals, dealer or auction classifications, partner status, addresses, or private operator details; they are absent from the public source contract.

## Review

- Confirm prerendered HTML contains no product inventory that must wait for the next deployment to refresh.
- Keep the client result and prerendered placeholder structurally compatible.
