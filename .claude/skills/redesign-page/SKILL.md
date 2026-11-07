---
name: redesign-page
description: Redesign one page of the Aura Historia webapp end to end from just the page's name or route — research what the page shows today, design it in the "Aura Historia Redesign" Claude artifact (desktop, mobile, component and states boards built from the design system), iterate with the user, then implement it on a feature branch with translations, tests, a browser check and a PR. Use this whenever someone asks to redesign, restyle, re-skin or "bring to v3" a page or screen of the webapp (notification center, shop profile, partner dashboard, admin pages, the search filters or watchlist pages, and so on), asks for a page "in the redesign file", or names a route under src/routes and wants it to match the new design — even if they only say "do the X page next".
argument-hint: <page name or route, e.g. "notification center" or /me/notifications>
---

# Redesign a page

The only input is the page: a name ("notification center") or a route (`/$lng/me/notifications`).
Everything else comes from the repo, the two design artifacts and the user.

The work has two phases with a stop between them:

1. **Design** — research the page, add a page of boards to the Redesign artifact, iterate on feedback.
   No code changes in this phase.
2. **Implement** — only after the user approves the design: branch, build, translate, test, check in the
   browser, document, commit, open the PR.

The user steers the design visually, so the most valuable thing in phase 1 is getting good boards in
front of them quickly and then reacting to their comments; the most valuable thing in phase 2 is that
the code matches the approved boards exactly and passes the repo's strict checks.

## Sources of truth

- Redesign artifact (screens): https://claude.ai/artifact/QRhqGsVofXjs5c86d11mrV — a "Design (canvas)"
  artifact. Its own type instructions (returned by the Artifact tool's `read`) define the file format and
  publishing rules; follow them. Board conventions for this project are in
  `references/board-conventions.md` — read it before writing the first board.
- Design system (tokens, component cards): https://claude.ai/artifact/LQaEJcAwBEbWWsynUxHcc1. The canvas
  already has it installed at `project/ds/aurahistoria/tokens.css`; boards link that file.
- Repo rules: `AGENTS.md`, `docs/design-guidelines.md` (read both first), and on demand
  `docs/hydration-guidelines.md`, `docs/architecture-guidelines.md`, `docs/product-context.md`.

## Phase 1 — Design

### 0. Check the request against the repo

Before designing anything, find out whether the page has been through this already: look for a canvas
page or boards named after it in `project/canvas.json`, a section for it in
`docs/design-guidelines.md`, and a merged redesign PR (`gh pr list --state merged --search "<page>"`).
If it was redesigned, tell the user what exists and ask what they want — a second pass, a fix of
mismatches between boards and code, or a change to one part. Do the same when an issue number the user
gives doesn't match the page (`gh issue view <n>`). A minute spent here saves a redesign nobody asked
for.

### 1. Inventory the page

Find the route file(s) in `src/routes/`, the page component and its feature folder, every subpage,
dialog and wizard it opens, its states (loading, empty, error, quota/plan limits, pagination), the
translation keys it uses (English values) and the DTO fields that actually exist. Delegate this to an
Explore subagent with a "very thorough" brief when the feature spans many files — you only need the
inventory, not the file dumps. Note which data does **not** exist (e.g. a count the API never returns):
the design must not show it, or must mark it as needing an API change.

### 2. Study the canvas

Read `project/canvas.json` and two or three boards of an already-redesigned page with a similar shape
(Watchlist for grids, Account for forms and sections, Search for filters and result cards, Listing for
detail views). Reuse their header pattern, components (`AppNavBar`, `MobileHeader`, `SearchResultCard`
via `dc-import`), spacing, state panels and copy tone instead of inventing new ones. Read the boards'
`.dc.html` source, not screenshots.

### 3. Build the boards

First decide **where** the boards go. The canvas is organised by feature area, not by request, so
people find related screens together:

- If the feature already has a canvas page, add to it — new rows below the existing ones, with their
  own row titles. When the boards replace earlier ones, keep the old boards until the user approves
  the new design, then ask before removing them.
- If the page belongs semantically with an existing canvas page, add it there: a partner screen goes
  on the partner page, an account-related screen on Account, a dialog or wizard on the page of the
  screen that opens it, a component several screens share on Shared (as `docs/design-guidelines.md`
  says).
- Only when nothing fits, add a new canvas page (a `pages` entry), and say in your summary why none of
  the existing ones fit.

Read the chosen page's existing rows in `canvas.json` and place the new rows below them without
overlapping any board or note. Then build, on that page:

- the page on desktop (1440, `expand: "fill"`) and on mobile (390) — the mobile board can wrap the
  desktop file through `dc-import` with a `mobile` prop when the layout only reflows;
- one board per reusable part (a card, a row, a dialog, a wizard) with tweak props for its variants;
- subpages (detail pages, wizards) on their own rows;
- one States board: loading skeletons, empty, error with retry, no-results, plan/quota limits, menus,
  confirm dialogs, validation, toasts — everything the inventory found.

Write the index first with all new entries, then publish **one board per call** so the user sees them
appear and a mistake costs one file. Don't verify by rendering unless the user asks; the type
instructions say so and it saves a lot of time.

Copy rules: reuse existing strings where they fit; rewrite headings in the house pattern
("My *watchlist.*", closing phrase in `<em>`); never invent figures, matches, counts or prices beyond
clearly fake sample data; mark missing facts as `[PLACEHOLDER]`.

### 4. Present and iterate

Give the user the link and a short summary: what each board shows, and — most important — **where the
design departs from today's implementation** (removed controls, new controls, new strings, behaviour
changes), because each of those becomes code work. Then iterate:

