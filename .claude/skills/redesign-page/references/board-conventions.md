# Board conventions in the Aura Historia Redesign canvas

How the existing boards are built, so new ones match. The canvas type's own instructions (from the
Artifact tool's `read`) are the format authority; this file adds the project's conventions and the
mistakes that cost time before.

## Contents

1. Working with the files
2. Board skeleton
3. Canvas layout
4. Visual vocabulary
5. Interactivity and tweaks
6. Gotchas

## 1. Working with the files

- `read` the files you will change (several `paths` in one call). They land in the scratchpad under
  `artifact-files/<artifact-id>/project/…`. New boards can live in their own folder; pass `root` = the
  folder holding `project/`, `file_path` = one file's absolute path, and other files in `files` (a
  source may be an absolute scratchpad path, e.g. the downloaded `canvas.json`).
- Send `project/canvas.json` only when boards, pages or notes change, and re-read it right before
  editing it — the user may have moved boards. Keep every key you didn't change.
- One board per publish. A publish over someone's newer edit is refused and hands you the live
  version; merge onto it.
- Removing boards: drop their `boards` entries, `order` slots and row note from the index and pass the
  files as `null` in `files`. Only when the user asked.

## 2. Board skeleton

Every board starts like this (copy from an existing board rather than retyping):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Aura Historia — <screen name></title>
<script src="./support.js"></script>
<link rel="stylesheet" href="ds/aurahistoria/tokens.css">
</head>
<body>
<x-dc>
<helmet>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&amp;family=Geist:wght@300..700&amp;family=Geist+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
<style>
body{margin:0;background:var(--surface)}
*{box-sizing:border-box}
h1,h2,p{margin:0}
a{color:inherit;text-decoration:none}
button{font:inherit;cursor:pointer;color:inherit}
:focus-visible{outline:2px solid var(--brass);outline-offset:3px}
</style>
</helmet>
<div style="min-height: 100vh; background: var(--surface); color: var(--ink); font-family: var(--font-sans); -webkit-font-smoothing: antialiased">
  <div style="position: sticky; top: 0; z-index: 40">
    <dc-import name="AppNavBar" signed-in="{{ true }}" hint-size="100%,64px"></dc-import>
  </div>
  <main style="max-width: 1376px; margin: 0 auto; padding: 56px clamp(20px, 4vw, 48px) 140px">…</main>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1440,"height":2000}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
```

Mobile boards are 390 wide with
`<div data-theme="light" style="height: 60px; …"><dc-import name="MobileHeader" tone="light" signed-in="{{ true }}" …></dc-import></div>`
as the header and 20px side padding.

## 3. Canvas layout

- Canvas pages are feature areas (Shared, Search, Listing Detail, Account, Watchlist, Legal, About,
  E-Mail, Search Filters, Notifications, Partner Program…), listed in `pages`. Add boards to the page
  that already holds the feature or fits it semantically; create a new `pages` entry
  (`{"id":"search-filters","name":"Search Filters"}`) only when none fits. Every board entry carries
  its page's id in `page`.
- On an existing page, new rows start below the lowest board or note already on it: find the largest
  `y + h` among that page's boards, add 120px, plus 300px for the new row's title note. Check that no
  board or note on the page overlaps the new rectangles.
- Rows: desktop at `x: 0` (w 1440), mobile at `x: 1520` (w 390), part boards from `x: 1990`; 80px
  between boards in a row, 120px between rows plus 300px for the row's title note.
- Each row has a `title1` note at `y = rowY - 300`, `maxW` = the row's width, e.g.
  "Search filters — list page, desktop, mobile & card".
- Board entries: `title` like "Search filters · List page — desktop", `is_interactive: true` when the
  board has working controls, `expand: "fill"` on full desktop pages. Desktop page `h` ≈ its height at
  1440; over-tall beats clipped.

## 4. Visual vocabulary

Catalogue × Terminal: serif headlines, mono uppercase labels, hairlines instead of shadows.

- Grounds: parchment `var(--surface)`; a full-width ink band is a section with `data-theme="dark"` and
  `background: var(--surface)` (tokens switch inside it). Raised cards `var(--surface-raised)` +
  `box-shadow: var(--shadow-ring)`, radius `var(--radius-panel)` (14) or `var(--radius-card)` (18).
- Page header: serif h1 `clamp(40px, 4.6vw, 68px)`, `letter-spacing: -0.02em`, closing phrase in
  `<em>` ("My <em>watchlist.</em>"), 15px lead in `--ink-secondary`, ruled bottom when content follows
  on parchment.
- Section headings: serif 30px; mono labels 10–12px, `letter-spacing: 0.14em`, uppercase,
  `--ink-muted` (eyebrows `--brass-ink`, on ink `--brass-light`).
- Buttons: 44px pills; primary `--ink` fill with `--surface` text; secondary
  `box-shadow: inset 0 0 0 1px var(--line-strong)`; destructive `--oxblood` fill + `--on-oxblood`.
  Touch targets ≥ 44px.
- Fields: `--surface` or `--surface-raised` with `--shadow-field`, radius `--radius-md`, invalid
  `inset 0 0 0 1.5px var(--oxblood)`.
- Small filled tags: `--surface-sunken`, `--radius-sm`, 12–13px.
- Status dots: ink filled = active/available, brass = reserved, hollow = ended/paused, oxblood lock =
  plan-locked. `--signal-live` only on the ink ground, always with a text label.
- States panels (empty/error): centred, 56px round icon (raised ring, or oxblood fill for errors),
  serif 30px headline with `<em>`, 15px copy, one action. Toasts: raised, `--shadow-menu`, 24px round
  icon (oxblood fill = success, oxblood ring = error).
- Skeletons: `--surface-sunken` bars / `--image-ground` images, pulse animation off under reduced
  motion.
- Only tokens that exist: spacing `--space-4/6/8/10/12/14/16/20/22/24/28/36/48/56/64/140`, radii
  `xs sm thumb md field lg panel figure card pill`. Check `tokens.css` before using another name.

## 5. Interactivity and tweaks

- Keep interaction state in `this.state` and pass handlers from `renderVals()`; precompute per-item
  styles there (holes are lookups, never expressions).
- Tweaks (`data-props` with an editor) are for variants and states: `state` enum, `compact`, `mobile`,
  `menuOpen`, `plan`, `step`, `noResting`… They let the user and the States board show one component
  in many states without copying markup.
- A parent that moves items between sections (watching ↔ resting) owns their state and passes an
  `on-toggle` callback to the child via `dc-import`.

## 6. Gotchas

- A `dc-import` prop called `name` selects the component — call it `title` instead.
- Put data in methods (`filters() { return [...] }`), not top-level `const`s outside the class.
- `{{ hole }}` cannot be an expression; compute booleans like `noActive` in `renderVals()`.
- `aria-labelledby` should point at the heading, not a wrapper with extra text.
- Text split by `<em>` is several nodes — fine on boards, but remember it in code tests.
