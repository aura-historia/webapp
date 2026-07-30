# Features DOX

## Purpose

`src/features/` contains feature-sliced modules with their own workflows, components, hooks, API/server handlers, libraries, pages, and types.

Current feature areas include:

- `about` — public About page content, values, mission, and team configuration.
- `admin/oauth-client-management` — admin management for OAuth clients.
- `comparison` — comparison/SEO pages such as Aura Historia vs Barnebys.
- `oauth` — OAuth authorization UI and approve handler support.
- `oauth-client-broker` — third-party redirect broker/API support.
- `partner` — partner access tokens, applications, common partner UI, and partner-program flows.

## Ownership

This doc owns all feature-sliced work under `src/features/**`. Add child docs only for feature areas that need distinct durable rules.

## Local Contracts

- Follow `../../docs/architecture-guidelines.md` for feature slicing and folder choices.
- Read `../../docs/privacy-policy-alignment.md` before touching partner data, admin data, OAuth clients, access tokens, account-linked flows, or any user/shop/contact metadata.
- Keep sensitive data out of logs, analytics, URLs, and unnecessary rendered text. Mask tokens except where a one-time plaintext display is explicitly intended.
- Keep user-facing strings translated in all supported locales.

## Work Guidance

- Add only the folders a feature needs: `api`, `components`, `hooks`, `lib`, `pages`, `types`.
- Keep API/server handlers in `api`, pure helpers in `lib`, UI in `components`/`pages`, and shape definitions in `types`.
- Keep route files as composition shells that import feature pages/components.
- Map generated API DTOs to internal or feature-specific types before passing them deep into UI.
- Co-locate tests in `__tests__` folders near changed feature files.

## Verification

- Run focused tests for the changed feature where present.
- Run `pnpm build` for OAuth/API route, route composition, SSR, or generated-client integration changes.
- Ignore E2E tests for now unless explicitly requested.

## Child DOX Index

- `src/features/admin/AGENTS.md` — admin feature and admin-sensitive data contracts.
- `src/features/oauth/AGENTS.md` — OAuth authorization, scopes, redirect, and token-safety contracts.
- `src/features/partner/AGENTS.md` — partner program, applications, access-token, and shop-data contracts.

Add child docs only at feature roots when special contracts are durable. Do not add one per subfolder.
