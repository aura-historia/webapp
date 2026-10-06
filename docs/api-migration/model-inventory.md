# Complete model inventory

Old definitions below come directly from the generated client, not the older embedded partner documentation snapshot. New definitions preserve the complete schema, including descriptions, examples and validation limits. Renamed/restructured models are paired where useful; obsolete event payloads remain explicitly listed. Same-name entries are included even when their shape is unchanged so this inventory has no coverage gaps.

| Existing generated model | Target model |
|---|---|
| ActorData | ActorData |
| GetProductData | ProductListingDetailsData |
| GetProductSummaryData | ProductListingSummaryData |
| PersonalizedGetProductData | PersonalizedProductListingDetailsData |
| PersonalizedGetProductSummaryData | PersonalizedProductListingSummaryData |
| PersonalizedProductSearchResultData | ProductListingSearchResultData |
| ProductUserStateData | ProductListingUserStateData |
| WatchlistUserStateData | WatchlistUserStateData |
| ProhibitedContentUserStateData | ContentVisibilityUserStateData |
| NotificationUserStateData | NotificationUserStateData |
| SearchFilterUserStateData | SearchFilterUserStateData |
| LocalizedTextData | LocalizedTextData |
| PriceData | PriceData |
| ProductCreatedEventPayloadData | Absent / absorbed by replacement domain model |
| ProductEventStateChangedPayloadData | Absent / absorbed by replacement domain model |
| ProductEventPriceChangedPayloadData | Absent / absorbed by replacement domain model |
| ProductEventEstimatePriceChangedPayloadData | Absent / absorbed by replacement domain model |
| ProductEventUrlChangedPayloadData | Absent / absorbed by replacement domain model |
| ProductEventImagesChangedPayloadData | Absent / absorbed by replacement domain model |
| ProductEventAuctionTimeChangedPayloadData | Absent / absorbed by replacement domain model |
| GetProductEventData | ProductListingHistoryEntryData |
| LanguageData | LanguageData |
| CurrencyData | CurrencyData |
| MeasurementUnitData | MeasurementUnitData |
| ProductStateData | ListingAvailabilityData |
| ProductLifecycleData | ListingLifecycleData |
| AuctionData | AuctionData |
| PriceEstimateData | PriceEstimateData |
| PricingData | PricingData |
| ProhibitedContentData | ContentPolicyData |
| ShopTypeData | Absent / absorbed by replacement domain model |
| ShopPartnerStatusData | Absent / absorbed by replacement domain model |
| ProductImageData | ProductListingImageData |
| SortProductFieldData | SortProductListingFieldData |
| ProductEventTypeData | ProductListingHistoryEntryTypeData |
| ProductEventPayloadData | ProductListingHistoryPayloadData |
| ApiError | ApiError |
| ApiErrorSource | ApiErrorSource |
| ProductSearchData | ProductListingSearchData |
| PostUserSearchFilterData | PostUserSearchFilterData |
| PatchUserSearchFilterData | PatchUserSearchFilterData |
| PatchUserSearchFilterMatchData | PatchUserSearchFilterMatchData |
| PatchProductSearchData | PatchProductListingSearchData |
| UserSearchFilterData | UserSearchFilterData |
| ResourceStateData | ResourceStateData |
| PatchResourceStateData | PatchResourceStateData |
| SearchFilterProductMatchData | SearchFilterProductMatchData |
| RangeQueryUInt64 | RangeQueryUInt64 |
| RangeQueryDateTime | RangeQueryDateTime |
| RangeQueryInt32 | Absent / absorbed by replacement domain model |
| DistanceUnitData | Absent / absorbed by replacement domain model |
| DistanceData | Absent / absorbed by replacement domain model |
| GeoDistanceQueryData | Absent / absorbed by replacement domain model |
| SortUserSearchFilterFieldData | Absent / absorbed by replacement domain model |
| UserSearchFilterCollectionData | UserSearchFilterCollectionData |
| CountryCodeData | Absent / absorbed by replacement domain model |
| ContinentData | Absent / absorbed by replacement domain model |
| StructuredAddressData | Absent / absorbed by replacement domain model |
| GeoAddressData | Absent / absorbed by replacement domain model |
| GetShopData | ListingSourceData |
| ShopSearchData | Absent / absorbed by replacement domain model |
| PatchShopData | UpdateListingSourceData |
| PostShopData | CreateListingSourceData |
| AccessTokenScopeData | AccessTokenScopeData |
| AccessTokenTypeData | AccessTokenTypeData |
| GetAccessTokenData | GetAccessTokenData |
| PostAccessTokenData | PostAccessTokenData |
| PatchAccessTokenData | PatchAccessTokenData |
| OAuthClientMetadataRequestData | OAuthClientMetadataRequestData |
| OAuthClientMetadataPatchData | OAuthClientMetadataPatchData |
| OAuthClientMetadataResponseData | OAuthClientMetadataResponseData |
| OAuthTokenResponseData | OAuthTokenResponseData |
| OAuthIntrospectionResponseData | OAuthIntrospectionResponseData |
| SortShopFieldData | SortListingSourceFieldData |
| ShopSearchResultData | ListingSourceSearchCollectionData |
| CategorySearchData | Absent / absorbed by replacement domain model |
| SortCategoryFieldData | Absent / absorbed by replacement domain model |
| GetCategorySummaryData | Absent / absorbed by replacement domain model |
| GetCategoryData | Absent / absorbed by replacement domain model |
| PeriodSearchData | Absent / absorbed by replacement domain model |
| SortPeriodFieldData | Absent / absorbed by replacement domain model |
| GetPeriodSummaryData | Absent / absorbed by replacement domain model |
| GetPeriodData | Absent / absorbed by replacement domain model |
| ProductKeyData | PostWatchlistData |
| WatchlistCollectionData | Absent / absorbed by replacement domain model |
| WatchlistProductPatch | WatchlistProductPatch |
| SortWatchlistProductFieldData | Absent / absorbed by replacement domain model |
| SortSearchFilterMatchFieldData | Absent / absorbed by replacement domain model |
| SortUserFieldData | SortUserFieldData |
| SearchFilterMatchProductCollectionData | SearchFilterMatchProductCollectionData |
| UserCollectionData | UserCollectionData |
| UserSearchData | Absent / absorbed by replacement domain model |
| GetUserAccountData | OwnUserAccountData |
| PatchAdminUserData | PatchAdminUserData |
| PatchUserAccountData | PatchUserAccountData |
| PostBillingCheckoutData | PostBillingCheckoutData |
| BillingPlanData | BillingPlanData |
| BillingCycleData | BillingCycleData |
| BillingSessionUrlData | BillingSessionUrlData |
| PutNewsletterSubscriptionData | PutNewsletterSubscriptionData |
| UserTierData | UserTierData |
| UserRoleData | UserRoleData |
| GetNotificationData | NotificationData |
| NotificationPayloadData | NotificationPayloadData |
| WatchlistNotificationPayloadData | WatchlistNotificationPayloadData |
| WatchlistPayloadData | Absent / absorbed by replacement domain model |
| PriceChangeWatchlistPayloadData | Absent / absorbed by replacement domain model |
| StateChangeWatchlistPayloadData | Absent / absorbed by replacement domain model |
| SearchFilterNotificationPayloadData | SearchFilterNotificationPayloadData |
| SearchFilterPayloadData | Absent / absorbed by replacement domain model |
| PartnerApplicationNotificationPayloadData | PartnershipApplicationNotificationPayloadData |
| PartnerApplicationPayloadData | Absent / absorbed by replacement domain model |
| ApprovedPartnerApplicationPayloadData | Absent / absorbed by replacement domain model |
| RejectedPartnerApplicationPayloadData | Absent / absorbed by replacement domain model |
| PatchNotificationData | UpdateNotificationSeenData |
| NotificationCollectionData | NotificationCollectionData |
| PostProductData | CreateProductListingData |
| PartnerProductEnqueueFailuresResponse | PartnerProductListingBatchFailuresResponse |
| PatchProductData | UpdateProductListingData |
| PutProductData | UpsertProductListingData |
| WoocommerceProductWebhookImageData | WoocommerceProductWebhookImageData |
| WoocommerceProductWebhookUpsertData | WoocommerceProductWebhookUpsertData |
| WoocommerceProductWebhookDeleteData | WoocommerceProductWebhookDeleteData |
| PartnerShopApplicationStateData | PartnershipApplicationStateData |
| ExecutionStateData | Absent / absorbed by replacement domain model |
| GetPartnerShopApplicationPayloadData | Absent / absorbed by replacement domain model |
| GetPartnerShopApplicationData | OwnPartnershipApplicationData |
| PostPartnerShopApplicationPayloadData | SubmitPartnershipApplicationData |
| PatchPartnerShopApplicationData | Absent / absorbed by replacement domain model |
| AdminPatchPartnerShopApplicationData | Absent / absorbed by replacement domain model |
| PartnerShopApplicationDecisionData | Absent / absorbed by replacement domain model |
| PostPartnerShopApplicationDecisionData | DecidePartnershipApplicationData |
| PatchShopDataWritable | Absent / absorbed by replacement domain model |
| PostShopDataWritable | Absent / absorbed by replacement domain model |
| New | ProductListingSummaryPriceValuationData |
| New | ProductListingPricingData |
| New | ProductListingPricingValuationData |
| New | ProductListingSearchCursorData |
| New | PersonalizedProductListingSearchResultData |
| New | ProductListingPriceData |
| New | ListingOrderabilityData |
| New | ProductListingDiscoveryHistoryPayloadData |
| New | ProductListingChangedHistoryPayloadData |
| New | ProductListingHistoryChangeData |
| New | ProductListingMainPriceHistoryChangeData |
| New | ProductListingPriceHistoryChangeData |
| New | ProductListingAvailabilityHistoryChangeData |
| New | ProductListingUrlHistoryChangeData |
| New | ProductListingImagesHistoryChangeData |
| New | ProductListingAuctionHistoryChangeData |
| New | ProductListingWithdrawalHistoryChangeData |
| New | ProductListingRestorationHistoryChangeData |
| New | ProductListingSaleObservationHistoryChangeData |
| New | AdminAccessTokenCollectionData |
| New | AdminAccessTokenData |
| New | OAuthClientAdminCollectionData |
| New | OAuthClientAdminData |
| New | WatchlistEntryData |
| New | SortPartyFieldData |
| New | CreatePartyData |
| New | UpdatePartyData |
| New | PartyData |
| New | PartyCollectionData |
| New | PartySummaryData |
| New | PartyContactData |
| New | AdminUserSummaryData |
| New | AdminUserAccountData |
| New | SuspendUserData |
| New | SuspendUserResponseData |
| New | UnsuspendUserResponseData |
| New | WatchlistNotificationChangeData |
| New | WatchlistNotificationPriceChangeData |
| New | WatchlistNotificationAvailabilityChangeData |
| New | UpdateNotificationsSeenData |
| New | WithdrawProductListingData |
| New | AdminOverviewData |
| New | AdminOverviewCountData |
| New | AdminOverviewUsersData |
| New | AdminOverviewUserTierCountsData |
| New | AdminOverviewUserRoleCountsData |
| New | AdminOverviewPartnershipApplicationsData |
| New | AdminOverviewPartnershipApplicationStateCountsData |
| New | AdminOverviewListingSourcesData |
| New | AdminOverviewListingSourceMethodAssignmentCountsData |
| New | AdminOverviewProductListingsData |
| New | AdminOverviewProductListingLifecycleCountsData |
| New | AdminOverviewActiveListingAvailabilityCountsData |
| New | AdminPartnershipCollectionData |
| New | AdminPartnershipDetailsData |
| New | AdminPartnershipSummaryData |
| New | PartnershipPartySummaryData |
| New | AdminPartnershipApplicationData |
| New | PartnershipProposalTypeData |
| New | AdminPartnershipApplicationSummaryData |
| New | AdminPartnershipApplicationCollectionData |
| New | ListingSourceReferenceData |
| New | AdministeredListingSourceData |
| New | ListingSourceSearchSummaryData |
| New | ListingSourcePresentationData |
| New | ListingIngestionMethodData |
| New | ListingIngestionConfigurationData |
| New | ReferralConfigurationData |
| New | OperatorPartyData |
| New | ListingSourceOperatorInputData |
| New | PartnershipApplicationProposalData |
| New | ProposedPartyData |
| New | ProposedListingSourceData |
| New | ProductListingSourceData |

## ActorData → ActorData

Old generated shape:

```ts
type ActorData = 'SYSTEM' | string;
```

Target shape (readable projection; exact constraints follow):

```ts
type ActorData = "SYSTEM" | string;
```

```yaml
oneOf:
  - type: string
    enum:
      - SYSTEM
    description: Backend-initiated actor marker.
  - type: string
    description: User ID of the user who performed the change.
description: |
  Audit actor encoded as a plain string.
  Values are either the literal `SYSTEM` or the User ID of the acting user.
example: SYSTEM

```


## GetProductData → ProductListingDetailsData

Old generated shape:

```ts
type GetProductData = {
    /**
     * Unique internal identifier for the product
     */
    productId: string;
    /**
     * Human-readable slug identifier for the product (kebab-case with 6-character hex suffix).
     * Format: {product-title}-{6-char-hex} where the title is derived from the product name.
     * Example: "amazing-product-fa87c4"
     *
     */
    productSlugId: string;
    /**
     * Human-readable slug identifier of the shop (kebab-case, derived from shop name).
     * Example: "tech-store-premium" or "christies"
     *
     */
    shopSlugId: string;
    /**
     * Unique identifier for the current state/version of the product
     */
    eventId: string;
    /**
     * Unique identifier of the shop
     */
    shopId: string;
    /**
     * Shop's unique identifier for the product. Can be any arbitrary string.
     */
    shopsProductId: string;
    /**
     * Display name of the shop
     */
    shopName: string;
    /**
     * Display name of the seller associated with the product
     */
    sellerName: string;
    shopType: ShopTypeData;
    /**
     * Optional structured address propagated from the selling shop when available.
     * This is the address that backs the product's geo-search filters.
     *
     */
    structuredAddress?: StructuredAddressData | null;
    /**
     * Optional latitude/longitude coordinates propagated from the selling shop when available.
     * This is the coordinate data used by product geo-distance search.
     *
     */
    geoAddress?: GeoAddressData | null;
    title: LocalizedTextData;
    /**
     * Optional product description
     */
    description?: LocalizedTextData | null;
    /**
     * Complete pricing information including offer price and optional estimates.
     * When null, no pricing information is available for this product.
     *
     */
    price?: PricingData | null;
    state: ProductStateData;
    lifecycle: ProductLifecycleData;
    /**
     * Raw URL to the product on the shop's website.
     */
    url: string;
    /**
     * Tracked or affiliate URL generated by the backend for user-facing navigation to the product.
     */
    viewUrl: string;
    /**
     * Array of product images with prohibited content classification
     */
    images: Array<ProductImageData>;
    /**
     * Optional auction time window information.
     * Only present for products from auction houses with scheduled auction times.
     * Contains start and/or end timestamps for the auction.
     *
     */
    auction?: AuctionData | null;
    createdBy: ActorData;
    updatedBy: ActorData;
    /**
     * When the product was first created (RFC3339 format)
     */
    created: string;
    /**
     * When the product was last updated (RFC3339 format)
     */
    updated: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingDetailsData = { "productListingId": string; "productListingTitleSlugId"?: string; "eventId": string; "source": ProductListingSourceData; "sourceListingId": string; "productTitle"?: LocalizedTextData | null; "productDescription"?: LocalizedTextData | null; "title"?: LocalizedTextData | null; "description"?: LocalizedTextData | null; "pricing": { "source": ProductListingPricingData; "display": ProductListingPricingData; "valuation": ProductListingPricingValuationData; }; "availability": ListingAvailabilityData | null; "lifecycle": ListingLifecycleData; "url": string; "viewUrl": string; "images": Array<ProductListingImageData>; "contentPolicy"?: ContentPolicyData | null; "auction": { "start": string | null; "end": string | null; }; "created": string; "updated": string; };
```

```yaml
type: object
description: Canonical ProductListing detail inside a personalized response wrapper.
required:
  - productListingId
  - eventId
  - source
  - sourceListingId
  - pricing
  - availability
  - lifecycle
  - url
  - viewUrl
  - images
  - auction
  - created
  - updated
properties:
  productListingId:
    type: string
  productListingTitleSlugId:
    type: string
    minLength: 8
    maxLength: 120
    pattern: ^[a-z0-9]+(-[a-z0-9]+)*-[0-9a-f]{6}$
    description: Immutable Aura-owned public locator. Omitted when the listing is
      redacted as hidden.
    example: museum-cabinet-18-19-century-a1b2c3
  eventId:
    type: string
  source:
    $ref: "#/components/schemas/ProductListingSourceData"
  sourceListingId:
    type: string
  productTitle:
    allOf:
      - $ref: "#/components/schemas/LocalizedTextData"
    nullable: true
  productDescription:
    allOf:
      - $ref: "#/components/schemas/LocalizedTextData"
    nullable: true
  title:
    allOf:
      - $ref: "#/components/schemas/LocalizedTextData"
    nullable: true
  description:
    allOf:
      - $ref: "#/components/schemas/LocalizedTextData"
    nullable: true
  pricing:
    type: object
    required:
      - source
      - display
      - valuation
    properties:
      source:
        $ref: "#/components/schemas/ProductListingPricingData"
      display:
        $ref: "#/components/schemas/ProductListingPricingData"
      valuation:
        $ref: "#/components/schemas/ProductListingPricingValuationData"
  availability:
    allOf:
      - $ref: "#/components/schemas/ListingAvailabilityData"
    nullable: true
  lifecycle:
    $ref: "#/components/schemas/ListingLifecycleData"
  url:
    type: string
    format: uri
  viewUrl:
    type: string
    format: uri
  images:
    type: array
    items:
      $ref: "#/components/schemas/ProductListingImageData"
  contentPolicy:
    allOf:
      - $ref: "#/components/schemas/ContentPolicyData"
    nullable: true
  auction:
    type: object
    required:
      - start
      - end
    properties:
      start:
        type: string
        format: date-time
        nullable: true
      end:
        type: string
        format: date-time
        nullable: true
  created:
    type: string
    format: date-time
  updated:
    type: string
    format: date-time

```


## GetProductSummaryData → ProductListingSummaryData

Old generated shape:

```ts
type GetProductSummaryData = {
    /**
     * Unique internal identifier for the product
     */
    productId: string;
    /**
     * Human-readable slug identifier for the product (kebab-case with 6-character hex suffix).
     * Format: {product-title}-{6-char-hex} where the title is derived from the product name.
     * Example: "amazing-product-fa87c4"
     *
     */
    productSlugId: string;
    /**
     * Human-readable slug identifier of the shop (kebab-case, derived from shop name).
     * Example: "tech-store-premium" or "christies"
     *
     */
    shopSlugId: string;
    /**
     * Unique identifier for the current state/version of the product
     */
    eventId: string;
    /**
     * Unique identifier of the shop
     */
    shopId: string;
    /**
     * Shop's unique identifier for the product. Can be any arbitrary string.
     */
    shopsProductId: string;
    /**
     * Display name of the shop
     */
    shopName: string;
    /**
     * Display name of the seller associated with the product
     */
    sellerName: string;
    shopType: ShopTypeData;
    title: LocalizedTextData;
    /**
     * Optional product price
     */
    price?: PriceData | null;
    state: ProductStateData;
    lifecycle: ProductLifecycleData;
    /**
     * Raw URL to the product on the shop's website.
     */
    url: string;
    /**
     * Tracked or affiliate URL generated by the backend for user-facing navigation to the product.
     */
    viewUrl: string;
    /**
     * Array of product images with prohibited content classification
     */
    images: Array<ProductImageData>;
    /**
     * Optional auction time window information.
     * Only present for products from auction houses with scheduled auction times.
     * Contains start and/or end timestamps for the auction.
     *
     */
    auction?: AuctionData | null;
    createdBy: ActorData;
    updatedBy: ActorData;
    /**
     * When the product was first created (RFC3339 format)
     */
    created: string;
    /**
     * When the product was last updated (RFC3339 format)
     */
    updated: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingSummaryData = { "productListingId": string; "productListingTitleSlugId"?: string; "eventId": string; "source": ProductListingSourceData; "sourceListingId": string; "title"?: LocalizedTextData | null; "displayPrice"?: ProductListingPriceData | null; "priceValuation": ProductListingSummaryPriceValuationData; "availability": ListingAvailabilityData | null; "lifecycle": ListingLifecycleData; "url": string; "viewUrl": string; "images": Array<ProductListingImageData>; "contentPolicy"?: ContentPolicyData | null; "updated": string; };
```

```yaml
type: object
description: Lightweight ProductListing summary for search and similar-listing results.
required:
  - productListingId
  - eventId
  - source
  - sourceListingId
  - priceValuation
  - availability
  - lifecycle
  - url
  - viewUrl
  - images
  - updated
properties:
  productListingId:
    type: string
  productListingTitleSlugId:
    type: string
    minLength: 8
    maxLength: 120
    pattern: ^[a-z0-9]+(-[a-z0-9]+)*-[0-9a-f]{6}$
    description: Immutable Aura-owned public locator. Omitted when the listing is
      redacted as hidden.
    example: museum-cabinet-18-19-century-a1b2c3
  eventId:
    type: string
  source:
    $ref: "#/components/schemas/ProductListingSourceData"
  sourceListingId:
    type: string
  title:
    allOf:
      - $ref: "#/components/schemas/LocalizedTextData"
    nullable: true
  displayPrice:
    allOf:
      - $ref: "#/components/schemas/ProductListingPriceData"
    nullable: true
  priceValuation:
    $ref: "#/components/schemas/ProductListingSummaryPriceValuationData"
  availability:
    allOf:
      - $ref: "#/components/schemas/ListingAvailabilityData"
    nullable: true
  lifecycle:
    $ref: "#/components/schemas/ListingLifecycleData"
  url:
    type: string
    format: uri
  viewUrl:
    type: string
    format: uri
  images:
    type: array
    items:
      $ref: "#/components/schemas/ProductListingImageData"
  contentPolicy:
    allOf:
      - $ref: "#/components/schemas/ContentPolicyData"
    nullable: true
  updated:
    type: string
    format: date-time

```


## PersonalizedGetProductData → PersonalizedProductListingDetailsData

Old generated shape:

```ts
type PersonalizedGetProductData = {
    item: GetProductData;
    /**
     * Optional user-specific state for this product (only present when authenticated)
     */
    userState?: ProductUserStateData | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PersonalizedProductListingDetailsData = { "item": ProductListingDetailsData; "userState"?: ProductListingUserStateData | null; };
```

```yaml
type: object
description: Canonical Product detail with optional user-specific state.
required:
  - item
properties:
  item:
    $ref: "#/components/schemas/ProductListingDetailsData"
  userState:
    allOf:
      - $ref: "#/components/schemas/ProductListingUserStateData"
    nullable: true
    description: Present only for a valid user or delegated-user bearer token.

```


## PersonalizedGetProductSummaryData → PersonalizedProductListingSummaryData

Old generated shape:

```ts
type PersonalizedGetProductSummaryData = {
    item: GetProductSummaryData;
    /**
     * Optional user-specific state for this product (only present when authenticated)
     */
    userState?: ProductUserStateData | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PersonalizedProductListingSummaryData = { "item": ProductListingSummaryData; "userState"?: ProductListingUserStateData | null; };
```

```yaml
type: object
description: Canonical Product summary with optional user-specific state.
required:
  - item
properties:
  item:
    $ref: "#/components/schemas/ProductListingSummaryData"
  userState:
    allOf:
      - $ref: "#/components/schemas/ProductListingUserStateData"
    nullable: true
    description: Present only for a valid user or delegated-user bearer token.

```


## PersonalizedProductSearchResultData → ProductListingSearchResultData

Old generated shape:

```ts
type PersonalizedProductSearchResultData = {
    /**
     * Array of personalized product summaries in the current page
     */
    items: Array<PersonalizedGetProductSummaryData>;
    /**
     * Number of products returned in the current page
     */
    size: number;
    /**
     * Total number of products matching the query (optional, may not always be available)
     */
    total?: number | null;
    /**
     * Cursor for the next page (JSON value). Present when there are more results.
     * Pass this value as the `searchAfter` query parameter to get the next page.
     * This can be ANY heterogeneous array.
     *
     */
    searchAfter?: Array<unknown> | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingSearchResultData = { "items": Array<PersonalizedProductListingSummaryData>; "size": number; "total"?: number | null; "searchAfter"?: ProductListingSearchCursorData | null; };
```

```yaml
type: object
description: Cursor-paged canonical Product search response.
required:
  - items
  - size
properties:
  items:
    type: array
    items:
      $ref: "#/components/schemas/PersonalizedProductListingSummaryData"
    description: Personalized Product summaries in OpenSearch result order.
  size:
    type: integer
    minimum: 1
    maximum: 100
    description: Requested page size after server-side clamping.
    example: 21
  total:
    type: integer
    minimum: 0
    nullable: true
    description: Total matching product-listings for BM25 search when the backend
      provides it. Hybrid BM25 plus KNN search omits this value because its
      fused candidate pool is not a reliable total.
    example: 127
  searchAfter:
    allOf:
      - $ref: "#/components/schemas/ProductListingSearchCursorData"
    nullable: true
    description: Opaque cursor for the next page. It must be sent back as one
      JSON-encoded `searchAfter` query value.

```


## ProductUserStateData → ProductListingUserStateData

Old generated shape:

```ts
type ProductUserStateData = {
    watchlist: WatchlistUserStateData;
    prohibitedContent: ProhibitedContentUserStateData;
    notification: NotificationUserStateData;
    searchFilter: SearchFilterUserStateData;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingUserStateData = { "watchlist": WatchlistUserStateData; "contentVisibility": ContentVisibilityUserStateData; "notification": NotificationUserStateData; "searchFilter": SearchFilterUserStateData; };
```

```yaml
type: object
description: User-specific state information for a product
required:
  - watchlist
  - contentVisibility
  - notification
  - searchFilter
properties:
  watchlist:
    $ref: "#/components/schemas/WatchlistUserStateData"
  contentVisibility:
    $ref: "#/components/schemas/ContentVisibilityUserStateData"
  notification:
    $ref: "#/components/schemas/NotificationUserStateData"
  searchFilter:
    $ref: "#/components/schemas/SearchFilterUserStateData"

```


## WatchlistUserStateData → WatchlistUserStateData

Old generated shape:

```ts
type WatchlistUserStateData = {
    /**
     * Whether the product is on the user's watchlist
     */
    watching: boolean;
    /**
     * Whether notifications are enabled for this watchlist product
     */
    notifications: boolean;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type WatchlistUserStateData = { "watching": boolean; "notifications": boolean; };
```

```yaml
type: object
description: Watchlist-specific user state for a product
required:
  - watching
  - notifications
properties:
  watching:
    type: boolean
    description: Whether the product is on the user's watchlist
    example: true
  notifications:
    type: boolean
    description: Whether notifications are enabled for this watchlist product
    example: false

```


## ProhibitedContentUserStateData → ContentVisibilityUserStateData

Old generated shape:

```ts
type ProhibitedContentUserStateData = {
    /**
     * Whether the user has consented to view prohibited content
     */
    consent: boolean;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type ContentVisibilityUserStateData = { "showUnassessedOrSensitiveContent": boolean; };
```

```yaml
type: object
description: Stored viewer preference used when presenting unassessed or
  sensitive listing content.
required:
  - showUnassessedOrSensitiveContent
properties:
  showUnassessedOrSensitiveContent:
    type: boolean
    description: Whether unassessed or sensitive content may be shown to this viewer.
    example: false

```


## NotificationUserStateData → NotificationUserStateData

Old generated shape:

```ts
type NotificationUserStateData = {
    /**
     * Whether the latest notification for this product has been seen by the user. Defaults to `true` when no notifications exist.
     */
    seen: boolean;
    /**
     * The ID of the domain event that triggered the latest notification for this product.
     * Present whenever at least one notification exists for the user on this product (seen or unseen).
     * Absent (`undefined` / omitted) when no notifications exist for this product.
     *
     */
    originEventId?: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type NotificationUserStateData = { "unseenNotificationIds": Array<string>; };
```

```yaml
type: object
description: Unseen notification IDs for this product, ordered newest first.
required:
  - unseenNotificationIds
properties:
  unseenNotificationIds:
    type: array
    description: Every unseen Notification ID for this product. Empty when none exist.
    default: []
    items:
      type: string

```


## SearchFilterUserStateData → SearchFilterUserStateData

Old generated shape:

```ts
type SearchFilterUserStateData = {
    /**
     * Whether any of the user's saved search filters matched this product. Defaults to `false`.
     */
    matched: boolean;
    /**
     * Whether this match is hidden because the user has exceeded their monthly search-filter match quota.
     * When `true`, the product data in the response is anonymized: the `productId` is set to a nil UUID,
     * the title becomes a language-specific placeholder, all other UUID
     * fields are nil, enum fields are set to their unknown variants, optional fields are omitted, and
     * timestamps are set to the Unix epoch.
     * Defaults to `false`.
     *
     */
    hidden: boolean;
    /**
     * The ID of the saved search filter that matched this product.
     * Present only when `matched` is `true`; omitted otherwise.
     *
     */
    userSearchFilterId?: string;
    /**
     * The user-defined name of the saved search filter that matched this product.
     * Present only when `matched` is `true`; omitted otherwise.
     *
     */
    userSearchFilterName?: string;
    /**
     * A human-readable explanation of why the saved search filter matched this product.
     * Only set for AI-enhanced filters (i.e. those with `search.enhancedSearchDescription`).
     * Present only when `matched` is `true` and an enhanced match reason exists; omitted otherwise.
     *
     */
    matchReason?: string;
    /**
     * Optional feedback previously recorded by the authenticated user for this saved-search match.
     * Present only when `matched` is `true` and feedback has been explicitly stored for the match.
     * `true` marks the match as relevant, `false` marks it as not relevant.
     *
     */
    matchFeedback?: boolean;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type SearchFilterUserStateData = { "matched": boolean; "hidden": boolean; "userSearchFilterId"?: string; "userSearchFilterName"?: string; "matchReason"?: string; "matchFeedback"?: boolean; };
```

