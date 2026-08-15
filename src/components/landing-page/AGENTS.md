# Landing Page Components DOX

## Purpose

`src/components/landing-page/` owns public landing-page sections, discovery storytelling, product-market copy, and section config.

## Ownership

This doc owns landing-page components and section data under `src/components/landing-page/**`.

## Local Contracts

- Read `../../../docs/product-context.md` before copy or positioning changes.
- Read `../../../docs/design-guidelines.md` before visual changes.
- Read `../../../docs/hydration-guidelines.md` before browser API, animation, data, i18n, or route-sensitive changes.
- User-facing text must use i18n keys and be translated in `de`, `en`, `es`, `fr`, `it`.
- Claims about market size, source coverage, trust, pricing, or AI must be true and supported.
- Keep recently added products client-only so frequently changing inventory is never embedded in prerendered landing-page HTML; prerender a matching skeleton to reserve layout space.

## Work Guidance

- Keep `*.data.ts` for section config, translation keys, icons, links, and static arrays.
- Keep `*.tsx` for rendering and interaction.
- Decorative art/images: `alt=""` and `aria-hidden="true"`. Informative images need localized alt text.
- Keep tone refined, professional, restrained. No cheap urgency.
- Avoid hydration drift from scroll/window/media/date/random values. Use effects and stable initial markup.
- Preserve anchor IDs/fragments from `LandingPage.fragments.ts`.

## Verification

- Run focused landing-page component tests when changed.
- Run `pnpm build` for route-visible, SSR, data loader, or hydration-sensitive edits.
- Ignore E2E tests unless explicitly requested.

## Child DOX Index

No child DOX files yet. Section folders should not each get docs unless rules diverge.
