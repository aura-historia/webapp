# Design Guidelines

## Design identity

The look is **Catalogue × Terminal**: an auction catalogue's serif, parchment and oxblood, crossed with a data terminal's mono labels, hairlines and exact numbers. Calm, legible, never salesy. The source of truth is the Aura Historia Design System (tokens) and the Aura Historia Redesign (screens).

Core signals:

- Two grounds: parchment (light) for catalogue sections; ink (dark) for the hero, dealer section and footer. `oxblood` is the brand, `brass` the accent.
- Typography: `Newsreader` (`font-serif`) for headlines, object titles, numbers and the wordmark; `Geist` (`font-sans`) for running copy and UI; `Geist Mono` (`font-mono`) for uppercase labels, eyebrows and tags.
- Hairlines, not shadows: cards carry `shadow-ring`; drop shadows only for floating elements (`shadow-search`, `shadow-menu`).
- Calm layouts with generous whitespace, strong hierarchy, and restrained motion.
- Professional UI behavior: predictable, accessible, responsive, and fast.

## Design sync

The design should always match the implementation. Two Claude artifacts are the source of truth:

- Aura Historia Redesign (screens, one board per component or state): https://claude.ai/artifact/QRhqGsVofXjs5c86d11mrV
- Aura Historia Design System (tokens, component cards): https://claude.ai/artifact/LQaEJcAwBEbWWsynUxHcc1

The Redesign file is split into pages: **Shared** (headers, app bars, menus, footer, locale pickers: boards reused across screens), **Landing Page** (the landing page on desktop and mobile, and a hero stat strip board for the loaded, singular and loading states), **Search** (product search results on desktop and mobile, filter panel, result card, filter controls, states, save-search dialog), **Listing Detail** (product listing detail on desktop and mobile, loading skeleton, summary states with status badges and optional price estimates, optional description, share menu, gallery states, lightbox, price history, history and carousel states), **Account** (profile page on desktop and mobile, one board each for the personal data, change password, subscription and delete account sections, and a states board for loading, validation, pending buttons, preference pickers, toasts and the delete dialog; below them the sign-in and registration flow: the login page on desktop and mobile, one board each for the sign-in, registration, verify email, complete profile and reset password forms, and an "Auth · States" board for errors, validation, pending and federated sign-in, code resend and toasts), **Watchlist** (watchlist page on desktop and mobile, built from the search result card, and a states board for loading, empty, error, loading more and list end), **Legal** (the imprint, privacy policy and terms on desktop and mobile, and an elements board for unnumbered headings, subsections, the model form, links, contents rows and the status line; cookie settings on desktop and mobile with a switch-states board), **About** (the about page on desktop and mobile and the team member card), **Search Filters** (the search filter list on desktop and mobile, the filter card in its watching and resting forms, the detail page with criteria and matches on desktop and mobile, the create/edit/duplicate wizard on desktop and mobile, and a states board for loading, empty, error, no name match, quota, the actions menu, the delete dialog, match feedback, wizard validation, preview states and toasts), **Notifications** (the notifications page on desktop and mobile, the notification row and its variants, and a states board for loading, empty, error, list end, pending and the delete-all dialog; the bell popover and its states sit on Shared), **Partner Program** (the partner program page on desktop and mobile; the custom API integration page on desktop and mobile with a states board for provider access, the token action, the unselected cURL example and the reference loading frame) and **E-Mail**. Put a new board on the page of the screen it belongs to; a component used by several screens goes on Shared.

For every component you are asked to build or change:

1. Read its board in the Redesign file and its card in the design system before writing code.
2. Board missing (a state, a variant, a picker, an empty or error state): add a board to the Redesign file first, built only from design-system tokens and components, then implement it.
3. Change request: update the board first, then the code, in the same task, so both match at the end.
4. A change to tokens, type styles or a shared component is a design-system change: update the design system, then `src/styles.css` or the component, together.
5. Only touch boards for the components in scope; do not redesign or "tidy" other boards or components.
6. Mention the boards you added or changed in the commit or PR description.

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
- The landing header lies transparently over the ink hero (`tone="overlay"`); it is sticky on phones and scrolls away with the hero from 1024px.

## Landing page

