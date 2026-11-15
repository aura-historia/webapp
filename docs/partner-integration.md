# Partner Integration

Apply this guide to the custom integration guide, the embedded Scalar reference, partner API
examples and partner-facing copy about product sync. Generation of the reference artifact is
described in [API contracts](api-contracts.md).

## Integration guide

The guide consumes `OwnListingSource` from `useOwnListingSources`; it never treats source access as
ownership or permission to edit metadata. The provider picker shows the first page of grants and
loads further pages when the user asks, preselecting a single provider only when no further page
exists. Failed refreshes, revoked grants and restarted pages remove cached selections from the
example; a choice belongs to the viewer who made it. Token creation selects only
`product-listings:write`. Application requests link to application management; the guide does not
embed the application form.

The authenticated page can mount `AccessTokenCreateDialog`, which displays
`createdAccessToken.plaintextToken` once and copies it only on the user's explicit action. The
credential is held in memory and cleared, with the mutation state, when the dialog closes; this
cannot erase a token already copied to the clipboard. Keep the credential out of logs, analytics,
URLs, persistent storage, public HTML and shared caches. The Scalar-only assurances below do not
apply to the whole page or the token-creation response.

The guide presents asynchronous batches first, as the recommended mode, and synchronous batches
second. The cURL example switches between the two with tabs and starts on asynchronous, so server
and client render alike. Its Copy button writes only the command of the shown mode, with the
selected `listingSourceId` (or `YOUR_LISTING_SOURCE_ID`), the `YOUR_USER_ACCESS_TOKEN` placeholder
and, for asynchronous batches, the `YOUR_BATCH_KEY` idempotency-key placeholder; it never reads or
inserts a real token.

## Reference artifact

`public/partner-products.openapi.json` is extracted by
`scripts/generate_partner_products_openapi.py --input <contract>` from the same contract used for
the client. Without `--input` the script fetches backend `develop`, which is convenient but not
pinned. The artifact records a canonical parsed-contract SHA-256 in `x-source-contract-sha256`.

The extractor fails if a required operation or reference is missing, preserves shared path
parameters, follows transitive component and discriminator references, and keeps only used
security schemes. It corrects outdated asking-price examples to include `type: MONETARY` without
changing monetary estimate schemas.

The subset contains POST/PATCH/PUT/DELETE on
`/v1/listing-sources/{listingSourceId}/product-listings/async` first, then on
`/v1/listing-sources/{listingSourceId}/product-listings`, with the async admission report,
failure and idempotency-key components. The WooCommerce webhook and provider ingestion
configuration are outside the guide and reference; the webhook contract below is for the
WooCommerce plugin and server integrations. Scalar is documentation-only: request/client buttons
are hidden, authentication persistence is disabled, and no real credentials are passed to it.

## Provider ingestion configuration

`PUT /v1/listing-sources/{listingSourceId}/ingestion-configurations/woocommerce` and `/shopify`
are server integration capabilities with no browser settings form. They require a Cognito user or
access token with `listing-sources:write` plus partnership write access to the source. A PUT
atomically enables or replaces the method; omitted or null currency/language clears those
overrides. WooCommerce requires a nonblank, write-only `webhookSecret`; Shopify requires a unique
valid store domain. Responses are bodyless 201 (enabled) or 204 (replaced or unchanged) with
`no-store`. Keep provider secrets server-side and out of logs, examples and caches.

## Asynchronous batches (recommended)

- POST/PATCH/PUT/DELETE on `/v1/listing-sources/{listingSourceId}/product-listings/async` take the
  same arrays and field rules as the synchronous batches, `maxItems: 100` including `[]`.
- HTTP 202 means at least one entry was confirmed admitted (or the batch was empty). Admitted
  entries are then processed for the partner; there is nothing to poll or confirm, and copy says
  so instead of asking partners to check back. Admission is still not a completed write or search
  visibility, so never label it as one. Listing existence, auctions and provider authority are
  checked during processing, not reported in the response.
- Every evaluated response is an admission report `{ submissionId, acceptedCount, failures }`:
  `acceptedCount` plus the failures equals the entries sent, and each failure carries the original
  `index`, `error`, `retryable` and, when safe to echo, `sourceListingId`. With nothing admitted the
  report comes with 503 (unconfirmed, retryable or blocked sends), else 500 (internal), else 413
  (size only), else 400. `submissionId` only correlates; there is no status endpoint.
- Send one `Idempotency-Key` (1–128 visible ASCII characters, no comma); without it a key is
  generated and echoed, and is lost with a lost response. After transport uncertainty resend the
  exact unchanged batch, in the same order, with the same key; correct invalid entries in a new
  request with a new key, leaving out admitted and uncertain entries. `retryable` marks failures
  where that resend is appropriate (`ENQUEUE_UNCONFIRMED` may already be queued).
- A partner who wants to look anyway reads listings back with GET on the synchronous collection
  path; delegated tokens need `product-listings:read` for it, which the guide's token dialog does not
  preselect.

## Synchronous batches

- All four methods accept an array with `maxItems: 100`, including `[]`. Each entry uses its own
  transaction, so successful writes stay committed when another entry fails.
- HTTP 200 means at least one entry succeeded (or the batch was empty); the body lists only
  failures as `{ listingSourceId, sourceListingId, error }`, so full success is `[]`. If every entry
  of a nonempty batch fails, the first failure is returned as `application/problem+json`.
