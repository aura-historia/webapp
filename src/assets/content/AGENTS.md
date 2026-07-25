# Localized Content DOX

## Purpose

`src/assets/content/` contains localized static markdown/legal content for imprint, privacy policy, and terms.

## Ownership

This doc owns markdown content and asset maps under `src/assets/content/**`.

## Local Contracts

- Privacy policy must stay aligned with European and German law expectations, especially GDPR/DSGVO and TDDDG/ePrivacy. Use `../../../docs/privacy-policy-alignment.md` for checks.
- Keep all locales semantically aligned for every content set: `de`, `en`, `es`, `fr`, `it`.
- Treat German legal/privacy text as especially important for German-law alignment.
- Do not invent legal guarantees, compliance claims, processor relationships, retention periods, or data-subject workflows without support.
- If a code change affects user-data behavior, check whether privacy content must change before finishing.

## Work Guidance

- Update the relevant `*-asset-map.ts` only when file naming/import behavior changes.
- Preserve markdown readability and heading structure across locales.
- Legal translations should be meaning-preserving, not marketing rewrites.
- When adding a new static content set, include all locales and an asset map consistent with existing maps.

## Verification

- Run `pnpm build` after asset-map changes or large markdown import changes.
- Run `pnpm check` for formatting/lint-sensitive TypeScript asset-map edits.
- Ignore E2E tests for now unless explicitly requested.

## Child DOX Index

No child DOX files yet. Do not add one per locale or per legal page unless workflows diverge substantially.
