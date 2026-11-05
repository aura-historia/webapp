# Product Context

## What Aura Historia does

Aura Historia is a refined global discovery platform for art, antiques, design objects, and related market intelligence. It indexes objects from public providers such as dealers, auction houses, and marketplaces so users can search across providers, languages, and currencies from one place. In user-facing copy, call these providers (German: “Anbieter”); retain “listing source” for technical identifiers and implementation terminology.

The app currently emphasizes:

- Global art and antiques discovery across public providers.
- Recently added objects and provider discovery. Provider pages show the public provider summary and currently indexed listings; they do not provide provider classifications, addresses, partner status, or total listing counts.
- Multilingual search/discovery and localized SEO.
- Watchlists, saved search filters, notifications, and matching.
- Partner/shop onboarding, product ingestion APIs, access tokens, OAuth flows, and admin review tools.
- Professional presentation, legal trust, and privacy-aware account features.

## Product goal

Help users find, evaluate, remember, and act on opportunities in valuable art and antiques faster than they could by browsing fragmented dealer, auction, and marketplace websites manually.

The user should feel:

- respected as knowledgeable and discerning;
- in control of search, alerts, preferences, and privacy;
- reassured that Aura Historia is professional, careful, and legally serious;
- intrigued by discovery without feeling pushed by cheap urgency or hype.

## Target users

Primary audience: collectors in the art and antiques field. This includes amateur collectors, expert collectors, wealthy collectors, budget-conscious collectors, and specialist niche collectors.

Additional audiences:

- Commercial dealers and gallery/shop operators.
- Private dealers and estate sellers.
- Auction-house staff, analysts, cataloguers, and market researchers.
- People selling inherited art and antiques who may need orientation.
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

Position Aura Historia on art and antiques (German “Kunst und Antiquitäten”, French “art et antiquités”, Spanish “arte y antigüedades”, Italian “arte e antiquariato”). Use “art and antiques” as the category name in titles, metadata, taglines, and audience descriptions; in a list with other categories write “art, antiques and design objects”. Do not narrow the positioning back to antiques alone, and do not claim a specialism the index does not show, such as “fine art dealers” or valuations of artworks. Keep literal object names and cited market figures as the source states them: the Art Basel / UBS report counts art and antiques sales together, so its labels say so. Legal documents (terms, imprint, privacy policy) keep their reviewed wording until counsel updates it.

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
4. Explain AI-era discovery by what works today (public listing pages with structured data, the public MCP server and API) and label apps for named assistants as in development. Never promise traffic, rankings, AI answers, native integrations or endorsements; third parties decide what they show.
5. Present Shopify and WooCommerce as equal options chosen by the partner's shop system, and respect each brand's naming and logo rules (see `docs/design-guidelines.md`, Partner program).

Custom partner integrations use granted listing sources and access tokens with
`product-listings:write`. POST/PATCH/PUT/DELETE batches of up to 100 entries go
asynchronously (recommended, `/async`) or synchronously. Asynchronous HTTP 202 confirms
admission; admitted entries are processed for the partner, who has nothing to poll.
Synchronous HTTP 200 returns only failed entries; `[]` is full success, including empty
batches. Never call admission a completed write, and avoid promises of immediate search
visibility or publication within a fixed time. The WooCommerce plugin's webhook HTTP 204
only acknowledges confirmed admission or an authorized no-op; secrets remain server-side.
See [Partner integration](partner-integration.md) for
field clearing, auction membership, withdrawal/restoration, and retry semantics.

## Product-writing checklist

Before adding user-facing text:

- Does it fit the refined art and antiques setting?
- Does it respect knowledgeable, status-sensitive users?
- Is the claim supported by product behavior or existing content?
- Is it translated in every supported locale: `de`, `en`, `es`, `fr`, `it`?
- Does it avoid legal, valuation, authenticity, provenance, or privacy overclaims?