- **Comments on the artifact** arrive as artifact-comment turns. Re-read the files the comment touches
  (others may have edited them — a higher `edits` count in the view context means re-read), make the
  change, reply in the thread with what changed, and resolve it.
- **"Give me alternatives"**: put each alternative on its own board in a new row titled
  "<part> — alternatives A, B & C", make them genuinely different (layout, hierarchy, how state is
  shown), not tweaks of the current board. When the user picks one, rebuild the real boards from it,
  update the States board to match, and only delete the alternative boards when the user says so.
- Keep the design and the boards consistent: a change to a shared part means updating every board
  that shows it.

Do not start phase 2 until the user says so.

## Phase 2 — Implement

### 5. Branch

Ask for the issue number if the user hasn't given it, and check it with `gh issue view <n>`.

Then decide the base branch. During the v3 rollout redesign PRs targeted an integration branch
(`feature/#1115-redesign-v3`); it has since been merged and deleted, and work now goes to `develop`.
Integration branches come and go, so check rather than assume: look at where the latest redesign PRs
went (`gh pr list --state all --limit 10 --json number,title,baseRefName`) and whether that branch
still exists on origin (`git ls-remote --heads origin <branch>`). Use it if it does; otherwise use
`develop`. Branch from the **freshly fetched remote** base, never from a local copy, which may be stale
and silently roll back merged work:

```bash
git fetch origin <base>
git switch -c 'feature/#<issue>-<slug>' 'origin/<base>' --no-track
```

If the working tree has someone else's uncommitted work, stop and ask — don't carry it over.

### 6. Build from the boards

- Rewrite the page and its components in its feature folder to match the boards exactly (spacing,
  type sizes, tokens). Put shared class strings in `src/features/<feature>/lib/<feature>Styles.ts`,
  like `accountStyles.ts` and `searchFilterStyles.ts`.
- Reuse what earlier redesigns built before writing anything new: `ResultStatePanel`,
  `RESULT_SECONDARY_BUTTON_CLASS`, `SearchResultCard(Skeleton)` and `SearchHiddenMatchCard`
  (`search/products/components/results/`), `ListLoaderRow`, `ToggleBellIcon`, `HEADLINE_COMPONENTS`
  for `<em>` headings, `useDescribeActiveFilter` / `useFilterFormatters` for filter values,
  `data-theme="dark"` sections for ink bands, the page column
  `max-w-[calc(var(--container-content)+2*var(--page-gutter))] px-(--page-gutter)`.