```yaml
type: object
description: >
  User's saved-search-filter match state for a product.

  When `matched` is `true`, at least one of the user's saved search filters
  matched this product.

  `userSearchFilterId`, `userSearchFilterName`, `matchReason`, and
  `matchFeedback` are only

  present when `matched` is `true`.

  Defaults to `matched: false` when the user has no saved search filters or none
  of them matched.

  When `hidden` is `true`, the match exceeds the user's monthly search-filter
  match quota and the

  product data is anonymized (valid synthetic object IDs, placeholder title,
  unknown enums, nulled timestamps).

  Only matches ranked beyond the quota (by ascending match creation time) are
  hidden;

  the first N matches (where N is the user's tier quota) remain fully visible.
required:
  - matched
  - hidden
properties:
  matched:
    type: boolean
    description: Whether any of the user's saved search filters matched this
      product. Defaults to `false`.
    default: false
    example: true
  hidden:
    type: boolean
    description: >
      Whether this match is hidden because the user has exceeded their monthly
      search-filter match quota.

      When `true`, the product data in the response is anonymized: object-ID
      fields are replaced with valid synthetic IDs using their documented
      prefixes,

      the title becomes a language-specific placeholder, enum fields are set to
      their unknown variants, optional fields are omitted, and

      timestamps are set to the Unix epoch.

      Defaults to `false`.
    default: false
    example: false
  userSearchFilterId:
    type: string
    description: |
      The ID of the saved search filter that matched this product.
      Present only when `matched` is `true`; omitted otherwise.
    example: sf_4hyqf0gyxveazss7nby5hve5x2
  userSearchFilterName:
    type: string
    description: >
      The user-defined name of the saved search filter that matched this
      product.

      Present only when `matched` is `true`; omitted otherwise.
    example: Vintage Art Deco
  matchReason:
    type: string
    description: >
      A human-readable explanation of why the saved search filter matched this
      product.

      Only set for AI-enhanced filters (i.e. those with
      `search.enhancedSearchDescription`).

      Present only when `matched` is `true` and an enhanced match reason exists;
      omitted otherwise.
    example: Product matches the vintage Art Deco style described in your search filter.
  matchFeedback:
    type: boolean
    description: >
      Optional feedback previously recorded by the authenticated user for this
      saved-search match.

      Present only when `matched` is `true` and feedback has been explicitly
      stored for the match.

      `true` marks the match as relevant, `false` marks it as not relevant.
    example: true

```


## LocalizedTextData → LocalizedTextData

Old generated shape:

```ts
type LocalizedTextData = {
    /**
     * The text content
     */
    text: string;
    language: LanguageData;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type LocalizedTextData = { "text": string; "language": LanguageData; };
```

```yaml
type: object
description: Text content with language information
required:
  - text
  - language
properties:
  text:
    type: string
    description: The text content
  language:
    $ref: "#/components/schemas/LanguageData"

```


## PriceData → PriceData

Old generated shape:

```ts
type PriceData = {
    currency: CurrencyData;
    /**
     * Price amount in minor currency units (e.g., cents for most supported currencies, whole yen for JPY)
     */
    amount: number;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PriceData = { "currency": CurrencyData; "amount": number; };
```

```yaml
type: object
description: Price information with currency
required:
  - currency
  - amount
properties:
  currency:
    $ref: "#/components/schemas/CurrencyData"
  amount:
    type: integer
    description: Price amount in minor currency units (e.g., cents for most
      supported currencies, whole yen for JPY)
    minimum: 0
    example: 2999

```


## ProductCreatedEventPayloadData → (absent)

Old generated shape:

```ts
type ProductCreatedEventPayloadData = {
    state: ProductStateData;
    price?: PriceData;
};
```


## ProductEventStateChangedPayloadData → (absent)

Old generated shape:

```ts
type ProductEventStateChangedPayloadData = {
    oldState: ProductStateData;
    newState: ProductStateData;
};
```


## ProductEventPriceChangedPayloadData → (absent)

Old generated shape:

```ts
type ProductEventPriceChangedPayloadData = {
    /**
     * The previous price. Absent when this is the first price discovery.
     */
    oldPrice?: PriceData | null;
    /**
     * The new price. Absent when the price is removed.
     */
    newPrice?: PriceData | null;
};
```


## ProductEventEstimatePriceChangedPayloadData → (absent)

Old generated shape:

```ts
type ProductEventEstimatePriceChangedPayloadData = {
    /**
     * The updated lower bound of the estimated price range. Absent if this field was not changed.
     */
    priceEstimateMin?: PriceData | null;
    /**
     * The updated upper bound of the estimated price range. Absent if this field was not changed.
     */
    priceEstimateMax?: PriceData | null;
};
```


## ProductEventUrlChangedPayloadData → (absent)

Old generated shape:

```ts
type ProductEventUrlChangedPayloadData = {
    /**
     * The new URL of the product on the shop's website.
     */
    url: string;
};
```


## ProductEventImagesChangedPayloadData → (absent)

Old generated shape:

```ts
type ProductEventImagesChangedPayloadData = {
    /**
     * The complete updated list of product images.
     */
    images: Array<ProductImageData>;
};
```


## ProductEventAuctionTimeChangedPayloadData → (absent)

Old generated shape:

```ts
type ProductEventAuctionTimeChangedPayloadData = {
    /**
     * Updated RFC3339 auction start timestamp. Absent if this field was not changed.
     */
    auctionStart?: string | null;
    /**
     * Updated RFC3339 auction end timestamp. Absent if this field was not changed.
     */
    auctionEnd?: string | null;
};
```


## GetProductEventData → ProductListingHistoryEntryData

Old generated shape:

```ts
type GetProductEventData = {
    eventType: ProductEventTypeData;
    /**
     * Unique internal identifier for the product
     */
    productId: string;
    /**
     * Unique identifier for this event
     */
    eventId: string;
    /**
     * Unique identifier of the shop
     */
    shopId: string;
    /**
     * Unique identifier of the seller associated with the product event
     */
    sellerId: string;
    /**
     * Shop's unique identifier for the product. Can be any arbitrary string.
     */
    shopsProductId: string;
    payload: ProductEventPayloadData;
    /**
     * When the event occurred (RFC3339 format)
     */
    timestamp: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingHistoryEntryData = { "eventType": ProductListingHistoryEntryTypeData; "productListingId": string; "eventId": string; "payload": ProductListingHistoryPayloadData; "timestamp": string; };
```

```yaml
type: object
description: One immutable committed ProductListing domain-history entry.
required:
  - eventType
  - productListingId
  - eventId
  - payload
  - timestamp
properties:
  eventType:
    $ref: "#/components/schemas/ProductListingHistoryEntryTypeData"
  productListingId:
    type: string
    description: Unique internal ProductListing identifier
  eventId:
    type: string
    description: Unique identifier for this committed event
  payload:
    $ref: "#/components/schemas/ProductListingHistoryPayloadData"
  timestamp:
    type: string
    format: date-time
    description: When the event occurred (RFC3339 format)

```


## LanguageData → LanguageData

Old generated shape:

```ts
type LanguageData = 'de' | 'en' | 'fr' | 'es' | 'it' | 'zh' | 'pt' | 'pl' | 'tr' | 'nl' | 'cs' | 'ja' | 'ru' | 'ar';
```

Target shape (readable projection; exact constraints follow):

```ts
type LanguageData = "de" | "en" | "fr" | "es" | "it" | "zh" | "pt" | "pl" | "tr" | "nl" | "cs" | "ja" | "ru" | "ar";
```

```yaml
type: string
enum:
  - de
  - en
  - fr
  - es
  - it
  - zh
  - pt
  - pl
  - tr
  - nl
  - cs
  - ja
  - ru
  - ar
description: >
  Supported language codes (ISO 639-1 canonical values):

  - de: German (includes de-DE, de-AT, de-CH, de-LU, de-LI)

  - en: English (includes en-US, en-GB, en-AU, en-CA, en-NZ, and
  backend-specific accepted alias en_IE)

  - fr: French (includes fr-FR, fr-CA, fr-BE, fr-CH, fr-LU)

  - es: Spanish (includes es-ES, es-MX, es-AR, es-CO, es-CL, es-PE, es-VE)

  - it: Italian (includes it-IT, it-CH)

  - zh: Chinese (Simplified) (includes zh-CN, zh-Hans)

  - pt: Portuguese (includes pt-PT, pt-BR)

  - pl: Polish (includes pl-PL)

  - tr: Turkish (includes tr-TR)

  - nl: Dutch (includes nl-NL, nl-BE)

  - cs: Czech (includes cs-CZ)

  - ja: Japanese (includes ja-JP)

  - ru: Russian (includes ru-RU)

  - ar: Arabic (includes ar-SA, ar-EG, ar-AE)


  `de`, `en`, `fr`, `es`, and `it` are fully supported
  localization/translation-target languages.

  `zh`, `pt`, `pl`, `tr`, `nl`, `cs`, `ja`, `ru`, and `ar` are ingestion-only
  languages:

  they can appear in stored/native content and are accepted anywhere
  `LanguageData` is used,

  but backend-generated translations and fallback localized strings are not
  produced in these languages.
default: en
example: de

```


## CurrencyData → CurrencyData

Old generated shape:

```ts
type CurrencyData = 'EUR' | 'GBP' | 'USD' | 'AUD' | 'CAD' | 'NZD' | 'CNY' | 'BRL' | 'PLN' | 'TRY' | 'JPY' | 'CZK' | 'RUB' | 'AED' | 'SAR' | 'HKD' | 'SGD' | 'CHF';
```

Target shape (readable projection; exact constraints follow):

```ts
type CurrencyData = "EUR" | "GBP" | "USD" | "AUD" | "CAD" | "NZD" | "CNY" | "BRL" | "PLN" | "TRY" | "JPY" | "CZK" | "RUB" | "AED" | "SAR" | "HKD" | "SGD" | "CHF";
```

```yaml
type: string
enum:
  - EUR
  - GBP
  - USD
  - AUD
  - CAD
  - NZD
  - CNY
  - BRL
  - PLN
  - TRY
  - JPY
  - CZK
  - RUB
  - AED
  - SAR
  - HKD
  - SGD
  - CHF
description: |
  Supported currencies (ISO 4217 codes):
  - EUR: Euro
  - GBP: British Pound
  - USD: US Dollar
  - AUD: Australian Dollar
  - CAD: Canadian Dollar
  - NZD: New Zealand Dollar
  - CNY: Chinese Yuan
  - BRL: Brazilian Real
  - PLN: Polish Złoty
  - TRY: Turkish Lira
  - JPY: Japanese Yen
  - CZK: Czech Koruna
  - RUB: Russian Ruble
  - AED: UAE Dirham
  - SAR: Saudi Riyal
  - HKD: Hong Kong Dollar
  - SGD: Singapore Dollar
  - CHF: Swiss Franc
default: EUR
example: EUR

```


## MeasurementUnitData → MeasurementUnitData

Old generated shape:

```ts
type MeasurementUnitData = 'METRIC' | 'IMPERIAL';
```

Target shape (readable projection; exact constraints follow):

```ts
type MeasurementUnitData = "METRIC" | "IMPERIAL";
```

```yaml
type: string
enum:
  - METRIC
  - IMPERIAL
description: |
  User preference for distance/size presentation:
  - METRIC: Metric units.
  - IMPERIAL: Imperial units.
default: METRIC
example: METRIC

```


## ProductStateData → ListingAvailabilityData

Old generated shape:

```ts
type ProductStateData = 'LISTED' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'REMOVED' | 'UNKNOWN';
```

Target shape (readable projection; exact constraints follow):

```ts
type ListingAvailabilityData = "AVAILABLE" | "IN_STOCK" | "LIMITED_AVAILABILITY" | "BACK_ORDER" | "MADE_TO_ORDER" | "PRE_ORDER" | "PRE_SALE" | "UNAVAILABLE" | "RESERVED" | "OUT_OF_STOCK" | "SOLD_OUT";
```

```yaml
type: string
enum:
  - AVAILABLE
  - IN_STOCK
  - LIMITED_AVAILABILITY
  - BACK_ORDER
  - MADE_TO_ORDER
  - PRE_ORDER
  - PRE_SALE
  - UNAVAILABLE
  - RESERVED
  - OUT_OF_STOCK
  - SOLD_OUT
description: Current reliable source assertion of listing purchase availability.
  Omitted or `null` means Aura has no reliable current assertion.
example: IN_STOCK

```


## ProductLifecycleData → ListingLifecycleData

Old generated shape:

```ts
type ProductLifecycleData = 'ACTIVE' | 'DELETED';
```

Target shape (readable projection; exact constraints follow):

```ts
type ListingLifecycleData = "ACTIVE" | "WITHDRAWN";
```

```yaml
type: string
enum:
  - ACTIVE
  - WITHDRAWN
description: |
  Source-catalog membership of a ProductListing:
  - ACTIVE: The listing is currently offered by its authoritative source.
  - WITHDRAWN: The listing is retained for history but is no longer offered.
example: ACTIVE

```


## AuctionData → AuctionData

Old generated shape:

```ts
type AuctionData = {
    /**
     * Start datetime of the auction window for this product (RFC3339 format).
     * Only present for products from auction houses with scheduled auction start times.
     * Used to indicate when bidding begins or when the item will be auctioned.
     *
     */
    start?: string | null;
    /**
     * End datetime of the auction window for this product (RFC3339 format).
     * Only present for products from auction houses with scheduled auction end times.
     * Used to indicate when bidding ends or when the auction session concludes.
     *
     */
    end?: string | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type AuctionData = { "start"?: string | null; "end"?: string | null; };
```

```yaml
type: object
description: >
  Auction time window information for product-listings from auction houses.

  Contains optional start and end timestamps for scheduled auctions.

  At least one of the fields (start or end) must be present when this object is
  included.
properties:
  start:
    type: string
    format: date-time
    nullable: true
    description: >
      Start datetime of the auction window for this product (RFC3339 format).

      Only present for product-listings from auction houses with scheduled
      auction start times.

      Used to indicate when bidding begins or when the item will be auctioned.
    example: 2025-05-01T12:00:00Z
  end:
    type: string
    format: date-time
    nullable: true
    description: >
      End datetime of the auction window for this product (RFC3339 format).

      Only present for product-listings from auction houses with scheduled
      auction end times.

      Used to indicate when bidding ends or when the auction session concludes.
    example: 2025-05-10T12:00:00Z

```


## PriceEstimateData → PriceEstimateData

Old generated shape:

```ts
type PriceEstimateData = {
    /**
     * Optional minimum estimated price for the product
     */
    min?: PriceData | null;
    /**
     * Optional maximum estimated price for the product
     */
    max?: PriceData | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PriceEstimateData = { "min"?: PriceData | null; "max"?: PriceData | null; };
```

```yaml
type: object
description: |
  Price estimate range for a product.
  Contains optional minimum and maximum estimated prices.
properties:
  min:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true
    description: Optional minimum estimated price for the product
  max:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true
    description: Optional maximum estimated price for the product

```


## PricingData → PricingData

Old generated shape:

```ts
type PricingData = {
    /**
     * The actual offer or asking price for the product.
     * This is the price at which the product is currently being sold.
     *
     */
    offer?: PriceData | null;
    /**
     * Optional price estimate range.
     * Common for auction items where an estimated value range is provided.
     *
     */
    estimate?: PriceEstimateData | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PricingData = { "offer"?: PriceData | null; "estimate"?: PriceEstimateData | null; };
```

```yaml
type: object
description: |
  Complete pricing information for a product.
  Contains both the offer price and optional price estimates.
properties:
  offer:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true
    description: |
      The actual offer or asking price for the product.
      This is the price at which the product is currently being sold.
  estimate:
    allOf:
      - $ref: "#/components/schemas/PriceEstimateData"
    nullable: true
    description: |
      Optional price estimate range.
      Common for auction items where an estimated value range is provided.

```


## ProhibitedContentData → ContentPolicyData

Old generated shape:

```ts
type ProhibitedContentData = 'UNKNOWN' | 'NONE' | 'NAZI_GERMANY';
```

Target shape (readable projection; exact constraints follow):

```ts
type ContentPolicyData = { "decision": "ALLOWED"; } | { "decision": "REQUIRES_CONSENT"; "category": "NAZI_GERMANY"; };
```

```yaml
oneOf:
  - type: object
    required:
      - decision
    properties:
      decision:
        type: string
        enum:
          - ALLOWED
  - type: object
    required:
      - decision
      - category
    properties:
      decision:
        type: string
        enum:
          - REQUIRES_CONSENT
      category:
        type: string
        enum:
          - NAZI_GERMANY
description: Listing-level content decision. This schema is used only when the
  listing has an assessment.

```


## ShopTypeData → (absent)

Old generated shape:

```ts
type ShopTypeData = 'AUCTION_HOUSE' | 'AUCTION_PLATFORM' | 'COMMERCIAL_DEALER' | 'MARKETPLACE';
```


## ShopPartnerStatusData → (absent)

Old generated shape:

```ts
type ShopPartnerStatusData = 'SCRAPED' | 'PARTNERED';
```


## ProductImageData → ProductListingImageData

Old generated shape:

```ts
type ProductImageData = {
    /**
     * URL to the product image.
     * Absent when the image has prohibited content (`prohibitedContent != "NONE"`) and the user has not given consent (`prohibitedContent.consent == false`).
     *
     */
    url?: string;
    prohibitedContent: ProhibitedContentData;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingImageData = { "url": string | null; };
```

```yaml
type: object
description: Product image after viewer-specific presentation.
required:
  - url
properties:
  url:
    type: string
    format: uri
    nullable: true
    description: URL to the product image, or `null` when it is not shown to this viewer.
    example: https://my-listing-source.com/images/product-1.jpg

```


## SortProductFieldData → SortProductListingFieldData

Old generated shape:

```ts
type SortProductFieldData = 'score' | 'price' | 'updated' | 'created';
```

Target shape (readable projection; exact constraints follow):

```ts
type SortProductListingFieldData = "score" | "updated" | "created";
```

```yaml
type: string
enum:
  - score
  - updated
  - created
description: >
  Fields available for sorting:

  - score: Sort by relevance score (default, only available when searching with
  text query)

  - updated: Sort by last updated timestamp

  - created: Sort by creation timestamp
default: score
example: updated

```


## ProductEventTypeData → ProductListingHistoryEntryTypeData

Old generated shape:

```ts
type ProductEventTypeData = 'CREATED' | 'STATE_CHANGED' | 'PRICE_CHANGED' | 'ESTIMATE_PRICE_CHANGED' | 'URL_CHANGED' | 'IMAGES_CHANGED' | 'AUCTION_TIME_CHANGED';
```

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingHistoryEntryTypeData = "PRODUCT_LISTING_DISCOVERED" | "PRODUCT_LISTING_CHANGED";
```

```yaml
type: string
enum:
  - PRODUCT_LISTING_DISCOVERED
  - PRODUCT_LISTING_CHANGED
description: Canonical ProductListing domain-history entry type.
example: PRODUCT_LISTING_CHANGED

```


## ProductEventPayloadData → ProductListingHistoryPayloadData

Old generated shape:

```ts
type ProductEventPayloadData = ProductCreatedEventPayloadData | ProductEventStateChangedPayloadData | ProductEventPriceChangedPayloadData | ProductEventEstimatePriceChangedPayloadData | ProductEventUrlChangedPayloadData | ProductEventImagesChangedPayloadData | ProductEventAuctionTimeChangedPayloadData;
```

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingHistoryPayloadData = ProductListingDiscoveryHistoryPayloadData | ProductListingChangedHistoryPayloadData;
```

```yaml
oneOf:
  - $ref: "#/components/schemas/ProductListingDiscoveryHistoryPayloadData"
  - $ref: "#/components/schemas/ProductListingChangedHistoryPayloadData"
description: Immutable semantic history payload. It never contains image URLs or
  enrichment data.

```


## ApiError → ApiError

Old generated shape:

```ts
type ApiError = {
    /**
     * HTTP status code
     */
    status: number;
    /**
     * HTTP status code in human-readable form
     */
    title: string;
    /**
     * Error code identifier
     */
    error: string;
    source?: ApiErrorSource;
    /**
     * Human-readable error message
     */
    detail?: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type ApiError = { "status": number; "title": string; "error": string; "source"?: ApiErrorSource; "detail"?: string; };
```

```yaml
type: object
description: Standard error response format (RFC 9457)
required:
  - status
  - title
  - error
properties:
  status:
    type: integer
    description: HTTP status code
    example: 400
  title:
    type: string
    description: HTTP status code in human-readable form
    example: Bad Request
  error:
    type: string
    description: Error code identifier
    example: BAD_PARAMETER
  source:
    $ref: "#/components/schemas/ApiErrorSource"
  detail:
    type: string
    description: Human-readable error message
    example: "Expected any of: 'true' or 'false'. Got: 'invalid'"

```


## ApiErrorSource → ApiErrorSource

Old generated shape:

```ts
type ApiErrorSource = {
    /**
     * Name of the field that caused the error
     */
    field: string;
    /**
     * Type of parameter that caused the error
     */
    sourceType: 'query' | 'path' | 'header' | 'body';
};
```

Target shape (readable projection; exact constraints follow):

```ts
type ApiErrorSource = { "field": string; "type": "QUERY" | "PATH" | "HEADER" | "BODY"; };
```

```yaml
type: object
description: Information about the source of the error
required:
  - field
  - type
properties:
  field:
    type: string
    description: Name of the field that caused the error
    example: listingSourceId
  type:
    type: string
    enum:
      - QUERY
      - PATH
      - HEADER
      - BODY
    description: Type of parameter that caused the error
    example: PATH

```


## ProductSearchData → ProductListingSearchData

Old generated shape:

```ts
type ProductSearchData = {
    language?: LanguageData;
    currency?: CurrencyData;
    /**
     * Optional text queries for searching products. Multiple entries are ORed together. Empty list means no text query.
     */
    productQuery?: Array<string>;
    /**
     * Optional natural-language description used by the AI-enhanced search filter matching service.
     * When provided on a saved search filter, a language model evaluates each matched product against
     * this description and only keeps products that are a true match, attaching a user-facing reason
     * to every confirmed hit.
     * Whitespace is trimmed and the value is silently truncated to 1000 characters if longer.
     *
     */
    enhancedSearchDescription?: string | null;
    /**
     * Optional product IDs to exclude from search results.
     */
    excludeProductId?: Array<string>;
    /**
     * Optional filter by exact shop names (keyword matching).
     * Filters products to only those from shops with names exactly matching one of the provided values.
     * This is an exact match filter, not a fuzzy text search.
     *
     */
    shopName?: Array<string>;
    /**
     * Optional filter to exclude products from specific shop names (keyword matching).
     * Products from shops with names exactly matching one of the provided values will be excluded from results.
     * This is an exact match filter, not a fuzzy text search.
     * Empty array means no shops are excluded.
     *
     */
    excludeShopName?: Array<string>;
    /**
     * Optional filter by exact seller names (keyword matching).
     * Filters products to only those from sellers with names exactly matching one of the provided values.
     * This is an exact match filter, not a fuzzy text search.
     * Applied independently from `shopName` filters.
     *
     */
    sellerName?: Array<string>;
    /**
     * Optional filter to exclude products from specific seller names (keyword matching).
     * Products from sellers with names exactly matching one of the provided values will be excluded from results.
     * This is an exact match filter, not a fuzzy text search.
     * Applied independently from `excludeShopName` filters.
     * Empty array means no sellers are excluded.
     *
     */
    excludeSellerName?: Array<string>;
    /**
     * Optional filter by exact shop slug identifiers.
     * Filters products to only those whose `shopSlugId` exactly matches one of the provided kebab-case values.
     *
     */
    shopSlugId?: Array<string>;
    /**
     * Optional filter to exclude products from specific shop slug identifiers.
     * Products whose `shopSlugId` exactly matches one of the provided kebab-case values are excluded from results.
     *
     */
    excludeShopSlugId?: Array<string>;
    /**
     * Optional filter by exact seller slug identifiers.
     * Filters products to only those whose seller slug ID exactly matches one of the provided kebab-case values.
     *
     */
    sellerSlugId?: Array<string>;
    /**
     * Optional filter to exclude products from specific seller slug identifiers.
     * Products whose seller slug ID exactly matches one of the provided kebab-case values are excluded from results.
     *
     */
    excludeSellerSlugId?: Array<string>;
    /**
     * Optional filter by shop types
     */
    shopType?: Array<ShopTypeData> | null;
    /**
     * Optional filter by one or more structured-address country codes of the selling shop.
     * Uses ISO 3166-1 alpha-2 codes.
     *
     */
    country?: Array<CountryCodeData>;
    /**
     * Optional filter by one or more structured-address continents of the selling shop.
     */
    continent?: Array<ContinentData>;
    /**
     * Optional geospatial proximity filter for the selling shop's indexed coordinates.
     * Matches products whose indexed shop coordinates fall within the given distance of the provided point.
     *
     */
    geoAddress?: GeoDistanceQueryData | null;
    /**
     * Optional price range filter in minor currency units for the selected/requested currency
     */
    price?: RangeQueryUInt64 | null;
    /**
     * Optional filter by product states
     */
    state?: Array<ProductStateData> | null;
    /**
     * Optional filter by product creation date range
     */
    created?: RangeQueryDateTime | null;
    /**
     * Optional filter by product last updated date range
     */
    updated?: RangeQueryDateTime | null;
    /**
     * Optional filter by auction start datetime range.
     * Filters products by when their auction windows begin.
     * Only matches products that have auction start times set.
     *
     */
    auctionStart?: RangeQueryDateTime | null;
    /**
     * Optional filter by auction end datetime range.
     * Filters products by when their auction windows end.
     * Only matches products that have auction end times set.
     *
     */
    auctionEnd?: RangeQueryDateTime | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingSearchData = { "language"?: LanguageData; "currency"?: CurrencyData; "productQuery"?: Array<string>; "enhancedSearchDescription"?: string | null; "excludeProductId"?: Array<string>; "listingSourceId"?: Array<string>; "excludeListingSourceId"?: Array<string>; "price"?: RangeQueryUInt64 | null; "availability"?: Array<ListingAvailabilityData> | null; "orderability"?: Array<ListingOrderabilityData> | null; "includeUnspecifiedAvailability"?: boolean | null; "created"?: RangeQueryDateTime | null; "updated"?: RangeQueryDateTime | null; "auctionStart"?: RangeQueryDateTime | null; "auctionEnd"?: RangeQueryDateTime | null; };
```

```yaml
type: object
description: ProductListing search criteria used by saved search filters.
properties:
  language:
    $ref: "#/components/schemas/LanguageData"
  currency:
    $ref: "#/components/schemas/CurrencyData"
  productQuery:
    type: array
    items:
      type: string
      minLength: 1
  enhancedSearchDescription:
    type: string
    minLength: 1
    maxLength: 1000
    nullable: true
  excludeProductId:
    type: array
    items:
      type: string
    uniqueItems: true
    description: ProductListing IDs to exclude.
  listingSourceId:
    type: array
    items:
      type: string
    uniqueItems: true
    description: ListingSource IDs to include.
  excludeListingSourceId:
    type: array
    items:
      type: string
    uniqueItems: true
    description: ListingSource IDs to exclude.
  price:
    allOf:
      - $ref: "#/components/schemas/RangeQueryUInt64"
    nullable: true
  availability:
    type: array
    items:
      $ref: "#/components/schemas/ListingAvailabilityData"
    uniqueItems: true
    nullable: true
  orderability:
    type: array
    items:
      $ref: "#/components/schemas/ListingOrderabilityData"
    uniqueItems: true
    nullable: true
  includeUnspecifiedAvailability:
    type: boolean
    nullable: true
  created:
    allOf:
      - $ref: "#/components/schemas/RangeQueryDateTime"
    nullable: true
  updated:
    allOf:
      - $ref: "#/components/schemas/RangeQueryDateTime"
    nullable: true
  auctionStart:
    allOf:
      - $ref: "#/components/schemas/RangeQueryDateTime"
    nullable: true
  auctionEnd:
    allOf:
      - $ref: "#/components/schemas/RangeQueryDateTime"
    nullable: true

```


## PostUserSearchFilterData → PostUserSearchFilterData

Old generated shape:

```ts
type PostUserSearchFilterData = {
    /**
     * User-defined name for the search filter (max 255 characters, will be truncated if longer)
     */
    name: string;
    search: ProductSearchData;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PostUserSearchFilterData = { "name": string; "search": ProductListingSearchData; };
```

```yaml
type: object
description: Request body for creating a new search filter
required:
  - name
  - search
properties:
  name:
    type: string
    description: User-defined name for the search filter (max 255 characters, will
      be truncated if longer)
    maxLength: 255
    example: My Tech Store Search
  search:
    $ref: "#/components/schemas/ProductListingSearchData"

```


## PatchUserSearchFilterData → PatchUserSearchFilterData

Old generated shape:

```ts
type PatchUserSearchFilterData = {
    /**
     * User-defined name for the search filter (max 255 characters, will be truncated if longer)
     */
    name?: string | null;
    /**
     * Whether to enable or disable email/push notifications for new products matching this search filter.
     * When `true`, the user will be notified when a new product matches this filter.
     * When `false`, no notifications are sent for this filter.
     * Omit to leave unchanged.
     *
     */
    notifications?: boolean | null;
    /**
     * Optional activation state update for this saved search filter.
     * `ACTIVE` reactivates the filter if the current user tier still permits the configured search features and quota.
     * `INACTIVE_BY_USER` manually disables the filter.
     * Omit to leave the current state unchanged.
     *
     */
    state?: PatchResourceStateData | null;
    /**
     * Partial search filter criteria to update
     */
    search?: PatchProductSearchData | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PatchUserSearchFilterData = { "name"?: string | null; "notifications"?: boolean | null; "state"?: PatchResourceStateData | null; "search"?: PatchProductListingSearchData | null; };
```

```yaml
type: object
description: >
  Partial search filter update data.

  All fields are optional and only provided fields will be updated.

  Can update the search filter name, notifications preference, activation state,
  and/or the search filter criteria.
properties:
  name:
    type: string
    description: User-defined name for the search filter (max 255 characters, will
      be truncated if longer)
    maxLength: 255
    nullable: true
    example: Updated Filter Name
  notifications:
    type: boolean
    nullable: true
    description: >
      Whether to enable or disable email notifications for new product-listings
      matching this search filter.

      When `true`, the user will be notified when a new product matches this
      filter.

      When `false`, no notifications are sent for this filter.

      Omit to leave unchanged.
    example: true
  state:
    allOf:
      - $ref: "#/components/schemas/PatchResourceStateData"
    nullable: true
    description: >
      Optional activation state update for this saved search filter.

      `ACTIVE` reactivates the filter if the current user tier still permits the
      configured search features and quota.

      `INACTIVE_BY_USER` manually disables the filter.

      Omit to leave the current state unchanged.
  search:
    allOf:
      - $ref: "#/components/schemas/PatchProductListingSearchData"
    nullable: true
    description: Partial search filter criteria to update

```


