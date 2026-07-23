# i18n DOX

## Purpose

`src/i18n/` owns localization setup and translation dictionaries for all supported UI languages.

Supported locales:

- `de` — Deutsch
- `en` — English, default fallback
- `fr` — Français
- `es` — Español
- `it` — Italiano

## Ownership

This doc owns `src/i18n/**`, including locale JSON dictionaries, language metadata, resource setup, and browser/server language behavior.

## Local Contracts

- Every user-facing string added to the app must be translated in all five locale dictionaries: `de`, `en`, `es`, `fr`, `it`.
- Keep translation key structure aligned across every `translation.json` file.
- Preserve placeholders exactly across locales, e.g. `{{year}}`, `{{language}}`, component markers used by `<Trans>`, and plural/context keys when present.
- Do not add hardcoded user-facing strings in components/routes when a translation key should be used.
- Read `../../docs/product-context.md` for voice and audience before translating marketing/product copy.

## Work Guidance

- Prefer clear, idiomatic translations over literal word-for-word output.
- Keep German formal and professional (`Sie`) unless existing local context proves otherwise.
- For legal/privacy copy, keep semantics aligned with the German source and use `src/assets/content/AGENTS.md` rules.
- When adding SEO metadata, update the relevant `meta.*` keys in every locale.
- Be hydration-aware: server and client language initialization must agree. Avoid render-time language detection from browser-only APIs.

## Verification

- Run JSON-aware checks through `pnpm check` for substantial dictionary edits.
- Run focused tests if translation-dependent tests exist for changed components.
- Run `pnpm build` after changes to language setup, resource loading, or SSR language behavior.

## Child DOX Index

No child DOX files yet. Locale subfolders should not each get docs unless their workflow diverges.
