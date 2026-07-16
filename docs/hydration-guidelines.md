# Hydration Guidelines

Aura Historia uses TanStack Router/Start-style SSR. Hydration bugs are easy to introduce when server-rendered markup differs from the browser's first render.

## Avoid in render paths

Do not read these directly while rendering SSR-visible markup:

- `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `cookieStore`.
- `Date.now()`, `new Date()` for displayed values, `Math.random()`, generated IDs not stabilized by React.
- Browser-only media queries or layout measurements.
- Client-only language, currency, timezone, auth, or consent values when the server has a different initial value.

Use route loaders, server helpers, context, props, or `useEffect` after mount instead.

## Existing SSR-safe inputs

Prefer these existing sources:

- Locale: `getLocale()` in `src/lib/server/i18n.ts`, then `i18n.changeLanguage` in `src/routes/__root.tsx` before load.
- Preferences: `getServerPreferences()` and `UserPreferencesProvider` initial state.
- Timezone: `getServerTimezone()` through route context.
- Auth: `getServerUser()` in root route context and existing auth hooks/guards.
- Data: TanStack Router loaders and TanStack Query SSR integration in `src/router.tsx`.

## Effects

Use effects for browser-only behavior such as scroll listeners, analytics page views, Amplify Hub listeners, and third-party widgets. Keep the initial render deterministic and render the same fallback on server and first client render.

## Common safe patterns

- Render a stable placeholder/skeleton until client-only data is available.
- Initialize state from SSR-provided props/context rather than recomputing from browser storage.
- Gate analytics/tracking initialization behind consent and run it in effects, not render.
- Use `useId` for React-stable IDs instead of custom random IDs.
- When displaying dates/prices/currency/language-sensitive values, use the same locale/currency/timezone inputs on server and client.

## Hydration review checklist

Before finishing work that touches routes, layout, i18n, preferences, auth, time, random IDs, analytics, or browser APIs:

- Can the server render this markup without browser globals?
- Will the browser's first render produce identical text, attributes, and element structure?
- Are locale, currency, timezone, consent, and auth initialized from server-compatible data?
- Are user-specific responses protected from public/shared caching?
- Did you run `pnpm build` if the change is SSR/routing-sensitive?
