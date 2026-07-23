# Routes DOX

## Purpose

`src/routes/` defines TanStack Router file-based routes, SSR loaders, route metadata, auth layout routes, API route handlers, and page composition.

## Ownership

This doc owns route files under `src/routes/**`. UI-heavy implementations should usually live in `src/components/**` or `src/features/**` with route files composing them.

## Local Contracts

- Keep routes thin: route declaration, loader/beforeLoad, head metadata, params/search validation, auth layout composition, and page component wiring.
- Use `generatePageHeadMeta` and localized `meta.*` translation keys for page SEO where applicable.
- Preserve SSR determinism. Read `../../docs/hydration-guidelines.md` for SSR-sensitive changes.
- For user-data or authenticated behavior, read `../../docs/privacy-policy-alignment.md` and preserve cache/privacy boundaries.
- Do not edit `src/routeTree.gen.ts`; let TanStack Router regenerate it.

## Work Guidance

- Prefer route loaders for data needed by first paint or SEO-sensitive pages.
- Use TanStack Query options from the generated client where available.
- Catch non-critical landing/discovery prefetch failures when the page can still render gracefully.
- Avoid browser globals in route loaders and server-rendered route components.
- Route-level user-facing strings must be translated in every supported locale.
- Do not place any test files under this directory - this will result in errors
- Keep route metadata in sync with content

## Verification

- Run `pnpm build` for route additions/renames, root route changes, loader changes, or SEO/head changes.
- Run focused Vitest tests if changing route-adjacent utilities or API handlers.
- Ignore E2E tests for now unless explicitly requested.

## Child DOX Index

No child DOX files yet. Add one only if a route subtree becomes a durable boundary with distinct rules.