- The landing page follows the Redesign's chapters: hero (headline, lead, search, stat strip), Latest acquisitions, II The opportunity, III The platform, IV How it works, V Pricing, VI For dealers, VII Questions, and the oxblood newsletter band. Chapter headings use `SectionHeading` (mono Roman-numeral eyebrow, serif headline whose closing phrase is `<em>`); grounds come from `LandingSection` and alternate parchment and ink.
- Latest acquisitions and any other live inventory load after mount (see `docs/landing-page-prerendering-guidelines.md`). Use real listings only; the design system's sample photos are stand-ins for mockups and never marketing imagery.
- Figures need a cited source. Do not ship bracketed placeholders; leave the element out until the figure is confirmed.
- The hero stat strip (`HeroStats`) shows sources indexed, live objects, countries and languages from the public overview API, loaded after mount with a skeleton of the same height. Figures are exact and grouped in the page language; live objects shorten from a million ("1.8M"). Labels are pluralised by the figure ("1 Country", "18 Countries"). Phones show a 2 × 2 grid with the shorter "Languages"; from 640px one ruled row. A failed read leaves the strip out rather than showing placeholders or zeros.
- Pricing is designed and built but stays hidden on the landing page until paid plans launch.
- Pricing (`PricingSection`) shows the fixed Stripe catalogue amounts in `PricingSection.data.ts`, one per supported currency for both paid plans (a missing currency is a type error, not a "coming soon" state). Yearly shows the annual charge divided by twelve, at the currency's charge precision (none for JPY and KRW), with the monthly price struck through. When any price runs to nine characters or more ("1 399 TWD", "4.158,33 HUF"), all three step down a size together so they stay inside the cards. Feature rows state the backend entitlements: active search alerts and watchlist objects, monthly match notifications, permitted alert criteria, and matching evidence (title and description; text and up to one image on Pro; text and up to four images plus detailed search instructions for AI-Agent matching on Ultimate). They make no delivery-time or priority promises. The platform chapter's first card presents those search instructions as an Ultimate search-alert feature, not as an autonomous agent, and the search-alerts card makes no "be first" timing claim.

## Product search

- The search page follows the Redesign's Search page: from 1024px a sticky 280px filter sidebar beside the results; below it, a left drawer (`SearchFilterDrawer`) with the same `SearchFilters` in its `sheet` variant and a footer to reset or close. Phones add `MobileAppBar` (search field and a filter button with the active-filter count) under the header.
- Filters apply as they change, through the URL. Applied filters also show as removable chips (`ActiveFilterChips`, from `lib/activeFilters.ts`), so they stay visible while the panel is closed.
- Filter groups use `FilterCard`: a mono heading with a short value summary, a reset button only while the group is active, and a lock for plan-restricted groups in the saved-search wizard. The same filter components serve the search page and the wizard.
- Results use `SearchResultCard` (square photo, provider in mono, serif title, availability dot, price, Details and Go to provider) in two columns, three from 1180px. Empty, error, short-query, loading and end-of-list states follow the board "Search · States".
- `cn` knows the type-style utilities (`text-tag`, `text-meta`, …) as font sizes, so they combine safely with text colours.

## Listing detail

- The listing page follows the Redesign's Listing Detail page. From 1024px the gallery (a 4:5 frame showing each image uncropped on the image ground, counter chip, Full screen, six square thumbnails with a "+N" tile) sits beside the summary column; below that they stack, and a sticky `ProductActionBar` keeps the price, the watchlist toggle and Go to provider in reach.
- The summary column holds the status pill (`ListingStatusPill`: ink dot offered, brass reserved, hollow ended, dashed not reported), the provider eyebrow, the serif title, the saved-search match, the price, the optional estimate and the optional description. It does not stick while scrolling.
- Estimates come from `pricing.display` (`formatPriceEstimate`): a ruled "Estimate" row under a price, the large figure when there is no price, "From"/"Up to" with one end only. The description clamps behind Show more by its length, not a measurement, so server and client render alike; it is hidden when absent.
- Price history is a raised panel with a stepped oxblood line; History uses the shared `Timeline`. Similar items and More listings from this provider reuse `SearchResultCard`; the provider rail sits on a raised band with a progress counter. Their states follow the board "Listing · Price history, history & carousel states".

## Account

- The account page follows the Redesign's Account page: a header (mono eyebrow, serif "My *account.*", the signed-in email), a jump nav to the four sections (pills on phones, a ruled row from 640px), then one `AccountSection` per section with its title and short description beside a raised card from 1024px, stacked above it below.
- Personal data groups Profile (read-only email, first and last name) and Preferences (language, currency, units, the sensitive-content checkbox) behind one Save changes button. Preference fields open the shared `PreferencePicker` through its `triggerContent`, so they match the footer's locale pickers.
- Change password shows a live policy checklist (oxblood check when met) under the new and confirm fields. Delete account uses an oxblood outline button and an oxblood confirm in the dialog; the dialog locks while the request runs.
- Shared field, button and card classes live in `account-management/lib/accountStyles.ts`. Loading, validation, pending, picker and dialog states follow the board "Account · States".

## Sign in and registration

