# Product Context

## What Aura Historia does

Aura Historia is a refined global discovery platform for antiques, art, design objects, and related market intelligence. It indexes objects from public providers such as dealers, auction houses, and marketplaces so users can search across providers, languages, and currencies from one place. In user-facing copy, call these providers (German: “Anbieter”); retain “listing source” for technical identifiers and implementation terminology.

The app currently emphasizes:

- Global antiques and art discovery across public providers.
- Recently added objects and provider discovery. Provider pages show the public provider summary and currently indexed listings; they do not provide provider classifications, addresses, partner status, or total listing counts.
- Multilingual search/discovery and localized SEO.
- Watchlists, saved search filters, notifications, and matching.
- Partner/shop onboarding, product ingestion APIs, access tokens, OAuth flows, and admin review tools.
- Professional presentation, legal trust, and privacy-aware account features.

## Product goal

Help users find, evaluate, remember, and act on valuable antiques and art opportunities faster than they could by browsing fragmented dealer, auction, and marketplace websites manually.

The user should feel:

- respected as knowledgeable and discerning;
- in control of search, alerts, preferences, and privacy;
- reassured that Aura Historia is professional, careful, and legally serious;
- intrigued by discovery without feeling pushed by cheap urgency or hype.

## Target users

Primary audience: collectors in the antiques and arts field. This includes amateur collectors, expert collectors, wealthy collectors, budget-conscious collectors, and specialist niche collectors.

Additional audiences:

- Commercial dealers and gallery/shop operators.
- Private dealers and estate sellers.
- Auction-house staff, analysts, cataloguers, and market researchers.
- People selling inherited antiques or art who may need orientation.
- Partners integrating shops, WooCommerce, Shopify, custom APIs, or OAuth clients.

## Audience psychology

Assume many users are intelligent, proud of their taste, skeptical, and status-sensitive. They often:

- have high expectations for wording, accuracy, imagery, and interface polish;
- value expertise, restraint, provenance, tradition, craft, and the good old times;
- dislike being talked down to or treated like mass-market shoppers;
- may believe they know better than generic platforms;
- notice imprecise claims, exaggerated valuations, and sloppy translations;
- want modern tooling without losing the feeling of connoisseurship.

## Voice and copy

Use a tone that is polished, confident, precise, and restrained.

Prefer:

- “Discover”, “track”, “compare”, “monitor”, “curated”, “trusted”, “global”, “refined”.
- Concrete utility: source coverage, multilingual discovery, alerts, watchlists, saved filters, partner integration.
- Professional warmth over aggressive conversion copy.
- Respectful language that makes the user feel discerning, not naive.

Avoid:

- cheap FOMO, exaggerated scarcity, or guaranteed investment claims;
- childish excitement, emojis, gimmicks, or slang;
- legal, provenance, authenticity, or valuation promises unless verified;
- overclaiming that every source, dealer, or listing is vetted when the code/content does not prove that.

## Conversion path

For collectors:

1. Show breadth and beauty through the landing page and recently added objects.
2. Invite a search without demanding signup.
3. Offer watchlists, saved filters, and notifications as natural next steps.
4. Use account creation to unlock persistence and personalization.

For partners:

1. Present Aura Historia as a professional acquisition and discovery channel.
2. Reduce fear of lock-in: free/commission-free where current product copy says so, easy integrations, API/OAuth options.
3. Make setup, product sync, and token/OAuth security understandable.

Custom partner integrations use granted listing sources and access tokens with
`product-listings:write`. POST/PATCH/PUT/DELETE batches of up to 100 entries complete
synchronously and return HTTP 200 with only failed entries; `[]` is full success,
including empty batches. Avoid promises of queue acceptance, immediate search
visibility, or publication within a fixed time. WooCommerce webhook HTTP 204 only
acknowledges confirmed admission or an authorized no-op; secrets remain server-side.
See [Partner integration](partner-integration.md) for
field clearing, auction membership, withdrawal/restoration, and retry semantics.

## Product-writing checklist

Before adding user-facing text:

- Does it fit the refined antiques/art setting?
- Does it respect knowledgeable, status-sensitive users?
- Is the claim supported by product behavior or existing content?
- Is it translated in every supported locale: `de`, `en`, `es`, `fr`, `it`?
- Does it avoid legal, valuation, authenticity, provenance, or privacy overclaims?