## PatchUserSearchFilterMatchData → PatchUserSearchFilterMatchData

Old generated shape:

```ts
type PatchUserSearchFilterMatchData = {
    /**
     * Optional relevance feedback for the matched product.
     * `true` marks the product as relevant to the saved search filter, `false` marks it as not relevant.
     *
     */
    feedback?: boolean | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PatchUserSearchFilterMatchData = { "feedback"?: boolean | null; };
```

```yaml
type: object
description: |
  Partial update payload for a saved-search product match.
  Omitting `feedback` leaves the stored match feedback unchanged.
properties:
  feedback:
    type: boolean
    nullable: true
    description: >
      Optional relevance feedback for the matched product.

      `true` marks the product as relevant to the saved search filter, `false`
      marks it as not relevant.
    example: true

```


## PatchProductSearchData → PatchProductListingSearchData

Old generated shape:

```ts
type PatchProductSearchData = {
    /**
     * Language for search and localized content
     */
    language?: LanguageData | null;
    /**
     * Currency for price display
     */
    currency?: CurrencyData | null;
    /**
     * Text queries for searching products. Multiple entries are ORed together. Empty list clears the text query when patching.
     */
    productQuery?: Array<string> | null;
    /**
     * Optional natural-language description used by the AI-enhanced search filter matching service.
     * When provided on a saved search filter, a language model evaluates each matched product against
     * this description and only keeps products that are a true match, attaching a user-facing reason
     * to every confirmed hit.
     * Whitespace is trimmed and the value is silently truncated to 1000 characters if longer.
     * Omit to leave unchanged.
     *
     */
    enhancedSearchDescription?: string | null;
    /**
     * Optional filter by exact shop names (keyword matching).
     * Filters products to only those from shops with names exactly matching one of the provided values.
     * This is an exact match filter, not a fuzzy text search.
     *
     */
    shopName?: Array<string> | null;
    /**
     * Optional filter to exclude products from specific shop names (keyword matching).
     * Products from shops with names exactly matching one of the provided values will be excluded from results.
     * This is an exact match filter, not a fuzzy text search.
     *
     */
    excludeShopName?: Array<string> | null;
    /**
     * Optional filter by exact seller names (keyword matching).
     * Filters products to only those from sellers with names exactly matching one of the provided values.
     * This is an exact match filter, not a fuzzy text search.
     * Applied independently from `shopName` filters.
     *
     */
    sellerName?: Array<string> | null;
    /**
     * Optional filter to exclude products from specific seller names (keyword matching).
     * Products from sellers with names exactly matching one of the provided values will be excluded from results.
     * This is an exact match filter, not a fuzzy text search.
     * Applied independently from `excludeShopName` filters.
     *
     */
    excludeSellerName?: Array<string> | null;
    /**
     * Optional filter by exact shop slug identifiers.
     * Filters products to only those whose `shopSlugId` exactly matches one of the provided kebab-case values.
     *
     */
    shopSlugId?: Array<string> | null;
    /**
     * Optional filter to exclude products from specific shop slug identifiers.
     * Products whose `shopSlugId` exactly matches one of the provided kebab-case values are excluded from results.
     *
     */
    excludeShopSlugId?: Array<string> | null;
    /**
     * Optional filter by exact seller slug identifiers.
     * Filters products to only those whose seller slug ID exactly matches one of the provided kebab-case values.
     *
     */
    sellerSlugId?: Array<string> | null;
    /**
     * Optional filter to exclude products from specific seller slug identifiers.
     * Products whose seller slug ID exactly matches one of the provided kebab-case values are excluded from results.
     *
     */
    excludeSellerSlugId?: Array<string> | null;
    /**
     * Optional filter by shop types
     */
    shopType?: Array<ShopTypeData> | null;
    /**
     * Optional replacement filter by structured-address country codes of the selling shop.
     */
    country?: Array<CountryCodeData> | null;
    /**
     * Optional replacement filter by structured-address continents of the selling shop.
     */
    continent?: Array<ContinentData> | null;
    /**
     * Optional replacement geo-distance filter for the selling shop's indexed coordinates.
     */
    geoAddress?: GeoDistanceQueryData | null;
    /**
     * Optional price range filter in minor currency units for the selected/requested currency
     */
    price?: RangeQueryUInt64 | null;
    /**
     * Optional filter by product states
     */
    state?: Array<ProductStateData> | null;
    /**
     * Optional filter by product creation date range
     */
    created?: RangeQueryDateTime | null;
    /**
     * Optional filter by product last updated date range
     */
    updated?: RangeQueryDateTime | null;
    /**
     * Optional filter by auction start datetime range.
     * Filters products by when their auction windows begin.
     * Only matches products that have auction start times set.
     *
     */
    auctionStart?: RangeQueryDateTime | null;
    /**
     * Optional filter by auction end datetime range.
     * Filters products by when their auction windows end.
     * Only matches products that have auction end times set.
     *
     */
    auctionEnd?: RangeQueryDateTime | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PatchProductListingSearchData = { "language"?: LanguageData | null; "currency"?: CurrencyData | null; "productQuery"?: Array<string> | null; "enhancedSearchDescription"?: string | null; "listingSourceId"?: Array<string> | null; "excludeListingSourceId"?: Array<string> | null; "price"?: RangeQueryUInt64 | null; "availability"?: Array<ListingAvailabilityData> | null; "orderability"?: Array<ListingOrderabilityData> | null; "includeUnspecifiedAvailability"?: boolean | null; "created"?: RangeQueryDateTime | null; "updated"?: RangeQueryDateTime | null; "auctionStart"?: RangeQueryDateTime | null; "auctionEnd"?: RangeQueryDateTime | null; };
```

```yaml
type: object
description: Partial ProductListing search criteria. Omitted fields are
  unchanged. `enhancedSearchDescription`, price, date ranges, and the
  availability query may be cleared with `null`; availability, orderability, and
  includeUnspecifiedAvailability` must be supplied together or all be `null`.
properties:
  language:
    $ref: "#/components/schemas/LanguageData"
    nullable: true
  currency:
    $ref: "#/components/schemas/CurrencyData"
    nullable: true
  productQuery:
    type: array
    items:
      type: string
      minLength: 1
    nullable: true
  enhancedSearchDescription:
    type: string
    minLength: 1
    maxLength: 1000
    nullable: true
  listingSourceId:
    type: array
    items:
      type: string
    uniqueItems: true
    description: ListingSource IDs to include.
    nullable: true
  excludeListingSourceId:
    type: array
    items:
      type: string
    uniqueItems: true
    description: ListingSource IDs to exclude.
    nullable: true
  price:
    allOf:
      - $ref: "#/components/schemas/RangeQueryUInt64"
    nullable: true
  availability:
    type: array
    items:
      $ref: "#/components/schemas/ListingAvailabilityData"
    uniqueItems: true
    nullable: true
  orderability:
    type: array
    items:
      $ref: "#/components/schemas/ListingOrderabilityData"
    uniqueItems: true
    nullable: true
  includeUnspecifiedAvailability:
    type: boolean
    nullable: true
  created:
    allOf:
      - $ref: "#/components/schemas/RangeQueryDateTime"
    nullable: true
  updated:
    allOf:
      - $ref: "#/components/schemas/RangeQueryDateTime"
    nullable: true
  auctionStart:
    allOf:
      - $ref: "#/components/schemas/RangeQueryDateTime"
    nullable: true
  auctionEnd:
    allOf:
      - $ref: "#/components/schemas/RangeQueryDateTime"
    nullable: true