- The login route follows the Redesign's "Auth · …" boards on the Account page: from 1024px the promise (eyebrow, serif headline, lead) and a 440px form column share the parchment ground in two equal halves divided by a centred hairline; below that a short ink band sits above the sign-in and registration forms only. The app bar shows just the wordmark there.
- Every step opens with `AuthFormHeader` (mono eyebrow, serif headline whose closing phrase is `<em>`, lead). Registration, verify email and complete profile carry `RegistrationSteps` (01 Account · 02 Verify · 03 Profile).
- Fields sit on the parchment ground, so they and inset panels use `surface-raised` (`authentication/lib/authStyles.ts`). Passwords use `PasswordInput` (show/hide toggle); new passwords show the shared `PasswordPolicyChecklist`; codes use `CodeInput` (six boxes, serif lining figures); checkboxes use `CheckboxPanel`; form-level errors use `AuthFormAlert`. The profile step reuses the account page's `PreferenceField`.
- The signed-out landing header and mobile menu lead with "Create account", which opens registration (`/login?mode=sign-up`). States follow the board "Auth · States".

## Watchlist

- The watchlist page follows the Redesign's Watchlist page: a ruled header (serif "My *watchlist.*" and a short lead, no eyebrow and no total, since the watchlist API returns none), then `SearchResultCard`s in two columns, three from 768px and four from 1180px. Each card keeps its bookmark and alert bell, so removing an item or toggling alerts works in place.
- Loading, empty (with a Search objects link while search is enabled), error (with Try again) and list-end states follow the board "Watchlist · States" and reuse the search page's `ResultStatePanel` and `SearchResultCardSkeleton` and the shared `ListLoaderRow`.

## Search filters

- The search filter list follows the Redesign's Search Filters page. A parchment header holds the serif "My *search filters.*", the lead, a name search, the Create button (disabled at the plan quota) and a quota meter for plans with a limit. Active filters sit on a full-width ink "Watching *now.*" band with a pulsing signal-live dot (`animate-live-pulse`, still under reduced motion), as `SearchFilterCard`s in two columns from 1024px. Paused and plan-locked filters drop to a "Resting" list below, as `SearchFilterRestingRow`s, so pausing a filter moves it down and resuming moves it back up.
- A watching card shows the LIVE label, the serif name, the search terms in brass-light italics, the optional AI description, a mono criteria line, the email-alert toggle, "Matches & details" and the ⋮ menu (Edit, Duplicate, Delete; Duplicate is blocked at the quota). A resting row says why it is not watching and offers Resume, or "Upgrade to resume" when the plan locks it.
- The detail page has a parchment header (back link, eyebrow and state, serif name, added and updated dates, the alert toggle, Pause or Resume, Edit and Delete), "Your filter criteria" as ruled rows in a raised card on a full-width ink band, then "Found *products.*" with `SearchResultCard`s and a ruled relevance row under each match (`MatchFeedbackButtons`). The empty matches state opens the edit wizard.
- Criteria are named once, by `useSearchFilterCriteria`, for the card, the detail page and the wizard summary. Deleting goes through `DeleteSearchFilterDialog`, which locks while the request runs.
- The create, edit and duplicate wizard keeps its five steps: a parchment stepper column from 1024px, a segmented progress bar with "Next: …" below, a "Pro & Ultimate only" notice on restricted steps for Free users, and a confirm step with Change links and the listing preview. Shared classes live in `saved-searches/lib/searchFilterStyles.ts`. States follow the board "Search filters · States".

## Notifications

- The header bell (`NotificationBell`) follows the board "Nav · Notification popover": an oxblood count on desktop bars ("9+" from ten), a brass dot on phone bars, and a sunken square while open. Its 400px parchment popover holds a serif title with an "N new" pill, icon-only Mark all as read and Delete all, the five newest notifications and a footer to the page with the total once every page is loaded. Delete all asks first in an inset panel under the header. Loading, empty and error states follow "Nav · Notification popover — states".
- The notifications page follows the Redesign's Notifications page: a ruled header (serif "My *notifications.*", the lead, Mark all as read while anything is unread, Delete all in oxblood outline), from 1024px an overview column with the unread and total counts and links to the watchlist and search filters, then the notifications grouped into Today, This week and Earlier. From 640px each group is one raised card of `NotificationRow`s; on phones every notification is its own card. Delete all opens `DeleteAllNotificationsDialog`, which locks while the request runs.
- Both rows show a mono type label (on the page with its source, "Price change · Watchlist"), the serif title and the dealer, then the change from `NotificationChange`: a struck old price and the new one (on the page with a "−8%" pill when both are amounts in one currency), status to status with the listing status dots, the matched filter in italics (with All matches on the page), or the partner decision as a pill. `NotificationThumbnail` shows the photo, a shield while sensitive content is hidden, a hatched placeholder, or for partner applications the dealer logo or initials on oxblood.
- Unread rows carry an oxblood dot, an oxblood type label and a weight-500 title; on the page they also get a "New" pill and the bright raised ground while read rows drop to parchment. In the popover, row actions appear on hover or focus and stay visible on touch screens. Totals show only once every page is loaded, since the API returns none. Grouping by day reads the clock, which is safe because notifications load on the client only.

