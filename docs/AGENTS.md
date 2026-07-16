# Docs DOX

## Purpose

`docs/` contains durable project reference material used by agents and contributors: product context, design guidance, privacy alignment, architecture guidance, and hydration guidance.

## Ownership

This doc owns reference documentation under `docs/**`. The root `AGENTS.md` owns repo-wide workflow and child DOX indexing.

## Local Contracts

- Keep docs operational and concise: stable rules, checklists, and source-of-truth references, not diary entries.
- Update docs when product positioning, design rules, privacy expectations, architecture patterns, hydration guidance, or validation workflow changes.
- Do not duplicate whole docs into `AGENTS.md` files; reference the relevant doc from local contracts.
- Keep legal/privacy docs clear that they are engineering guidance, not legal advice.

## Work Guidance

- `product-context.md` owns audience, positioning, voice, and conversion context.
- `design-guidelines.md` owns design identity, tokens, primitives, accessibility, and UI checklist.
- `privacy-policy-alignment.md` owns user-data/privacy-policy engineering checks.
- `architecture-guidelines.md` owns durable architecture and feature-slicing guidance.
- `hydration-guidelines.md` owns SSR/hydration rules and review checklist.

## Verification

- Markdown-only changes usually need no automated validation.
- Run `pnpm check` only when doc edits include code snippets or adjacent TypeScript changes that need validation.

## Child DOX Index

No child DOX files yet. Do not add one per document.