```


## UserSearchFilterData → UserSearchFilterData

Old generated shape:

```ts
type UserSearchFilterData = {
    /**
     * Unique identifier of the user who owns this search filter
     */
    userId: string;
    /**
     * Unique identifier for this search filter
     */
    userSearchFilterId: string;
    /**
     * User-defined name for the search filter
     */
    name: string;
    /**
     * Whether notifications are enabled for this search filter.
     * When `true`, the user will be notified when a new product matches this filter.
     * When `false`, no notifications are sent for this filter.
     * Defaults to `true` for newly created filters.
     *
     */
    notifications: boolean;
    state: ResourceStateData;
    search: ProductSearchData;
    createdBy: ActorData;
    updatedBy: ActorData;
    /**
     * When the search filter was created (RFC3339 format)
     */
    created: string;
    /**
     * When the search filter was last updated (RFC3339 format)
     */
    updated: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type UserSearchFilterData = { "userId": string; "userSearchFilterId": string; "name": string; "notifications": boolean; "state": ResourceStateData; "search": ProductListingSearchData; "createdBy": ActorData; "updatedBy": ActorData; "created": string; "updated": string; };
```

```yaml
type: object
description: Complete user search filter with metadata
required:
  - userId
  - userSearchFilterId
  - name
  - notifications
  - state
  - search
  - createdBy
  - updatedBy
  - created
  - updated
properties:
  userId:
    type: string
    description: Unique identifier of the user who owns this search filter
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
  userSearchFilterId:
    type: string
    description: Unique identifier for this search filter
    example: sf_4hyqf0gyxveazss7nby5hve5x2
  name:
    type: string
    description: User-defined name for the search filter
    example: My Tech Store Search
  notifications:
    type: boolean
    description: >
      Whether notifications are enabled for this search filter.

      When `true`, the user will be notified when a new product matches this
      filter.

      When `false`, no notifications are sent for this filter.

      Defaults to `true` for newly created filters.
    example: true
  state:
    $ref: "#/components/schemas/ResourceStateData"
  search:
    $ref: "#/components/schemas/ProductListingSearchData"
  createdBy:
    $ref: "#/components/schemas/ActorData"
  updatedBy:
    $ref: "#/components/schemas/ActorData"
  created:
    type: string
    format: date-time
    description: When the search filter was created (RFC3339 format)
    example: 2024-01-01T10:00:00Z
  updated:
    type: string
    format: date-time
    description: When the search filter was last updated (RFC3339 format)
    example: 2024-01-01T12:00:00Z

```


## ResourceStateData → ResourceStateData

Old generated shape:

```ts
type ResourceStateData = 'ACTIVE' | 'INACTIVE_BY_USER' | 'INACTIVE_BY_RESTRICTED_PLAN';
```

Target shape (readable projection; exact constraints follow):

```ts
type ResourceStateData = "ACTIVE" | "INACTIVE_BY_USER" | "INACTIVE_BY_RESTRICTED_PLAN";
```

```yaml
type: string
description: >
  Activation state of a stored user-owned resource such as a saved search
  filter.

  `ACTIVE` resources are eligible for their normal runtime behavior.

  `INACTIVE_BY_USER` resources were explicitly deactivated by the user.

  `INACTIVE_BY_RESTRICTED_PLAN` resources remain stored but are inactive because
  the user's current tier no longer allows them to stay active.
enum:
  - ACTIVE
  - INACTIVE_BY_USER
  - INACTIVE_BY_RESTRICTED_PLAN
example: ACTIVE

```


## PatchResourceStateData → PatchResourceStateData

Old generated shape:

```ts
type PatchResourceStateData = 'ACTIVE' | 'INACTIVE_BY_USER';
```

Target shape (readable projection; exact constraints follow):

```ts
type PatchResourceStateData = "ACTIVE" | "INACTIVE_BY_USER";
```

```yaml
type: string
description: >
  Client-settable activation state for resources that support manual activation
  toggles.

  Clients may reactivate a resource with `ACTIVE` or manually disable it with
  `INACTIVE_BY_USER`.

  `INACTIVE_BY_RESTRICTED_PLAN` is managed internally by the backend and is
  never accepted from clients.
enum:
  - ACTIVE
  - INACTIVE_BY_USER
example: INACTIVE_BY_USER

```


## SearchFilterProductMatchData → SearchFilterProductMatchData

Old generated shape:

```ts
type SearchFilterProductMatchData = {
    /**
     * Unique identifier of the user who owns the matched search filter.
     */
    userId: string;
    /**
     * Unique identifier of the saved search filter that matched the product.
     */
    userSearchFilterId: string;
    /**
     * Unique identifier of the shop that owns the matched product.
     */
    shopId: string;
    /**
     * Shop's own identifier for the matched product.
     */
    shopsProductId: string;
    /**
     * Unique internal identifier of the matched product.
     */
    productId: string;
    /**
     * Optional feedback recorded by the user for this saved-search match.
     * Present only after the user has explicitly marked the match as relevant or not relevant.
     *
     */
    feedback?: boolean;
    createdBy: ActorData;
    updatedBy: ActorData;
    /**
     * When the search-filter product match was originally created (RFC3339 format).
     */
    created: string;
    /**
     * When the search-filter product match was last updated (RFC3339 format).
     */
    updated: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type SearchFilterProductMatchData = { "userId": string; "userSearchFilterId": string; "userSearchFilterName"?: string; "productListingId": string; "originEventId": string; "enhancedMatchReason"?: string; "feedback"?: boolean; "created": string; "updated": string; };
```

```yaml
type: object
description: Persisted match record for one of a user's saved search filters.
required:
  - userId
  - userSearchFilterId
  - productListingId
  - originEventId
  - created
  - updated
properties:
  userId:
    type: string
    description: Unique identifier of the user who owns the matched search filter.
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
  userSearchFilterId:
    type: string
    description: Unique identifier of the saved search filter that matched the product.
    example: sf_4hyqf0gyxveazss7nby5hve5x2
  userSearchFilterName:
    type: string
    description: Saved-search name captured with the match, when available.
    example: Golden Accessories
  productListingId:
    type: string
    description: Unique internal identifier of the matched product.
    example: pl_6zydvb8xqqfcntt760grgm41t4
  originEventId:
    type: string
    description: Product event that produced this match.
    example: evt_08nrsmex2je2dvsyh01v2kh78a
  enhancedMatchReason:
    type: string
    description: Enhanced-match explanation, when matching supplied one.
    example: The product matches the saved enhanced description.
  feedback:
    type: boolean
    description: Optional feedback recorded by the user for this saved-search match.
    example: true
  created:
    type: string
    format: date-time
    description: When the search-filter product match was originally created
      (RFC3339 format).
    example: 2024-01-01T10:00:00Z
  updated:
    type: string
    format: date-time
    description: When the search-filter product match was last updated (RFC3339 format).
    example: 2024-01-01T12:30:00Z

```


## RangeQueryUInt64 → RangeQueryUInt64

Old generated shape:

```ts
type RangeQueryUInt64 = {
    /**
     * Minimum value (inclusive)
     */
    min?: number;
    /**
     * Maximum value (inclusive)
     */
    max?: number;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type RangeQueryUInt64 = { "min"?: number; "max"?: number; };
```

```yaml
type: object
description: Range query for numeric values in minor currency units for the
  selected indexed currency; no request-time conversion occurs
properties:
  min:
    type: integer
    minimum: 0
    description: Minimum value (inclusive)
    example: 1000
  max:
    type: integer
    minimum: 0
    description: Maximum value (inclusive)
    example: 5000

```


## RangeQueryDateTime → RangeQueryDateTime

Old generated shape:

```ts
type RangeQueryDateTime = {
    /**
     * Minimum date and time (inclusive, RFC3339 format)
     */
    min?: string;
    /**
     * Maximum date and time (inclusive, RFC3339 format)
     */
    max?: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type RangeQueryDateTime = { "min"?: string; "max"?: string; };
```

```yaml
type: object
description: Range query for date and time values
properties:
  min:
    type: string
    format: date-time
    description: Minimum date and time (inclusive, RFC3339 format)
    example: 2024-01-01T00:00:00Z
  max:
    type: string
    format: date-time
    description: Maximum date and time (inclusive, RFC3339 format)
    example: 2024-12-31T23:59:59Z

```


## RangeQueryInt32 → (absent)

Old generated shape:

```ts
type RangeQueryInt32 = {
    /**
     * Minimum value (inclusive)
     */
    min?: number;
    /**
     * Maximum value (inclusive)
     */
    max?: number;
};
```


## DistanceUnitData → (absent)

Old generated shape:

```ts
type DistanceUnitData = 'MILES' | 'YARDS' | 'FEET' | 'INCHES' | 'KILOMETERS' | 'METERS' | 'CENTIMETERS' | 'MILLIMETERS' | 'NAUTICAL_MILES';
```


## DistanceData → (absent)

Old generated shape:

```ts
type DistanceData = {
    /**
     * Numeric distance amount.
     */
    amount: number;
    unit: DistanceUnitData;
};
```


## GeoDistanceQueryData → (absent)

Old generated shape:

```ts
type GeoDistanceQueryData = {
    /**
     * Reference latitude in decimal degrees.
     */
    lat: number;
    /**
     * Reference longitude in decimal degrees.
     */
    lon: number;
    distance: DistanceData;
};
```


## SortUserSearchFilterFieldData → (absent)

Old generated shape:

```ts
type SortUserSearchFilterFieldData = 'created';
```


## UserSearchFilterCollectionData → UserSearchFilterCollectionData

Old generated shape:

```ts
type UserSearchFilterCollectionData = {
    /**
     * Array of search filters in the current page
     */
    items: Array<UserSearchFilterData>;
    /**
     * Number of products skipped (offset)
     */
    from: number;
    /**
     * Number of products in the current page
     */
    size: number;
    /**
     * Total number of products matching the query
     */
    total?: number | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type UserSearchFilterCollectionData = { "items": Array<UserSearchFilterData>; "from": number; "size": number; "total"?: number | null; };
```

```yaml
type: object
description: Paginated collection of user search filters with flattened pagination
required:
  - items
  - from
  - size
properties:
  items:
    type: array
    items:
      $ref: "#/components/schemas/UserSearchFilterData"
    description: Array of search filters in the current page
  from:
    type: integer
    minimum: 0
    description: Number of product-listings skipped (offset)
    example: 0
  size:
    type: integer
    minimum: 0
    description: Number of product-listings in the current page
    example: 21
  total:
    type: integer
    minimum: 0
    description: Total number of product-listings matching the query
    nullable: true
    example: 127

```


## CountryCodeData → (absent)

Old generated shape:

```ts
type CountryCodeData = 'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 'AQ' | 'AR' | 'AS' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | 'BA' | 'BB' | 'BD' | 'BE' | 'BF' | 'BG' | 'BH' | 'BI' | 'BJ' | 'BL' | 'BM' | 'BN' | 'BO' | 'BQ' | 'BR' | 'BS' | 'BT' | 'BV' | 'BW' | 'BY' | 'BZ' | 'CA' | 'CC' | 'CD' | 'CF' | 'CG' | 'CH' | 'CI' | 'CK' | 'CL' | 'CM' | 'CN' | 'CO' | 'CR' | 'CU' | 'CV' | 'CW' | 'CX' | 'CY' | 'CZ' | 'DE' | 'DJ' | 'DK' | 'DM' | 'DO' | 'DZ' | 'EC' | 'EE' | 'EG' | 'EH' | 'ER' | 'ES' | 'ET' | 'FI' | 'FJ' | 'FK' | 'FM' | 'FO' | 'FR' | 'GA' | 'GB' | 'GD' | 'GE' | 'GF' | 'GG' | 'GH' | 'GI' | 'GL' | 'GM' | 'GN' | 'GP' | 'GQ' | 'GR' | 'GS' | 'GT' | 'GU' | 'GW' | 'GY' | 'HK' | 'HM' | 'HN' | 'HR' | 'HT' | 'HU' | 'ID' | 'IE' | 'IL' | 'IM' | 'IN' | 'IO' | 'IQ' | 'IR' | 'IS' | 'IT' | 'JE' | 'JM' | 'JO' | 'JP' | 'KE' | 'KG' | 'KH' | 'KI' | 'KM' | 'KN' | 'KP' | 'KR' | 'KW' | 'KY' | 'KZ' | 'LA' | 'LB' | 'LC' | 'LI' | 'LK' | 'LR' | 'LS' | 'LT' | 'LU' | 'LV' | 'LY' | 'MA' | 'MC' | 'MD' | 'ME' | 'MF' | 'MG' | 'MH' | 'MK' | 'ML' | 'MM' | 'MN' | 'MO' | 'MP' | 'MQ' | 'MR' | 'MS' | 'MT' | 'MU' | 'MV' | 'MW' | 'MX' | 'MY' | 'MZ' | 'NA' | 'NC' | 'NE' | 'NF' | 'NG' | 'NI' | 'NL' | 'NO' | 'NP' | 'NR' | 'NU' | 'NZ' | 'OM' | 'PA' | 'PE' | 'PF' | 'PG' | 'PH' | 'PK' | 'PL' | 'PM' | 'PN' | 'PR' | 'PS' | 'PT' | 'PW' | 'PY' | 'QA' | 'RE' | 'RO' | 'RS' | 'RU' | 'RW' | 'SA' | 'SB' | 'SC' | 'SD' | 'SE' | 'SG' | 'SH' | 'SI' | 'SJ' | 'SK' | 'SL' | 'SM' | 'SN' | 'SO' | 'SR' | 'SS' | 'ST' | 'SV' | 'SX' | 'SY' | 'SZ' | 'TC' | 'TD' | 'TF' | 'TG' | 'TH' | 'TJ' | 'TK' | 'TL' | 'TM' | 'TN' | 'TO' | 'TR' | 'TT' | 'TV' | 'TW' | 'TZ' | 'UA' | 'UG' | 'UM' | 'US' | 'UY' | 'UZ' | 'VA' | 'VC' | 'VE' | 'VG' | 'VI' | 'VN' | 'VU' | 'WF' | 'WS' | 'YE' | 'YT' | 'ZA' | 'ZM' | 'ZW';
```


## ContinentData → (absent)

Old generated shape:

```ts
type ContinentData = 'AFRICA' | 'ANTARCTICA' | 'ASIA' | 'EUROPE' | 'NORTH_AMERICA' | 'OCEANIA' | 'SOUTH_AMERICA';
```


## StructuredAddressData → (absent)

Old generated shape:

```ts
type StructuredAddressData = {
    /**
     * Primary free-form address line such as street and house number.
     */
    addressline?: string;
    /**
     * Optional secondary address line such as floor, suite, building, or c/o information.
     */
    addresslineExtra?: string;
    /**
     * City, town, or locality.
     */
    locality?: string;
    /**
     * Region, state, province, or administrative area.
     */
    region?: string;
    /**
     * Postal or ZIP code.
     */
    postalCode?: string;
    /**
     * ISO 3166-1 alpha-2 country code serialized by the backend.
     * When `continent` is omitted but `country` is present, the backend derives the continent from this code.
     *
     */
    country?: CountryCodeData;
    /**
     * Optional continent value exposed alongside `country` in structured-address data.
     * If omitted while `country` is present, the backend derives it automatically.
     *
     */
    continent?: ContinentData;
};
```


## GeoAddressData → (absent)

Old generated shape:

```ts
type GeoAddressData = {
    /**
     * Latitude in decimal degrees.
     */
    lat: number;
    /**
     * Longitude in decimal degrees.
     */
    lon: number;
};
```


## GetShopData → ListingSourceData

Old generated shape:

```ts
type GetShopData = {
    /**
     * Unique identifier of the shop
     */
    shopId: string;
    /**
     * Human-readable slug identifier of the shop (kebab-case, derived from shop name).
     * Example: "tech-store-premium" or "christies"
     *
     */
    shopSlugId: string;
    /**
     * Display name of the shop
     */
    name: string;
    shopType: ShopTypeData;
    /**
     * All known domains associated with the shop.
     * Domains are normalized (lowercase, no scheme, no www prefix, no path/query/fragment).
     *
     */
    domains: Array<string>;
    /**
     * Optional normalized Shopify storefront domain associated with the shop.
     * Used by the backend to match Shopify product lifecycle events to the shop.
     * Normalized with the same rules as `domains` (lowercase, no scheme, no `www.` prefix, no path/query/fragment).
     *
     */
    shopifyDomain?: string | null;
    /**
     * Optional Shopify currency configured for the shop, serialized as an ISO 4217 code.
     */
    shopifyCurrency?: CurrencyData | null;
    /**
     * Optional Shopify default language configured for the shop.
     * Relevant for shops using Shopify partner-shop ingestion.
     * When present, Shopify product lifecycle events for this shop are ingested using this language.
     * When absent, Shopify product lifecycle events for this shop currently fail instead of inferring or defaulting a language.
     *
     */
    shopifyLanguage?: LanguageData | null;
    /**
     * Optional WooCommerce currency configured for webhook-ingested products, serialized as an ISO 4217 code.
     * When WooCommerce webhooks send a non-empty `price`, the backend parses that amount in this currency.
     *
     */
    woocommerceCurrency?: CurrencyData | null;
    /**
     * Optional WooCommerce default language configured for the shop.
     * Relevant for shops using `POST /api/v1/webhooks/woocommerce/{shopId}`.
     * When present, WooCommerce webhook-ingested products for this shop are ingested using this language.
     * When absent, WooCommerce webhook requests for this shop currently fail instead of inferring or defaulting a language.
     *
     */
    woocommerceLanguage?: LanguageData | null;
    /**
     * Optional primary URL of the shop website.
     */
    url?: string | null;
    /**
     * Optional tracked or affiliate URL derived from `url` for user-facing navigation.
     * When the shop has a primary `url`, the backend may populate this field with either Aura Historia tracking parameters or an affiliate-link target.
     *
     */
    viewUrl?: string | null;
    /**
     * Optional URL to the shop's logo or image
     */
    image?: string | null;
    structuredAddress?: StructuredAddressData;
    geoAddress?: GeoAddressData;
    /**
     * Optional public contact phone number of the shop.
     */
    phone?: string;
    /**
     * Optional public contact email address of the shop.
     */
    email?: string;
    partnerStatus: ShopPartnerStatusData;
    createdBy: ActorData;
    updatedBy: ActorData;
    /**
     * When the shop was first created (RFC3339 format)
     */
    created: string;
    /**
     * When the shop was last updated (RFC3339 format)
     */
    updated: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type ListingSourceData = { "listingSourceId": string; "listingSourceSlugId": string; "name": string; "operator": OperatorPartyData; "ingestionMethods": Array<ListingIngestionMethodData>; "url"?: string; "image"?: string; "created": string; "updated": string; };
```

```yaml
type: object
required:
  - listingSourceId
  - listingSourceSlugId
  - name
  - operator
  - ingestionMethods
  - created
  - updated
properties:
  listingSourceId:
    type: string
  listingSourceSlugId:
    type: string
  name:
    type: string
    description: ListingSource name. Outer Unicode whitespace is trimmed; blank
      values and values over 255 UTF-8 bytes are rejected.
  operator:
    $ref: "#/components/schemas/OperatorPartyData"
  ingestionMethods:
    type: array
    items:
      $ref: "#/components/schemas/ListingIngestionMethodData"
  url:
    type: string
    format: uri
  image:
    type: string
    format: uri
  created:
    type: string
    format: date-time
  updated:
    type: string
    format: date-time

```


## ShopSearchData → (absent)

Old generated shape:

```ts
type ShopSearchData = {
    /**
     * Optional text query for searching shops by name
     */
    shopNameQuery?: string;
    /**
     * Optional filter by shop types
     */
    shopType?: Array<ShopTypeData> | null;
    /**
     * Optional filter by shop partner relationship status.
     * When provided, only shops with one of the given partner-status values are returned.
     *
     */
    partnerStatus?: Array<ShopPartnerStatusData> | null;
    /**
     * Optional repeated ISO 3166-1 alpha-2 country-code filter.
     * When provided, only shops having at least one of the listed structured-address country codes are returned.
     *
     */
    countries?: Array<CountryCodeData>;
    /**
     * Optional repeated continent filter.
     * When provided, only shops having at least one of the listed structured-address continents are returned.
     *
     */
    continents?: Array<ContinentData>;
    /**
     * Optional filter by shop creation date range
     */
    created?: RangeQueryDateTime | null;
    /**
     * Optional filter by shop last updated date range
     */
    updated?: RangeQueryDateTime | null;
};
```


## PatchShopData → UpdateListingSourceData

Old generated shape:

```ts
type PatchShopData = {
    /**
     * Optional updated shop type classification.
     */
    shopType?: ShopTypeData | null;
    /**
     * Optional updated set of domains for the shop.
     * When provided, this replaces the existing domains entirely.
     * Domains are normalized (lowercase, no scheme, no www prefix, no path/query/fragment).
     *
     */
    domains?: Array<string> | null;
    /**
     * Optional updated Shopify storefront domain used for Shopify partner-shop event matching.
     * Normalized with the same rules as `domains`.
     * When omitted or set to `null`, the current Shopify domain remains unchanged.
     *
     */
    shopifyDomain?: string | null;
    /**
     * Optional updated Shopify currency for the shop, serialized as an ISO 4217 code.
     * When omitted or set to `null`, the current Shopify currency remains unchanged.
     *
     */
    shopifyCurrency?: CurrencyData | null;
    /**
     * Optional updated Shopify default language for the shop.
     * When configured, Shopify product lifecycle events for this shop are ingested using this language.
     * When absent on the stored shop record, Shopify product lifecycle events currently fail instead of inferring or defaulting a language.
     * When omitted or set to `null`, the current Shopify language remains unchanged.
     *
     */
    shopifyLanguage?: LanguageData | null;
    /**
     * Optional updated WooCommerce currency for the shop, serialized as an ISO 4217 code.
     * When omitted or set to `null`, the current WooCommerce currency remains unchanged.
     * This currency is used when WooCommerce webhook payloads provide a non-empty `price`.
     *
     */
    woocommerceCurrency?: CurrencyData | null;
    /**
     * Optional updated WooCommerce default language for the shop.
     * When configured, WooCommerce webhook-ingested products for this shop are ingested using this language.
     * When absent on the stored shop record, WooCommerce webhook requests currently fail instead of inferring or defaulting a language.
     * When omitted or set to `null`, the current WooCommerce language remains unchanged.
     *
     */
    woocommerceLanguage?: LanguageData | null;
    /**
     * Optional updated primary URL of the shop website.
     * When omitted or set to `null`, the current URL remains unchanged.
     *
     */
    url?: string | null;
    /**
     * Optional updated URL to the shop's logo or image.
     * When omitted or set to `null`, the current image is left unchanged.
     *
     */
    image?: string | null;
    /**
     * Optional updated structured postal address.
     * When provided with at least one non-empty component, the backend geocodes it and refreshes `geoAddress`.
     * When omitted or set to `null`, the current address remains unchanged.
     *
     */
    structuredAddress?: StructuredAddressData | null;
    /**
     * Optional updated public contact phone number. When omitted or set to `null`, the current phone number remains unchanged.
     */
    phone?: string | null;
    /**
     * Optional updated public contact email address. When omitted or set to `null`, the current email address remains unchanged.
     */
    email?: string | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type UpdateListingSourceData = { "name"?: string; "ingestionConfiguration"?: Array<ListingIngestionConfigurationData>; "woocommerceWebhookSecret"?: string | null; "url"?: string | null; "image"?: string | null; "referralConfiguration"?: ReferralConfigurationData | null; };
```

```yaml
type: object
description: Omitted fields are unchanged. `null` clears only
  `woocommerceWebhookSecret`, `url`, `image`, and `referralConfiguration`.
properties:
  name:
    type: string
    description: ListingSource name. Outer Unicode whitespace is trimmed; blank
      values and values over 255 UTF-8 bytes are rejected.
  ingestionConfiguration:
    type: array
    items:
      $ref: "#/components/schemas/ListingIngestionConfigurationData"
  woocommerceWebhookSecret:
    type: string
    nullable: true
    writeOnly: true
    description: Optional WooCommerce webhook secret. Never returned or logged.
  url:
    type: string
    format: uri
    nullable: true
  image:
    type: string
    format: uri
    nullable: true
  referralConfiguration:
    allOf:
      - $ref: "#/components/schemas/ReferralConfigurationData"
    nullable: true

```


## PostShopData → CreateListingSourceData

Old generated shape:

```ts
type PostShopData = {
    /**
     * Display name of the shop. Used to derive the human-readable `shopSlugId`.
     */
    name: string;
    shopType: ShopTypeData;
    /**
     * Unique set of domains associated with the shop.
     * Input values are normalized by stripping any `http://` or `https://` scheme, optional `www.` prefix,
     * and any port, path, query, or fragment, then lowercasing the remaining domain.
     *
     */
    domains: Array<string>;
    /**
     * Optional Shopify storefront domain associated with the shop.
     * Used by the backend to match Shopify product lifecycle events to the shop.
     * Input values are normalized with the same rules as `domains`.
     *
     */
    shopifyDomain?: string | null;
    /**
     * Optional Shopify currency associated with the shop, serialized as an ISO 4217 code.
     */
    shopifyCurrency?: CurrencyData | null;
    /**
     * Optional Shopify default language associated with the shop.
     * Relevant for shops using Shopify partner-shop ingestion.
     * When configured, Shopify product lifecycle events for this shop are ingested using this language.
     * When omitted, Shopify product lifecycle events for this shop currently fail instead of inferring or defaulting a language.
     *
     */
    shopifyLanguage?: LanguageData | null;
    /**
     * Optional WooCommerce currency associated with the shop, serialized as an ISO 4217 code.
     * This currency is used when WooCommerce webhook payloads provide a non-empty `price`.
     *
     */
    woocommerceCurrency?: CurrencyData | null;
    /**
     * Optional WooCommerce default language associated with the shop.
     * Relevant for shops using `POST /api/v1/webhooks/woocommerce/{shopId}`.
     * When configured, WooCommerce webhook-ingested products for this shop are ingested using this language.
     * When omitted, WooCommerce webhook requests for this shop currently fail instead of inferring or defaulting a language.
     *
     */
    woocommerceLanguage?: LanguageData | null;
    /**
     * Optional primary URL of the shop website.
     */
    url?: string | null;
    /**
     * Optional URL to the shop's logo or image.
     */
    image?: string | null;
    /**
     * Optional structured postal address.
     * When provided, the backend geocodes it and stores the resulting coordinates in `geoAddress`.
     *
     */
    structuredAddress?: StructuredAddressData | null;
    /**
     * Optional public contact phone number of the shop.
     */
    phone?: string | null;
    /**
     * Optional public contact email address of the shop.
     */
    email?: string | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type CreateListingSourceData = { "name": string; "operator": ListingSourceOperatorInputData; "ingestionConfiguration": Array<ListingIngestionConfigurationData>; "woocommerceWebhookSecret"?: string; "url"?: string; "image"?: string; "referralConfiguration"?: ReferralConfigurationData; };
```

```yaml
type: object
required:
  - name
  - operator
  - ingestionConfiguration
properties:
  name:
    type: string
    description: ListingSource name. Outer Unicode whitespace is trimmed; blank
      values and values over 255 UTF-8 bytes are rejected.
  operator:
    $ref: "#/components/schemas/ListingSourceOperatorInputData"
  ingestionConfiguration:
    type: array
    items:
      $ref: "#/components/schemas/ListingIngestionConfigurationData"
  woocommerceWebhookSecret:
    type: string
    writeOnly: true
    description: Optional WooCommerce webhook secret. Accepted only when WOOCOMMERCE
      ingestion is configured; never returned or logged.
  url:
    type: string
    format: uri
  image:
    type: string
    format: uri
  referralConfiguration:
    $ref: "#/components/schemas/ReferralConfigurationData"

```


## AccessTokenScopeData → AccessTokenScopeData

Old generated shape:

```ts
type AccessTokenScopeData = 'shops:manage' | 'products:write';
```

Target shape (readable projection; exact constraints follow):

```ts
type AccessTokenScopeData = "product-listings:write" | "users:read" | "users:write" | "access-tokens:read" | "access-tokens:write" | "search-filters:write" | "watchlist:read" | "watchlist:write";
```

```yaml
type: string
enum:
  - product-listings:write
  - users:read
  - users:write
  - access-tokens:read
  - access-tokens:write
  - search-filters:write
  - watchlist:read
  - watchlist:write
description: >
  Aura Historia access-token and OAuth scope string.

  The value is one of the capabilities supported by the canonical access-token
  and OAuth flows.
example: access-tokens:read

```


## AccessTokenTypeData → AccessTokenTypeData

Old generated shape:

```ts
type AccessTokenTypeData = 'BEARER';
```

Target shape (readable projection; exact constraints follow):

```ts
type AccessTokenTypeData = "BEARER";
```

```yaml
type: string
enum:
  - BEARER
description: Token type returned for Aura Historia access tokens.
example: BEARER

```


## GetAccessTokenData → GetAccessTokenData

Old generated shape:

```ts
type GetAccessTokenData = {
    /**
     * Unique identifier of the access token.
     */
    accessTokenId: string;
    /**
     * User-defined display name of the access token.
     */
    name: string;
    /**
     * Granted access-token scopes. Omitted when the token has no scopes.
     */
    scope?: Array<AccessTokenScopeData>;
    /**
     * Plaintext or masked bearer token value.
     * Create responses return the full token once; subsequent reads return a masked value such as `aurahistoria_abcdefghijk_****`.
     *
     */
    token: string;
    tokenType: AccessTokenTypeData;
    /**
     * Optional absolute expiration timestamp in RFC 3339 format.
     */
    expiresAt?: string | null;
    /**
     * Optional non-negative number of seconds remaining until expiry.
     */
    expiresIn?: number | null;
    createdBy: ActorData;
    updatedBy: ActorData;
    /**
     * Timestamp when the access token was created.
     */
    created: string;
    /**
     * Timestamp when the access token metadata was last updated.
     */
    updated: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type GetAccessTokenData = { "accessTokenId": string; "name": string; "scope"?: Array<AccessTokenScopeData>; "token": string; "tokenType": AccessTokenTypeData; "expiresAt"?: string | null; "expiresIn"?: number | null; "createdBy": ActorData; "updatedBy": ActorData; "created": string; "updated": string; };
```

```yaml
type: object
description: |
  Access-token read model.
  `POST /api/v1/me/access-tokens` returns the plaintext bearer token once;
  list/get/update endpoints return the masked display value instead.
required:
  - accessTokenId
  - name
  - token
  - tokenType
  - createdBy
  - updatedBy
  - created
  - updated
properties:
  accessTokenId:
    type: string
    description: Unique identifier of the access token.
    example: at_4ck23tcv0meqqrbyjaka24ra6g
  name:
    type: string
    maxLength: 128
    description: User-defined display name of the access token.
    example: Partner product sync
  scope:
    type: array
    items:
      $ref: "#/components/schemas/AccessTokenScopeData"
    uniqueItems: true
    description: Granted access-token scopes. Omitted when the token has no scopes.
    example:
      - product-listings:write
  token:
    type: string
    description: >
      Plaintext or masked bearer token value.

      Create responses return the full token once; subsequent reads return a
      masked value such as `aurahistoria_abcdefghijk_****`.
    example: aurahistoria_abcdefghijk_****
  tokenType:
    $ref: "#/components/schemas/AccessTokenTypeData"
  expiresAt:
    type: string
    format: date-time
    nullable: true
    description: Optional absolute expiration timestamp in RFC 3339 format.
    example: 2026-06-30T00:00:00Z
  expiresIn:
    type: integer
    minimum: 0
    nullable: true
    description: Optional non-negative number of seconds remaining until expiry.
    example: 2851200
  createdBy:
    $ref: "#/components/schemas/ActorData"
    description: Actor who created this access token
  updatedBy:
    $ref: "#/components/schemas/ActorData"
    description: Actor who last updated this access token
  created:
    type: string
    format: date-time
    description: Timestamp when the access token was created.
    example: 2026-05-28T06:30:00Z
  updated:
    type: string
    format: date-time
    description: Timestamp when the access token metadata was last updated.
    example: 2026-05-28T07:00:00Z

```


## PostAccessTokenData → PostAccessTokenData

Old generated shape:

```ts
type PostAccessTokenData = {
    /**
     * User-defined display name of the new access token.
     */
    name: string;
    /**
     * Optional scopes granted to the access token. Defaults to an empty set.
     */
    scope?: Array<AccessTokenScopeData>;
    /**
     * Optional expiration timestamp in RFC 3339 format.
     */
    expiresAt?: string | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PostAccessTokenData = { "name": string; "scope"?: Array<AccessTokenScopeData>; "expiresAt"?: string | null; };
```

```yaml
type: object
description: Request body for creating an Aura Historia access token.
required:
  - name
properties:
  name:
    type: string
    maxLength: 128
    description: User-defined display name of the new access token.
    example: Partner product sync
  scope:
    type: array
    items:
      $ref: "#/components/schemas/AccessTokenScopeData"
    uniqueItems: true
    description: Optional scopes granted to the access token. Defaults to an empty set.
    example:
      - product-listings:write
  expiresAt:
    type: string
    format: date-time
    nullable: true
    description: Optional expiration timestamp in RFC 3339 format.
    example: 2026-06-30T00:00:00Z

```


## PatchAccessTokenData → PatchAccessTokenData

Old generated shape:

```ts
type PatchAccessTokenData = {
    /**
     * Unique identifier of the access token to update.
     */
    accessTokenId: string;
    /**
     * Optional replacement display name.
     */
    name?: string | null;
    /**
     * Optional replacement scope set.
     */
    scope?: Array<AccessTokenScopeData> | null;
    /**
     * Optional replacement expiration timestamp in RFC 3339 format.
     */
    expiresAt?: string | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PatchAccessTokenData = { "accessTokenId": string; "name"?: string; "scopes"?: Array<AccessTokenScopeData>; "expires"?: string | null; };
```

```yaml
type: object
description: >
  Request body for updating access-token metadata.

  Omitted fields remain unchanged. `expires: null` clears the expiry; `name` and
  `scopes`

  reject null, and `scopes: []` replaces the scope set with an empty set.
required:
  - accessTokenId
properties:
  accessTokenId:
    type: string
    description: Unique identifier of the access token to update.
    example: at_4ck23tcv0meqqrbyjaka24ra6g
  name:
    type: string
    maxLength: 128
    description: Omit to leave unchanged. Null is invalid.
    example: Renamed partner sync token
  scopes:
    type: array
    items:
      $ref: "#/components/schemas/AccessTokenScopeData"
    uniqueItems: true
    description: Omit to leave unchanged. Send `[]` to empty the set; null is invalid.
    example:
      - product-listings:write
  expires:
    type: string
    format: date-time
    nullable: true
    description: Omit to leave unchanged. Send null to clear the expiration timestamp.
    example: 2026-07-31T00:00:00Z

```


## OAuthClientMetadataRequestData → OAuthClientMetadataRequestData

Old generated shape:

```ts
type OAuthClientMetadataRequestData = {
    /**
     * Display name of the OAuth client.
     */
    client_name: string;
    /**
     * HTTPS URL of the OAuth client's terms-of-service document.
     */
    tos_uri: string;
    /**
     * HTTPS URL of the OAuth client's privacy policy document.
     */
    policy_uri: string;
    /**
     * HTTPS URL of the OAuth client's homepage or product site.
     */
    client_uri: string;
    /**
     * HTTPS URL of the OAuth client's logo image.
     */
    logo_uri: string;
    /**
     * Registered HTTPS redirect URIs for the OAuth client.
     */
    redirect_uris: Array<string>;
    /**
     * Optional allowed scopes for tokens issued to this OAuth client.
     */
    scope?: Array<AccessTokenScopeData>;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type OAuthClientMetadataRequestData = { "client_name": string; "tos_uri": string; "policy_uri": string; "client_uri": string; "logo_uri": string; "redirect_uris": Array<string>; "scope"?: Array<AccessTokenScopeData>; };
```

```yaml
type: object
description: |
  Request body for creating OAuth client metadata.
  `redirect_uris` must contain at least one HTTPS redirect URI.
required:
  - client_name
  - tos_uri
  - policy_uri
  - client_uri
  - logo_uri
  - redirect_uris
properties:
  client_name:
    type: string
    description: Display name of the OAuth client.
    example: Acceptance OAuth client
  tos_uri:
    type: string
    format: uri
    description: HTTPS URL of the OAuth client's terms-of-service document.
    example: https://client.example/tos
  policy_uri:
    type: string
    format: uri
    description: HTTPS URL of the OAuth client's privacy policy document.
    example: https://client.example/policy
  client_uri:
    type: string
    format: uri
    description: HTTPS URL of the OAuth client's homepage or product site.
    example: https://client.example
  logo_uri:
    type: string
    format: uri
    description: HTTPS URL of the OAuth client's logo image.
    example: https://client.example/logo.png
  redirect_uris:
    type: array
    minItems: 1
    uniqueItems: true
    description: Registered HTTPS redirect URIs for the OAuth client.
    items:
      type: string
      format: uri
    example:
      - https://client.example/callback
  scope:
    type: array
    uniqueItems: true
    description: Optional allowed scopes for tokens issued to this OAuth client.
    items:
      $ref: "#/components/schemas/AccessTokenScopeData"
    example:
      - product-listings:write

```


## OAuthClientMetadataPatchData → OAuthClientMetadataPatchData

Old generated shape:

```ts
type OAuthClientMetadataPatchData = {
    /**
     * Optional replacement display name for the OAuth client.
     */
    client_name?: string | null;
    /**
     * Optional replacement terms-of-service document URL for the OAuth client.
     */
    tos_uri?: string | null;
    /**
     * Optional replacement privacy-policy document URL for the OAuth client.
     */
    policy_uri?: string | null;
    /**
     * Optional replacement homepage or product-site URL for the OAuth client.
     */
    client_uri?: string | null;
    /**
     * Optional replacement logo image URL for the OAuth client.
     */
    logo_uri?: string | null;
    /**
     * Optional replacement set of registered HTTPS redirect URIs.
     */
    redirect_uris?: Array<string> | null;
    /**
     * Optional replacement set of allowed scopes for the OAuth client.
     */
    scope?: Array<AccessTokenScopeData> | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type OAuthClientMetadataPatchData = { "client_name"?: string; "tos_uri"?: string; "policy_uri"?: string; "client_uri"?: string; "logo_uri"?: string; "redirect_uris"?: Array<string>; "scope"?: Array<AccessTokenScopeData>; };
```

```yaml
type: object
description: >
  Request body for updating OAuth client metadata. Omitted properties remain
  unchanged;

  every explicit null is invalid because metadata values are non-nullable.
properties:
  client_name:
    type: string
    description: Optional replacement display name for the OAuth client.
    example: Updated acceptance OAuth client
  tos_uri:
    type: string
    format: uri
    description: Optional replacement terms-of-service document URL for the OAuth client.
    example: https://client.example/updated-tos
  policy_uri:
    type: string
    format: uri
    description: Optional replacement privacy-policy document URL for the OAuth client.
    example: https://client.example/updated-policy
  client_uri:
    type: string
    format: uri
    description: Optional replacement homepage or product-site URL for the OAuth client.
    example: https://updated-client.example
  logo_uri:
    type: string
    format: uri
    description: Optional replacement logo image URL for the OAuth client.
    example: https://updated-client.example/logo.png
  redirect_uris:
    type: array
    minItems: 1
    uniqueItems: true
    description: Optional replacement set of registered HTTPS redirect URIs.
    items:
      type: string
      format: uri
    example:
      - https://client.example/updated
  scope:
    type: array
    uniqueItems: true
    description: Omit to leave unchanged. Send `[]` to replace with an empty set;
      null is invalid.
    items:
      $ref: "#/components/schemas/AccessTokenScopeData"
    example:
      - access-tokens:read

```


## OAuthClientMetadataResponseData → OAuthClientMetadataResponseData

Old generated shape:

```ts
type OAuthClientMetadataResponseData = {
    /**
     * UUIDv7 identifier of the OAuth client.
     */
    client_id: string;
    /**
     * OAuth client secret.
     * Create responses return the plaintext secret once; later reads return a masked value such as `aurahistoria_oauth_client_secret_abcdefghijk_****`.
     *
     */
    client_secret: string;
    /**
     * Display name of the OAuth client.
     */
    client_name: string;
    /**
     * Terms-of-service document URL registered for the OAuth client.
     */
    tos_uri: string;
    /**
     * Privacy-policy document URL registered for the OAuth client.
     */
    policy_uri: string;
    /**
     * Homepage or product-site URL registered for the OAuth client.
     */
    client_uri: string;
    /**
     * Logo image URL registered for the OAuth client.
     */
    logo_uri: string;
    /**
     * Registered redirect URIs for the OAuth client.
     */
    redirect_uris: Array<string>;
    /**
     * Allowed scopes for tokens issued to this OAuth client.
     */
    scope: Array<AccessTokenScopeData>;
    /**
     * Unix timestamp (seconds) when the OAuth client was created and its client ID was issued.
     */
    client_id_issued_at: number;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type OAuthClientMetadataResponseData = { "client_id": string; "client_secret": string; "client_name": string; "tos_uri": string; "policy_uri": string; "client_uri": string; "logo_uri": string; "redirect_uris": Array<string>; "scope": Array<AccessTokenScopeData>; "client_id_issued_at": number; };
```

```yaml
type: object
description: >
  OAuth client metadata create response.

  `client_secret` contains the plaintext secret only in the create response.

  Admin list, detail, and update responses use `OAuthClientAdminData` and omit
  `client_secret` entirely.
required:
  - client_id
  - client_secret
  - client_name
  - tos_uri
  - policy_uri
  - client_uri
  - logo_uri
  - redirect_uris
  - scope
  - client_id_issued_at
properties:
  client_id:
    type: string
    description: Canonical OAuthClient ID.
    example: oc_7b0gwc1x49e0mvbt3tfexfqgb5
  client_secret:
    type: string
    description: |
      Plaintext OAuth client secret returned only once by the create response.
      Admin list, detail, and update responses omit this property entirely.
    example: aurahistoria_oauth_client_secret_abcdefghijk_abcdefghijklmnopqrstuvwxyz1234567
  client_name:
    type: string
    description: Display name of the OAuth client.
    example: Acceptance OAuth client
  tos_uri:
    type: string
    format: uri
    description: Terms-of-service document URL registered for the OAuth client.
    example: https://client.example/tos
  policy_uri:
    type: string
    format: uri
    description: Privacy-policy document URL registered for the OAuth client.
    example: https://client.example/policy
  client_uri:
    type: string
    format: uri
    description: Homepage or product-site URL registered for the OAuth client.
    example: https://client.example
  logo_uri:
    type: string
    format: uri
    description: Logo image URL registered for the OAuth client.
    example: https://client.example/logo.png
  redirect_uris:
    type: array
    uniqueItems: true
    description: Registered redirect URIs for the OAuth client.
    items:
      type: string
      format: uri
    example:
      - https://client.example/callback
  scope:
    type: array
    uniqueItems: true
    description: Allowed scopes for tokens issued to this OAuth client.
    items:
      $ref: "#/components/schemas/AccessTokenScopeData"
    example:
      - product-listings:write
  client_id_issued_at:
    type: integer
    format: int64
    description: Unix timestamp (seconds) when the OAuth client was created and its
      client ID was issued.
    example: 1748539200

```


## OAuthTokenResponseData → OAuthTokenResponseData

Old generated shape:

```ts
type OAuthTokenResponseData = {
    /**
     * The issued Aura Historia access token (plaintext bearer value).
     */
    access_token: string;
    token_type: AccessTokenTypeData;
    /**
     * Seconds until the access token expires. `null` when the token does not expire.
     */
    expires_in?: number | null;
    /**
     * Space-separated list of scopes granted to the access token.
     */
    scope: string;
    /**
     * Optional one-time exchange code returned by `POST /api/v1/oauth/token`.
     * It can be redeemed once via `GET /api/v1/oauth/tokens/by-third-party-code/{thirdPartyCode}`
     * within 60 seconds to obtain the same access token.
     *
     */
    third_party_exchange_code?: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type OAuthTokenResponseData = { "access_token": string; "token_type": AccessTokenTypeData; "expires_in"?: number | null; "scope": string; "third_party_exchange_code"?: string; };
```

```yaml
type: object
description: >
  Token response returned by `POST /api/v1/oauth/token` and

  `GET /api/v1/oauth/tokens/by-third-party-code/{thirdPartyCode}`.

  The `access_token` is an Aura Historia bearer access token. `expires_in` is
  omitted

  (`null`) for non-expiring tokens. `third_party_exchange_code` is only present
  on the

  direct token exchange response.
required:
  - access_token
  - token_type
  - scope
properties:
  access_token:
    type: string
    description: The issued Aura Historia access token (plaintext bearer value).
    example: aurahistoria_abcdefghijk_verylongtokenvalue
  token_type:
    $ref: "#/components/schemas/AccessTokenTypeData"
  expires_in:
    type: integer
    format: int64
    minimum: 0
    nullable: true
    description: Seconds until the access token expires. `null` when the token does
      not expire.
    example: null
  scope:
    type: string
    description: Space-separated list of scopes granted to the access token.
    example: product-listings:write
  third_party_exchange_code:
    type: string
    format: uuid
    description: >
      Optional one-time exchange code returned by `POST /api/v1/oauth/token`.

      It can be redeemed once via `GET
      /api/v1/oauth/tokens/by-third-party-code/{thirdPartyCode}`

      within 60 seconds to obtain the same access token.
    example: 01970f22-2bf0-7000-8000-000000000099

```


## OAuthIntrospectionResponseData → OAuthIntrospectionResponseData

Old generated shape:

```ts
type OAuthIntrospectionResponseData = {
    /**
     * Whether the token is currently active (not expired, not revoked, and known to this server).
     */
    active: boolean;
    /**
     * Space-separated list of scopes granted to the token. Present only when `active` is `true`.
     */
    scope?: string;
    /**
     * UUIDv7 OAuth client identifier that issued the token. Present only when `active` is `true` and the token was issued via the OAuth flow.
     */
    client_id?: string;
    /**
     * Subject — the Aura Historia user ID who authorized the token. Present only when `active` is `true`.
     */
    sub?: string;
    /**
     * Token type. Always `"Bearer"` when `active` is `true`.
     */
    token_type?: string;
    /**
     * Unix timestamp (seconds) when the token expires. Present only when `active` is `true` and the token has an expiry.
     */
    exp?: number;
    /**
     * Unix timestamp (seconds) when the token was issued. Present only when `active` is `true` and the issue time is known.
     */
    iat?: number;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type OAuthIntrospectionResponseData = { "active": boolean; "scope"?: string; "client_id"?: string; "sub"?: string; "token_type"?: string; "exp"?: number; "iat"?: number; };
```

```yaml
type: object
description: |
  Introspection response returned by `POST /api/v1/oauth/introspect` (RFC 7662).
  When `active` is `false` all other fields are omitted.
  When `active` is `true` the available token metadata is populated.
required:
  - active
properties:
  active:
    type: boolean
    description: Whether the token is currently active (not expired, not revoked,
      and known to this server).
    example: true
  scope:
    type: string
    description: Space-separated list of scopes granted to the token. Present only
      when `active` is `true`.
    example: product-listings:write
  client_id:
    type: string
    description: OAuthClient ID that issued the token. Present only when `active` is
      `true` and the token was issued via the OAuth flow.
    example: oc_7b0gwc1x49e0mvbt3tfexfqgb5
  sub:
    type: string
    description: Subject — the Aura Historia user ID who authorized the token.
      Present only when `active` is `true`.
    example: usr_4hzreqwxgvef69j056bszwwm17
  token_type:
    type: string
    description: Token type. Always `"Bearer"` when `active` is `true`.
    example: Bearer
  exp:
    type: integer
    format: int64
    description: Unix timestamp (seconds) when the token expires. Present only when
      `active` is `true` and the token has an expiry.
    example: 1780000000
  iat:
    type: integer
    format: int64
    description: Unix timestamp (seconds) when the token was issued. Present only
      when `active` is `true` and the issue time is known.
    example: 1748400000

```


## SortShopFieldData → SortListingSourceFieldData

Old generated shape:

```ts
type SortShopFieldData = 'score' | 'name' | 'updated' | 'created';
```

Target shape (readable projection; exact constraints follow):

```ts
type SortListingSourceFieldData = "name" | "slug" | "created" | "updated";
```

```yaml
type: string
enum:
  - name
  - slug
  - created
  - updated
description: Fields available for sorting admin ListingSource-search results.
  ListingSource ID is always used as a deterministic tie-breaker.
example: name

```


## ShopSearchResultData → ListingSourceSearchCollectionData

Old generated shape:

```ts
type ShopSearchResultData = {
    /**
     * Array of shops in the current page
     */
    items: Array<GetShopData>;
    /**
     * Number of products in the current page
     */
    size: number;
    /**
     * Cursor for the next page (keyset pagination).
     * Contains the sort field value and shop ID as tie-breaker: `[sortValue, shopId]`.
     * Present when there are more results available.
     * This is a heterogeneous JSON array.
     *
     */
    searchAfter?: Array<unknown> | null;
    /**
     * Total number of products matching the query
     */
    total?: number | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type ListingSourceSearchCollectionData = { "items": Array<ListingSourceSearchSummaryData>; "size": number; "searchAfter"?: string; "total"?: number; };
```

```yaml
type: object
description: Cursor-paginated safe ListingSource summaries for the admin search
  endpoint. `searchAfter` is a ListingSource ID cursor and is omitted when the
  current page is terminal.
required:
  - items
  - size
properties:
  items:
    type: array
    items:
      $ref: "#/components/schemas/ListingSourceSearchSummaryData"
    description: ListingSource summaries returned in the current page.
  size:
    type: integer
    minimum: 1
    maximum: 100
    description: Requested page size after server-side clamping.
    example: 21
  searchAfter:
    type: string
    description: ListingSource ID cursor for the next page, omitted when no more
      results are available.
    example: ls_11j55nbvjfe7ds34s7gya899a9
  total:
    type: integer
    minimum: 0
    description: Total matching ListingSources when provided by the reader; omitted
      otherwise.
    example: 42

```


## CategorySearchData → (absent)

Old generated shape:

```ts
type CategorySearchData = {
    language?: LanguageData;
    /**
     * Optional localized name query for categories
     */
    nameQuery?: string;
};
```


## SortCategoryFieldData → (absent)

Old generated shape:

```ts
type SortCategoryFieldData = 'score' | 'name' | 'updated' | 'created';
```


## GetCategorySummaryData → (absent)

Old generated shape:

```ts
type GetCategorySummaryData = {
    /**
     * Kebab-case identifier of the category
     */
    categoryId: string;
    /**
     * Stable key for the category
     */
    categoryKey: string;
    /**
     * Localized display name
     */
    name: LocalizedTextData;
    /**
     * Total number of products associated with this category
     */
    products: number;
    /**
     * When the category was created (RFC3339 format)
     */
    created: string;
    /**
     * When the category was last updated (RFC3339 format)
     */
    updated: string;
};
```


## GetCategoryData → (absent)

Old generated shape:

```ts
type GetCategoryData = {
    /**
     * Kebab-case identifier of the category
     */
    categoryId: string;
    /**
     * Stable key for the category
     */
    categoryKey: string;
    /**
     * Localized display name
     */
    name: LocalizedTextData;
    /**
     * Total number of products associated with this category
     */
    products: number;
    /**
     * When the category was created (RFC3339 format)
     */
    created: string;
    /**
     * When the category was last updated (RFC3339 format)
     */
    updated: string;
};
```


## PeriodSearchData → (absent)

Old generated shape:

```ts
type PeriodSearchData = {
    language?: LanguageData;
    /**
     * Optional localized name query for periods
     */
    nameQuery?: string;
};
```


## SortPeriodFieldData → (absent)

Old generated shape:

```ts
type SortPeriodFieldData = 'score' | 'name' | 'updated' | 'created';
```


## GetPeriodSummaryData → (absent)

Old generated shape:

```ts
type GetPeriodSummaryData = {
    /**
     * Kebab-case identifier of the period
     */
    periodId: string;
    /**
     * Stable key for the period
     */
    periodKey: string;
    /**
     * Localized display name
     */
    name: LocalizedTextData;
    /**
     * Total number of products associated with this period
     */
    products: number;
    /**
     * When the period was created (RFC3339 format)
     */
    created: string;
    /**
     * When the period was last updated (RFC3339 format)
     */
    updated: string;
};
```


## GetPeriodData → (absent)

Old generated shape:

```ts
type GetPeriodData = {
    /**
     * Kebab-case identifier of the period
     */
    periodId: string;
    /**
     * Stable key for the period
     */
    periodKey: string;
    /**
     * Localized display name
     */
    name: LocalizedTextData;
    /**
     * Total number of products associated with this period
     */
    products: number;
    /**
     * When the period was created (RFC3339 format)
     */
    created: string;
    /**
     * When the period was last updated (RFC3339 format)
     */
    updated: string;
};
```


## ProductKeyData → PostWatchlistData

Old generated shape:

```ts
type ProductKeyData = {
    /**
     * Unique identifier of the shop
     */
    shopId: string;
    /**
     * Shop's unique identifier for the product. Can be any arbitrary string.
     */
    shopsProductId: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PostWatchlistData = { "productListingId": string; "notifications"?: boolean; };
```

```yaml
type: object
description: Request body for creating a watchlist entry.
required:
  - productListingId
properties:
  productListingId:
    type: string
    description: Canonical identifier of the product to add to the watchlist.
    example: pl_5xdb465tg1enarx2knf04mxbxj
  notifications:
    type: boolean
    description: Whether notifications are enabled for this entry. Defaults to `true`.
    default: true
    example: true

```


## WatchlistCollectionData → (absent)

Old generated shape:

```ts
type WatchlistCollectionData = {
    /**
     * Array of personalized watchlist products in the current page
     */
    items: Array<PersonalizedGetProductData>;
    /**
     * Number of products in the current page
     */
    size: number;
    /**
     * Cursor for the next page (RFC3339 timestamp). Present when there are more results.
     */
    searchAfter?: string | null;
    /**
     * Total number of products (optional, may not be available for cursor-based pagination)
     */
    total?: number | null;
};
```


## WatchlistProductPatch → WatchlistProductPatch

Old generated shape:

```ts
type WatchlistProductPatch = {
    /**
     * Whether to enable or disable notifications for this watchlist product
     */
    notifications?: boolean;
    /**
     * Optional activation state update for this watchlist entry.
     * `ACTIVE` reactivates the entry if the user's current tier still has watchlist quota.
     * `INACTIVE_BY_USER` manually disables the entry.
     * Omit to leave the current state unchanged.
     *
     */
    state?: PatchResourceStateData | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type WatchlistProductPatch = { "notifications"?: boolean; "state"?: PatchResourceStateData | null; };
```

```yaml
type: object
description: Patch object for updating watchlist product settings
properties:
  notifications:
    type: boolean
    description: Whether to enable or disable notifications for this watchlist product
    example: true
  state:
    allOf:
      - $ref: "#/components/schemas/PatchResourceStateData"
    nullable: true
    description: >
      Optional activation state update for this watchlist entry.

      `ACTIVE` reactivates the entry if the user's current tier still has
      watchlist quota.

      `INACTIVE_BY_USER` manually disables the entry.

      Omit to leave the current state unchanged.

```


## SortWatchlistProductFieldData → (absent)

Old generated shape:

```ts
type SortWatchlistProductFieldData = 'created';
```


## SortSearchFilterMatchFieldData → (absent)

Old generated shape:

```ts
type SortSearchFilterMatchFieldData = 'created';
```


## SortUserFieldData → SortUserFieldData

Old generated shape:

```ts
type SortUserFieldData = 'score' | 'email' | 'firstName' | 'lastName' | 'tier' | 'role' | 'updated' | 'created';
```

Target shape (readable projection; exact constraints follow):

```ts
type SortUserFieldData = "name" | "email" | "firstName" | "lastName" | "tier" | "role" | "updated" | "created";
```

```yaml
type: string
enum:
  - name
  - email
  - firstName
  - lastName
  - tier
  - role
  - updated
  - created
description: |
  Fields available for sorting admin user-search results:
  - name: First name followed by last name
  - email: User email address
  - firstName: User first name
  - lastName: User last name
  - tier: User subscription tier
  - role: User role
  - updated: Last update timestamp
  - created: Creation timestamp
  Every sort uses user ID as a deterministic tie-breaker.
example: email

```


## SearchFilterMatchProductCollectionData → SearchFilterMatchProductCollectionData

Old generated shape:

```ts
type SearchFilterMatchProductCollectionData = {
    /**
     * Array of personalized matched products in the current page
     */
    items: Array<PersonalizedGetProductData>;
    /**
     * Number of products in the current page
     */
    size: number;
    /**
     * Cursor for the next page (RFC3339 timestamp). Present when there are more results.
     */
    searchAfter?: string | null;
    /**
     * Total number of matched products
     */
    total?: number | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type SearchFilterMatchProductCollectionData = { "items": Array<PersonalizedProductListingDetailsData>; "size": number; "searchAfter"?: Array<string>; "total"?: number; };
```

```yaml
type: object
description: Cursor-paginated personalized ProductListing details for persisted
  search-filter matches.
required:
  - items
  - size
properties:
  items:
    type: array
    items:
      $ref: "#/components/schemas/PersonalizedProductListingDetailsData"
    description: Persisted matches in ascending match-creation order.
  size:
    type: integer
    minimum: 1
    maximum: 100
    description: Effective page size after runtime defaulting and clamping.
    example: 21
  searchAfter:
    type: array
    minItems: 2
    maxItems: 2
    items:
      type: string
    description: Next-page cursor, present only when another page is available. It
      contains `[RFC3339 persisted match creation timestamp, canonical
      ProductListing ID]`; serialize the returned array as the `searchAfter`
      query parameter for the next request.
    example:
      - 2026-08-05T12:30:00Z
      - pl_6zydvb8xqqfcntt760grgm41t4
  total:
    type: integer
    minimum: 0
    description: Total number of persisted matches, when available.
    example: 127

```


## UserCollectionData → UserCollectionData

Old generated shape:

```ts
type UserCollectionData = {
    /**
     * Users returned in the current page.
     */
    items: Array<GetUserAccountData>;
    /**
     * Number of users in the current page.
     */
    size: number;
    /**
     * Cursor for the next page.
     * Present only when more results are available.
     * Pass this value back as the `searchAfter` query parameter.
     *
     */
    searchAfter?: Array<unknown> | null;
    /**
     * Total number of users matching the current search.
     */
    total?: number | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type UserCollectionData = { "items": Array<AdminUserSummaryData>; "size": number; "searchAfter"?: string; "total"?: number; };
```

```yaml
type: object
description: >
  Cursor-paginated collection of users for the admin search endpoint.

  Items are compact admin user summaries. `searchAfter` is a User ID cursor for

  the next page and is omitted when the current page is terminal. The cursor
  must

  be sent with the same filters and sort as the page that returned it.
required:
  - items
  - size
properties:
  items:
    type: array
    items:
      $ref: "#/components/schemas/AdminUserSummaryData"
    description: Admin user summaries returned in the current page.
  size:
    type: integer
    minimum: 1
    maximum: 100
    description: Requested page size after server-side clamping.
    example: 21
  searchAfter:
    type: string
    description: User ID cursor for the next page, omitted when more results are
      unavailable.
    example: usr_681w9znhe8eawrhebxd1046d44
  total:
    type: integer
    minimum: 0
    description: Total matching users when the reader provides it; omitted otherwise.
    example: 42

```


## UserSearchData → (absent)

Old generated shape:

```ts
type UserSearchData = {
    /**
     * Fuzzy full-text query across email, first name, last name, and Stripe customer ID.
     */
    query?: string;
    /**
     * Fuzzy email-only query.
     */
    email?: string;
    /**
     * Fuzzy first-name query.
     */
    firstName?: string;
    /**
     * Fuzzy last-name query.
     */
    lastName?: string;
    /**
     * Filter matching users to one or more tiers.
     */
    tier?: Array<UserTierData>;
    /**
     * Filter matching users to one or more roles.
     */
    role?: Array<UserRoleData>;
    /**
     * Filter matching users to one or more structured-address country codes.
     */
    country?: Array<CountryCodeData>;
    /**
     * Filter matching users to one or more structured-address continents.
     */
    continent?: Array<ContinentData>;
    /**
     * Filter matching users whose indexed coordinates lie within the given distance of the provided point.
     */
    geoAddress?: GeoDistanceQueryData | null;
    /**
     * Optional created-at range filter (RFC3339 timestamps).
     */
    created?: {
        /**
         * Inclusive lower bound.
         */
        min?: string;
        /**
         * Inclusive upper bound.
         */
        max?: string;
    };
    /**
     * Optional updated-at range filter (RFC3339 timestamps).
     */
    updated?: {
        /**
         * Inclusive lower bound.
         */
        min?: string;
        /**
         * Inclusive upper bound.
         */
        max?: string;
    };
};
```


## GetUserAccountData → OwnUserAccountData

Old generated shape:

```ts
type GetUserAccountData = {
    /**
     * Unique identifier for the user
     */
    userId: string;
    /**
     * User's email address
     */
    email: string;
    /**
     * User's first name (optional, max 64 characters)
     */
    firstName?: string | null;
    /**
     * User's last name (optional, max 64 characters)
     */
    lastName?: string | null;
    /**
     * User's preferred language (optional)
     */
    language?: LanguageData | null;
    /**
     * User's preferred currency (optional)
     */
    currency?: CurrencyData | null;
    /**
     * User's preferred measurement unit system (optional)
     */
    measurementUnit?: MeasurementUnitData | null;
    /**
     * Whether the user has consented to viewing prohibited content
     */
    prohibitedContentConsent: boolean;
    tier: UserTierData;
    role: UserRoleData;
    /**
     * Persisted Stripe customer identifier for the user, omitted when the user has never been linked to a Stripe customer
     */
    stripeCustomerId?: string;
    /**
     * Optional structured postal address stored on the user account.
     */
    structuredAddress?: StructuredAddressData | null;
    /**
     * Optional latitude/longitude coordinates derived by the backend from `structuredAddress`.
     */
    geoAddress?: GeoAddressData | null;
    createdBy: ActorData;
    updatedBy: ActorData;
    /**
     * When the user account was created (RFC3339 format)
     */
    created: string;
    /**
     * When the user account was last updated (RFC3339 format)
     */
    updated: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type OwnUserAccountData = { "userId": string; "email": string; "firstName"?: string | null; "lastName"?: string | null; "language"?: LanguageData | null; "currency"?: CurrencyData | null; "measurementUnit"?: MeasurementUnitData | null; "showUnassessedOrSensitiveContent": boolean; "tier": UserTierData; "role": UserRoleData; "stripeCustomerId"?: string | null; };
```

```yaml
type: object
description: User-owned account information for `/api/v1/me/account`. Role,
  tier, and Stripe customer ID are read-only here.
required:
  - userId
  - email
  - showUnassessedOrSensitiveContent
  - tier
  - role
properties:
  userId:
    type: string
    description: Unique identifier for the user.
  email:
    type: string
    format: email
    description: User's email address.
  firstName:
    type: string
    maxLength: 64
    nullable: true
  lastName:
    type: string
    maxLength: 64
    nullable: true
  language:
    allOf:
      - $ref: "#/components/schemas/LanguageData"
    nullable: true
  currency:
    allOf:
      - $ref: "#/components/schemas/CurrencyData"
    nullable: true
  measurementUnit:
    allOf:
      - $ref: "#/components/schemas/MeasurementUnitData"
    nullable: true
  showUnassessedOrSensitiveContent:
    type: boolean
    description: Stored preference for showing unassessed or sensitive content.
  tier:
    $ref: "#/components/schemas/UserTierData"
  role:
    $ref: "#/components/schemas/UserRoleData"
  stripeCustomerId:
    type: string
    nullable: true
    description: Persisted Stripe customer identifier, omitted when absent.

```


## PatchAdminUserData → PatchAdminUserData

Old generated shape:

```ts
type PatchAdminUserData = {
    /**
     * New first name.
     */
    firstName?: string | null;
    /**
     * New last name.
     */
    lastName?: string | null;
    /**
     * New preferred language.
     */
    language?: LanguageData | null;
    /**
     * New preferred currency.
     */
    currency?: CurrencyData | null;
    /**
     * New preferred measurement unit system.
     */
    measurementUnit?: MeasurementUnitData | null;
    /**
     * New consent state for displaying prohibited content.
     */
    prohibitedContentConsent?: boolean | null;
    /**
     * New subscription tier.
     */
    tier?: UserTierData | null;
    /**
     * New user role.
     */
    role?: UserRoleData | null;
    /**
     * New Stripe customer identifier to persist for the user.
     */
    stripeCustomerId?: string | null;
    /**
     * Optional structured postal address to persist for the user. When provided, the backend geocodes it and refreshes `geoAddress`.
     */
    structuredAddress?: StructuredAddressData | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PatchAdminUserData = { "email"?: string; "firstName"?: string | null; "lastName"?: string | null; "language"?: LanguageData | null; "currency"?: CurrencyData | null; "measurementUnit"?: MeasurementUnitData | null; "showUnassessedOrSensitiveContent"?: boolean; "tier"?: UserTierData; "role"?: UserRoleData; };
```

```yaml
type: object
description: >
  Partial admin-only user update payload.

  All fields are optional. Omitted fields remain unchanged.

  Only one logical change category may be sent per request: profile/preferences
  fields, `role`, or `tier`.
properties:
  email:
    type: string
    format: email
    description: New email address. Null is invalid.
  firstName:
    type: string
    maxLength: 64
    nullable: true
    description: New first name.
    example: Ada
  lastName:
    type: string
    maxLength: 64
    nullable: true
    description: New last name.
    example: Lovelace
  language:
    allOf:
      - $ref: "#/components/schemas/LanguageData"
    nullable: true
    description: New preferred language.
  currency:
    allOf:
      - $ref: "#/components/schemas/CurrencyData"
    nullable: true
    description: New preferred currency.
  measurementUnit:
    allOf:
      - $ref: "#/components/schemas/MeasurementUnitData"
    nullable: true
    description: New preferred measurement unit system.
  showUnassessedOrSensitiveContent:
    type: boolean
    description: Omit to leave unchanged. Send `true` to show unassessed or
      sensitive content; send `false` to hide it. `null` is invalid.
    example: true
  tier:
    allOf:
      - $ref: "#/components/schemas/UserTierData"
    description: Omit to leave unchanged. Null is invalid.
  role:
    allOf:
      - $ref: "#/components/schemas/UserRoleData"
    description: Omit to leave unchanged. Null is invalid.

```


## PatchUserAccountData → PatchUserAccountData

Old generated shape:

```ts
type PatchUserAccountData = {
    /**
     * New first name (max 64 characters)
     */
    firstName?: string | null;
    /**
     * New last name (max 64 characters)
     */
    lastName?: string | null;
    /**
     * New preferred language
     */
    language?: LanguageData | null;
    /**
     * New preferred currency
     */
    currency?: CurrencyData | null;
    /**
     * New preferred measurement unit system
     */
    measurementUnit?: MeasurementUnitData | null;
    /**
     * New consent state for displaying prohibited content
     */
    prohibitedContentConsent?: boolean | null;
    /**
     * Optional structured postal address to persist for the user. When provided, the backend geocodes it and refreshes `geoAddress`.
     */
    structuredAddress?: StructuredAddressData | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PatchUserAccountData = { "firstName"?: string | null; "lastName"?: string | null; "language"?: LanguageData | null; "currency"?: CurrencyData | null; "measurementUnit"?: MeasurementUnitData | null; "showUnassessedOrSensitiveContent"?: boolean; };
```

```yaml
type: object
description: |
  Partial user account update data.
  All fields are optional - only provided fields will be updated.
properties:
  firstName:
    type: string
    maxLength: 64
    nullable: true
    description: New first name (max 64 characters)
    example: Jane
  lastName:
    type: string
    maxLength: 64
    nullable: true
    description: New last name (max 64 characters)
    example: Smith
  language:
    allOf:
      - $ref: "#/components/schemas/LanguageData"
    nullable: true
    description: New preferred language
  currency:
    allOf:
      - $ref: "#/components/schemas/CurrencyData"
    nullable: true
    description: New preferred currency
  measurementUnit:
    allOf:
      - $ref: "#/components/schemas/MeasurementUnitData"
    nullable: true
    description: New preferred measurement unit system
  showUnassessedOrSensitiveContent:
    type: boolean
    description: Omit to leave unchanged. Send `true` to show unassessed or
      sensitive content; send `false` to hide it. `null` is invalid.
    example: true

```


## PostBillingCheckoutData → PostBillingCheckoutData

Old generated shape:

```ts
type PostBillingCheckoutData = {
    plan: BillingPlanData;
    cycle: BillingCycleData;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PostBillingCheckoutData = { "plan": BillingPlanData; "cycle": BillingCycleData; };
```

```yaml
type: object
description: Request body for creating a Stripe checkout session for a subscription purchase
required:
  - plan
  - cycle
properties:
  plan:
    $ref: "#/components/schemas/BillingPlanData"
  cycle:
    $ref: "#/components/schemas/BillingCycleData"

```


## BillingPlanData → BillingPlanData

Old generated shape:

```ts
type BillingPlanData = 'PRO' | 'ULTIMATE';
```

Target shape (readable projection; exact constraints follow):

```ts
type BillingPlanData = "PRO" | "ULTIMATE";
```

```yaml
type: string
description: Subscription plan that should be purchased through Stripe Checkout
enum:
  - PRO
  - ULTIMATE
example: PRO

```


## BillingCycleData → BillingCycleData

Old generated shape:

```ts
type BillingCycleData = 'MONTHLY' | 'YEARLY';
```

Target shape (readable projection; exact constraints follow):

```ts
type BillingCycleData = "MONTHLY" | "YEARLY";
```

```yaml
type: string
description: Billing interval that should be used for the subscription purchase
enum:
  - MONTHLY
  - YEARLY
example: MONTHLY

```


## BillingSessionUrlData → BillingSessionUrlData

Old generated shape:

```ts
type BillingSessionUrlData = {
    /**
     * Hosted Stripe URL that the frontend should redirect the authenticated user to
     */
    url: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type BillingSessionUrlData = { "url": string; };
```

```yaml
type: object
description: Hosted Stripe session URL returned by the billing endpoints
required:
  - url
properties:
  url:
    type: string
    format: uri
    description: Hosted Stripe URL that the frontend should redirect the
      authenticated user to
    example: https://checkout.stripe.com/c/pay/cs_test_123

```


## PutNewsletterSubscriptionData → PutNewsletterSubscriptionData

Old generated shape:

```ts
type PutNewsletterSubscriptionData = {
    /**
     * Email address to subscribe to the newsletter
     */
    email: string;
    /**
     * Optional first name to sync with the subscription
     */
    firstName?: string | null;
    /**
     * Optional last name to sync with the subscription
     */
    lastName?: string | null;
    /**
     * Optional preferred language to sync with the subscription
     */
    language?: LanguageData | null;
    /**
     * Optional preferred currency to sync with the subscription
     */
    currency?: CurrencyData | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PutNewsletterSubscriptionData = { "email": string; "firstName"?: string | null; "lastName"?: string | null; "language"?: LanguageData | null; "currency"?: CurrencyData | null; };
```

```yaml
type: object
description: >
  Request body for creating or updating a newsletter subscription.

  `email` is required; all other fields are optional and may be omitted or set
  to `null`.
required:
  - email
properties:
  email:
    type: string
    format: email
    description: Email address to subscribe to the newsletter
    example: collector@example.com
  firstName:
    type: string
    maxLength: 64
    nullable: true
    description: Optional first name to sync with the subscription
    example: Ada
  lastName:
    type: string
    maxLength: 64
    nullable: true
    description: Optional last name to sync with the subscription
    example: Lovelace
  language:
    allOf:
      - $ref: "#/components/schemas/LanguageData"
    nullable: true
    description: Optional preferred language to sync with the subscription
  currency:
    allOf:
      - $ref: "#/components/schemas/CurrencyData"
    nullable: true
    description: Optional preferred currency to sync with the subscription

```


## UserTierData → UserTierData

Old generated shape:

```ts
type UserTierData = 'FREE' | 'PRO' | 'ULTIMATE';
```

Target shape (readable projection; exact constraints follow):

```ts
type UserTierData = "FREE" | "PRO" | "ULTIMATE";
```

```yaml
type: string
description: >
  The user's subscription tier, which determines limits and feature access (e.g.
  max watchlist entries, max search filters, allowed search filter fields).

  - `FREE`: Default tier for all users. Allows up to 20 watchlist entries, up to
  1 search filter (limited to `productQuery`, `price`, `state`,
  `excludeProductId`, and `lifecycle` filter fields), and up to 10 product
  matches per filter.

  - `PRO`: Premium tier. Allows up to 100 watchlist entries, up to 5 search
  filters with access to all filter fields, and unlimited product matches per
  filter.

  - `ULTIMATE`: Highest tier. Allows unlimited watchlist entries, unlimited
  search filters with access to all filter fields, and unlimited product matches
  per filter.
enum:
  - FREE
  - PRO
  - ULTIMATE
example: FREE

```


## UserRoleData → UserRoleData

Old generated shape:

```ts
type UserRoleData = 'USER' | 'ADMIN';
```

Target shape (readable projection; exact constraints follow):

```ts
type UserRoleData = "USER" | "ADMIN";
```

```yaml
type: string
description: |
  The user's role used for API authorization.
  - `USER`: Standard authenticated user.
  - `ADMIN`: Administrator with access to admin-only endpoints.
enum:
  - USER
  - ADMIN
example: USER

```


## GetNotificationData → NotificationData

Old generated shape:

```ts
type GetNotificationData = {
    /**
     * The ID of the domain event that triggered this notification.
     */
    originEventId: string;
    /**
     * Unique identifier of this notification record.
     */
    notificationId: string;
    payload: NotificationPayloadData;
    /**
     * Whether the user has seen this notification.
     */
    seen: boolean;
    /**
     * Whether the notification has been sent externally to the user via a third-party medium (e.g. mail, SMS). `true` means it was sent externally; `false` means it was not.
     */
    external: boolean;
    createdBy: ActorData;
    updatedBy: ActorData;
    /**
     * When the notification was created (RFC3339 format).
     */
    created: string;
    /**
     * When the notification was last updated (RFC3339 format).
     */
    updated: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type NotificationData = { "notificationId": string; "kind": "WATCHLIST_PRICE_CHANGED" | "WATCHLIST_AVAILABILITY_CHANGED" | "SEARCH_FILTER_MATCH" | "PARTNERSHIP_APPLICATION_APPROVED" | "PARTNERSHIP_APPLICATION_REJECTED"; "payload": NotificationPayloadData; "seen": boolean; "created": string; "updated": string; };
```

```yaml
type: object
required:
  - notificationId
  - kind
  - payload
  - seen
  - created
  - updated
properties:
  notificationId:
    type: string
  kind:
    type: string
    enum:
      - WATCHLIST_PRICE_CHANGED
      - WATCHLIST_AVAILABILITY_CHANGED
      - SEARCH_FILTER_MATCH
      - PARTNERSHIP_APPLICATION_APPROVED
      - PARTNERSHIP_APPLICATION_REJECTED
  payload:
    $ref: "#/components/schemas/NotificationPayloadData"
  seen:
    type: boolean
  created:
    type: string
    format: date-time
  updated:
    type: string
    format: date-time

```


## NotificationPayloadData → NotificationPayloadData

Old generated shape:

```ts
type NotificationPayloadData = ({
    type: 'WATCHLIST';
} & WatchlistNotificationPayloadData) | ({
    type: 'SEARCH_FILTER';
} & SearchFilterNotificationPayloadData) | ({
    type: 'PARTNER_APPLICATION';
} & PartnerApplicationNotificationPayloadData);
```

Target shape (readable projection; exact constraints follow):

```ts
type NotificationPayloadData = WatchlistNotificationPayloadData | SearchFilterNotificationPayloadData | PartnershipApplicationNotificationPayloadData;
```

```yaml
description: Reason-specific immutable snapshot. Its shape is selected by the
  parent `NotificationData.kind`.
oneOf:
  - $ref: "#/components/schemas/WatchlistNotificationPayloadData"
  - $ref: "#/components/schemas/SearchFilterNotificationPayloadData"
  - $ref: "#/components/schemas/PartnershipApplicationNotificationPayloadData"

```


## WatchlistNotificationPayloadData → WatchlistNotificationPayloadData

Old generated shape:

```ts
type WatchlistNotificationPayloadData = {
    /**
     * Discriminator field identifying this as a watchlist notification.
     */
    type: 'WATCHLIST';
    /**
     * Internal product identifier.
     */
    productId: string;
    /**
     * Unique identifier of the shop.
     */
    shopId: string;
    /**
     * Shop's own identifier for the product.
     */
    shopsProductId: string;
    /**
     * URL-friendly slug identifier for the shop.
     */
    shopSlugId: string;
    /**
     * URL-friendly slug identifier for the product (6-character suffix).
     */
    productSlugId: string;
    /**
     * Display name of the shop.
     */
    shopName: string;
    title: LocalizedTextData;
    /**
     * The first image of the product at the time the notification was generated.
     * Absent when the product had no images. The URL is always included (prohibited content filtering is skipped for notifications).
     *
     */
    image?: ProductImageData | null;
    /**
     * Raw URL to the product on the shop's website.
     */
    url: string;
    /**
     * Tracked or affiliate URL generated by the backend for user-facing navigation to the product.
     */
    viewUrl: string;
    watchlistPayload: WatchlistPayloadData;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type WatchlistNotificationPayloadData = { "productListingId": string; "listingSourceId": string; "sourceListingId": string; "listingSourceSlugId": string; "productListingTitleSlugId": string; "listingSourceName": string; "title": LocalizedTextData | null; "image": ProductListingImageData | null; "url": string; "viewUrl": string; "change": WatchlistNotificationChangeData; };
```

```yaml
type: object
required:
  - productListingId
  - listingSourceId
  - sourceListingId
  - listingSourceSlugId
  - productListingTitleSlugId
  - listingSourceName
  - title
  - image
  - url
  - viewUrl
  - change
properties:
  productListingId:
    type: string
  listingSourceId:
    type: string
  sourceListingId:
    type: string
  listingSourceSlugId:
    type: string
  productListingTitleSlugId:
    type: string
  listingSourceName:
    type: string
  title:
    allOf:
      - $ref: "#/components/schemas/LocalizedTextData"
    nullable: true
  image:
    allOf:
      - $ref: "#/components/schemas/ProductListingImageData"
    nullable: true
  url:
    type: string
    format: uri
  viewUrl:
    type: string
    format: uri
  change:
    $ref: "#/components/schemas/WatchlistNotificationChangeData"

```


## WatchlistPayloadData → (absent)

Old generated shape:

```ts
type WatchlistPayloadData = ({
    type: 'PRICE_CHANGE';
} & PriceChangeWatchlistPayloadData) | ({
    type: 'STATE_CHANGE';
} & StateChangeWatchlistPayloadData);
```


## PriceChangeWatchlistPayloadData → (absent)

Old generated shape:

```ts
type PriceChangeWatchlistPayloadData = {
    /**
     * Discriminator field identifying this as a price-change watchlist payload.
     */
    type: 'PRICE_CHANGE';
    /**
     * Previous price in the requested currency. Absent when price was unavailable in that currency.
     */
    oldPrice?: PriceData | null;
    /**
     * New price in the requested currency. Absent when price is unavailable in that currency.
     */
    newPrice?: PriceData | null;
};
```


## StateChangeWatchlistPayloadData → (absent)

Old generated shape:

```ts
type StateChangeWatchlistPayloadData = {
    /**
     * Discriminator field identifying this as a state-change watchlist payload.
     */
    type: 'STATE_CHANGE';
    oldState: ProductStateData;
    newState: ProductStateData;
};
```


## SearchFilterNotificationPayloadData → SearchFilterNotificationPayloadData

Old generated shape:

```ts
type SearchFilterNotificationPayloadData = {
    /**
     * Discriminator field identifying this as a search filter notification.
     */
    type: 'SEARCH_FILTER';
    /**
     * Internal product identifier.
     */
    productId: string;
    /**
     * Unique identifier of the shop.
     */
    shopId: string;
    /**
     * Shop's own identifier for the product.
     */
    shopsProductId: string;
    /**
     * URL-friendly slug identifier for the shop.
     */
    shopSlugId: string;
    /**
     * URL-friendly slug identifier for the product (6-character suffix).
     */
    productSlugId: string;
    /**
     * Display name of the shop.
     */
    shopName: string;
    title: LocalizedTextData;
    /**
     * The first image of the product at the time the notification was generated.
     * Absent when the product had no images. The URL is always included (prohibited content filtering is skipped for notifications).
     *
     */
    image?: ProductImageData | null;
    /**
     * Raw URL to the product on the shop's website.
     */
    url: string;
    /**
     * Tracked or affiliate URL generated by the backend for user-facing navigation to the product.
     */
    viewUrl: string;
    searchFilterPayload: SearchFilterPayloadData;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type SearchFilterNotificationPayloadData = { "productListingId": string; "userSearchFilterId": string; "userSearchFilterName": string; "listingSourceId": string; "sourceListingId": string; "listingSourceSlugId": string; "productListingTitleSlugId": string; "listingSourceName": string; "title": LocalizedTextData | null; "image": ProductListingImageData | null; "url": string; "viewUrl": string; };
```

```yaml
type: object
required:
  - productListingId
  - userSearchFilterId
  - userSearchFilterName
  - listingSourceId
  - sourceListingId
  - listingSourceSlugId
  - productListingTitleSlugId
  - listingSourceName
  - title
  - image
  - url
  - viewUrl
properties:
  productListingId:
    type: string
  userSearchFilterId:
    type: string
  userSearchFilterName:
    type: string
  listingSourceId:
    type: string
  sourceListingId:
    type: string
  listingSourceSlugId:
    type: string
  productListingTitleSlugId:
    type: string
  listingSourceName:
    type: string
  title:
    allOf:
      - $ref: "#/components/schemas/LocalizedTextData"
    nullable: true
  image:
    allOf:
      - $ref: "#/components/schemas/ProductListingImageData"
    nullable: true
  url:
    type: string
    format: uri
  viewUrl:
    type: string
    format: uri

```


## SearchFilterPayloadData → (absent)

Old generated shape:

```ts
type SearchFilterPayloadData = {
    /**
     * Unique identifier of the user's search filter that matched the product.
     */
    userSearchFilterId: string;
    /**
     * User-defined name of the search filter that matched the product.
     */
    userSearchFilterName: string;
};
```


## PartnerApplicationNotificationPayloadData → PartnershipApplicationNotificationPayloadData

Old generated shape:

```ts
type PartnerApplicationNotificationPayloadData = {
    /**
     * Discriminator field identifying this as a partner application notification.
     */
    type: 'PARTNER_APPLICATION';
    /**
     * Display name of the shop referenced by the partner application.
     */
    shopName: string;
    /**
     * Optional shop logo URL included with partner-application notifications when the related
     * application or linked existing shop has an image configured.
     * Absent when no shop logo URL is available.
     *
     */
    image?: string | null;
    partnerApplicationPayload: PartnerApplicationPayloadData;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type PartnershipApplicationNotificationPayloadData = { "partnershipApplicationId": string; "decision": "APPROVED" | "REJECTED"; "listingSourceName": string; "image": string | null; };
```

```yaml
type: object
required:
  - partnershipApplicationId
  - decision
  - listingSourceName
  - image
properties:
  partnershipApplicationId:
    type: string
  decision:
    type: string
    enum:
      - APPROVED
      - REJECTED
  listingSourceName:
    type: string
  image:
    type: string
    format: uri
    nullable: true

```


## PartnerApplicationPayloadData → (absent)

Old generated shape:

```ts
type PartnerApplicationPayloadData = ({
    type: 'APPROVED';
} & ApprovedPartnerApplicationPayloadData) | ({
    type: 'REJECTED';
} & RejectedPartnerApplicationPayloadData);
```


## ApprovedPartnerApplicationPayloadData → (absent)

Old generated shape:

```ts
type ApprovedPartnerApplicationPayloadData = {
    /**
     * Discriminator field identifying this as an approval payload.
     */
    type: 'APPROVED';
    /**
     * Unique identifier of the approved partner shop application.
     */
    partnerApplicationId: string;
};
```


## RejectedPartnerApplicationPayloadData → (absent)

Old generated shape:

```ts
type RejectedPartnerApplicationPayloadData = {
    /**
     * Discriminator field identifying this as a rejection payload.
     */
    type: 'REJECTED';
    /**
     * Unique identifier of the rejected partner shop application.
     */
    partnerApplicationId: string;
};
```


## PatchNotificationData → UpdateNotificationSeenData

Old generated shape:

```ts
type PatchNotificationData = {
    /**
     * Set to `true` to mark the notification as seen, `false` to mark it unseen.
     */
    seen?: boolean | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type UpdateNotificationSeenData = { "seen": boolean; };
```

```yaml
type: object
required:
  - seen
properties:
  seen:
    type: boolean

```


## NotificationCollectionData → NotificationCollectionData

Old generated shape:

```ts
type NotificationCollectionData = {
    /**
     * Notifications in the current page.
     */
    items: Array<GetNotificationData>;
    /**
     * Requested page size echoed back from the cursor payload; this does not necessarily equal `items.length`.
     */
    size: number;
    /**
     * Event ID cursor for the next page (UUID string).
     * Present only when more results are available.
     * Pass this value as the `searchAfter` query parameter to retrieve the next page.
     *
     */
    searchAfter?: string | null;
    /**
     * Total number of notifications for the user. May be absent in some cases.
     */
    total?: number | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type NotificationCollectionData = { "items": Array<NotificationData>; "size": number; "searchAfter"?: Array<string> | null; };
```

```yaml
type: object
required:
  - items
  - size
properties:
  items:
    type: array
    items:
      $ref: "#/components/schemas/NotificationData"
  size:
    type: integer
    minimum: 1
    maximum: 100
  searchAfter:
    type: array
    nullable: true
    minItems: 2
    maxItems: 2
    items:
      type: string
    description: Opaque `[created RFC3339 timestamp, Notification ID]` cursor for
      the next page; omitted when no further page exists.

```


## PostProductData → CreateProductListingData

Old generated shape:

```ts
type PostProductData = {
    /**
     * The shop's own identifier for the product. Must be unique within the shop.
     */
    shopsProductId: string;
    title: LocalizedTextData;
    description: LocalizedTextData;
    /**
     * Optional asking price for the product
     */
    price?: PriceData | null;
    /**
     * Optional lower bound of the estimated price range
     */
    priceEstimateMin?: PriceData | null;
    /**
     * Optional upper bound of the estimated price range
     */
    priceEstimateMax?: PriceData | null;
    state: ProductStateData;
    /**
     * URL to the product on the shop's website
     */
    url: string;
    /**
     * List of image URLs for the product. May be empty.
     */
    images: Array<string>;
    /**
     * RFC3339 timestamp of when the auction for this product starts.
     * Only relevant for auction-house shop types. Omit for non-auction products.
     *
     */
    auctionStart?: string | null;
    /**
     * RFC3339 timestamp of when the auction for this product ends.
     * Only relevant for auction-house shop types. Omit for non-auction products.
     *
     */
    auctionEnd?: string | null;
    /**
     * Optional raw name of the secondary seller for this product.
     * Only applicable for `AUCTION_PLATFORM` and `MARKETPLACE` shop types.
     * When provided, the backend resolves the seller shop by this name and associates the product with that seller.
     * When omitted, or when the shop type is neither `AUCTION_PLATFORM` nor `MARKETPLACE`, the partner shop itself is used as the seller.
     *
     */
    sellerName?: string | null;
    /**
     * Optional structured address to attach to the product for geo-aware indexing and search.
     */
    structuredAddress?: StructuredAddressData | null;
    /**
     * Optional coordinates to attach to the product for geo-aware indexing and search.
     */
    geoAddress?: GeoAddressData | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type CreateProductListingData = { "sourceListingId": string; "title": LocalizedTextData; "description": LocalizedTextData; "price"?: ProductListingPriceData | null; "priceEstimateMin"?: PriceData | null; "priceEstimateMax"?: PriceData | null; "availability"?: ListingAvailabilityData | null; "url": string; "images": Array<string>; "auctionStart"?: string | null; "auctionEnd"?: string | null; };
```

```yaml
type: object
description: |
  Data for creating a single product via the partner batch-create endpoint.
required:
  - sourceListingId
  - title
  - description
  - url
  - images
properties:
  sourceListingId:
    type: string
    description: The listing source's own identifier for the product. Must be unique
      within the listing source.
    example: baroque-violin-001
  title:
    $ref: "#/components/schemas/LocalizedTextData"
  description:
    $ref: "#/components/schemas/LocalizedTextData"
  price:
    allOf:
      - $ref: "#/components/schemas/ProductListingPriceData"
    nullable: true
    description: Optional asking-price assertion for the product.
  priceEstimateMin:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true
    description: Optional lower bound of the estimated price range
  priceEstimateMax:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true
    description: Optional upper bound of the estimated price range
  availability:
    allOf:
      - $ref: "#/components/schemas/ListingAvailabilityData"
    nullable: true
    description: Omit or send `null` when Aura has no reliable current availability
      assertion.
  url:
    type: string
    format: uri
    description: URL to the product on the listing source's website
    example: https://my-listing-source.com/product-listings/baroque-violin
  images:
    type: array
    items:
      type: string
      format: uri
    description: List of image URLs for the product. May be empty.
    example:
      - https://my-listing-source.com/images/violin-1.jpg
      - https://my-listing-source.com/images/violin-2.jpg
  auctionStart:
    type: string
    format: date-time
    nullable: true
    description: Optional RFC3339 auction timestamp.
    example: 2025-05-01T12:00:00Z
  auctionEnd:
    type: string
    format: date-time
    nullable: true
    description: Optional RFC3339 auction timestamp.
    example: 2025-05-10T12:00:00Z

```


## PartnerProductEnqueueFailuresResponse → PartnerProductListingBatchFailuresResponse

Old generated shape:

```ts
type PartnerProductEnqueueFailuresResponse = Array<string>;
```

Target shape (readable projection; exact constraints follow):

```ts
type PartnerProductListingBatchFailuresResponse = Array<{ "listingSourceId": string; "sourceListingId": string; "error": string; }>;
```

```yaml
type: array
description: >
  Failed entries from a synchronous partner-product batch. This response body is
  returned

  with HTTP 200 only when at least one entry in a non-empty batch succeeded.
items:
  type: object
  required:
    - listingSourceId
    - sourceListingId
    - error
  properties:
    listingSourceId:
      type: string
      description: ListingSource that owns the failed product entry.
    sourceListingId:
      type: string
      description: Partner-controlled identifier of the failed product entry.
    error:
      type: string
      description: Stable API error key for the failed product entry.
      example: PRODUCT_LISTING_NOT_FOUND
example:
  - listingSourceId: ls_6rd827eqfefsva9teecmwa3ate
    sourceListingId: baroque-violin-002
    error: PRODUCT_LISTING_NOT_FOUND

```


## PatchProductData → UpdateProductListingData

Old generated shape:

```ts
type PatchProductData = {
    /**
     * The shop's own identifier for the product to update. The request is accepted for asynchronous processing even though product existence is evaluated later during ingestion.
     */
    shopsProductId: string;
    /**
     * Optional updated asking price for the product. Omit to leave the current price unchanged.
     */
    price?: PriceData | null;
    /**
     * Optional updated product state. Omit to leave the current state unchanged.
     */
    state?: ProductStateData;
    /**
     * Optional updated lower bound of the estimated price range. Omit to leave the current value unchanged.
     */
    priceEstimateMin?: PriceData | null;
    /**
     * Optional updated upper bound of the estimated price range. Omit to leave the current value unchanged.
     */
    priceEstimateMax?: PriceData | null;
    /**
     * Optional updated URL to the product on the shop's website. Omit to leave the current URL unchanged.
     */
    url?: string | null;
    /**
     * Optional updated list of image URLs for the product. Omit to leave the current images unchanged.
     */
    images?: Array<string> | null;
    /**
     * Optional updated RFC3339 timestamp of when the auction starts. Omit to leave the current value unchanged.
     */
    auctionStart?: string | null;
    /**
     * Optional updated RFC3339 timestamp of when the auction ends. Omit to leave the current value unchanged.
     */
    auctionEnd?: string | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type UpdateProductListingData = { "sourceListingId": string; "price"?: ProductListingPriceData | null; "availability"?: ListingAvailabilityData | null; "priceEstimateMin"?: PriceData | null; "priceEstimateMax"?: PriceData | null; "url"?: string; "images"?: Array<string>; "auctionStart"?: string | null; "auctionEnd"?: string | null; };
```

```yaml
type: object
description: >
  Data for synchronously updating one ProductListing. Omitted fields remain
  unchanged.

  `availability: null` clears the current assertion. `null` clears price and
  auction fields;

  `url` and `images` reject null. Send `images: []` to remove all images.
required:
  - sourceListingId
properties:
  sourceListingId:
    type: string
    description: The listing source's own identifier for the product to update.
      Product existence is evaluated synchronously.
    example: baroque-violin-001
  price:
    allOf:
      - $ref: "#/components/schemas/ProductListingPriceData"
    nullable: true
    description: Omit to leave unchanged. Send null to clear the current
      asking-price assertion.
  availability:
    allOf:
      - $ref: "#/components/schemas/ListingAvailabilityData"
    nullable: true
    description: Omit to leave unchanged. Send null to clear the current assertion.
  priceEstimateMin:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true
    description: Omit to leave unchanged. Send null to clear the current value.
  priceEstimateMax:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true
    description: Omit to leave unchanged. Send null to clear the current value.
  url:
    type: string
    format: uri
    description: Omit to leave unchanged. Null is invalid.
    example: https://my-listing-source.com/product-listings/baroque-violin
  images:
    type: array
    items:
      type: string
      format: uri
    description: Omit to leave unchanged. Send [] to remove all images; null is invalid.
    example:
      - https://my-listing-source.com/images/violin-1.jpg
  auctionStart:
    type: string
    format: date-time
    nullable: true
    description: Omit to leave unchanged. Send null to clear the auction start.
    example: 2026-04-10T10:00:00Z
  auctionEnd:
    type: string
    format: date-time
    nullable: true
    description: Omit to leave unchanged. Send null to clear the auction end.
    example: 2026-04-10T12:00:00Z

```


## PutProductData → UpsertProductListingData

Old generated shape:

```ts
type PutProductData = {
    /**
     * The shop's own identifier for the product. Must be unique within the shop.
     */
    shopsProductId: string;
    /**
     * Optional localized title for the product. Used only when creating a new product.
     */
    title?: LocalizedTextData | null;
    /**
     * Optional localized description of the product. Used only when creating a new product.
     */
    description?: LocalizedTextData | null;
    /**
     * Optional asking price for the product. Applied on create and on update when a non-null value is provided. Omit or send `null` to leave the current stored price unchanged.
     */
    price?: PriceData | null;
    /**
     * Optional lower bound of the estimated price range. Applied on both create and update paths. Omit or send `null` to leave the current stored lower bound unchanged.
     */
    priceEstimateMin?: PriceData | null;
    /**
     * Optional upper bound of the estimated price range. Applied on both create and update paths. Omit or send `null` to leave the current stored upper bound unchanged.
     */
    priceEstimateMax?: PriceData | null;
    /**
     * Optional product state. Applied on both create and update paths.
     */
    state?: ProductStateData | null;
    /**
     * URL to the product on the shop's website. Applied on both create and update paths. Omit or send `null` to leave the current stored URL unchanged.
     */
    url?: string | null;
    /**
     * List of image URLs for the product. Applied on both create and update paths. On update, the provided array replaces the stored image set; omitting `images` or sending `null` is treated as an empty list and therefore clears all stored images.
     */
    images?: Array<string> | null;
    /**
     * RFC3339 timestamp of when the auction for this product starts.
     * Only relevant for auction-house shop types. Applied on both create and update paths.
     * Omit or send `null` to leave the current stored start timestamp unchanged.
     *
     */
    auctionStart?: string | null;
    /**
     * RFC3339 timestamp of when the auction for this product ends.
     * Only relevant for auction-house shop types. Applied on both create and update paths.
     * Omit or send `null` to leave the current stored end timestamp unchanged.
     *
     */
    auctionEnd?: string | null;
    /**
     * Optional raw name of the secondary seller for this product.
     * Only applicable for `AUCTION_PLATFORM` and `MARKETPLACE` shop types.
     * When provided, the backend resolves the seller shop by this name and associates the product with that seller.
     * When omitted, or when the shop type is neither `AUCTION_PLATFORM` nor `MARKETPLACE`, the partner shop itself is used as the seller.
     * Used only when creating a new product.
     *
     */
    sellerName?: string | null;
    /**
     * Optional structured address to attach to the product for geo-aware indexing and search. Used only when creating a new product.
     */
    structuredAddress?: StructuredAddressData | null;
    /**
     * Optional coordinates to attach to the product for geo-aware indexing and search. Used only when creating a new product.
     */
    geoAddress?: GeoAddressData | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type UpsertProductListingData = { "sourceListingId": string; "title"?: LocalizedTextData | null; "description"?: LocalizedTextData | null; "price"?: ProductListingPriceData | null; "priceEstimateMin"?: PriceData | null; "priceEstimateMax"?: PriceData | null; "availability"?: ListingAvailabilityData | null; "url"?: string | null; "images"?: Array<string>; "auctionStart"?: string | null; "auctionEnd"?: string | null; };
```

```yaml
type: object
description: >
  Data for synchronously upserting one ProductListing. Only `sourceListingId` is
  required.

  Availability, price, each price estimate, and each auction timestamp are
  tri-state: omitted

  preserves an existing value, `null` clears it, and a concrete value sets it.
  On creation,

  omitted and `null` both mean no value. Upsert restores a withdrawn listing
  before current

  facts apply. Images and URL use the field-specific rules documented below.
required:
  - sourceListingId
properties:
  sourceListingId:
    type: string
    description: The listing source's own identifier for the product. Must be unique
      within the listing source.
    example: baroque-violin-001
  title:
    allOf:
      - $ref: "#/components/schemas/LocalizedTextData"
    nullable: true
    description: Optional localized title for the product. Used only when creating a
      new product.
  description:
    allOf:
      - $ref: "#/components/schemas/LocalizedTextData"
    nullable: true
    description: Optional localized description of the product. Used only when
      creating a new product.
  price:
    allOf:
      - $ref: "#/components/schemas/ProductListingPriceData"
    nullable: true
    description: Optional current asking-price assertion. Omit to leave it
      unchanged; send null to clear it; send a tagged monetary or on-request
      value to set it. On creation, omitted and null both mean no assertion.
  priceEstimateMin:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true
    description: Optional lower bound of the estimated price range. On an existing
      listing, omit to preserve, send `null` to clear, or send a value to set.
      On creation, omitted and `null` both mean no lower bound.
  priceEstimateMax:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true
    description: Optional upper bound of the estimated price range. On an existing
      listing, omit to preserve, send `null` to clear, or send a value to set.
      On creation, omitted and `null` both mean no upper bound.
  availability:
    allOf:
      - $ref: "#/components/schemas/ListingAvailabilityData"
    nullable: true
    description: Omit to preserve an existing assertion; send null to clear it; send
      a code to set it.
  url:
    type: string
    format: uri
    nullable: true
    description: URL to the product on the listing source's website. On an existing
      listing, omit or send `null` to preserve the current URL; send a value to
      replace it. URL is non-clearable.
    example: https://my-listing-source.com/product-listings/baroque-violin
  images:
    type: array
    items:
      type: string
      format: uri
    description: List of image URLs for the product. On an existing listing, omit to
      preserve the stored image set, send `[]` to clear it, or send an array to
      replace it. `null` is invalid.
    example:
      - https://my-listing-source.com/images/violin-1.jpg
      - https://my-listing-source.com/images/violin-2.jpg
  auctionStart:
    type: string
    format: date-time
    nullable: true
    description: Optional RFC3339 auction timestamp.
    example: 2025-05-01T12:00:00Z
  auctionEnd:
    type: string
    format: date-time
    nullable: true
    description: Optional RFC3339 auction timestamp.
    example: 2025-05-10T12:00:00Z

```


## WoocommerceProductWebhookImageData → WoocommerceProductWebhookImageData

Old generated shape:

```ts
type WoocommerceProductWebhookImageData = {
    /**
     * Absolute URL of a product image.
     */
    src: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type WoocommerceProductWebhookImageData = { "src": string; };
```

```yaml
type: object
description: Image object extracted from a WooCommerce product payload.
required:
  - src
properties:
  src:
    type: string
    format: uri
    description: Absolute URL of a product image.
    example: https://aura-historia-test.local/wp-content/uploads/2026/05/product.jpg

```


## WoocommerceProductWebhookUpsertData → WoocommerceProductWebhookUpsertData

Old generated shape:

```ts
type WoocommerceProductWebhookUpsertData = {
    /**
     * WooCommerce product identifier. It is converted to the internal `shopsProductId`.
     */
    id: number;
    /**
     * Product title from WooCommerce.
     */
    name: string;
    /**
     * Public URL of the WooCommerce product.
     */
    permalink: string;
    /**
     * Optional HTML product description. The backend converts it to plain text for indexing.
     */
    description?: string | null;
    /**
     * Optional HTML short description used when `description` is absent.
     */
    short_description?: string | null;
    /**
     * Optional decimal price string from WooCommerce.
     * The backend accepts ASCII digits with an optional fractional part, trims whitespace,
     * and truncates the fractional part to at most two digits before storing the amount in
     * the shop's configured `woocommerceCurrency`.
     *
     */
    price?: string | null;
    /**
     * Optional WooCommerce product status string.
     * Recognized mappings are: `publish` -> `AVAILABLE` unless `stock_status` is `outofstock`,
     * `draft` / `pending` / `private` -> `LISTED`, `trash` -> `REMOVED`, and any other value -> `UNKNOWN`.
     *
     */
    status?: string | null;
    /**
     * Optional WooCommerce stock-status string.
     * When `status` is `publish`, `outofstock` maps to `SOLD`; all other values map to `AVAILABLE`.
     *
     */
    stock_status?: string | null;
    /**
     * Optional list of WooCommerce product images. Missing payload fields are treated as an empty list.
     */
    images?: Array<WoocommerceProductWebhookImageData>;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type WoocommerceProductWebhookUpsertData = { "id": number; "name"?: string; "permalink"?: string; "description"?: string | null; "short_description"?: string | null; "price"?: string | null; "status"?: string | null; "stock_status"?: string | null; "date_modified_gmt"?: string | null; "images"?: Array<WoocommerceProductWebhookImageData>; };
```

```yaml
type: object
description: >
  WooCommerce product payload accepted for `product.created` and
  `product.updated`.

  Every event requires `id`. `status: publish` captures an UPSERT and requires
  nonblank `name` and `permalink`.

  `status: trash`, `draft`, `pending`, or `private` captures a DELETE and
  requires only `id`; missing or

  unsupported status is authorized ignored input and also requires only `id`.
required:
  - id
properties:
  id:
    type: integer
    format: int64
    minimum: 0
    description: WooCommerce product identifier. It is converted to the internal
      `sourceListingId`.
    example: 17
  name:
    type: string
    description: "Nonblank product title required only when `status: publish`
      captures an UPSERT."
    example: Test Produkt Titel
  permalink:
    type: string
    format: uri
    description: "Public URL required only when `status: publish` captures an UPSERT."
    example: http://aura-historia-test.local/product/test-produkt-titel/
  description:
    type: string
    nullable: true
    description: Optional HTML product description. The backend converts it to plain
      text for indexing.
    example: |
      <p>Hayde yallah test beschreibung</p>
  short_description:
    type: string
    nullable: true
    description: Optional HTML short description used when `description` is absent.
    example: |
      <p>Hayde yallah kurze test beschreibung</p>
  price:
    type: string
    nullable: true
    pattern: ^(?:[0-9]+(?:\.[0-9]+)?|)$
    description: >
      Optional WooCommerce price string for a captured `status: publish` UPSERT.

      Intake writes raw-values V2 `MACHINE_DECIMAL`. A nonblank value must be an
      untrimmed unsigned ASCII decimal

      (`digits` or `digits.digits`): no whitespace, signs, grouping separators,
      or currency symbols. A nonblank

      `SET` requires the listing source's configured `woocommerceCurrency`.
      Fractional digits beyond the configured

      currency minor-unit scale are accepted only when every excess digit is
      `0`; a nonzero excess digit is

      rejected rather than truncated. A blank source string maps to `CLEAR`.
    example: "42.69"
  status:
    type: string
    nullable: true
    description: >
      Optional WooCommerce product status string.

      `publish` captures an UPSERT and requires nonblank `name` and `permalink`.
      `draft`, `pending`,

      `private`, and `trash` capture a DELETE and require only `id`. Unsupported
      or missing status is

      authorized ignored input: it causes no destructive write and does not
      require `name` or `permalink`.
    example: publish
  stock_status:
    type: string
    nullable: true
    description: >
      Optional WooCommerce stock-status string.

      For `publish`, `instock` maps to `IN_STOCK`, `outofstock` to
      `OUT_OF_STOCK`, and

      `onbackorder` to `BACK_ORDER`. Missing or unsupported stock status never
      implies a sale.
    example: instock
  date_modified_gmt:
    type: string
    nullable: true
    description: Optional WooCommerce product modification timestamp. When the
      topic/status maps to raw capture, accepted forms are no-offset GMT
      interpreted as UTC, RFC3339 `Z`, and RFC3339 `+00:00`; malformed or
      nonzero-offset values are rejected. A valid value establishes provider
      source order; omit it when no source-ordering guarantee is available.
    example: 2026-09-06T12:34:56
  images:
    type: array
    description: Optional list of WooCommerce product images. Missing payload fields
      are treated as an empty list.
    items:
      $ref: "#/components/schemas/WoocommerceProductWebhookImageData"
    example: []

```


## WoocommerceProductWebhookDeleteData → WoocommerceProductWebhookDeleteData

Old generated shape:

```ts
type WoocommerceProductWebhookDeleteData = {
    /**
     * WooCommerce product identifier. It is converted to the internal `shopsProductId`.
     */
    id: number;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type WoocommerceProductWebhookDeleteData = { "id": number; "date_modified_gmt"?: string | null; };
```

```yaml
type: object
description: >
  WooCommerce product payload accepted for `product.deleted`.

  Only `id` is required. If `name` or `permalink` are provided they may still be
  used by the backend,

  but the event remains valid with just the product ID.
required:
  - id
properties:
  id:
    type: integer
    format: int64
    minimum: 0
    description: WooCommerce product identifier. It is converted to the internal
      `sourceListingId`.
    example: 17
  date_modified_gmt:
    type: string
    nullable: true
    description: Optional WooCommerce product modification timestamp. Accepted forms
      are no-offset GMT interpreted as UTC, RFC3339 `Z`, and RFC3339 `+00:00`;
      nonzero offsets are rejected. A valid value establishes provider source
      order; omit it when no source-ordering guarantee is available.
    example: 2026-09-06T12:34:56

```


## PartnerShopApplicationStateData → PartnershipApplicationStateData

Old generated shape:

```ts
type PartnerShopApplicationStateData = 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'APPROVED';
```

Target shape (readable projection; exact constraints follow):

```ts
type PartnershipApplicationStateData = "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
```

```yaml
type: string
enum:
  - SUBMITTED
  - IN_REVIEW
  - APPROVED
  - REJECTED
  - WITHDRAWN

```


## ExecutionStateData → (absent)

Old generated shape:

```ts
type ExecutionStateData = 'PROCESSING' | 'WAITING' | 'COMPLETED';
```


## GetPartnerShopApplicationPayloadData → (absent)

Old generated shape:

```ts
type GetPartnerShopApplicationPayloadData = {
    /**
     * Discriminator value indicating this payload targets an existing shop.
     */
    type: 'EXISTING';
    /**
     * Hydrated data for the existing shop.
     */
    shop: GetShopData;
} | {
    /**
     * Discriminator value indicating this payload describes a new shop.
     */
    type: 'NEW';
    /**
     * Display name of the new shop.
     */
    shopName: string;
    shopType: ShopTypeData;
    /**
     * Domains associated with the new shop.
     * Domains are normalized (lowercase, no scheme, no www prefix, no path/query/fragment).
     *
     */
    shopDomains: Array<string>;
    /**
     * Optional primary URL of the requested new shop website.
     */
    shopUrl?: string | null;
    /**
     * Optional URL to the new shop's logo or image.
     */
    shopImage?: string | null;
    shopStructuredAddress?: StructuredAddressData;
    /**
     * Optional public contact phone number for the requested new shop.
     */
    shopPhone?: string;
    /**
     * Optional public contact email address for the requested new shop.
     */
    shopEmail?: string;
};
```


## GetPartnerShopApplicationData → OwnPartnershipApplicationData

Old generated shape:

```ts
type GetPartnerShopApplicationData = {
    /**
     * Unique identifier of the partner shop application.
     */
    id: string;
    /**
     * Unique identifier of the user who submitted the partner shop application.
     */
    applicantUserId: string;
    /**
     * Review/business state of the application.
     */
    businessState: PartnerShopApplicationStateData;
    /**
     * Workflow execution state of the application.
     */
    executionState: ExecutionStateData;
    payload: GetPartnerShopApplicationPayloadData;
    createdBy: ActorData;
    updatedBy: ActorData;
    /**
     * When the application was created (RFC3339 format).
     */
    created: string;
    /**
     * When the application was last updated (RFC3339 format).
     */
    updated: string;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type OwnPartnershipApplicationData = { "id": string; "state": PartnershipApplicationStateData; "proposal": PartnershipApplicationProposalData; };
```

```yaml
type: object
required:
  - id
  - state
  - proposal
properties:
  id:
    type: string
  state:
    $ref: "#/components/schemas/PartnershipApplicationStateData"
  proposal:
    $ref: "#/components/schemas/PartnershipApplicationProposalData"

```


## PostPartnerShopApplicationPayloadData → SubmitPartnershipApplicationData

Old generated shape:

```ts
type PostPartnerShopApplicationPayloadData = {
    /**
     * Discriminator value indicating this payload targets an existing shop.
     */
    type: 'EXISTING';
    /**
     * Unique identifier of the existing shop to apply for.
     */
    shopId: string;
} | {
    /**
     * Discriminator value indicating this payload describes a new shop.
     */
    type: 'NEW';
    /**
     * Display name of the new shop.
     */
    shopName: string;
    shopType: ShopTypeData;
    /**
     * Domains associated with the new shop.
     * Domains are normalized (lowercase, no scheme, no www prefix, no path/query/fragment).
     *
     */
    shopDomains: Array<string>;
    /**
     * Optional primary URL of the requested new shop website.
     */
    shopUrl?: string | null;
    /**
     * Optional URL to the new shop's logo or image.
     */
    shopImage?: string | null;
    /**
     * Optional structured postal address for the requested new shop.
     */
    shopStructuredAddress?: StructuredAddressData | null;
    /**
     * Optional public contact phone number for the requested new shop.
     */
    shopPhone?: string | null;
    /**
     * Optional public contact email address for the requested new shop.
     */
    shopEmail?: string | null;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type SubmitPartnershipApplicationData = { "proposal": PartnershipApplicationProposalData; };
```

```yaml
type: object
required:
  - proposal
properties:
  proposal:
    $ref: "#/components/schemas/PartnershipApplicationProposalData"

```


## PatchPartnerShopApplicationData → (absent)

Old generated shape:

```ts
type PatchPartnerShopApplicationData = {
    /**
     * Updated display name of the shop.
     */
    shopName?: string;
    /**
     * Updated shop type classification.
     */
    shopType?: ShopTypeData;
    /**
     * Updated set of domains for the shop. Replaces the existing domains entirely.
     * Domains are normalized (lowercase, no scheme, no www prefix, no path/query/fragment).
     *
     */
    shopDomains?: Array<string>;
    /**
     * Updated primary URL of the requested new shop website. When omitted or set to `null`, the current value remains unchanged.
     */
    shopUrl?: string | null;
    /**
     * Updated URL to the shop's logo or image. When omitted or set to `null`, the current image remains unchanged.
     */
    shopImage?: string | null;
    /**
     * Updated structured postal address for the requested new shop.
     * When provided with at least one non-empty component, the address is later geocoded during shop creation.
     * When omitted or set to `null`, the current address remains unchanged.
     *
     */
    shopStructuredAddress?: StructuredAddressData | null;
    /**
     * Updated public contact phone number for the requested new shop. When omitted or set to `null`, the current value remains unchanged.
     */
    shopPhone?: string | null;
    /**
     * Updated public contact email address for the requested new shop. When omitted or set to `null`, the current value remains unchanged.
     */
    shopEmail?: string | null;
};
```


## AdminPatchPartnerShopApplicationData → (absent)

Old generated shape:

```ts
type AdminPatchPartnerShopApplicationData = {
    /**
     * Updated display name of the shop.
     */
    shopName?: string;
    /**
     * Updated shop type classification.
     */
    shopType?: ShopTypeData;
    /**
     * Updated set of domains for the shop. Replaces the existing domains entirely.
     * Domains are normalized (lowercase, no scheme, no www prefix, no path/query/fragment).
     *
     */
    shopDomains?: Array<string>;
    /**
     * Updated primary URL of the requested new shop website. When omitted or set to `null`, the current value remains unchanged.
     */
    shopUrl?: string | null;
    /**
     * Updated URL to the shop's logo or image. When omitted or set to `null`, the current image remains unchanged.
     */
    shopImage?: string | null;
    /**
     * Updated structured postal address for the requested new shop.
     * When provided with at least one non-empty component, the address is later geocoded during shop creation.
     * When omitted or set to `null`, the current address remains unchanged.
     *
     */
    shopStructuredAddress?: StructuredAddressData | null;
    /**
     * Updated public contact phone number for the requested new shop. When omitted or set to `null`, the current value remains unchanged.
     */
    shopPhone?: string | null;
    /**
     * Updated public contact email address for the requested new shop. When omitted or set to `null`, the current value remains unchanged.
     */
    shopEmail?: string | null;
};
```


## PartnerShopApplicationDecisionData → (absent)

Old generated shape:

```ts
type PartnerShopApplicationDecisionData = 'APPROVE' | 'REJECT';
```


## PostPartnerShopApplicationDecisionData → DecidePartnershipApplicationData

Old generated shape:

```ts
type PostPartnerShopApplicationDecisionData = {
    decision: PartnerShopApplicationDecisionData;
};
```

Target shape (readable projection; exact constraints follow):

```ts
type DecidePartnershipApplicationData = { "decision": "APPROVE" | "REJECT"; };
```

```yaml
type: object
required:
  - decision
properties:
  decision:
    type: string
    enum:
      - APPROVE
      - REJECT

```


## PatchShopDataWritable → (absent)

Old generated shape:

```ts
type PatchShopDataWritable = {
    /**
     * Optional updated shop type classification.
     */
    shopType?: ShopTypeData | null;
    /**
     * Optional updated set of domains for the shop.
     * When provided, this replaces the existing domains entirely.
     * Domains are normalized (lowercase, no scheme, no www prefix, no path/query/fragment).
     *
     */
    domains?: Array<string> | null;
    /**
     * Optional updated Shopify storefront domain used for Shopify partner-shop event matching.
     * Normalized with the same rules as `domains`.
     * When omitted or set to `null`, the current Shopify domain remains unchanged.
     *
     */
    shopifyDomain?: string | null;
    /**
     * Optional updated Shopify currency for the shop, serialized as an ISO 4217 code.
     * When omitted or set to `null`, the current Shopify currency remains unchanged.
     *
     */
    shopifyCurrency?: CurrencyData | null;
    /**
     * Optional updated Shopify default language for the shop.
     * When configured, Shopify product lifecycle events for this shop are ingested using this language.
     * When absent on the stored shop record, Shopify product lifecycle events currently fail instead of inferring or defaulting a language.
     * When omitted or set to `null`, the current Shopify language remains unchanged.
     *
     */
    shopifyLanguage?: LanguageData | null;
    /**
     * Optional replacement WooCommerce webhook secret used to validate HMAC signatures on
     * `POST /api/v1/webhooks/woocommerce/{shopId}`.
     * When omitted or set to `null`, the current webhook secret remains unchanged.
     * This field is write-only and is never returned by read responses.
     *
     */
    woocommerceWebhookSecret?: string | null;
    /**
     * Optional updated WooCommerce currency for the shop, serialized as an ISO 4217 code.
     * When omitted or set to `null`, the current WooCommerce currency remains unchanged.
     * This currency is used when WooCommerce webhook payloads provide a non-empty `price`.
     *
     */
    woocommerceCurrency?: CurrencyData | null;
    /**
     * Optional updated WooCommerce default language for the shop.
     * When configured, WooCommerce webhook-ingested products for this shop are ingested using this language.
     * When absent on the stored shop record, WooCommerce webhook requests currently fail instead of inferring or defaulting a language.
     * When omitted or set to `null`, the current WooCommerce language remains unchanged.
     *
     */
    woocommerceLanguage?: LanguageData | null;
    /**
     * Optional updated primary URL of the shop website.
     * When omitted or set to `null`, the current URL remains unchanged.
     *
     */
    url?: string | null;
    /**
     * Optional updated URL to the shop's logo or image.
     * When omitted or set to `null`, the current image is left unchanged.
     *
     */
    image?: string | null;
    /**
     * Optional updated structured postal address.
     * When provided with at least one non-empty component, the backend geocodes it and refreshes `geoAddress`.
     * When omitted or set to `null`, the current address remains unchanged.
     *
     */
    structuredAddress?: StructuredAddressData | null;
    /**
     * Optional updated public contact phone number. When omitted or set to `null`, the current phone number remains unchanged.
     */
    phone?: string | null;
    /**
     * Optional updated public contact email address. When omitted or set to `null`, the current email address remains unchanged.
     */
    email?: string | null;
};
```


## PostShopDataWritable → (absent)

Old generated shape:

```ts
type PostShopDataWritable = {
    /**
     * Display name of the shop. Used to derive the human-readable `shopSlugId`.
     */
    name: string;
    shopType: ShopTypeData;
    /**
     * Unique set of domains associated with the shop.
     * Input values are normalized by stripping any `http://` or `https://` scheme, optional `www.` prefix,
     * and any port, path, query, or fragment, then lowercasing the remaining domain.
     *
     */
    domains: Array<string>;
    /**
     * Optional Shopify storefront domain associated with the shop.
     * Used by the backend to match Shopify product lifecycle events to the shop.
     * Input values are normalized with the same rules as `domains`.
     *
     */
    shopifyDomain?: string | null;
    /**
     * Optional Shopify currency associated with the shop, serialized as an ISO 4217 code.
     */
    shopifyCurrency?: CurrencyData | null;
    /**
     * Optional Shopify default language associated with the shop.
     * Relevant for shops using Shopify partner-shop ingestion.
     * When configured, Shopify product lifecycle events for this shop are ingested using this language.
     * When omitted, Shopify product lifecycle events for this shop currently fail instead of inferring or defaulting a language.
     *
     */
    shopifyLanguage?: LanguageData | null;
    /**
     * Optional WooCommerce webhook secret stored for validating HMAC signatures on
     * `POST /api/v1/webhooks/woocommerce/{shopId}`.
     * This field is write-only and is never returned by read responses.
     *
     */
    woocommerceWebhookSecret?: string | null;
    /**
     * Optional WooCommerce currency associated with the shop, serialized as an ISO 4217 code.
     * This currency is used when WooCommerce webhook payloads provide a non-empty `price`.
     *
     */
    woocommerceCurrency?: CurrencyData | null;
    /**
     * Optional WooCommerce default language associated with the shop.
     * Relevant for shops using `POST /api/v1/webhooks/woocommerce/{shopId}`.
     * When configured, WooCommerce webhook-ingested products for this shop are ingested using this language.
     * When omitted, WooCommerce webhook requests for this shop currently fail instead of inferring or defaulting a language.
     *
     */
    woocommerceLanguage?: LanguageData | null;
    /**
     * Optional primary URL of the shop website.
     */
    url?: string | null;
    /**
     * Optional URL to the shop's logo or image.
     */
    image?: string | null;
    /**
     * Optional structured postal address.
     * When provided, the backend geocodes it and stores the resulting coordinates in `geoAddress`.
     *
     */
    structuredAddress?: StructuredAddressData | null;
    /**
     * Optional public contact phone number of the shop.
     */
    phone?: string | null;
    /**
     * Optional public contact email address of the shop.
     */
    email?: string | null;
};
```


## (new) → ProductListingSummaryPriceValuationData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingSummaryPriceValuationData = { "type": "CURRENT"; "fxRateId": string; "capturedAt": string; } | { "type": "SALE_OBSERVATION"; "fxRateId": string; "observedAt": string; };
```

```yaml
oneOf:
  - type: object
    required:
      - type
      - fxRateId
      - capturedAt
    properties:
      type:
        type: string
        enum:
          - CURRENT
      fxRateId:
        type: string
      capturedAt:
        type: string
        format: date-time
  - type: object
    required:
      - type
      - fxRateId
      - observedAt
    properties:
      type:
        type: string
        enum:
          - SALE_OBSERVATION
      fxRateId:
        type: string
      observedAt:
        type: string
        format: date-time

```


## (new) → ProductListingPricingData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingPricingData = { "price"?: ProductListingPriceData | null; "priceEstimateMin"?: PriceData | null; "priceEstimateMax"?: PriceData | null; };
```

```yaml
type: object
properties:
  price:
    allOf:
      - $ref: "#/components/schemas/ProductListingPriceData"
    nullable: true
  priceEstimateMin:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true
  priceEstimateMax:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true

```


## (new) → ProductListingPricingValuationData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingPricingValuationData = { "type": "CURRENT"; "fxRateId": string; "capturedAt": string; } | { "type": "SALE_OBSERVATION"; "fxRateId": string; "capturedAt": string; "observedAt": string; };
```

```yaml
oneOf:
  - type: object
    required:
      - type
      - fxRateId
      - capturedAt
    properties:
      type:
        type: string
        enum:
          - CURRENT
      fxRateId:
        type: string
      capturedAt:
        type: string
        format: date-time
  - type: object
    required:
      - type
      - fxRateId
      - capturedAt
      - observedAt
    properties:
      type:
        type: string
        enum:
          - SALE_OBSERVATION
      fxRateId:
        type: string
      capturedAt:
        type: string
        format: date-time
      observedAt:
        type: string
        format: date-time

```


## (new) → ProductListingSearchCursorData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingSearchCursorData = { "fxRateId": string; "searchAfter": Array<unknown>; };
```

```yaml
type: object
required:
  - fxRateId
  - searchAfter
properties:
  fxRateId:
    type: string
    description: Persisted FX snapshot used for active Product filtering and display
      values in this cursor chain.
  searchAfter:
    type: array
    items: {}
    description: Internal OpenSearch continuation token.
example:
  fxRateId: fx_0cwktgjtwnf4tb6hf2f8zm0x5k
  searchAfter:
    - 2999
    - pl_5xdb465tg1enarx2knf04mxbxj

```


## (new) → PersonalizedProductListingSearchResultData

Target shape (readable projection; exact constraints follow):

```ts
type PersonalizedProductListingSearchResultData = { "items": Array<PersonalizedProductListingSummaryData>; "size": number; "total"?: number | null; "searchAfter"?: Array<unknown> | null; };
```

```yaml
type: object
description: >
  Paginated collection of personalized product-listings using cursor-based
  pagination (search-after pattern).

  Each product may include user-specific state when the request is
  authenticated.
required:
  - items
  - size
properties:
  items:
    type: array
    items:
      $ref: "#/components/schemas/PersonalizedProductListingSummaryData"
    description: Array of personalized product summaries in the current page
  size:
    type: integer
    minimum: 0
    description: Number of product-listings returned in the current page
    example: 21
  total:
    type: integer
    minimum: 0
    description: Total number of product-listings matching the query (optional, may
      not always be available)
    nullable: true
    example: 127
  searchAfter:
    type: array
    items: {}
    description: >
      Cursor for the next page (JSON value). Present when there are more
      results.

      Pass this value as the `searchAfter` query parameter to get the next page.

      This can be ANY heterogeneous array.
    nullable: true
    example: '[2999, "pl_5xdb465tg1enarx2knf04mxbxj"]'

```


## (new) → ProductListingPriceData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingPriceData = { "type": "MONETARY"; "currency": CurrencyData; "amount": number; } | { "type": "ON_REQUEST"; };
```

```yaml
oneOf:
  - type: object
    required:
      - type
      - currency
      - amount
    additionalProperties: false
    properties:
      type:
        type: string
        enum:
          - MONETARY
      currency:
        $ref: "#/components/schemas/CurrencyData"
      amount:
        type: integer
        minimum: 0
  - type: object
    required:
      - type
    additionalProperties: false
    properties:
      type:
        type: string
        enum:
          - ON_REQUEST

```


## (new) → ListingOrderabilityData

Target shape (readable projection; exact constraints follow):

```ts
type ListingOrderabilityData = "ORDERABLE_NOW" | "ORDERABLE_CONDITIONALLY" | "NOT_ORDERABLE";
```

```yaml
type: string
enum:
  - ORDERABLE_NOW
  - ORDERABLE_CONDITIONALLY
  - NOT_ORDERABLE
description: Broad classification derived from a concrete availability
  assertion; it is not independently stored.
example: ORDERABLE_NOW

```


## (new) → ProductListingDiscoveryHistoryPayloadData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingDiscoveryHistoryPayloadData = { "listingSourceId": string; "sourceListingId": string; "title"?: LocalizedTextData; "description"?: LocalizedTextData; "pricing": ProductListingPricingData; "availability": ListingAvailabilityData | null; "url": string; "imageCount": number; "auction": AuctionData; };
```

```yaml
type: object
required:
  - listingSourceId
  - sourceListingId
  - pricing
  - availability
  - url
  - imageCount
  - auction
properties:
  listingSourceId:
    type: string
  sourceListingId:
    type: string
  title:
    $ref: "#/components/schemas/LocalizedTextData"
  description:
    $ref: "#/components/schemas/LocalizedTextData"
  pricing:
    $ref: "#/components/schemas/ProductListingPricingData"
  availability:
    allOf:
      - $ref: "#/components/schemas/ListingAvailabilityData"
    nullable: true
  url:
    type: string
    format: uri
  imageCount:
    type: integer
    format: int64
    minimum: 0
  auction:
    $ref: "#/components/schemas/AuctionData"

```


## (new) → ProductListingChangedHistoryPayloadData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingChangedHistoryPayloadData = { "changes": Array<ProductListingHistoryChangeData>; };
```

```yaml
type: object
required:
  - changes
properties:
  changes:
    type: array
    minItems: 1
    description: "Deterministic semantic-change order: main price, minimum estimate,
      maximum estimate, availability, URL, images, auction, lifecycle, sale
      observation."
    items:
      $ref: "#/components/schemas/ProductListingHistoryChangeData"

```


## (new) → ProductListingHistoryChangeData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingHistoryChangeData = ProductListingMainPriceHistoryChangeData | ProductListingPriceHistoryChangeData | ProductListingAvailabilityHistoryChangeData | ProductListingUrlHistoryChangeData | ProductListingImagesHistoryChangeData | ProductListingAuctionHistoryChangeData | ProductListingWithdrawalHistoryChangeData | ProductListingRestorationHistoryChangeData | ProductListingSaleObservationHistoryChangeData;
```

```yaml
oneOf:
  - $ref: "#/components/schemas/ProductListingMainPriceHistoryChangeData"
  - $ref: "#/components/schemas/ProductListingPriceHistoryChangeData"
  - $ref: "#/components/schemas/ProductListingAvailabilityHistoryChangeData"
  - $ref: "#/components/schemas/ProductListingUrlHistoryChangeData"
  - $ref: "#/components/schemas/ProductListingImagesHistoryChangeData"
  - $ref: "#/components/schemas/ProductListingAuctionHistoryChangeData"
  - $ref: "#/components/schemas/ProductListingWithdrawalHistoryChangeData"
  - $ref: "#/components/schemas/ProductListingRestorationHistoryChangeData"
  - $ref: "#/components/schemas/ProductListingSaleObservationHistoryChangeData"
description: Typed semantic change.

```


## (new) → ProductListingMainPriceHistoryChangeData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingMainPriceHistoryChangeData = { "type": "MAIN_PRICE_CHANGED"; "previous": ProductListingPriceData | null; "current": ProductListingPriceData | null; };
```

```yaml
type: object
required:
  - type
  - previous
  - current
properties:
  type:
    type: string
    enum:
      - MAIN_PRICE_CHANGED
  previous:
    allOf:
      - $ref: "#/components/schemas/ProductListingPriceData"
    nullable: true
  current:
    allOf:
      - $ref: "#/components/schemas/ProductListingPriceData"
    nullable: true

```


## (new) → ProductListingPriceHistoryChangeData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingPriceHistoryChangeData = { "type": "MINIMUM_ESTIMATE_CHANGED" | "MAXIMUM_ESTIMATE_CHANGED"; "previous": PriceData | null; "current": PriceData | null; };
```

```yaml
type: object
required:
  - type
  - previous
  - current
properties:
  type:
    type: string
    enum:
      - MINIMUM_ESTIMATE_CHANGED
      - MAXIMUM_ESTIMATE_CHANGED
  previous:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true
  current:
    allOf:
      - $ref: "#/components/schemas/PriceData"
    nullable: true

```


## (new) → ProductListingAvailabilityHistoryChangeData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingAvailabilityHistoryChangeData = { "type": "AVAILABILITY_CHANGED"; "previous": ListingAvailabilityData | null; "current": ListingAvailabilityData | null; };
```

```yaml
type: object
required:
  - type
  - previous
  - current
properties:
  type:
    type: string
    enum:
      - AVAILABILITY_CHANGED
  previous:
    allOf:
      - $ref: "#/components/schemas/ListingAvailabilityData"
    nullable: true
  current:
    allOf:
      - $ref: "#/components/schemas/ListingAvailabilityData"
    nullable: true

```


## (new) → ProductListingUrlHistoryChangeData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingUrlHistoryChangeData = { "type": "URL_CHANGED"; "previous": string; "current": string; };
```

```yaml
type: object
required:
  - type
  - previous
  - current
properties:
  type:
    type: string
    enum:
      - URL_CHANGED
  previous:
    type: string
    format: uri
  current:
    type: string
    format: uri

```


## (new) → ProductListingImagesHistoryChangeData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingImagesHistoryChangeData = { "type": "IMAGES_CHANGED"; "previousCount": number; "currentCount": number; };
```

```yaml
type: object
required:
  - type
  - previousCount
  - currentCount
properties:
  type:
    type: string
    enum:
      - IMAGES_CHANGED
  previousCount:
    type: integer
    format: int64
    minimum: 0
  currentCount:
    type: integer
    format: int64
    minimum: 0

```


## (new) → ProductListingAuctionHistoryChangeData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingAuctionHistoryChangeData = { "type": "AUCTION_CHANGED"; "previous": AuctionData; "current": AuctionData; };
```

```yaml
type: object
required:
  - type
  - previous
  - current
properties:
  type:
    type: string
    enum:
      - AUCTION_CHANGED
  previous:
    $ref: "#/components/schemas/AuctionData"
  current:
    $ref: "#/components/schemas/AuctionData"

```


## (new) → ProductListingWithdrawalHistoryChangeData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingWithdrawalHistoryChangeData = { "type": "WITHDRAWN"; "previousAvailability": ListingAvailabilityData | null; };
```

```yaml
type: object
required:
  - type
  - previousAvailability
properties:
  type:
    type: string
    enum:
      - WITHDRAWN
  previousAvailability:
    allOf:
      - $ref: "#/components/schemas/ListingAvailabilityData"
    nullable: true

```


## (new) → ProductListingRestorationHistoryChangeData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingRestorationHistoryChangeData = { "type": "RESTORED"; };
```

```yaml
type: object
required:
  - type
properties:
  type:
    type: string
    enum:
      - RESTORED

```


## (new) → ProductListingSaleObservationHistoryChangeData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingSaleObservationHistoryChangeData = { "type": "SALE_OBSERVED" | "SALE_OBSERVATION_RETRACTED"; "observation": { "observedAt": string; "fxRateId": string; }; };
```

```yaml
type: object
required:
  - type
  - observation
properties:
  type:
    type: string
    enum:
      - SALE_OBSERVED
      - SALE_OBSERVATION_RETRACTED
  observation:
    type: object
    required:
      - observedAt
      - fxRateId
    properties:
      observedAt:
        type: string
        format: date-time
      fxRateId:
        type: string

```


## (new) → AdminAccessTokenCollectionData

Target shape (readable projection; exact constraints follow):

```ts
type AdminAccessTokenCollectionData = { "items": Array<AdminAccessTokenData>; "size": number; "searchAfter"?: Array<string> | null; };
```

```yaml
type: object
description: >
  Cursor-paginated, secret-free access-token metadata for an administrator's
  explicit target user.

  `searchAfter` is a `[created RFC3339 timestamp, AccessToken ID]` cursor and is
  omitted

  when the current page is terminal. The cursor timestamp is not returned as
  item metadata.

  This schema intentionally has no raw token, masked token, short-token, or
  token-hash property.
required:
  - items
  - size
properties:
  items:
    type: array
    description: Access-token metadata returned for the target user, including
      expired and current tokens.
    items:
      $ref: "#/components/schemas/AdminAccessTokenData"
  size:
    type: integer
    format: int64
    minimum: 1
    maximum: 100
    description: Requested page size after server-side clamping.
    example: 21
  searchAfter:
    type: array
    minItems: 2
    maxItems: 2
    items:
      type: string
    description: "`[created RFC3339 timestamp, AccessToken ID]` cursor for the next
      page, omitted when no more results are available."
    nullable: true
    example:
      - 2026-09-04T12:00:00Z
      - at_4ck23tcv0meqqrbyjaka24ra6g

```


## (new) → AdminAccessTokenData

Target shape (readable projection; exact constraints follow):

```ts
type AdminAccessTokenData = { "userId": string; "accessTokenId": string; "name": string; "scopes": Array<AccessTokenScopeData>; "origin": string; "expires"?: string | null; };
```

```yaml
type: object
description: >
  Secret-free Aura Historia access-token metadata returned by the admin
  target-user listing.

  The representation contains no raw token, masked token, short-token, or
  token-hash value.

  `expires` is omitted when the token has no expiration and is returned for both
  expired and current tokens.
required:
  - userId
  - accessTokenId
  - name
  - scopes
  - origin
properties:
  userId:
    type: string
    description: Explicit target user who owns the access token.
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
  accessTokenId:
    type: string
    description: Unique identifier of the access token.
    example: at_4ck23tcv0meqqrbyjaka24ra6g
  name:
    type: string
    maxLength: 128
    description: User-defined display name of the access token.
    example: Incident review token
  scopes:
    type: array
    uniqueItems: true
    description: Granted access-token scopes.
    items:
      $ref: "#/components/schemas/AccessTokenScopeData"
    example:
      - users:read
  origin:
    type: string
    description: Origin recorded by the canonical access-token model.
    example: User
  expires:
    type: string
    format: date-time
    description: Optional RFC3339 expiration timestamp; expired and current tokens
      are both listed.
    nullable: true
    example: 2026-09-30T00:00:00Z

```


## (new) → OAuthClientAdminCollectionData

Target shape (readable projection; exact constraints follow):

```ts
type OAuthClientAdminCollectionData = { "items": Array<OAuthClientAdminData>; "size": number; "searchAfter"?: Array<string> | null; "total"?: number | null; };
```

```yaml
type: object
description: >
  Cursor-paginated OAuth client summaries for the administrator collection
  endpoint.

  `searchAfter` is a `[created RFC3339 timestamp, OAuthClient ID]` cursor and is
  omitted

  when the current page is terminal. The collection and its items never contain
  client

  secret plaintext, secret hashes, or masked secret values.
required:
  - items
  - size
properties:
  items:
    type: array
    items:
      $ref: "#/components/schemas/OAuthClientAdminData"
    description: OAuth client summaries returned in the current page.
  size:
    type: integer
    format: int64
    minimum: 1
    maximum: 100
    description: Requested page size after server-side clamping.
    example: 21
  searchAfter:
    type: array
    minItems: 2
    maxItems: 2
    items:
      type: string
    description: "`[created RFC3339 timestamp, OAuthClient ID]` cursor for the next
      page, omitted when no more results are available."
    nullable: true
    example:
      - 2026-09-04T12:00:00Z
      - oc_7b0gwc1x49e0mvbt3tfexfqgb5
  total:
    type: integer
    format: int64
    minimum: 0
    description: Total matching OAuth clients when provided by the reader; omitted
      otherwise.
    nullable: true
    example: 42

```


## (new) → OAuthClientAdminData

Target shape (readable projection; exact constraints follow):

```ts
type OAuthClientAdminData = { "client_id": string; "client_name": string; "tos_uri": string; "policy_uri": string; "client_uri": string; "logo_uri": string; "redirect_uris": Array<string>; "scope": Array<AccessTokenScopeData>; "client_id_issued_at": number; };
```

```yaml
type: object
description: >
  Secret-free OAuth client metadata returned by the admin OAuth client
  collection,

  detail, and update endpoints under `/api/v1/admin/oauth-clients`.

  This schema intentionally has no `client_secret` property.
required:
  - client_id
  - client_name
  - tos_uri
  - policy_uri
  - client_uri
  - logo_uri
  - redirect_uris
  - scope
  - client_id_issued_at
properties:
  client_id:
    type: string
    description: Canonical OAuthClient ID.
    example: oc_7b0gwc1x49e0mvbt3tfexfqgb5
  client_name:
    type: string
    description: Display name of the OAuth client.
    example: Dashboard integration
  tos_uri:
    type: string
    format: uri
    description: Terms-of-service document URL registered for the OAuth client.
    example: https://client.example/tos
  policy_uri:
    type: string
    format: uri
    description: Privacy-policy document URL registered for the OAuth client.
    example: https://client.example/policy
  client_uri:
    type: string
    format: uri
    description: Homepage or product-site URL registered for the OAuth client.
    example: https://client.example
  logo_uri:
    type: string
    format: uri
    description: Logo image URL registered for the OAuth client.
    example: https://client.example/logo.png
  redirect_uris:
    type: array
    uniqueItems: true
    description: Registered redirect URIs for the OAuth client.
    items:
      type: string
      format: uri
    example:
      - https://client.example/callback
  scope:
    type: array
    uniqueItems: true
    description: Allowed scopes for tokens issued to this OAuth client.
    items:
      $ref: "#/components/schemas/AccessTokenScopeData"
    example:
      - access-tokens:read
  client_id_issued_at:
    type: integer
    format: int64
    description: Unix timestamp (seconds) when the OAuth client was created and its
      client ID was issued.
    example: 1748539200

```


## (new) → WatchlistEntryData

Target shape (readable projection; exact constraints follow):

```ts
type WatchlistEntryData = { "userId": string; "productListingId": string; "notifications": boolean; "state": ResourceStateData; "created"?: string; "updated"?: string; };
```

```yaml
type: object
description: A user's watchlist entry.
required:
  - userId
  - productListingId
  - notifications
  - state
properties:
  userId:
    type: string
    description: Identifier of the user who owns the entry.
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
  productListingId:
    type: string
    description: Canonical identifier of the watched product.
    example: pl_5xdb465tg1enarx2knf04mxbxj
  notifications:
    type: boolean
    description: Whether notifications are enabled for this entry.
    example: true
  state:
    $ref: "#/components/schemas/ResourceStateData"
  created:
    type: string
    format: date-time
    description: When the entry was created, when available.
    example: 2026-08-06T12:00:00Z
  updated:
    type: string
    format: date-time
    description: When the entry was last updated, when available.
    example: 2026-08-06T12:00:00Z

```


## (new) → SortPartyFieldData

Target shape (readable projection; exact constraints follow):

```ts
type SortPartyFieldData = "name" | "email" | "phone" | "created" | "updated";
```

```yaml
type: string
enum:
  - name
  - email
  - phone
  - created
  - updated
description: Fields available for sorting admin Party-search results. Party ID
  is always used as a deterministic tie-breaker; absent contact values sort
  last.
example: name

```


## (new) → CreatePartyData

Target shape (readable projection; exact constraints follow):

```ts
type CreatePartyData = { "name": string; "phone"?: string; "email"?: string; };
```

```yaml
type: object
description: Party name and optional contact information used to create an admin Party.
required:
  - name
properties:
  name:
    type: string
    maxLength: 255
    description: Party name. Outer Unicode whitespace is trimmed; blank values and
      values over 255 UTF-8 bytes are rejected.
  phone:
    type: string
    description: Optional Party phone number.
  email:
    type: string
    format: email
    description: Optional Party email address.

```


## (new) → UpdatePartyData

Target shape (readable projection; exact constraints follow):

```ts
type UpdatePartyData = { "name"?: string; "phone"?: string | null; "email"?: string | null; };
```

```yaml
type: object
description: Partial admin Party update. Omitted members remain unchanged; null
  clears only phone and email.
properties:
  name:
    type: string
    maxLength: 255
    description: Replacement Party name. Outer Unicode whitespace is trimmed; blank
      values, values over 255 UTF-8 bytes, and null are rejected.
  phone:
    type: string
    nullable: true
    description: Replacement Party phone number; null clears it.
  email:
    type: string
    format: email
    nullable: true
    description: Replacement Party email address; null clears it.

```


## (new) → PartyData

Target shape (readable projection; exact constraints follow):

```ts
type PartyData = { "partyId": string; "partySlugId": string; "name": string; "contact": PartyContactData; "created": string; "updated": string; };
```

```yaml
type: object
description: Party representation returned after admin creation, update, and detail routes.
required:
  - partyId
  - partySlugId
  - name
  - contact
  - created
  - updated
properties:
  partyId:
    type: string
    description: Stable Party identifier.
  partySlugId:
    type: string
    description: Immutable Party slug identifier.
  name:
    type: string
    maxLength: 255
    description: Party name.
  contact:
    $ref: "#/components/schemas/PartyContactData"
  created:
    type: string
    format: date-time
    description: When the Party was created.
  updated:
    type: string
    format: date-time
    description: When the Party was last updated.

```


## (new) → PartyCollectionData

Target shape (readable projection; exact constraints follow):

```ts
type PartyCollectionData = { "items": Array<PartySummaryData>; "size": number; "searchAfter"?: string; "total"?: number; };
```

```yaml
type: object
description: Cursor-paginated Party summaries for the admin search endpoint.
  `searchAfter` is a Party ID cursor and is omitted when the current page is
  terminal.
required:
  - items
  - size
properties:
  items:
    type: array
    items:
      $ref: "#/components/schemas/PartySummaryData"
    description: Party summaries returned in the current page.
  size:
    type: integer
    minimum: 1
    maximum: 100
    description: Requested page size after server-side clamping.
    example: 21
  searchAfter:
    type: string
    description: Party ID cursor for the next page, omitted when no more results are
      available.
    example: pty_71m2jxjctefykb6crqka16yf6z
  total:
    type: integer
    minimum: 0
    description: Total matching Parties when provided by the reader; omitted otherwise.
    example: 42

```


## (new) → PartySummaryData

Target shape (readable projection; exact constraints follow):

```ts
type PartySummaryData = { "partyId": string; "partySlugId": string; "name": string; "contact": PartyContactData; "created": string; "updated": string; };
```

```yaml
type: object
description: Compact Party data returned by the administrator Party-search endpoint.
required:
  - partyId
  - partySlugId
  - name
  - contact
  - created
  - updated
properties:
  partyId:
    type: string
    description: Stable Party identifier.
  partySlugId:
    type: string
    description: Immutable Party slug identifier.
  name:
    type: string
    maxLength: 255
    description: Party name.
  contact:
    $ref: "#/components/schemas/PartyContactData"
  created:
    type: string
    format: date-time
    description: When the Party was created.
  updated:
    type: string
    format: date-time
    description: When the Party was last updated.

```


## (new) → PartyContactData

Target shape (readable projection; exact constraints follow):

```ts
type PartyContactData = { "phone"?: string; "email"?: string; };
```

```yaml
type: object
description: Optional Party contact summary. Absent contact members are omitted.
properties:
  phone:
    type: string
    description: Party phone number, omitted when absent.
  email:
    type: string
    format: email
    description: Party email address, omitted when absent.

```


## (new) → AdminUserSummaryData

Target shape (readable projection; exact constraints follow):

```ts
type AdminUserSummaryData = { "userId": string; "email": string; "firstName"?: string; "lastName"?: string; "tier": UserTierData; "role": UserRoleData; "stripeCustomerId"?: string; };
```

```yaml
type: object
description: Compact user account data returned by the administrator user-search endpoint.
required:
  - userId
  - email
  - tier
  - role
properties:
  userId:
    type: string
    description: Unique identifier for the user.
  email:
    type: string
    format: email
    description: User's email address.
  firstName:
    type: string
    maxLength: 64
    description: User's first name, omitted when absent.
  lastName:
    type: string
    maxLength: 64
    description: User's last name, omitted when absent.
  tier:
    $ref: "#/components/schemas/UserTierData"
  role:
    $ref: "#/components/schemas/UserRoleData"
  stripeCustomerId:
    type: string
    description: Persisted Stripe customer identifier, omitted when absent.

```


## (new) → AdminUserAccountData

Target shape (readable projection; exact constraints follow):

```ts
type AdminUserAccountData = OwnUserAccountData & {  };
```

```yaml
allOf:
  - $ref: "#/components/schemas/OwnUserAccountData"
  - type: object
    description: Admin user account view. Same read fields as own account; write
      permissions differ by endpoint.

```


## (new) → SuspendUserData

Target shape (readable projection; exact constraints follow):

```ts
type SuspendUserData = { "reason": string; };
```

```yaml
type: object
description: Required administrator-supplied explanation for suspending a user.
required:
  - reason
properties:
  reason:
    type: string
    minLength: 1
    maxLength: 1000
    description: Non-empty, non-whitespace explanation for the suspension. This
      value is emitted to structured operational logs; do not include tokens,
      passwords, credentials, or other secrets. Common credential markers are
      rejected.
    example: Repeated policy violations

```


## (new) → SuspendUserResponseData

Target shape (readable projection; exact constraints follow):

```ts
type SuspendUserResponseData = { "userId": string; "suspended": boolean; };
```

```yaml
type: object
required:
  - userId
  - suspended
properties:
  userId:
    type: string
    description: Identifier of the target user.
  suspended:
    type: boolean
    description: Current suspension state; true after this operation, including an
      idempotent repeat.
    example: true

```


## (new) → UnsuspendUserResponseData

Target shape (readable projection; exact constraints follow):

```ts
type UnsuspendUserResponseData = { "userId": string; "suspended": boolean; };
```

```yaml
type: object
required:
  - userId
  - suspended
properties:
  userId:
    type: string
    description: Identifier of the target user.
  suspended:
    type: boolean
    description: Current suspension state; false after this operation, including an
      idempotent repeat.
    example: false

```


## (new) → WatchlistNotificationChangeData

Target shape (readable projection; exact constraints follow):

```ts
type WatchlistNotificationChangeData = WatchlistNotificationPriceChangeData | WatchlistNotificationAvailabilityChangeData;
```

```yaml
oneOf:
  - $ref: "#/components/schemas/WatchlistNotificationPriceChangeData"
  - $ref: "#/components/schemas/WatchlistNotificationAvailabilityChangeData"

```


## (new) → WatchlistNotificationPriceChangeData

Target shape (readable projection; exact constraints follow):

```ts
type WatchlistNotificationPriceChangeData = { "type": "PRICE_CHANGE"; "oldPrice": ProductListingPriceData | null; "newPrice": ProductListingPriceData | null; };
```

```yaml
type: object
required:
  - type
  - oldPrice
  - newPrice
properties:
  type:
    type: string
    enum:
      - PRICE_CHANGE
  oldPrice:
    allOf:
      - $ref: "#/components/schemas/ProductListingPriceData"
    nullable: true
    description: Previous asking-price assertion. Null when unavailable.
  newPrice:
    allOf:
      - $ref: "#/components/schemas/ProductListingPriceData"
    nullable: true
    description: New asking-price assertion. Null when unavailable.

```


## (new) → WatchlistNotificationAvailabilityChangeData

Target shape (readable projection; exact constraints follow):

```ts
type WatchlistNotificationAvailabilityChangeData = { "type": "AVAILABILITY_CHANGE"; "oldAvailability": ListingAvailabilityData | null; "newAvailability": ListingAvailabilityData | null; };
```

```yaml
type: object
required:
  - type
  - oldAvailability
  - newAvailability
properties:
  type:
    type: string
    enum:
      - AVAILABILITY_CHANGE
  oldAvailability:
    allOf:
      - $ref: "#/components/schemas/ListingAvailabilityData"
    nullable: true
  newAvailability:
    allOf:
      - $ref: "#/components/schemas/ListingAvailabilityData"
    nullable: true

```


## (new) → UpdateNotificationsSeenData

Target shape (readable projection; exact constraints follow):

```ts
type UpdateNotificationsSeenData = { "notificationIds": Array<string>; "seen": boolean; };
```

```yaml
type: object
required:
  - notificationIds
  - seen
properties:
  notificationIds:
    type: array
    minItems: 1
    items:
      type: string
  seen:
    type: boolean

```


## (new) → WithdrawProductListingData

Target shape (readable projection; exact constraints follow):

```ts
type WithdrawProductListingData = { "sourceListingId": string; };
```

```yaml
type: object
required:
  - sourceListingId
properties:
  sourceListingId:
    type: string
    description: Partner-controlled identifier of the ProductListing to withdraw.
    example: baroque-violin-001

```


## (new) → AdminOverviewData

Target shape (readable projection; exact constraints follow):

```ts
type AdminOverviewData = { "schemaVersion": 1; "users": AdminOverviewUsersData; "partnershipApplications": AdminOverviewPartnershipApplicationsData; "parties": AdminOverviewCountData; "listingSources": AdminOverviewListingSourcesData; "partnerships": AdminOverviewCountData; "productListings": AdminOverviewProductListingsData; };
```

```yaml
type: object
description: Versioned bounded administrator operational summary sourced from
  authoritative PostgreSQL.
required:
  - schemaVersion
  - users
  - partnershipApplications
  - parties
  - listingSources
  - partnerships
  - productListings
properties:
  schemaVersion:
    type: integer
    minimum: 1
    enum:
      - 1
    description: Response contract version.
  users:
    $ref: "#/components/schemas/AdminOverviewUsersData"
  partnershipApplications:
    $ref: "#/components/schemas/AdminOverviewPartnershipApplicationsData"
  parties:
    $ref: "#/components/schemas/AdminOverviewCountData"
  listingSources:
    $ref: "#/components/schemas/AdminOverviewListingSourcesData"
  partnerships:
    $ref: "#/components/schemas/AdminOverviewCountData"
  productListings:
    $ref: "#/components/schemas/AdminOverviewProductListingsData"

```


## (new) → AdminOverviewCountData

Target shape (readable projection; exact constraints follow):

```ts
type AdminOverviewCountData = { "total": number; };
```

```yaml
type: object
required:
  - total
properties:
  total:
    type: integer
    format: int64
    minimum: 0

```


## (new) → AdminOverviewUsersData

Target shape (readable projection; exact constraints follow):

```ts
type AdminOverviewUsersData = { "total": number; "byTier": AdminOverviewUserTierCountsData; "byRole": AdminOverviewUserRoleCountsData; };
```

```yaml
type: object
required:
  - total
  - byTier
  - byRole
properties:
  total:
    type: integer
    format: int64
    minimum: 0
  byTier:
    $ref: "#/components/schemas/AdminOverviewUserTierCountsData"
  byRole:
    $ref: "#/components/schemas/AdminOverviewUserRoleCountsData"

```


## (new) → AdminOverviewUserTierCountsData

Target shape (readable projection; exact constraints follow):

```ts
type AdminOverviewUserTierCountsData = { "free": number; "pro": number; "ultimate": number; };
```

```yaml
type: object
required:
  - free
  - pro
  - ultimate
properties:
  free:
    type: integer
    format: int64
    minimum: 0
  pro:
    type: integer
    format: int64
    minimum: 0
  ultimate:
    type: integer
    format: int64
    minimum: 0

```


## (new) → AdminOverviewUserRoleCountsData

Target shape (readable projection; exact constraints follow):

```ts
type AdminOverviewUserRoleCountsData = { "user": number; "admin": number; };
```

```yaml
type: object
required:
  - user
  - admin
properties:
  user:
    type: integer
    format: int64
    minimum: 0
  admin:
    type: integer
    format: int64
    minimum: 0

```


## (new) → AdminOverviewPartnershipApplicationsData

Target shape (readable projection; exact constraints follow):

```ts
type AdminOverviewPartnershipApplicationsData = { "total": number; "byState": AdminOverviewPartnershipApplicationStateCountsData; };
```

```yaml
type: object
required:
  - total
  - byState
properties:
  total:
    type: integer
    format: int64
    minimum: 0
  byState:
    $ref: "#/components/schemas/AdminOverviewPartnershipApplicationStateCountsData"

```


## (new) → AdminOverviewPartnershipApplicationStateCountsData

Target shape (readable projection; exact constraints follow):

```ts
type AdminOverviewPartnershipApplicationStateCountsData = { "submitted": number; "inReview": number; "approved": number; "rejected": number; "withdrawn": number; };
```

```yaml
type: object
required:
  - submitted
  - inReview
  - approved
  - rejected
  - withdrawn
properties:
  submitted:
    type: integer
    format: int64
    minimum: 0
  inReview:
    type: integer
    format: int64
    minimum: 0
  approved:
    type: integer
    format: int64
    minimum: 0
  rejected:
    type: integer
    format: int64
    minimum: 0
  withdrawn:
    type: integer
    format: int64
    minimum: 0

```


## (new) → AdminOverviewListingSourcesData

Target shape (readable projection; exact constraints follow):

```ts
type AdminOverviewListingSourcesData = { "total": number; "withoutIngestionMethod": number; "methodAssignments": AdminOverviewListingSourceMethodAssignmentCountsData; };
```

```yaml
type: object
description: methodAssignments counts source-method rows and need not sum to total.
required:
  - total
  - withoutIngestionMethod
  - methodAssignments
properties:
  total:
    type: integer
    format: int64
    minimum: 0
  withoutIngestionMethod:
    type: integer
    format: int64
    minimum: 0
  methodAssignments:
    $ref: "#/components/schemas/AdminOverviewListingSourceMethodAssignmentCountsData"

```


## (new) → AdminOverviewListingSourceMethodAssignmentCountsData

Target shape (readable projection; exact constraints follow):

```ts
type AdminOverviewListingSourceMethodAssignmentCountsData = { "webCrawl": number; "shopify": number; "woocommerce": number; "partnerApi": number; };
```

```yaml
type: object
required:
  - webCrawl
  - shopify
  - woocommerce
  - partnerApi
properties:
  webCrawl:
    type: integer
    format: int64
    minimum: 0
  shopify:
    type: integer
    format: int64
    minimum: 0
  woocommerce:
    type: integer
    format: int64
    minimum: 0
  partnerApi:
    type: integer
    format: int64
    minimum: 0

```


## (new) → AdminOverviewProductListingsData

Target shape (readable projection; exact constraints follow):

```ts
type AdminOverviewProductListingsData = { "total": number; "byLifecycle": AdminOverviewProductListingLifecycleCountsData; "activeAvailability": AdminOverviewActiveListingAvailabilityCountsData; "activeWithoutAvailability": number; };
```

```yaml
type: object
description: Availability counts include ACTIVE listings only.
required:
  - total
  - byLifecycle
  - activeAvailability
  - activeWithoutAvailability
properties:
  total:
    type: integer
    format: int64
    minimum: 0
  byLifecycle:
    $ref: "#/components/schemas/AdminOverviewProductListingLifecycleCountsData"
  activeAvailability:
    $ref: "#/components/schemas/AdminOverviewActiveListingAvailabilityCountsData"
  activeWithoutAvailability:
    type: integer
    format: int64
    minimum: 0

```


## (new) → AdminOverviewProductListingLifecycleCountsData

Target shape (readable projection; exact constraints follow):

```ts
type AdminOverviewProductListingLifecycleCountsData = { "active": number; "withdrawn": number; };
```

```yaml
type: object
required:
  - active
  - withdrawn
properties:
  active:
    type: integer
    format: int64
    minimum: 0
  withdrawn:
    type: integer
    format: int64
    minimum: 0

```


## (new) → AdminOverviewActiveListingAvailabilityCountsData

Target shape (readable projection; exact constraints follow):

```ts
type AdminOverviewActiveListingAvailabilityCountsData = { "available": number; "inStock": number; "limitedAvailability": number; "backOrder": number; "madeToOrder": number; "preOrder": number; "preSale": number; "unavailable": number; "reserved": number; "outOfStock": number; "soldOut": number; };
```

```yaml
type: object
required:
  - available
  - inStock
  - limitedAvailability
  - backOrder
  - madeToOrder
  - preOrder
  - preSale
  - unavailable
  - reserved
  - outOfStock
  - soldOut
properties:
  available:
    type: integer
    format: int64
    minimum: 0
  inStock:
    type: integer
    format: int64
    minimum: 0
  limitedAvailability:
    type: integer
    format: int64
    minimum: 0
  backOrder:
    type: integer
    format: int64
    minimum: 0
  madeToOrder:
    type: integer
    format: int64
    minimum: 0
  preOrder:
    type: integer
    format: int64
    minimum: 0
  preSale:
    type: integer
    format: int64
    minimum: 0
  unavailable:
    type: integer
    format: int64
    minimum: 0
  reserved:
    type: integer
    format: int64
    minimum: 0
  outOfStock:
    type: integer
    format: int64
    minimum: 0
  soldOut:
    type: integer
    format: int64
    minimum: 0

```


## (new) → AdminPartnershipCollectionData

Target shape (readable projection; exact constraints follow):

```ts
type AdminPartnershipCollectionData = { "items": Array<AdminPartnershipSummaryData>; "size": number; "searchAfter"?: Array<string>; };
```

```yaml
type: object
description: Cursor-paginated safe Partnership summaries for the admin
  collection. `searchAfter` is omitted on the terminal page; no total is
  returned.
required:
  - items
  - size
properties:
  items:
    type: array
    items:
      $ref: "#/components/schemas/AdminPartnershipSummaryData"
    description: Partnership summaries returned in the current page.
  size:
    type: integer
    format: int64
    minimum: 1
    maximum: 100
    description: Requested page size after server-side clamping.
    example: 21
  searchAfter:
    type: array
    minItems: 2
    maxItems: 2
    items:
      type: string
    description: Partnership cursor for the next page, omitted when no more results
      are available.
    example:
      - 2026-09-04T12:00:00Z
      - psh_3q65ndcw7wfxqswjtrv1kfhwd1

```


## (new) → AdminPartnershipDetailsData

Target shape (readable projection; exact constraints follow):

```ts
type AdminPartnershipDetailsData = { "partnershipId": string; "party": PartnershipPartySummaryData; "memberUserIds": Array<string>; "listingSourceIds": Array<string>; "memberCount": number; "listingSourceGrantCount": number; "created": string; "updated": string; };
```

```yaml
type: object
description: Administrator Partnership detail. Member and ListingSource
  reference arrays are ordered by ID and capped at 100 entries; count fields are
  complete.
required:
  - partnershipId
  - party
  - memberUserIds
  - listingSourceIds
  - memberCount
  - listingSourceGrantCount
  - created
  - updated
properties:
  partnershipId:
    type: string
    description: Stable Partnership identifier.
  party:
    $ref: "#/components/schemas/PartnershipPartySummaryData"
  memberUserIds:
    type: array
    maxItems: 100
    uniqueItems: true
    description: Current member User IDs in deterministic ascending ID order. At
      most 100 references are returned.
    items:
      type: string
  listingSourceIds:
    type: array
    maxItems: 100
    uniqueItems: true
    description: Current ListingSource grant IDs in deterministic ascending ID
      order. At most 100 references are returned.
    items:
      type: string
  memberCount:
    type: integer
    format: int64
    minimum: 0
    description: Complete number of current Partnership members.
  listingSourceGrantCount:
    type: integer
    format: int64
    minimum: 0
    description: Complete number of current ListingSource grants.
  created:
    type: string
    format: date-time
    description: When the Partnership was created.
  updated:
    type: string
    format: date-time
    description: When the Partnership was last updated.

```


## (new) → AdminPartnershipSummaryData

Target shape (readable projection; exact constraints follow):

```ts
type AdminPartnershipSummaryData = { "partnershipId": string; "party": PartnershipPartySummaryData; "memberCount": number; "listingSourceGrantCount": number; "created": string; "updated": string; };
```

```yaml
type: object
description: Safe administrator Partnership summary. Member/grant identities,
  Party contact data, persistence versions, and credentials are excluded.
required:
  - partnershipId
  - party
  - memberCount
  - listingSourceGrantCount
  - created
  - updated
properties:
  partnershipId:
    type: string
    description: Stable Partnership identifier.
  party:
    $ref: "#/components/schemas/PartnershipPartySummaryData"
  memberCount:
    type: integer
    format: int64
    minimum: 0
    description: Number of users in the Partnership.
  listingSourceGrantCount:
    type: integer
    format: int64
    minimum: 0
    description: Number of ListingSource grants in the Partnership.
  created:
    type: string
    format: date-time
    description: When the Partnership was created.
  updated:
    type: string
    format: date-time
    description: When the Partnership was last updated.

```


## (new) → PartnershipPartySummaryData

Target shape (readable projection; exact constraints follow):

```ts
type PartnershipPartySummaryData = { "partyId": string; "partySlugId": string; "name": string; };
```

```yaml
type: object
description: Party summary embedded in an administrator Partnership result.
required:
  - partyId
  - partySlugId
  - name
properties:
  partyId:
    type: string
    description: Stable Party identifier.
  partySlugId:
    type: string
    description: Immutable Party slug identifier.
  name:
    type: string
    maxLength: 255
    description: Party name.

```


## (new) → AdminPartnershipApplicationData

Target shape (readable projection; exact constraints follow):

```ts
type AdminPartnershipApplicationData = { "id": string; "applicantUserId": string; "state": PartnershipApplicationStateData; "proposal": PartnershipApplicationProposalData; "approvedPartnershipId": string | null; "approvedListingSourceId": string | null; };
```

```yaml
type: object
required:
  - id
  - applicantUserId
  - state
  - proposal
  - approvedPartnershipId
  - approvedListingSourceId
properties:
  id:
    type: string
  applicantUserId:
    type: string
  state:
    $ref: "#/components/schemas/PartnershipApplicationStateData"
  proposal:
    $ref: "#/components/schemas/PartnershipApplicationProposalData"
  approvedPartnershipId:
    type: string
    nullable: true
  approvedListingSourceId:
    type: string
    nullable: true

```


## (new) → PartnershipProposalTypeData

Target shape (readable projection; exact constraints follow):

```ts
type PartnershipProposalTypeData = "EXISTING_LISTING_SOURCE" | "PROPOSED_LISTING_SOURCE";
```

```yaml
type: string
enum:
  - EXISTING_LISTING_SOURCE
  - PROPOSED_LISTING_SOURCE

```


## (new) → AdminPartnershipApplicationSummaryData

Target shape (readable projection; exact constraints follow):

```ts
type AdminPartnershipApplicationSummaryData = { "id": string; "applicantUserId": string; "state": PartnershipApplicationStateData; "proposal": PartnershipApplicationProposalData; "approvedPartnershipId": string | null; "approvedListingSourceId": string | null; "created": string; "updated": string; };
```

```yaml
type: object
required:
  - id
  - applicantUserId
  - state
  - proposal
  - approvedPartnershipId
  - approvedListingSourceId
  - created
  - updated
properties:
  id:
    type: string
  applicantUserId:
    type: string
  state:
    $ref: "#/components/schemas/PartnershipApplicationStateData"
  proposal:
    $ref: "#/components/schemas/PartnershipApplicationProposalData"
  approvedPartnershipId:
    type: string
    nullable: true
  approvedListingSourceId:
    type: string
    nullable: true
  created:
    type: string
    format: date-time
  updated:
    type: string
    format: date-time

```


## (new) → AdminPartnershipApplicationCollectionData

Target shape (readable projection; exact constraints follow):

```ts
type AdminPartnershipApplicationCollectionData = { "items": Array<AdminPartnershipApplicationSummaryData>; "size": number; "searchAfter"?: Array<string>; "total"?: number | null; };
```

```yaml
type: object
required:
  - items
  - size
properties:
  items:
    type: array
    items:
      $ref: "#/components/schemas/AdminPartnershipApplicationSummaryData"
  size:
    type: integer
    format: int64
    minimum: 1
    maximum: 100
  searchAfter:
    type: array
    minItems: 2
    maxItems: 2
    items:
      type: string
    description: JSON cursor containing the sort timestamp followed by the
      PartnershipApplication ID.
  total:
    type: integer
    format: int64
    minimum: 0
    nullable: true

```


## (new) → ListingSourceReferenceData

Target shape (readable projection; exact constraints follow):

```ts
type ListingSourceReferenceData = { "listingSourceId": string; "listingSourceSlugId": string; };
```

```yaml
type: object
required:
  - listingSourceId
  - listingSourceSlugId
properties:
  listingSourceId:
    type: string
  listingSourceSlugId:
    type: string
    example: ada-antiques

```


## (new) → AdministeredListingSourceData

Target shape (readable projection; exact constraints follow):

```ts
type AdministeredListingSourceData = { "listingSourceId": string; "listingSourceSlugId": string; "name": string; };
```

```yaml
type: object
required:
  - listingSourceId
  - listingSourceSlugId
  - name
properties:
  listingSourceId:
    type: string
  listingSourceSlugId:
    type: string
  name:
    type: string

```


## (new) → ListingSourceSearchSummaryData

Target shape (readable projection; exact constraints follow):

```ts
type ListingSourceSearchSummaryData = { "listingSourceId": string; "listingSourceSlugId": string; "name": string; "operator": OperatorPartyData; "ingestionMethods": Array<ListingIngestionMethodData>; "presentation": ListingSourcePresentationData; "referralConfiguration"?: ReferralConfigurationData | null; "created": string; "updated": string; };
```

```yaml
type: object
description: Safe ListingSource administration summary. Provider credentials,
  webhook secrets, and crawler-local configuration are excluded.
required:
  - listingSourceId
  - listingSourceSlugId
  - name
  - operator
  - ingestionMethods
  - presentation
  - created
  - updated
properties:
  listingSourceId:
    type: string
    description: Stable ListingSource identifier.
  listingSourceSlugId:
    type: string
    description: Immutable ListingSource slug identifier.
  name:
    type: string
    description: ListingSource name.
  operator:
    $ref: "#/components/schemas/OperatorPartyData"
  ingestionMethods:
    type: array
    items:
      $ref: "#/components/schemas/ListingIngestionMethodData"
    description: Active canonical ingestion methods.
  presentation:
    $ref: "#/components/schemas/ListingSourcePresentationData"
  referralConfiguration:
    allOf:
      - $ref: "#/components/schemas/ReferralConfigurationData"
    nullable: true
    description: Safe referral summary; provider credentials are never included.
  created:
    type: string
    format: date-time
  updated:
    type: string
    format: date-time

```


## (new) → ListingSourcePresentationData

Target shape (readable projection; exact constraints follow):

```ts
type ListingSourcePresentationData = { "url"?: string; "image"?: string; };
```

```yaml
type: object
description: Optional public presentation URLs for a ListingSource.
properties:
  url:
    type: string
    format: uri
  image:
    type: string
    format: uri

```


## (new) → ListingIngestionMethodData

Target shape (readable projection; exact constraints follow):

```ts
type ListingIngestionMethodData = "WEB_CRAWL" | "SHOPIFY" | "WOOCOMMERCE" | "PARTNER_API";
```

```yaml
type: string
enum:
  - WEB_CRAWL
  - SHOPIFY
  - WOOCOMMERCE
  - PARTNER_API

```


## (new) → ListingIngestionConfigurationData

Target shape (readable projection; exact constraints follow):

```ts
type ListingIngestionConfigurationData = { "type": "UNCONFIGURED"; "ingestionMethod": ListingIngestionMethodData; } | { "type": "WEB_CRAWL"; "fallbackCurrency"?: string; } | { "type": "SHOPIFY"; "domain": string; "currency"?: string; "language"?: string; } | { "type": "WOOCOMMERCE"; "currency"?: string; "language"?: string; } | { "type": "PARTNER_API"; };
```

```yaml
oneOf:
  - type: object
    required:
      - type
      - ingestionMethod
    properties:
      type:
        type: string
        enum:
          - UNCONFIGURED
      ingestionMethod:
        $ref: "#/components/schemas/ListingIngestionMethodData"
  - type: object
    required:
      - type
    properties:
      type:
        type: string
        enum:
          - WEB_CRAWL
      fallbackCurrency:
        type: string
        description: Optional ISO 4217 fallback used only when crawler-extracted price
          text contains no currency hint.
  - type: object
    required:
      - type
      - domain
    properties:
      type:
        type: string
        enum:
          - SHOPIFY
      domain:
        type: string
      currency:
        type: string
      language:
        type: string
  - type: object
    required:
      - type
    properties:
      type:
        type: string
        enum:
          - WOOCOMMERCE
      currency:
        type: string
      language:
        type: string
  - type: object
    required:
      - type
    properties:
      type:
        type: string
        enum:
          - PARTNER_API

```


## (new) → ReferralConfigurationData

Target shape (readable projection; exact constraints follow):

```ts
type ReferralConfigurationData = { "type": "PARTNERIZE"; "camref": string; };
```

```yaml
type: object
required:
  - type
  - camref
properties:
  type:
    type: string
    enum:
      - PARTNERIZE
  camref:
    type: string

```


## (new) → OperatorPartyData

Target shape (readable projection; exact constraints follow):

```ts
type OperatorPartyData = { "partyId": string; "partySlugId": string; "name": string; };
```

```yaml
type: object
required:
  - partyId
  - partySlugId
  - name
properties:
  partyId:
    type: string
  partySlugId:
    type: string
  name:
    type: string

```


## (new) → ListingSourceOperatorInputData

Target shape (readable projection; exact constraints follow):

```ts
type ListingSourceOperatorInputData = { "type": "EXISTING"; "partyId": string; } | { "type": "NEW"; "name": string; "phone"?: string; "email"?: string; };
```

```yaml
oneOf:
  - type: object
    required:
      - type
      - partyId
    properties:
      type:
        type: string
        enum:
          - EXISTING
      partyId:
        type: string
  - type: object
    required:
      - type
      - name
    properties:
      type:
        type: string
        enum:
          - NEW
      name:
        type: string
        description: Party name. Outer Unicode whitespace is trimmed; blank values and
          values over 255 UTF-8 bytes are rejected.
      phone:
        type: string
      email:
        type: string
        format: email

```


## (new) → PartnershipApplicationProposalData

Target shape (readable projection; exact constraints follow):

```ts
type PartnershipApplicationProposalData = { "type": "EXISTING_LISTING_SOURCE"; "listingSourceId": string; } | { "type": "PROPOSED_LISTING_SOURCE"; "party": ProposedPartyData; "listingSource": ProposedListingSourceData; };
```

```yaml
oneOf:
  - type: object
    required:
      - type
      - listingSourceId
    properties:
      type:
        type: string
        enum:
          - EXISTING_LISTING_SOURCE
      listingSourceId:
        type: string
  - type: object
    required:
      - type
      - party
      - listingSource
    properties:
      type:
        type: string
        enum:
          - PROPOSED_LISTING_SOURCE
      party:
        $ref: "#/components/schemas/ProposedPartyData"
      listingSource:
        $ref: "#/components/schemas/ProposedListingSourceData"

```


## (new) → ProposedPartyData

Target shape (readable projection; exact constraints follow):

```ts
type ProposedPartyData = { "name": string; "phone"?: string; "email"?: string; };
```

```yaml
type: object
required:
  - name
properties:
  name:
    type: string
    description: Party name. Outer Unicode whitespace is trimmed; blank values and
      values over 255 UTF-8 bytes are rejected.
  phone:
    type: string
  email:
    type: string
    format: email

```


## (new) → ProposedListingSourceData

Target shape (readable projection; exact constraints follow):

```ts
type ProposedListingSourceData = { "name": string; "url"?: string; "image"?: string; "requestedIngestionMethods": Array<ListingIngestionMethodData>; };
```

```yaml
type: object
required:
  - name
  - requestedIngestionMethods
properties:
  name:
    type: string
    description: ListingSource name. Outer Unicode whitespace is trimmed; blank
      values and values over 255 UTF-8 bytes are rejected.
  url:
    type: string
    format: uri
  image:
    type: string
    format: uri
  requestedIngestionMethods:
    type: array
    items:
      $ref: "#/components/schemas/ListingIngestionMethodData"

```


## (new) → ProductListingSourceData

Target shape (readable projection; exact constraints follow):

```ts
type ProductListingSourceData = { "listingSourceId": string; "name": string; "slugId": string; };
```

```yaml
type: object
description: ListingSource presentation hydrated for a ProductListing response.
required:
  - listingSourceId
  - name
  - slugId
properties:
  listingSourceId:
    type: string
  name:
    type: string
  slugId:
    type: string

```
