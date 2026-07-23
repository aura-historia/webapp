# Components DOX

## Purpose

`src/components/` contains shared UI primitives, domain UI, page sections, and reusable presentation components.

## Ownership

This doc owns component work under `src/components/**`, including `ui`, `typography`, landing-page sections, and domain folders such as account, search, product, shop, watchlist, consent, legal pages, and admin UI still located here.

## Local Contracts

- Always follow `../../docs/design-guidelines.md` for UI work.
- Read `../../docs/product-context.md` before user-facing copy changes.
- Read `../../docs/privacy-policy-alignment.md` before components that collect, show, mutate, or track user data.
- Keep all user-facing strings in i18n dictionaries unless a local pattern proves the text is static/non-user-facing.
- Maintain accessibility: semantic elements, keyboard paths, focus states, ARIA labels for icon-only actions, and informative alt text.
- Many of the components are currently in the process of being migrated to the feature slice directories - Do not migrate them unless specifically asked
- Do not add any new self-contained features here that could fit better into their own feature directory

## Work Guidance

- Reuse `src/components/ui/*` primitives and existing typography components before creating new ones.
- Keep `src/components/ui/*` generic and product-agnostic; move domain logic to domain components or features.
- Landing-page sections usually pair `*.data.ts` for translation keys/configuration with `*.tsx` rendering.
- Prefer named exports unless a folder already uses default exports for section components.
- Avoid storing derived render values in state; use effects only for browser/external synchronization.
- Watch hydration when a component reads scroll/window/media/local storage/date/random values. Initial markup must be stable.

## Verification

- Run focused component tests when changing tested behavior.
- Run `pnpm lint` or `pnpm check` for substantial component changes.
- Run `pnpm build` when component changes affect SSR, routes, or hydration-sensitive rendering.

## Child DOX Index

- `src/components/ui/AGENTS.md` — generic UI primitive contracts.
- `src/components/landing-page/AGENTS.md` — landing-page section, copy, and storytelling contracts.

Add more child docs only when a component domain has durable local rules beyond this doc.
