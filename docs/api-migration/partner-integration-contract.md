# Partner listing integration

Issue #985 (MIG-13) owns the custom integration guide and embedded Scalar reference.
The guide consumes `OwnListingSource` from `useOwnListingSources`, which maps generated
DTOs in `src/data/internal/listing-source`; the page never treats source access as
ownership or permission to edit metadata. Failed refreshes and revoked grants remove
cached selections from the example. Token creation selects only `product-listings:write`.
Application requests link to application management; this guide does not load legacy
application DTOs or embed the application form.

## Reference generation

The generated client also includes optional provider setup at
`PUT /api/v1/listing-sources/{listingSourceId}/ingestion-configurations/woocommerce`
and `/shopify`. These server integration capabilities are outside the product guide
and public reference; this migration adds no browser settings form. They require a
Cognito user or delegated access token with `listing-sources:write`, plus partnership
write access to the source. A PUT atomically enables/replaces the method; omitted or
null currency/language clears those overrides. WooCommerce requires a nonblank,
write-only `webhookSecret`; Shopify requires a unique valid store domain. Responses
are bodyless 201 for enabling or 204 for replacement/no change, with `no-store`.
Keep provider secrets server-side and out of logs, generated examples and caches.

The October 2 check was superseded by the pinned October 5
[integration contract](integration-release-gate.md), used by `pnpm openapi-ts`
for both the client and this reference. The September 10 analysis is historical:
the current create contract requires
`sourceListingId`, `url`, and `images`, while localized `title` and `description` are
optional and nullable. Supply both when available; do not make the public subset
stricter than the backend.

`scripts/generate_partner_products_openapi.py --input <contract.yaml-or-json>` accepts
the exact contract captured for client generation. Use the same input for the client
and reference when coordinating a new generation. Without `--input`, the script fetches
backend develop; this is convenient but not pinned. The artifact records a canonical
parsed-contract SHA-256 in `x-source-contract-sha256` to detect differing inputs.
The extractor fails if any required operation/reference is missing, preserves shared
path parameters, follows transitive component/discriminator references, and keeps only
used security schemes. It corrects outdated asking-price examples to include
`type: MONETARY`, without changing monetary estimate schemas.

The subset contains POST/PATCH/PUT/DELETE on
`/api/v1/listing-sources/{listingSourceId}/product-listings` and POST on
`/api/v1/webhooks/woocommerce/{listingSourceId}`. Separate `/async` batch endpoints are
outside this guide. Unrelated account/admin/configuration components are removed.
Scalar is documentation-only: request/client buttons are hidden and authentication
persistence is disabled. No source webhook configuration or real credentials are
passed to the Scalar embed or included in the public reference artifact.

The authenticated page can mount `AccessTokenCreateDialog`. After token creation,
the dialog deliberately displays `createdAccessToken.plaintextToken` once and copies
it to the clipboard only on the user's explicit action. The credential is held in
client memory; closing the dialog clears its local credential state and resets the
mutation state, and this page unmounts the closed dialog. This does not erase a token
already copied to the clipboard. Keep the one-time credential out of logs, analytics,
URLs, persistent browser storage, public HTML and shared caches. The Scalar-only
assurance must not be applied to the whole page or token-creation response.

## Synchronous batches

All four methods accept an array with `maxItems: 100`, including `[]`. An empty batch
returns HTTP 200 with `[]`. Each entry uses its own PostgreSQL transaction. Successful
writes remain committed when another entry fails. HTTP 200 means at least one entry
succeeded (or the batch was empty); its body contains only failures as
`{ listingSourceId, sourceListingId, error }`. Full success returns `[]`. If every entry
in a nonempty batch fails, the first failure is returned as `application/problem+json`.
Validate/correct failed entries and retry only those where appropriate; a lost response
needs reconciliation, not an assumption that nothing was committed. Search indexing
and visibility are separate from completed source writes.

Use `sourceListingId` for the source-owned identity; seller/address fields are absent.
Asking price is a tagged union: `{ type: "MONETARY", currency: "EUR", amount: 420000 }`
or `{ type: "ON_REQUEST" }`. Monetary amounts use minor currency units. Nullable
availability preserves unknown rather than inventing an available/sold state.

