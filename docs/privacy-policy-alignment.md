# Privacy Policy Alignment

This project must keep product behavior aligned with the privacy policy and European/German privacy expectations, especially GDPR/DSGVO and German TDDDG/ePrivacy rules.

This document is an engineering checklist, not legal advice. If a change introduces a new data category, purpose, processor, tracking mechanism, transfer, retention behavior, or consent flow, flag it for legal/product review and update the privacy materials before release.

## Source of truth in the app

Privacy content lives in:

- `src/features/legal/content/privacy/privacy-de.md`
- `src/features/legal/content/privacy/privacy-en.md`
- `src/features/legal/content/privacy/privacy-es.md`
- `src/features/legal/content/privacy/privacy-fr.md`
- `src/features/legal/content/privacy/privacy-it.md`
- `src/features/legal/content/privacy/privacy-asset-map.ts`

The German text is especially important for German-law alignment. Keep all locale files semantically aligned.

## User-data changes that require a privacy check

Run this checklist when code touches any of the following:

- Account data: email, name, user ID, roles, subscription status, language, currency, measurement units, content visibility preferences.
- Authentication/session behavior: AWS Amplify/Cognito, login, logout, session refresh, authorization guards.
- Preferences and cookies: `user-preferences`, `i18next`, localStorage, sessionStorage, consent state.
- Watchlists, saved searches/search filters, notifications, matching, product interactions, analytics events.
- Newsletter or marketing consent, including double opt-in evidence.
- Partner/shop/admin data: shop metadata, domains, addresses, contact fields, partner applications, API access tokens, OAuth clients.
- Payment/subscription metadata and Stripe-related behavior.
- Tracking, analytics, embedded third-party content, maps, pixels, or new outbound processors.
- Logs or error reporting that may include personal data.

## Alignment rules

- `showUnassessedOrSensitiveContent` is an account preference covering both unassessed and sensitive content. It is separate from tracking and external-map consent. Do not migrate an old restricted-symbol consent into this broader preference or persist it in browser preferences.
- Treat missing content assessments as unassessed. Only `ALLOWED` content is displayed without the preference. Redacted image URLs remain unavailable even when the preference is enabled.
- Account updates must discard and refetch cached personalized listings, watchlists, saved-search matches/previews, and notifications; merely marking them stale can retain previously visible images. Cancel in-flight queries before resetting these caches, and cancel and clear them on account deletion.
- Sign-in, sign-out and viewer changes also remove own-source grants, partnership applications and access-token caches before refetching. Pending private reads must be aborted so late responses cannot repopulate a previous viewer's data. Public SEO images must be assessed ALLOWED, regardless of a signed-in viewer's content preference.

### Newsletter consent

Two distinct flows exist; the privacy policy's "Newsletter and Marketing Communications" section describes both.

- **Native signup** ([#1035](https://github.com/aura-historia/webapp/issues/1035)): the only registration-time choice is an optional, unchecked checkbox, stored by the backend with the account. Do not call the standalone newsletter request for it, and never use a prechecked post-registration shortcut.
- **Standalone double opt-in:** every other request (landing-page form; anonymous, signed in, or federated sign-in) calls `PUT /api/v1/newsletter-subscriptions`. An empty 204 means only that the request was handled. The UI asks the user to check their inbox, does not claim a subscription or delivered email, does not reveal rate suppression or account state, and never sets a local `marketingEmailConsent` value. A verified account email is not a bypass. Use the shared one-purpose wording (`newsletter.purpose`) with the privacy link; there is no checkbox on a dedicated request form.
- **Confirmation:** the email links to `/$lng/newsletter/confirm#token=…`. The page is public, request-time SSR, `no-store`, `no-referrer`, noindex, not prerendered and excluded from analytics page views. The fragment is read only after hydration, then removed with `replaceState` and kept only in hook memory: never in storage, query keys, logs, titles, analytics or rendered text. A reload therefore needs the email link again. Nothing is posted on load, prefetch or GET; only the explicit "Confirm subscription" action posts the token, without a bearer credential. A 204 means "confirmation received" (provider sync is asynchronous, and replaying a used link also returns 204), so the copy must not claim delivery or a re-subscription. Afterwards the account query is invalidated and refetched. Temporary failures allow a deliberate retry with the same token; an invalid link offers a new standalone request.
- Pending means a confirmation email was requested. Confirmed is decided by the backend only, and the current value is read from the account's read-only `marketingEmailConsent`.

- Data minimization: collect and send only fields needed for the feature.
- Purpose limitation: use data only for purposes reflected in the privacy policy and user expectations.
- Consent: optional analytics/tracking or non-essential terminal storage must remain gated by valid consent.
- Transparency: if the UI asks for data, explain why when the reason is not obvious.
- No hidden escalation: do not add background tracking, enrichment, sharing, or profiling without explicit review.
- Retention: do not create new persistent storage without considering retention and deletion behavior.
- Security: never expose bearer tokens, Cognito/session details, OAuth secrets, or unmasked access tokens in UI, logs, URLs, or analytics.
- User rights: account deletion, privacy settings, unsubscribe, consent settings, and preference changes must remain functional.

## Privacy review steps

1. Identify data categories changed or newly processed.
2. Identify purpose, storage location, processors, and retention implications.
3. Check current privacy text covers the behavior in every language.
4. Check consent/settings UI still truthfully describes behavior.
5. Check analytics/tracking code respects consent state.
6. Check server/client rendering does not leak user-specific data into cacheable public responses.
7. If text changes are needed, update every privacy locale file and related route/meta translations.
8. If unsure, stop and request legal/product review before shipping.

## Red flags

- Adding a third-party SDK, pixel, analytics destination, map/embed, payment provider, CRM, email tool, or error reporter.
- Storing new identifiers or preferences in cookies/localStorage/sessionStorage.
- Sending user IDs, emails, search terms, watchlist contents, partner data, or payment metadata to analytics.
- Showing token plaintext beyond its intended one-time display.
- Caching authenticated/user-specific responses as shared public data.
