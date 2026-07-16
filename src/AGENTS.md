# Source DOX

## Purpose

`src/` contains the application source for Aura Historia: routes, UI, features, generated clients, data mappings, hooks, integrations, libraries, styles, and tests.

## Ownership

This doc owns source-wide implementation rules. Child docs own local rules for routes, components, feature slices, i18n, and legal content.

## Local Contracts

- Read `../docs/product-context.md` before adding or changing user-facing product copy.
- Read `../docs/design-guidelines.md` before UI work.
- Read `../docs/privacy-policy-alignment.md` before user-data, tracking, auth, consent, account, newsletter, payment, partner, admin, OAuth, token, watchlist, search-filter, notification, or preference changes.
- Read `../docs/architecture-guidelines.md` before adding new features, routes, API/domain mappings, or shared abstractions.
- Read `../docs/hydration-guidelines.md` before touching routes, root layout, SSR, browser APIs, i18n initialization, preferences, auth, dates, random IDs, or analytics.
- Keep translations complete in `src/i18n/locales/{de,en,es,fr,it}/translation.json` for every user-facing string.
- Do not hand-edit generated code: `src/client/**` and `src/routeTree.gen.ts`.

## Work Guidance

- Use TypeScript strict patterns and path alias `@/*`.
- Keep route files thin; place substantial UI/workflow logic in components, hooks, features, or data mapping modules.
- Convert generated API DTOs into internal domain types in `src/data/internal/**` before rendering where a mapper pattern exists.
- Prefer SSR-safe loaders/context over browser-only reads during render.
- Use effects only for external systems; derive render-only values directly.
- Prefer existing hooks/components/libraries before adding new abstractions.
- Add or update co-located tests for behavior changes when practical.

## Verification

- Use narrow Vitest runs for changed tests/components when possible.
- Use `pnpm lint` or `pnpm check` for code-quality-sensitive edits.
- Use `pnpm build` for route, SSR, i18n, or hydration-sensitive edits.
- Ignore E2E tests for now unless explicitly requested.

## Child DOX Index

- `src/routes/AGENTS.md` — file-based route, loader, SEO, and SSR shell contracts.
- `src/components/AGENTS.md` — shared/domain UI and design-system contracts.
- `src/features/AGENTS.md` — durable feature-slice contracts.
- `src/i18n/AGENTS.md` — translation and locale contracts.
- `src/assets/content/AGENTS.md` — localized legal/static markdown content contracts.
