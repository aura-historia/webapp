---
name: add-feature
description: Add or extend Aura Historia features using the project's feature-sliced React/TanStack architecture, i18n, design, privacy, testing, and hydration checks.
---

# Add Feature

Use this skill when creating a new feature, adding a route-backed flow, or extending a durable product area in Aura Historia.

## Required Reading

Before planning or editing, read the root instructions and these docs:

- `AGENTS.md`
- `docs/architecture-guidelines.md`
- `docs/design-guidelines.md` for UI work
- `docs/product-context.md` for user-facing text
- `docs/privacy-policy-alignment.md` for user-data/auth/tracking/account/payment/partner/admin/OAuth changes
- `docs/hydration-guidelines.md` for route/SSR/browser API changes


## Planning Steps

1. Identify whether the work belongs in an existing domain component folder, existing feature slice, or a new `src/features/<feature-name>` slice.
2. Keep route files thin: loader/head/params/search/composition only.
3. Put substantial workflow UI in feature `pages`/`components`, business helpers in `lib`, hooks in `hooks`, API/server handlers in `api`, types in `types`.
4. Identify all user-facing strings and translation keys before implementation.
5. Identify any user data touched and perform the privacy alignment check.
6. Identify hydration-sensitive values: browser globals, language, currency, timezone, auth, consent, dates, random IDs.

## Implementation Rules

- Reuse existing UI primitives and domain components before adding new ones.
- Use generated TanStack Query options/OpenAPI types through existing patterns; do not edit `src/client/**`.
- Convert API DTOs into internal/feature types before deep UI usage when a mapper pattern exists.
- Use `react-hook-form` + Zod for new/refactored forms unless an existing feature intentionally differs; load the `react-hook-form-writer` skill for non-trivial forms.
- Use effects only for external systems; load `react-useeffect` or `writing-react-effects` for non-trivial effect work.
- Translate every user-facing string in `de`, `en`, `es`, `fr`, and `it`.
- Preserve accessibility, SSR determinism, and privacy boundaries.

## Verification

Start narrow, then broaden if needed:

- Focused Vitest tests for changed feature/component/data mapping behavior.
- `pnpm lint` or `pnpm check` for significant code changes.
- `pnpm build` for route, SSR, i18n, generated-client integration, or hydration-sensitive changes.
- Do not run E2E tests unless the user explicitly asks.

## Closeout

- Update relevant docs when the change affects their guidance, contracts, or described behaviour.
- Report changed files and validation run.