| Write | Omitted | null | Concrete value |
|---|---|---|---|
| PATCH availability/price/estimates | Preserve | Clear | Set |
| PATCH URL/images | Preserve | Invalid (`400 BAD_BODY_VALUE`) | Replace; images `[]` clears |
| PUT existing availability/price/estimates | Preserve | Clear | Set |
| PUT existing images | Preserve | Invalid | Replace; `[]` clears |
| PUT existing URL | Preserve | Preserve | Replace |
| PUT title/description | Creation only | Creation only | Existing text remains unchanged |

For new PUT listings, URL/images are required; omitted/null availability and prices
record no assertion. PATCH validates the complete batch contract before entry writes.
Omit `auction` to preserve context; `auction: null` is invalid. Within an asserted
auction patch, `auctionId` must name an existing auction belonging to the same listing
source. Omit it to preserve membership, send null to clear, or a valid ID to set.
The same omit/preserve, null/clear, value/set rules apply individually to `lotNumber`,
`cataloguePosition`, and timing leaves `biddingOpens`, `scheduledCloses`, and
`reportedClosedAt`; timing values are RFC3339 instants. Never infer that setting a lot
creates an auction.

DELETE accepts `[{ "sourceListingId": "demo-violin-001" }]` on the collection path.
It withdraws listings and preserves history. PUT restores a withdrawn listing before
applying current facts. It is not a single-product hard-delete endpoint.

## WooCommerce

The webhook path uses the canonical `listingSourceId`. Requests require bearer
authorization, `x-wc-webhook-topic`, and `x-wc-webhook-signature`: a base64 HMAC-SHA256
over the exact untouched request body bytes. `x-wc-webhook-delivery-id` is optional.
The webhook secret and signature computation belong on the server/WooCommerce side;
the browser product guide and Scalar reference must never receive or send the secret.

Every topic requires `id`. Created/updated events with `status: publish` require
nonblank `name` and `permalink` and map to raw UPSERT capture. `trash`, `draft`, `pending`,
and `private` map to DELETE capture; `product.deleted` requires only `id`. Missing or
unsupported create/update statuses are authorized ignored events. Description fields
are accepted but ignored and removed from persisted source evidence; signature checks
still cover the original bytes.

HTTP 204 has no body. It acknowledges confirmed FIFO admission of a mapped command or
an authorized ignored event, **not** raw capture, provider receipt persistence,
normalization, source-order checks, or search visibility. Ignored events create no
receipt and do not parse timestamps. Non-204 responses never prove that a send was
rolled back; an acknowledgment can be lost after enqueueing.

`date_modified_gmt` supports GMT without an offset (treated as UTC), RFC3339 `Z`, and
`+00:00`. Malformed/nonzero-offset values on mapped captures are rejected before
admission. Omission supplies no source-order guarantee. Valid timestamp conflicts and
delivery-ID reuse with a different semantic evidence digest are evaluated downstream,
not returned as immediate HTTP 409 responses. A timestamp-free DELETE establishes a
restore barrier; an UPSERT without a provably newer timestamp fails downstream with
`WOOCOMMERCE_PROVIDER_SOURCE_ORDER_AMBIGUOUS`. Investigate consumer failures before
reconciliation/redrive. A supplied delivery receipt retains its evidence digest for
90 days; expiry does not erase captured revision provenance. Without a delivery ID,
there is no provider-receipt deduplication guarantee. Retry uncertain admission with
the unchanged signed body, topic, source, actor and supplied delivery ID.

## Validation

Run focused Vitest tests for `src/features/partner/partner-program` and locale parity,
plus `python -m unittest discover -s scripts/tests -v` for extraction. Contract tests
validate the create/PATCH/PUT/withdrawal examples and embedded batch examples, reject
legacy untagged prices and unsupported fields, resolve references, enforce the batch
limit, and check the webhook header/204 contract. Run lint, TypeScript, and build;
report unrelated migration failures without broadening this feature's ownership.
