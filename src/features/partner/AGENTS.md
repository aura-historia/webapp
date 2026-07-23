# Partner Feature DOX

## Purpose

`src/features/partner/` owns partner workflows: partner program pages, applications, access token management, and shared partner UI.

## Ownership

This doc owns partner feature code under `src/features/partner/**`.

## Local Contracts

- Partner data can include shop, domain, contact, application, API token, and account-linked metadata. Read `../../../docs/privacy-policy-alignment.md` before changes.
- Tokens are sensitive. Mask on read views. Plaintext display only when existing create flow intentionally returns it once.
- Partner copy must be professional, truthful, and translated in all locales.
- Do not promise integrations, pricing, commission terms, or onboarding speed unless current product copy/behavior supports it.

## Work Guidance

- Keep feature slices scoped: `access-token-management`, `application-management`, `partner-program`, `common`.
- Keep form validation explicit. Use `react-hook-form-writer` skill for non-trivial forms.
- Use clear loading/error/success states for partner mutations.
- Keep API DTOs out of deep UI; map to feature/internal types where useful.

## Verification

- Run focused partner feature tests when changed.
- Run `pnpm build` for route, SSR, token, or generated-client integration changes.
- Ignore E2E tests unless explicitly requested.

## Child DOX Index

No child DOX files yet. Do not add one per partner subfolder unless workflows diverge.
