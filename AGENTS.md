# Aura Historia

Refined global discovery for antiques, art, design objects, dealers, and auction houses. Tone: precise, calm, trusted; no hype.

## Rules

- Use `pnpm` only. Do not run E2E tests unless asked.
- Never hand-edit generated code: `src/routeTree.gen.ts`, `src/client/**`.
- Add every user-facing string to all locales: `de`, `en`, `es`, `fr`, `it`.
- Update relevant docs when a change affects their guidance, contracts, or described behaviour.
- Keep routes thin. Put durable workflows in `src/features/`; reuse existing UI and hooks first.
- Map generated API DTOs before deep UI use.
- Use route loaders for first-paint or SEO data. Do not prerender dynamic, personalised, or authenticated routes.
- Keep server-rendered markup deterministic: no browser APIs, client auth, current dates, random values, or client locale/currency during render.
- Treat tokens, OAuth, account, partner, admin, consent, storage, tracking, and payments as sensitive. Do not log, expose, or publicly cache private data.

## Read When Needed

- UI: `docs/design-guidelines.md`
- Product copy: `docs/product-context.md`
- User data: `docs/privacy-policy-alignment.md`
- Feature, route, or data design: `docs/architecture-guidelines.md`
- SSR or browser-only work: `docs/hydration-guidelines.md`
- OAuth: `docs/oauth-protocol-guidelines.md`
- Admin authorization: `docs/admin-authorization-guidelines.md`
- Landing-page prerendering: `docs/landing-page-prerendering-guidelines.md`
- Terms, imprint, or privacy translations: `docs/legal-content-guidelines.md`

## Validation

- Docs only: usually none.
- Code: run the narrowest relevant test, then `pnpm lint` or `pnpm check`.
- Routes, SSR, i18n, or hydration: also run `pnpm build`.
