# Design Guidelines

## Design identity

The look is **Catalogue × Terminal**: an auction catalogue's serif, parchment and oxblood, crossed with a data terminal's mono labels, hairlines and exact numbers. Calm, legible, never salesy. The source of truth is the Aura Historia Design System (tokens) and the Aura Historia Redesign (screens).

Core signals:

- Two grounds: parchment (light) for catalogue sections; ink (dark) for the hero, dealer section and footer. `oxblood` is the brand, `brass` the accent.
- Typography: `Newsreader` (`font-serif`) for headlines, object titles, numbers and the wordmark; `Geist` (`font-sans`) for running copy and UI; `Geist Mono` (`font-mono`) for uppercase labels, eyebrows and tags.
- Hairlines, not shadows: cards carry `shadow-ring`; drop shadows only for floating elements (`shadow-search`, `shadow-menu`).
- Calm layouts with generous whitespace, strong hierarchy, and restrained motion.
- Professional UI behavior: predictable, accessible, responsive, and fast.

## Tokens and styling

Use the token system in `src/styles.css`, which mirrors the design system's `tokens.css`:

- Colours: `surface`, `surface-raised`, `surface-sunken`, `surface-bar`, `image-ground`, `ink`, `ink-secondary`, `ink-muted`, `ink-placeholder`, `oxblood`, `on-oxblood*`, `brass`, `brass-ink`, `brass-light`, `sand`, `signal-live`, `line`, `line-subtle`, `line-strong`, `chip-on-image` (e.g. `bg-surface-raised`, `text-ink-muted`, `border-line`).
- On parchment, brass is a fill, never text; use `brass-ink` for brass-coloured text. On ink, oxblood is only a fill carrying `on-oxblood` text.
- Type styles: `text-display-hero`, `text-display-section`, `text-display-figure`, `text-display-rail`, `text-title-lg|md|sm`, `text-stat`, `text-question`, `text-object-title(-sm)`, `text-wordmark`, `text-lead`, `text-body(-lg|-sm)`, `text-meta`, `text-button`, `text-price`, `text-eyebrow`, `text-kicker`, `text-label`, `text-tag`. Each sets size, line height, weight and tracking; pair it with `font-serif`, `font-sans` or `font-mono`. Display sizes are fluid.
- Radius grows with the object: `rounded-xs|sm|thumb|md|field|lg|panel|figure|card|pill`.
- Spacing and layout: `--space-*` (design spacing), `max-w-content` (1280px), `--page-gutter`, `--section-padding`.
- Dark ground: wrap a section in `data-theme="dark"` (and `data-theme="light"` to return); all tokens and utilities below it switch. `.dark` maps to the same values.
- Legacy shadcn tokens (`bg-background`, `bg-card`, `bg-surface-container`, `text-primary`, `text-muted-foreground`, `border-border`, …) remain as aliases onto the new palette for existing components. Prefer the design-system tokens in new or redesigned components.
- Fonts are self-hosted via Fontsource and imported in `src/styles.css`; the latin Geist and Newsreader (upright and italic) files are preloaded in `src/routes/__root.tsx`. Keep those preloads in sync when changing font files.
- Do not hardcode new colors unless an exact asset/brand requirement exists. Add reusable tokens instead.
- Preserve dark-mode compatibility when touching colors or contrast.
- Use `cn` from `@/lib/utils` for class composition when variants/conditionals are needed.
- Keep Tailwind class composition close to existing component style.

## Components

- Reuse `src/components/ui/*` primitives before creating new primitives.
- For new shadcn components, use the latest shadcn CLI pattern from `.cursorrules`: `pnpx shadcn@latest add <component>`.
- Keep shared primitives generic in `src/components/ui`; put product/domain behavior in feature or domain components.
- Use existing typography components in `src/components/typography` for headings where appropriate.
- Maintain named exports unless a local file pattern already uses default exports.

## Navigation

- `Header` in `src/features/app-shell` picks the variant: the landing page gets `SiteHeader` (88px, site sections and calls to action, from 1024px), every other page gets the sticky `AppNavBar` (64px, global search, from 640px), and smaller screens get `MobileHeader` with the full-screen ink `MobileMenu`.
- Site sections live in `navigation/navigationConfig.ts`; account shortcuts live in `AccountMenu` and `MobileMenu`.
- `Footer` sits on the ink ground: wordmark, tagline and contact, then the Discover, Partners and Company groups from `footer/Footer.data.ts` (columns from 768px, one-at-a-time disclosures on phones), social links and `LocaleSwitch` (language, currency, units; shared with `MobileMenu`). Each switch opens a `PreferencePicker`: a parchment popover listbox with a mono title, an oxblood check on the selected row and, for currencies, a search field (design board "Nav · Locale pickers").
- The design lays the landing header transparently over an ink hero (`tone="overlay"`); switch `LANDING_HEADER_TONE` once the hero moves to the ink ground.

## Layout and responsive behavior

- Design mobile-first and test responsive breakpoints mentally when editing JSX/class names.
- Avoid layout shifts from late-loading client-only values. Prefer SSR-safe loader/context data when possible.
- Ensure focus states, keyboard paths, aria labels, and semantic elements are preserved.
- Prefer clear empty/loading/error states over blank areas.
- Use component-matching skeletons for loading states

## Motion and imagery

- Motion should feel premium and purposeful, not flashy.
- Respect reduced-motion expectations where interactions become substantial.
- Decorative images need `alt=""` and `aria-hidden="true"`; informative images need localized alt text.
- Remote image changes should consider performance, dimensions, and cumulative layout shift.

## UI change checklist

Before finishing UI work:

- Does it follow the token palette and typography system?
- Does it reuse existing primitives and variants?
- Does it work in light and dark themes?
- Does it preserve accessibility and keyboard behavior?
- Could it cause hydration or layout-shift issues?
- Are all user-facing strings translated in `de`, `en`, `es`, `fr`, and `it`?
