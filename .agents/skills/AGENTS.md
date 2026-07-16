# Skills DOX

## Purpose

`.agents/skills/` contains project-local Zed agent skills for reusable Aura Historia workflows.

## Ownership

This doc owns project-local skill definitions under `.agents/skills/**`.

## Local Contracts

- Each skill directory must be lowercase kebab-case and contain a `SKILL.md` with matching `name` frontmatter.
- Skill descriptions must clearly state when to use the skill.
- Keep skill instructions focused; link to `AGENTS.md` and `docs/**` rather than duplicating all project rules.
- Prefer project-local skills for Aura Historia-specific workflows and global skills only for personal cross-project workflows.

## Work Guidance

Current project-local skills:

- `add-feature` — feature work with architecture, i18n, design, privacy, hydration, and validation checks.
- `privacy-alignment-check` — user-data/privacy-policy alignment review.
- `product-copywriter` — user-facing product copy and full-locale translation guidance.
- `react-hook-form-writer` — React Hook Form + Zod form writing/refactoring.
- `react-useeffect` — React `useEffect` best-practice review.
- `writing-react-effects` — avoid unnecessary React effects.

## Verification

- Validate skill frontmatter manually when editing: `name`, `description`, delimiter syntax, and directory/name match.
- Markdown-only skill edits usually need no automated validation.

## Child DOX Index

No child DOX files yet. Do not add one per skill unless a skill directory gains supporting files with distinct maintenance rules.
