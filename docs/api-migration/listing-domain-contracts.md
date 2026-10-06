# Listing domain contracts

These shared contracts adapt the generated API DTOs for consumers in MIG-03 through MIG-09. Keep API-to-domain mapping in `src/data/internal`; components should not reinterpret generated listing DTOs.

The `ProductListing` and `ProductListingDetail` output types use app-owned price, availability, lifecycle, valuation, content-policy, auction, lot, and viewer-state types. API DTO types belong only in mapper inputs. Timestamp strings become `Date` values at the boundary.

## Listing summaries and details

- `ProductListing` is the card/search projection. It retains canonical `productListingId`, source-owned `sourceListingId`, nested source identity, optional public slug, optional summary `auctionId`, availability, lifecycle, content policy and complete summary valuation metadata.
- `ProductListingDetail` is a distinct detail contract. Its `pricing` keeps source and display prices and the valuation snapshot; `auction` and `lot` remain independently nullable. A lot never creates or supplies a parent auction.
- Text and public slugs remain optional. Redacted or missing text, slugs, and image URLs stay absent; adapters do not invent titles, prices, sellers, auctions, or sale facts.
- Monetary and on-request prices are separate union members. A missing price remains `null` or absent. Valuation retains `CURRENT` or `SALE_OBSERVATION` and its FX/timestamp metadata.
- Availability uses the app-owned nullable 11-value enum plus `UNKNOWN` for unexpected runtime values. Lifecycle remains independently `ACTIVE` or `WITHDRAWN` (with an `UNKNOWN` fallback); withdrawal, out-of-stock and sale are not equated.

## Personalized state and cache identity

`mapProductListingUserState` converts the optional `userState` wrapper. It preserves watchlist settings, content visibility, search-filter match data, and unseen notification IDs; `hasUnseenNotification` is derived from whether that ID array is non-empty.

`getProductListingIdentity` preserves prefixed canonical and source identifiers as opaque strings. Do not parse IDs as UUIDs or extract slugs from them. Use `productListingQueryKeys` for stable cache identities. Include a non-secret `viewerCacheKey` whenever a query can contain account-specific state so one account's state cannot share a cache entry with another account or anonymous data.

## API errors

`mapToInternalApiError` accepts the generated uppercase source types (`QUERY`, `PATH`, `HEADER`, `BODY`) and returns a safe unknown-error fallback when an endpoint has no problem body. UI presentation continues to use translated stable error codes rather than raw server detail.
