# OAuth Feature DOX

## Purpose

`src/features/oauth/` owns OAuth authorization UI, approve handler support, scopes, client summaries, partner shop selection, and OAuth helper logic.

## Ownership

This doc owns OAuth feature code under `src/features/oauth/**`.

## Local Contracts

- OAuth touches account access and tokens. Read `../../../docs/privacy-policy-alignment.md` before changes.
- Follow OAuth/PKCE intent from generated API docs and existing helpers. Do not weaken state, redirect, scope, or code-verifier behavior.
- Never leak authorization codes, access tokens, client secrets, redirect state, or shop/user identifiers into logs, analytics, or public cache.
- Consent/authorization copy must be clear, conservative, and translated in all locales.

## Work Guidance

- Keep URL/search param parsing in `lib` helpers.
- Keep UI pieces small: client summary, scopes, selected shop, actions, error card, skeleton.
- Treat redirect URIs and client identity as security-sensitive display data.
- Show scopes/permissions plainly. No vague “allow everything” copy.
- Keep API handler tests near `api` code.

## Verification

- Run focused OAuth tests for helpers/hooks/API handler when changed.
- Run `pnpm build` for route/API/SSR integration changes.
- Ignore E2E tests unless explicitly requested.

## Child DOX Index

No child DOX files yet. Add one only if OAuth subareas diverge.
