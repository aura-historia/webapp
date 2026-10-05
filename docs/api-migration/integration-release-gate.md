# MIG-24 integration release gate (#995)

## Final contract

Captured backend `develop/docs/swagger.yaml` on 2026-10-05, Git blob
`39d993e0ed775e65065c61fa885e791ee706d49c`. The pinned
[integration schema](swagger.integrated.yaml) has byte SHA-256
`b6962e36b828bfbeddfc5660fc07213a24aae3aa9f053d930ae2954e2adb3485`.
Its canonical parsed JSON SHA-256 is
`e598d91572bfe5437938661720619031f57bd273ecc359a644a7712aead0f772`.
The client and partner reference are generated together with `pnpm openapi-ts`
using `@hey-api/openapi-ts 0.0.0-next-20260824173136`, Python/PyYAML 6.0.3,
and the repository's pnpm 11.24.0. Generation does not fetch a moving contract.
To adopt a later revision, replace the pinned capture deliberately, regenerate,
refresh the inventory, and rerun validation.

[Complete operation/model coverage](integrated-inventory.md) accounts for all
103 current operations, 191 schemas, 77 baseline SDK operations and 134 baseline
generated models. It records current fields and requiredness for every schema.
The original September 10 inventories and issue drafts remain historical.
There are 17 operations added and one removed since that snapshot. Every later
addition is recorded, including public source search/slug lookup, ordinary OAuth
consent-client lookup, all six public/admin auction operations from
[MIG-25 / #1004](https://github.com/aura-historia/webapp/issues/1004), health/readiness
probes, async ingestion and provider ingestion configuration. This supersedes the
issue's earlier seven-operation follow-up count.

## Scope decisions

- Admin dashboard migration is explicitly deferred by the user. Existing guarded,
  authenticated, noindex, non-prerendered admin route placeholders remain. The
  unregistered legacy dashboard implementation, DTOs, tests and locale namespaces
  are removed; backend authorization is unchanged. Admin capabilities in the SDK
  are deferred to MIG-16–23/MIG-25, rather than represented as implemented UI.
- Standalone public auction browsing/detail/catalogue pages are explicitly deferred
  by the user to MIG-25. Listing-level auction summaries and typed history remain
  in the migrated product experience. The three public auction SDK operations are
  generated, with this UI gap recorded in the inventory.
- Partner ingestion configuration and async batches are external API capabilities,
  outside the synchronous product integration guide. They are generated; optional
  `listing-sources:write` is selectable and described in token/OAuth consent without
  adding it to existing grants or the product integration default.
- Legacy product URL routes remain intentional redirects. Source discovery uses
  public source search and slug lookup; removed shop metadata, taxonomy, seller-name,
  shop-type and price-sort controls are retired, rather than sent to removed APIs.

## Integrated behavior

Public loaders use canonical listing/source IDs and app-owned DTO mappings. Search
preserves the complete FX-pinned cursor; watchlist/match cursor formats stay endpoint
specific. Saved-match pagination observes a persistent sentinel and stops on absent
cursors; saved-filter editing, input labels and summaries preserve the saved currency.
Opaque prefixed listing/source/FX/user identities are represented in shared fixtures.
Existing slice tests cover redacted URLs, nullable availability, on-request prices,
typed tuple/string/FX cursors and minimal account/source/application responses.

SEO only publishes images assessed as ALLOWED (`NONE` internally), independently of
an individual viewer's content preference. Redacted image URLs stay unavailable.
Identity changes remove listing, account, watchlist, match, notification, own-source,
application and access-token caches; destroying queries aborts pending private reads
so late responses cannot repopulate them. Amplify auth events clear these caches
before refetching. Public source data and immutable history keep their safe boundaries.

OAuth PKCE/state/redirect behavior, billing via `postBillingManage`, and newsletter
subscription retain their established contracts. Token scope defaults remain empty;
the integration guide preselects only `product-listings:write`. No new processor,
persistent browser data or analytics payload is introduced.

Static output uses the explicit 40-page allowlist in `vite.config.ts`; authenticated,
personalized, dynamic listing/source and deferred auction routes are excluded.
All five locales have identical keys. The translation audit normalizes Windows paths
and excludes test/generated fixtures before identifying unused runtime translations.
Legacy shop/product API error labels are retired or renamed to the current listing/
source codes; shared transport errors and the unknown-error fallback remain.

## Validation

Required local release checks are `pnpm test --coverage`, `pnpm lint`,
`pnpm exec biome ci .`, `pnpm exec tsc --noEmit`, `pnpm build`, and the partner
reference extractor's Python unit tests. No E2E tests are run for this migration.
Local validation on the branch including `develop` commit
`64e3ea1912a4e1675a8c9b5e1db9f977207671a9` passed:

- Full unit/component suite with coverage: 206 files, 1,586 tests passed; seven
  pre-existing testimonial tests remain skipped. Line coverage is 90.82%.
- TypeScript, `pnpm lint`, and the exact `pnpm exec biome ci .` check pass cleanly.
- Production build and 40 allowlisted prerendered public pages succeed.
- All six partner reference extractor tests pass; a second `pnpm openapi-ts` run
  produces no client/reference diff, and inventory generation verifies all operations.
- Canonical API error translation cleanup additionally passes 13 focused translation/
  error-adapter tests. LF normalization is enforced by `.gitattributes` so the same
  formatting checks work on Windows and CI.

Hosted CI results are tracked on the final PR. No required checks were removed or
weakened, and no E2E tests were run.
