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

- Account data: email, name, user ID, roles, subscription status, language, currency, content consent flags.
- Authentication/session behavior: AWS Amplify/Cognito, login, logout, session refresh, authorization guards.
- Preferences and cookies: `user-preferences`, `i18next`, localStorage, sessionStorage, consent state.
- Watchlists, saved searches/search filters, notifications, matching, product interactions, analytics events.
- Newsletter or marketing consent, including double opt-in evidence.
- Partner/shop/admin data: shop metadata, domains, addresses, contact fields, partner applications, API access tokens, OAuth clients.
- Payment/subscription metadata and Stripe-related behavior.
- Tracking, analytics, embedded third-party content, maps, pixels, or new outbound processors.
- Logs or error reporting that may include personal data.

## Alignment rules

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
