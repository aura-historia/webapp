# Admin Feature DOX

## Purpose

`src/features/admin/` owns feature-sliced admin workflows, currently OAuth client management.

## Ownership

This doc owns admin feature code under `src/features/admin/**`.

## Local Contracts

- Admin data is sensitive. Read `../../../docs/privacy-policy-alignment.md` before changes.
- Keep authorization assumptions explicit. UI guards are not security by themselves.
- Do not expose secrets, tokens, client secrets, user contact data, or admin-only metadata in logs, URLs, analytics, or public cache.
- User-facing admin strings still need all locale translations.

## Work Guidance

- Keep admin feature shape: `components`, `hooks`, `lib`, `types`, plus tests near code.
- Put API/DTO adaptation in hooks/lib/types, not scattered through JSX.
- Prefer explicit loading, empty, error, and permission states.
- Mutation flows should invalidate/refetch only needed queries.

## Verification

- Run focused admin feature tests when changed.
- Run `pnpm build` for route integration, auth, SSR, or generated-client changes.
- Ignore E2E tests unless explicitly requested.

## Child DOX Index

No child DOX files yet. Add one only if an admin subfeature grows distinct rules.
