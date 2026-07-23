# UI Primitives DOX

## Purpose

`src/components/ui/` contains generic shadcn/Radix-style primitives and small reusable UI helpers.

## Ownership

This doc owns primitive UI components under `src/components/ui/**`.

## Local Contracts

- Keep primitives generic. No Aura Historia domain logic, API calls, routes, or feature workflows here.
- Follow `../../../docs/design-guidelines.md`.
- Preserve accessibility from Radix/shadcn patterns: focus, keyboard, ARIA, labels.
- Use semantic tokens from `src/styles.css`. Avoid hardcoded colors.
- New shadcn components must use latest CLI pattern: `pnpx shadcn@latest add <component>`.

## Work Guidance

- Use `cn` from `@/lib/utils` for class composition.
- Keep variants in `cva` when component has repeated style variants.
- Keep exports named and consistent with current primitives.
- Do not add user-facing copy unless primitive truly owns it. Prefer props/children.
- Do not add data fetching, auth, preferences, analytics, or i18n setup here.

## Verification

- Run focused tests for changed primitives when present.
- Run `pnpm check` for substantial TSX/style edits.
- Run `pnpm build` if primitive changes affect SSR or broad app rendering.

## Child DOX Index

No child DOX files yet. Do not add one per primitive.
