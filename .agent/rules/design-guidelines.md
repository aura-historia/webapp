---
trigger: model_decision
description: Apply this rule when working with UI or design changes
---

# Design System Document: The Antique Index

## 1. Overview & Creative North Star: "The Omniscient Archivist"
This design system rejects the typical, sterile "data-scraper" aesthetic in favor of a premium search experience. Our North Star is **The Omniscient Archivist**. The UI should feel like a high-end intelligence terminal or an elite private collector's tracking dossier—quiet, authoritative, and deeply tactile. We index the web's antique merchants and marketplaces so our users do not have to. 

We break the "dashboard" look by moving away from rigid, boxed grids. Instead, we embrace **intentional asymmetry** and **editorial pacing** for our search results and watchlists. This means using generous white space (the "breathing room" of a gallery) and overlapping elements where a serif headline might partially bleed over a subtle tonal container, creating a sense of physical layering while monitoring global inventory.

## 2. Colors & Tonal Architecture
The palette grounds our massive data sets in history: Deep Mahogany (`primary`), Warm Parchment (`background`), and Gold (`tertiary`).

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning search results. Boundaries must be defined through **Background Color Shifts**. To separate a tracked item block, place a `surface-container-low` section against the main `surface` background. This creates a "soft edge" that feels integrated rather than partitioned.

### Surface Hierarchy & Nesting
Treat the indexing UI as a series of stacked, fine papers.
* Use `surface-container-lowest` (#ffffff) for the most prominent "hero" search results to make them pop against the parchment base.
* Use `surface-container-high` (#ebe8de) for utility areas like filter sidebars or scraping-status indicators to "sink" them visually.
* **The Glass & Gradient Rule:** For floating notifications, "Price Drop" alerts, or watchlist updates, use Glassmorphism. Apply `surface` with 80% opacity and a `20px` backdrop-blur. This allows the mahogany and parchment tones to bleed through, softening the data-heavy interface.

### Signature Textures
Main search CTAs and Tracker Hero backgrounds should use a subtle linear gradient: `primary` (#42120f) to `primary-container` (#5d2722). This adds "soul" and depth to a highly technical indexing engine, mimicking the natural patina of aged wood or leather.

## 3. Typography: The Editorial Voice
We pair the intellectual rigor of `newsreader` with the modern clarity of `manrope` to handle dense scraped data elegantly.

* **Display & Headlines (Newsreader):** Use `display-lg` (3.5rem) for high-impact search portals and watchlist headers. Headlines should use "Optical Sizing" where available to ensure the serifs remain crisp.
* **Body & Titles (Manrope):** All functional data—scraped item descriptions, merchant URLs, indexing dates, and price histories—must use `manrope`. This ensures that while the brand feels antique, the utility remains razor-sharp and legible for our demographic scanning through hundreds of search results.
* **Hierarchy Note:** Use `tertiary` (Gold) sparingly for `label-md` or `title-sm` to highlight "Tracked," "Price Changed," or "Rare Keyword Match" statuses.

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to simulate height; we use light and tone to organize search layers.

* **The Layering Principle:** Place a `surface-container-lowest` tracked-item card on a `surface-container-low` background. The shift from #ffffff to #f7f4e9 provides all the "lift" required.
* **Ambient Shadows:** If a floating element (like a filter modal or an alert setting) requires a shadow, it must be an **Ambient Glow**: `Color: #1c1c16 (on-surface)`, `Opacity: 6%`, `Blur: 40px`, `Y: 12px`. It should feel like a soft shadow cast on a library table, not a digital drop-shadow.
* **The "Ghost Border" Fallback:** For search input fields or secondary filter buttons, use a "Ghost Border": `outline-variant` (#d8c1bf) at **20% opacity**. This provides a hint of structure without interrupting the editorial flow of the feed.

## 5. Components & Craftsmanship

### Buttons
* **Primary:** A solid Mahogany (`primary`) block with white text (`on-primary`). Use `DEFAULT` (0.25rem) roundedness to keep the silhouette sharp for core actions like "Save to Watchlist" or "Search".
* **Secondary:** No background. Use a `Ghost Border` (outline-variant at 20%) and `primary` text for secondary actions like "Refine Search".
* **Tertiary:** Text-only in `primary`, with an underline that appears on hover, styled like a scholarly footnote for actions like "View Scrape History".

### Cards & Lists
* **The Divider Ban:** Never use horizontal lines to separate indexed items in a feed. Use the spacing scale—specifically `8` (2.75rem)—to create rhythmic separation, or alternate background tones between `surface` and `surface-container-low`.
* **High-End Detailing:** Use `tertiary-fixed` (#ffdea5) for small "Notification" dots or "New Discovery" pips when a watched item updates.

### Input Fields
* Instead of a full box for the omni-search bar or filter inputs, use a "Bottom-Line Only" approach or a very faint `surface-container-highest` background. Labels should use `manrope` in `label-md` to maintain a professional, indexed look.

### Bespoke Component: The "Source Tag"
* A custom `Chip` variant to denote which marketplace or shop an item was indexed from. Use `secondary-container` (#efdfd8) with `on-secondary-container` (#6d625d) text. These should have `none` (0px) roundedness to look like clipped archival labels attached to raw data.

## 6. Do’s and Don’ts

### Do:
* **Do** lean into asymmetry. Align a search query headline to the left but offset the scraped metadata to the right by `spacing-10` to create an editorial layout out of raw information.
* **Do** use `primary` (#42120f) for all interactive text and links. It carries more weight and authority than standard black.
* **Do** ensure all touch targets meet the 44px minimum, even if the "Ghost Border" makes filter tags look smaller.

### Don’t:
* **Don't** use pure black (#000000). Use `on-surface` (#1c1c16) to keep the contrast "warm" when rendering heavy text results.
* **Don't** use standard "Success Green" or "Warning Orange" for index status alerts if they clash. Use `tertiary` (Gold) for positive highlights and `error` (#ba1a1a) only for critical scraping failures or dead links.
* **Don't** use rapid transitions. All hover states, search loads, and modal entries should use a `300ms ease-out` to mimic a deliberate, sophisticated tracking system.