## Legal pages

- Imprint, privacy policy and terms share `LegalMarkdownPage` and follow the Redesign's Legal page: a ruled header (mono "Legal" eyebrow, serif title, the document's opening paragraph as the lead), then the document in a 720px measure. Only the appearance is designed; the text comes unchanged from the Markdown files (see `docs/legal-content-guidelines.md`).
- Section headings (`##`) feed a contents list: a sticky 240px column from 1024px, a closed disclosure above the document below it. A leading section number is set apart in brass-ink mono ("01", "7.1") and gives the heading its anchor (`section-1`, `section-7-1`); unnumbered headings are anchored by their slug.
- Quoted blocks, such as the model withdrawal form, sit in a raised panel with a hairline ring. The closing italic paragraph is the status date, set as an uppercase mono line.
- Cookie settings (`ConsentSettingsPage`) share the legal header, then one raised card with a row per optional purpose: label, description and `ConsentToggle`, the design system's Toggle (34 × 20 pill, oxblood when on, 44px hit area). Each switch saves at once and confirms with the shared success toast; there is no save button.

## About page

- The about page follows the Redesign's About page and reuses the landing page's `LandingSection` and `SectionHeading`: an ink hero (mono eyebrow in brass-light, serif headline whose italic closing phrase is brass-light, lead), then I Why we exist (an editorial split on parchment), II How we work (the principles on a raised band, oxblood Roman numerals over ink-ruled columns, as in How it works) and III Who we are (team cards on parchment).
- Team cards are raised with `shadow-ring`: a portrait or initials on an oxblood disc, serif name, mono position, bio, and hairline-ruled pill links to email and LinkedIn. Two columns from 768px, three from 1024px.

## Partner program

- The partner program page follows the Redesign's Partner Program page and reuses the landing page's `LandingSection`, `SectionHeading` and `FaqItem`: an ink hero (eyebrow, serif headline with a brass-light italic close, lead, Become a partner and See how it works, a sample listing card with the Partner shop badge and a ruled row of four partner terms), then I Why join (six numbered reasons under ink rules), II How it works (three Roman-numeral steps on the raised band), III Connect (WordPress and Shopify cards beside the taller custom API card with the create example, on ink), IV What stays yours (a ruled ledger), V Questions and the oxblood apply band.
- The sample card uses the hero painting from the asset host, not the design system's stand-in photo. Figures stay out until confirmed: the old partner statistics and the "15+ countries" claim are gone; the terms row states only commitments the FAQ already makes.
- The custom API integration page shares the look: an ink hero with a breadcrumb back to the program and the typical batch flow as a terminal panel; I How batches work beside the raised first-sync checklist; II Set-up guide as four ruled rows (numeral, copy with a "What to check" note, and the step's control: provider picker, token summary and button, the cURL example with Copy, the batch outcomes); III Reference with the contract topics as ruled entries carrying a mono method tag, then the embedded Scalar reference in a raised frame with a same-size skeleton while it loads. The provider picker shows the first page of granted providers; while more exist, a line under the options says the list is not complete with an outline "Show more providers" button (spinner while loading, an alert line and Try again if the page fails). States follow the board "Partner program · Custom API integration — states".
- The partner portfolio and the OAuth consent source selector have no Redesign boards yet. They share `OwnListingSourcesMore`, the same incomplete-list line and outline button in their current style.

## Layout and responsive behavior

- Design mobile-first and test responsive breakpoints mentally when editing JSX/class names.
- Avoid layout shifts from late-loading client-only values. Prefer SSR-safe loader/context data when possible.
- Ensure focus states, keyboard paths, aria labels, and semantic elements are preserved.
- Prefer clear empty/loading/error states over blank areas.
- Use component-matching skeletons for loading states

## Motion and imagery

- Motion should feel premium and purposeful, not flashy.
- Respect reduced-motion expectations where interactions become substantial.
- Every notification-alert toggle uses `ToggleBellIcon` (`src/components/common`): a decaying swing as alerts turn on, a small settle as they turn off, never on first render, and off under reduced motion.
- Every infinite list ends with the shared `ListLoaderRow` (`src/components/common`): a hairline row with a spinner (and an optional mono progress counter) while the next page loads, then an oxblood check and the all-loaded message. The check pops in and its tick draws 500 ms after the row scrolls into view, once per mount, so readers actually see it; under reduced motion it shows at once.
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
