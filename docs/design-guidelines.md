# Design Guidelines

## Design identity

Aura Historia should feel like a modern digital cabinet of curiosities: refined, warm, trustworthy, and historically literate. The interface should combine SaaS clarity with a heritage art-market atmosphere.

Core signals:

- Heritage colors: mahogany, parchment, warm taupe, muted gold.
- Elegant typography: `Newsreader Variable` for display headings, `Manrope Variable` for body/UI.
- Calm layouts with generous whitespace, strong hierarchy, and restrained motion.
- Professional UI behavior: predictable, accessible, responsive, and fast.

## Tokens and styling

Use the token system in `src/styles.css`:

- Prefer semantic Tailwind tokens: `bg-background`, `bg-card`, `bg-surface-container`, `text-foreground`, `text-muted-foreground`, `text-primary`, `border-border`, `ring-ring`.
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
