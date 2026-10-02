# Granted listing-source access (MIG-14)

`OwnListingSource` in `src/data/internal/listing-source/OwnListingSource.ts` is the
shared internal reference for the partner portfolio, OAuth and custom integrations.
It contains only `listingSourceId`, `listingSourceSlugId` and `name`, copied by
`mapToOwnListingSource` from `AdministeredListingSourceData`. IDs are opaque strings.
Do not enrich this reference with admin requests or infer ownership, partner status,
metadata-edit permission, ingestion configuration or token scope from its presence.

`useOwnListingSources(enabled)` in `src/features/partner/common/api` calls
`getMyListingSources` and maps DTOs before returning them. Enable it only for an
authenticated consumer that needs the list. All consumers share
`OWN_LISTING_SOURCES_QUERY_KEY`. Requests use `cache: "no-store"`, cancellation,
zero stale time, zero inactive cache retention and no automatic retries. The list
is private, must not be publicly cached, and is not evidence of authorization for
a later write. Backend authorization remains authoritative.

An empty successful list means no current source access; it may follow revocation.
On a failed refresh, consumers must show the error state rather than render cached
grants or permit selection. Disabled consumers must not display prior query data.
Selections must be resolved against the current successful list; removed IDs must
not remain actionable. OAuth selection still does not scope the OAuth grant to a
source; the protocol and broker compatibility policy remain owned by MIG-12.

## Browser URL compatibility policy

Retain `/$lng/partners/shops` as the authenticated, non-indexed portfolio URL so
existing bookmarks and navigation continue to work. It now displays granted
listing-source references, with matching localized page and navigation labels.
The historical filename and `partnerShops` translation namespace are compatibility
details. No metadata-edit controls, mutation hooks, public profile links or fallback
detail requests remain in this portfolio. There is no authorized partner metadata
update contract; do not substitute `adminUpdateListingSource`.

## Consumer migration boundaries

- OAuth's `useOAuthListingSources` delegates to the shared hook. Its narrower
  `OAuthListingSource` presentation type derives from `OwnListingSource`.
- The custom-integration page temporarily uses deprecated `usePartnerShops`, a
  domain-to-domain adapter over this same query. Its `shopId` and `shopSlugId` are
  aliases for the canonical source ID and source slug, not old shop identifiers.
  It withholds data when disabled or when the query is unsuccessful. MIG-13 (#985)
  owns replacing those presentation names, endpoint examples and integration copy;
  MIG-15 (#986) owns application eligibility and proposal workflows. New consumers
  must use `useOwnListingSources` directly.

The backend `develop` Swagger was rechecked on 2026-10-02 at Git blob
`70ed085242992209a29c5411efebe8dac71b4537`; the administered-source DTO still has
exactly these three fields. No generated client changes were made for MIG-14.

## Privacy and rendering

This feature reduces displayed partner data to source references. It collects no
new data, creates no browser storage, adds no processors or tracking, and logs no
private responses. Existing partner/account processing coverage in all five
privacy locales remains applicable. Authentication resolves before fetching and
the portfolio renders a deterministic loading state during resolution.
