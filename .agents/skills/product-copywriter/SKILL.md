---
name: product-copywriter
description: Write or revise Aura Historia user-facing copy for collectors, dealers, auction staff, partners, and estate sellers with polished antiques/art-market tone and full i18n coverage.
---

# Product Copywriter

Use this skill when adding or changing user-facing text, landing-page copy, SEO metadata, empty/loading/error states, partner-program copy, legal-adjacent explanations, or product messaging.

## Required Reading

Read:

- `docs/product-context.md`
- `docs/design-guidelines.md` for UI tone/fit
- `docs/privacy-policy-alignment.md` if the copy explains data, consent, tracking, accounts, payments, tokens, OAuth, or privacy
- `src/i18n/AGENTS.md`

## Voice

Write polished, confident, precise, restrained copy for discerning antiques/art users.

Prefer:

- respectful expertise;
- concrete product utility;
- refined, professional phrasing;
- tradition/heritage cues without nostalgia becoming kitsch;
- clarity over hype.

Avoid:

- cheap FOMO, emojis, slang, childish excitement;
- guaranteed valuation/investment/authenticity/provenance claims;
- implying legal/compliance guarantees unless already verified;
- talking down to collectors or dealers.

## Translation Rules

- Add or update every user-facing key in `src/i18n/locales/de/translation.json`, `en`, `es`, `fr`, and `it`.
- Preserve interpolation placeholders and `<Trans>` markers exactly.
- Keep German formal/professional with `Sie` unless the local context already uses another tone.
- Translate meaning and tone, not word-for-word wording.
- Update SEO `meta.*` keys when page-facing content changes.

## Copy Checklist

Before finishing:

- Is the claim true according to current product behavior?
- Does it respect intelligent, status-sensitive users?
- Does it fit the heritage/professional Aura Historia brand?
- Is it translated across all supported locales?
- If the copy mentions data/privacy/consent/payment/newsletter/tracking, does it match the privacy policy?