- Keep behaviour and API calls unless the design changes them; a design that adds a control (e.g. a
  pause toggle on a detail page) needs the matching mutation wired up.
- Server-rendered markup must be deterministic: no `new Date()`, browser APIs or client locale during
  render. Relative times ("3 days ago") are computed after mount with a reserved line height — reviewers
  flag `suppressHydrationWarning` workarounds.
- Changing a shared primitive (`src/components/ui`) is allowed when the design needs it; keep its API
  and behaviour and run its tests.

### 7. Translations

Every user-facing string goes into `de`, `en`, `es`, `fr`, `it`. `src/i18n/translations.test.ts`
enforces two things that bite:

- **No orphan keys** — delete keys the page no longer uses.
- **A changed value must change in every locale** — if, say, only the English casing changes, add a
  new key (`createCta`) and delete the old one instead of editing the value.

`node .claude/skills/redesign-page/scripts/merge-translations.mjs <changes.json>` merges a JSON file
of per-locale additions and deletions into the five locale files with the repo's 2-space formatting
(the format is documented at the top of the script; keep the JSON in the scratchpad, not the repo). German product language uses "Suchauftrag",
"Merkliste" etc. — read neighbouring German keys and keep the wording natural (the user will catch
literal translations like "Beobachtet gerade").

### 8. Tests

Old tests will fail on the new markup. Rewriting them is a good job for a general-purpose subagent:
give it the list of changed components with what each now renders, tell it not to touch source files,
and to report suspected source bugs instead — then fix the real ones yourself. Add regression tests for
anything you fix afterwards.

### 9. Remove what the redesign made unused

Run `node .claude/skills/redesign-page/scripts/find-newly-unused.mjs origin/<base>` — it lists source
files that were reachable from the app's routes on the base branch but no longer are. Delete them with their
tests and any `vi.mock` of them, rerun until it prints nothing, then check exported helpers the deleted
files used (an exported function with no importers left goes too) and the orphan-key test. Pre-existing
dead code that this change didn't cause is out of scope.

### 10. Check

The repo uses pnpm only, so run tools through `pnpm exec`, and run what CI runs (check
`.github/workflows/` if unsure):

```bash
pnpm exec biome check --write <changed files>
pnpm exec tsc --noEmit
pnpm check
pnpm exec vitest run      # full suite once at the end
pnpm build                # routes, SSR and i18n changed
```

Then look at it in the browser pane at 1440×1000 and the mobile preset. Authenticated pages need the
user to sign in in the pane — ask them; never type credentials. Things learned the hard way:

- A screenshot taken right after a click can catch a dialog mid-animation; take another before
  calling something broken.
- The user's long-running dev server on :3000 can start throwing "Invalid hook call" from stale
  optimized deps. Before chasing it, start a second server on another port with a temporary
  `.claude/launch.json` entry (`pnpm exec vite dev --port 3001`; localhost cookies are shared), confirm
  the page is clean there, then stop it and remove the entry.
- Check states the test account can't show (empty lists, locked plans) through unit tests and say so.

Fix what you find in the code *and* on the boards so they stay in sync.

### 11. Document, commit, PR

- `docs/design-guidelines.md`: in the "Design sync" list, add the new boards to the description of the
  canvas page they went on (or add the page if you created one), and add or update the section
  describing the app page, like the Watchlist and Account sections.
- Commit everything except `.claude/` local config. The message lists the boards added or changed (the
  design guidelines ask for this).
- Open the PR against the base branch you chose in step 5. Follow the body of an earlier redesign PR
  (`gh pr view 1161`): "Closes #N", what changed per page section, shared changes, strings, design
  boards, validation.
- Review comments and CI events then arrive through Auto-fix: fix, push, reply in the thread, resolve.
