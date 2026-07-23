---
name: privacy-alignment-check
description: Review Aura Historia code changes that touch user data, cookies/storage, auth, consent, analytics, payments, partner/admin data, OAuth, or tokens for privacy-policy alignment.
---

# Privacy Alignment Check

Use this skill whenever work affects user data or behavior described by the privacy policy.

## Required Reading

Read:

- `docs/privacy-policy-alignment.md`
- `src/assets/content/AGENTS.md` when privacy/legal markdown may change
- the applicable DOX chain for touched code paths

## Data Categories to Check

Look for changes involving:

- Account/profile data: email, name, user ID, language, currency, roles, subscriptions.
- Auth/session data: AWS Amplify/Cognito, route guards, server auth, logout/login behavior.
- Cookies/storage: `user-preferences`, `i18next`, localStorage, sessionStorage, consent flags.
- Watchlists, saved searches/search filters, notifications, matching, product interactions.
- Newsletter/marketing and double-opt-in evidence.
- Partner/shop/admin data: contact/address/domain metadata, applications, access tokens, OAuth clients.
- Payment/subscription/Stripe metadata.
- Tracking/analytics, external embeds, processors, logs, or error reporting.

## Review Procedure

1. Identify exactly what personal data is collected, displayed, stored, sent, logged, or deleted.
2. Identify purpose, storage location, processor/API, persistence/retention implications, and whether the user expects it.
3. Confirm current privacy policy text covers the behavior in `de`, `en`, `es`, `fr`, and `it`.
4. Confirm optional analytics/tracking/non-essential storage remains consent-gated.
5. Confirm authenticated/user-specific data is not exposed in cacheable public responses, URLs, logs, or analytics events.
6. Confirm secrets and tokens are masked except for deliberate one-time plaintext display.
7. If policy/UI text changes are needed, update every locale and related i18n metadata.
8. If a new processor, data category, purpose, retention behavior, or transfer is introduced, flag for legal/product review.

## Output Expected

When reporting, summarize:

- Data touched.
- Policy sections/locales checked or updated.
- Consent/security/cache considerations.
- Remaining legal/product review questions, if any.
