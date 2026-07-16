**Think caveman. Talk caveman. Few word.**

# DOX framework

## Core Contract

- `AGENTS.md` files are binding work contracts for their subtree.
- Root owns project-wide law. Child docs own local detail.
- Closer doc wins for local work, but child docs must not weaken parent rules.
- Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

## Caveman Contract

- Think simple. Speak simple. Few word.
- Prefer short bullets. No fluff. No ceremony.
- Say only what helps. If unsure, say unsure.
- Keep final reports short: changed files, validation, risks.

## Read Before Editing

1. Read this root `AGENTS.md`.
2. Identify files/folders you may touch.
3. Walk from repo root to each target path.
4. Read every `AGENTS.md` on that path.
5. If a parent index lists a child doc for your target, read it too.
6. Read referenced docs/skills when the task matches them.

## Update After Editing

Every meaningful change needs a DOX pass before done.

Update nearest owning `AGENTS.md` when work changes:

- purpose, scope, ownership, responsibility;
- durable structure, contracts, workflow, validation;
- required inputs, outputs, permissions, constraints, side effects;
- user preferences;
- `AGENTS.md` creation, deletion, move, rename, or child index.

Do not update docs for tiny behavior-neutral edits. Still do the DOX pass.

## Child Doc Shape

Use this shape:

- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

Create child docs only for durable boundaries with special rules. Not every folder.

## Style

- Concise. Operational. Current.
- Stable contracts, not diary.
- Broad rules in parent. Concrete rules in child.
- Delete stale text. Do not explain history.

## Closeout

1. Re-check changed paths against DOX chain.
2. Update nearest owning docs and parent child indexes.
3. Remove stale/contradictory text.
4. Run relevant validation.
5. Report docs left unchanged, if any.

# Project Rules

## Hard Rules

- Use PNPM only. No npm/yarn.
- Do not hand-edit generated code:
  - `src/routeTree.gen.ts`
  - `src/client/**`
- Ignore E2E tests unless user explicitly asks.
- For user-facing strings: update all locales: `de`, `en`, `es`, `fr`, `it`.
- For UI: follow `docs/design-guidelines.md`.
- For copy: follow `docs/product-context.md`.
- For user data: run privacy alignment from `docs/privacy-policy-alignment.md`.
- For feature/route/data architecture: follow `docs/architecture-guidelines.md`.
- For SSR/browser-only values: follow `docs/hydration-guidelines.md`.

## Product Shape

Aura Historia is refined global discovery for antiques, art, design objects, dealers, auction houses, shops, and marketplaces.

Main users:

- collectors, amateur to expert;
- commercial/private dealers;
- auction-house staff and analysts;
- estate sellers;
- partners integrating shops/APIs/OAuth.

Tone: professional, precise, calm, high-trust, art-market aware. No cheap hype.

## Stack

- React + TypeScript strict.
- Vite + TanStack Router/Start style SSR.
- TanStack Query for server/cache state.
- Tailwind CSS v4 with tokens in `src/styles.css`.
- shadcn/Radix-style primitives in `src/components/ui`.
- i18next + `react-i18next`.
- AWS Amplify/Cognito auth.
- OpenAPI generated client in `src/client/**`.
- Vitest + Testing Library for unit/component tests.
- Biome for lint/format.

## Repo Map

- `docs/` — product, design, privacy, architecture, hydration guidance.
- `.agents/skills/` — project-local reusable agent skills.
- `src/routes/` — TanStack file routes, loaders, heads, API route files.
- `src/components/` — shared/domain UI and primitives.
- `src/features/` — feature slices with components/hooks/api/lib/pages/types.
- `src/data/internal/` — internal domain types and API mapping.
- `src/hooks/` — shared/domain hooks.
- `src/lib/` — reusable libraries, server helpers, SEO, tracking, validation.
- `src/i18n/` — language setup and locale dictionaries.
- `src/assets/content/` — localized legal/static markdown.
- `src/test/` — test utilities/setup.

## Architecture

- Keep route files thin: route declaration, loader, head, params/search validation, composition.
- Put substantial UI/workflow in components, hooks, features, or data modules.
- Prefer feature slices for durable new product areas.
- Convert generated API DTOs to internal/feature types before deep UI use.
- Prefer route loaders for first-paint/SEO data.
- Use React Query for cache, mutations, and interaction state.
- Use existing primitives/hooks/libs before new abstraction.
- Co-locate tests near changed code in `__tests__`.

## Privacy And Security

Run privacy check when touching:

- account/profile/auth/session data;
- cookies, localStorage, sessionStorage, consent;
- watchlist, search filters, notifications, preferences;
- newsletter/marketing;
- payments/subscriptions;
- partner/shop/admin data;
- OAuth clients, access tokens, bearer tokens;
- analytics/tracking/logging/external embeds.

Keep tokens masked. Do not send personal data to analytics unless policy and consent allow. Do not cache user-specific data as public.

## Hydration

Do not read browser-only values during SSR-visible render:

- `window`, `document`, `navigator`;
- `localStorage`, `sessionStorage`, `cookieStore`;
- `Date.now()`, `new Date()` for visible text;
- `Math.random()` or unstable IDs;
- client-only auth, locale, currency, timezone, consent.

Use server helpers, route context, loader data, stable fallbacks, or effects after mount.

## Commands

- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Unit tests: `pnpm test`
- Lint: `pnpm lint`
- Full Biome check: `pnpm check`
- Format write: `pnpm format:fix`
- OpenAPI generate: `pnpm openapi-ts`
- Type check: `pnpm exec tsc --noEmit`

## Validation Choice

Pick narrow first:

- Markdown/docs only: usually no automated validation.
- Component/hook/data logic: focused Vitest test if present.
- Significant TS/TSX: `pnpm lint` or `pnpm check`.
- Routes, SSR, i18n setup, hydration-sensitive work: `pnpm build`.
- OpenAPI source/spec change: `pnpm openapi-ts`, then relevant tests/build.
- E2E: do not run unless user asks.

Never claim validation passed unless run and passed.

## Generated Code

- `src/routeTree.gen.ts`: generated by TanStack Router tooling/dev/build.
- `src/client/**`: generated by OpenAPI tooling.
- If generated code is wrong, change source spec/config and regenerate. Do not patch output.

## Skills

Use project-local skills when task matches:

- `add-feature` — new or extended product feature.
- `privacy-alignment-check` — user data/privacy work.
- `product-copywriter` — user-facing copy and translations.
- `react-hook-form-writer` — forms with React Hook Form + Zod.
- `react-useeffect` / `writing-react-effects` — non-trivial React effects.

## Child DOX Index

- `docs/AGENTS.md` — durable product, design, privacy, architecture, hydration docs.
- `.agents/skills/AGENTS.md` — project-local agent skills.
- `src/AGENTS.md` — application source code and child source index.