- Retry only failed entries after correcting them. A lost response needs reconciliation, not an
  assumption that nothing was committed. Search indexing and visibility are separate from
  completed writes; never promise immediate visibility.
- Descriptions are write-only: no response returns a listing's description (it still informs
  search and matching), so a description write cannot be reconciled by reading it back. Check the
  entry's outcome, or repeat the write, which stores the same text again.
- `sourceListingId` is the source-owned identity; seller and address fields do not exist. The
  create contract requires `sourceListingId`, `url` and `images`; localized `title` and
  `description` are optional and nullable (omitted or `null` records no text). Do not make the
  public subset stricter than the backend.
- Asking price is a tagged union: `{ type: "MONETARY", currency: "EUR", amount: 420000 }` (minor
  units) or `{ type: "ON_REQUEST" }`. Nullable availability preserves unknown.

| Write | Omitted | null | Concrete value |
|---|---|---|---|
| PATCH/PUT title/description | Preserve | Clear | Set text and source language |
| PATCH availability/price/estimates | Preserve | Clear | Set |
| PATCH URL/images | Preserve | Invalid (`400 BAD_BODY_VALUE`) | Replace; images `[]` clears |
| PUT existing availability/price/estimates | Preserve | Clear | Set |
| PUT existing images | Preserve | Invalid | Replace; `[]` clears |
| PUT existing URL | Preserve | Preserve | Replace |

Titles are normalized (styled letters become ordinary text, emoji and ornamental symbols are
removed, the first letter is capitalized, a closing period is dropped, and titles over 128
characters are shortened with `...`); a title with no remaining text is rejected with `BAD_BODY_VALUE` (a synchronous batch
fails with `400`, an async batch reports that item). Whitespace-equivalent text is unchanged; a
meaningful text change is recorded in the listing history and refreshes translation, content
assessment and search asynchronously.

For new PUT listings, URL and images are required; omitted or null availability and prices record
no assertion. PATCH validates the complete batch before writing entries. Omit `auction` to
preserve context; `auction: null` is invalid. Within an asserted auction patch, `auctionId` must
name an existing auction of the same listing source: omit to preserve membership, null to clear, an
ID to set. The same omit/null/value rules apply to `lotNumber`, `cataloguePosition` and the RFC3339
timing leaves `biddingOpens`, `scheduledCloses` and `reportedClosedAt`. Setting a lot never creates
an auction.

DELETE accepts `[{ "sourceListingId": "demo-violin-001" }]` on either collection path. It withdraws
listings and preserves history; PUT restores a withdrawn listing before applying current facts.

## WooCommerce webhook

The webhook serves the WooCommerce plugin and server-to-server integrations; it is not part of the
custom integration guide or its embedded reference.

- The path uses the canonical `listingSourceId`. Requests require bearer authorization,
  `x-wc-webhook-topic` and `x-wc-webhook-signature` (base64 HMAC-SHA256 over the untouched body
  bytes); `x-wc-webhook-delivery-id` is optional. The secret and signature belong on the
  server/WooCommerce side, never in the browser guide or reference.
- Every topic requires `id`. Created/updated events with `status: publish` require nonblank `name`
  and `permalink` and map to an UPSERT; `trash`, `draft`, `pending` and `private` map to DELETE;
  `product.deleted` requires only `id`. Missing or unsupported statuses, and created/updated events
  with `type: variation` whatever their status, are authorized no-ops; the parent's own
  `product.updated` refreshes its listing. Every DELETE withdraws the listing whose
  `sourceListingId` is the delivered `id`, including one written only through the partner API.
  `description`, `short_description` and `related_ids` are accepted but ignored.
- HTTP 204 acknowledges confirmed queue admission or an authorized no-op, not capture,
  normalization, source-order checks or search visibility. A non-204 never proves rollback.
- `date_modified_gmt` accepts GMT without offset (UTC), `Z` and `+00:00`; other offsets are rejected
  before admission. Source order is applied downstream, never as an immediate 409: older
  observations of a product complete without effect, equal timestamps apply in arrival order (an
  UPSERT never overtakes a DELETE with the same timestamp), and a timestamp-free DELETE sets a
  restore barrier at the later of its capture time and every known `date_modified_gmt`. After a
  deletion, an UPSERT without `date_modified_gmt` is rejected downstream with
  `CAPTURE_RAW_PROVIDER_SOURCE_ORDER_AMBIGUOUS`; otherwise it is captured without an ordering
  guarantee.
- A delivery receipt binds the delivery ID to its evidence digest for 90 days, so an exact retry
  may be deduplicated; WooCommerce reuses IDs within one second, so a different payload under the
  same ID is a separate observation. Without a delivery ID there is no receipt-based deduplication.
  Retry uncertain admission with the unchanged signed body, topic, source, actor and delivery ID.

## Validation

Run focused Vitest tests for `src/features/partner/partner-program` and locale parity, plus
`python -m unittest discover -s scripts/tests`. Contract tests validate the request and batch
examples in both modes, reject legacy untagged prices and unsupported fields, resolve references,
enforce the batch limit and the async-then-sync path order, check the async admission report and
idempotency key, and keep any webhook out of the subset.
