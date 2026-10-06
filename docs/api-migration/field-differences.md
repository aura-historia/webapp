# Field and operation differences

Generated TypeScript is the baseline. This mechanical comparison ignores comments, whitespace, and quote style; a reference rename is shown even if its primitive representation is unchanged. Exact validation rules, examples, response headers and descriptions are preserved in the two inventories. No claim is made about old OpenAPI-only constraints that generation erased.

## Model fields

### GetProductData → ProductListingDetailsData

| Field | Existing | Target |
|---|---|---|
| productId | required string | absent |
| productSlugId | required string | absent |
| shopSlugId | required string | absent |
| shopId | required string | absent |
| shopsProductId | required string | absent |
| shopName | required string | absent |
| sellerName | required string | absent |
| shopType | required ShopTypeData | absent |
| structuredAddress | optional StructuredAddressData \| null | absent |
| geoAddress | optional GeoAddressData \| null | absent |
| title | required LocalizedTextData | optional LocalizedTextData \| null |
| price | optional PricingData \| null | absent |
| state | required ProductStateData | absent |
| lifecycle | required ProductLifecycleData | required ListingLifecycleData |
| images | required Array<ProductImageData> | required Array<ProductListingImageData> |
| auction | optional AuctionData \| null | required { "start": string \| null; "end": string \| null; } |
| createdBy | required ActorData | absent |
| updatedBy | required ActorData | absent |
| productListingId | absent | required string |
| productListingTitleSlugId | absent | optional string |
| source | absent | required ProductListingSourceData |
| sourceListingId | absent | required string |
| productTitle | absent | optional LocalizedTextData \| null |
| productDescription | absent | optional LocalizedTextData \| null |
| pricing | absent | required { "source": ProductListingPricingData; "display": ProductListingPricingData; "valuation": ProductListingPricingValuationData; } |
| availability | absent | required ListingAvailabilityData \| null |
| contentPolicy | absent | optional ContentPolicyData \| null |

### GetProductSummaryData → ProductListingSummaryData

| Field | Existing | Target |
|---|---|---|
| productId | required string | absent |
| productSlugId | required string | absent |
| shopSlugId | required string | absent |
| shopId | required string | absent |
| shopsProductId | required string | absent |
| shopName | required string | absent |
| sellerName | required string | absent |
| shopType | required ShopTypeData | absent |
| title | required LocalizedTextData | optional LocalizedTextData \| null |
| price | optional PriceData \| null | absent |
| state | required ProductStateData | absent |
| lifecycle | required ProductLifecycleData | required ListingLifecycleData |
| images | required Array<ProductImageData> | required Array<ProductListingImageData> |
| auction | optional AuctionData \| null | absent |
| createdBy | required ActorData | absent |
| updatedBy | required ActorData | absent |
| created | required string | absent |
| productListingId | absent | required string |
| productListingTitleSlugId | absent | optional string |
| source | absent | required ProductListingSourceData |
| sourceListingId | absent | required string |
| displayPrice | absent | optional ProductListingPriceData \| null |
| priceValuation | absent | required ProductListingSummaryPriceValuationData |
| availability | absent | required ListingAvailabilityData \| null |
| contentPolicy | absent | optional ContentPolicyData \| null |

### PersonalizedGetProductData → PersonalizedProductListingDetailsData

| Field | Existing | Target |
|---|---|---|
| item | required GetProductData | required ProductListingDetailsData |
| userState | optional ProductUserStateData \| null | optional ProductListingUserStateData \| null |

### PersonalizedGetProductSummaryData → PersonalizedProductListingSummaryData

| Field | Existing | Target |
|---|---|---|
| item | required GetProductSummaryData | required ProductListingSummaryData |
| userState | optional ProductUserStateData \| null | optional ProductListingUserStateData \| null |

### PersonalizedProductSearchResultData → ProductListingSearchResultData

| Field | Existing | Target |
|---|---|---|
| items | required Array<PersonalizedGetProductSummaryData> | required Array<PersonalizedProductListingSummaryData> |
| searchAfter | optional Array<unknown> \| null | optional ProductListingSearchCursorData \| null |

### ProductUserStateData → ProductListingUserStateData

| Field | Existing | Target |
|---|---|---|
| prohibitedContent | required ProhibitedContentUserStateData | absent |
| contentVisibility | absent | required ContentVisibilityUserStateData |

### ProhibitedContentUserStateData → ContentVisibilityUserStateData

| Field | Existing | Target |
|---|---|---|
| consent | required boolean | absent |
| showUnassessedOrSensitiveContent | absent | required boolean |

### NotificationUserStateData → NotificationUserStateData

| Field | Existing | Target |
|---|---|---|
| seen | required boolean | absent |
| originEventId | optional string | absent |
| unseenNotificationIds | absent | required Array<string> |

### ProductCreatedEventPayloadData → (absent)

```ts
// Existing
{ state: ProductStateData; price?: PriceData; }
// Target
absent
```

### ProductEventStateChangedPayloadData → (absent)

```ts
// Existing
{ oldState: ProductStateData; newState: ProductStateData; }
// Target
absent
```

### ProductEventPriceChangedPayloadData → (absent)

```ts
// Existing
{ oldPrice?: PriceData | null; newPrice?: PriceData | null; }
// Target
absent
```

### ProductEventEstimatePriceChangedPayloadData → (absent)

```ts
// Existing
{ priceEstimateMin?: PriceData | null; priceEstimateMax?: PriceData | null; }
// Target
absent
```

### ProductEventUrlChangedPayloadData → (absent)

```ts
// Existing
{ url: string; }
// Target
absent
```

### ProductEventImagesChangedPayloadData → (absent)

```ts
// Existing
{ images: Array<ProductImageData>; }
// Target
absent
```

### ProductEventAuctionTimeChangedPayloadData → (absent)

```ts
// Existing
{ auctionStart?: string | null; auctionEnd?: string | null; }
// Target
absent
```

### GetProductEventData → ProductListingHistoryEntryData

| Field | Existing | Target |
|---|---|---|
| eventType | required ProductEventTypeData | required ProductListingHistoryEntryTypeData |
| productId | required string | absent |
| shopId | required string | absent |
| sellerId | required string | absent |
| shopsProductId | required string | absent |
| payload | required ProductEventPayloadData | required ProductListingHistoryPayloadData |
| productListingId | absent | required string |

### ProductStateData → ListingAvailabilityData

```ts
// Existing
'LISTED' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'REMOVED' | 'UNKNOWN'
// Target
"AVAILABLE" | "IN_STOCK" | "LIMITED_AVAILABILITY" | "BACK_ORDER" | "MADE_TO_ORDER" | "PRE_ORDER" | "PRE_SALE" | "UNAVAILABLE" | "RESERVED" | "OUT_OF_STOCK" | "SOLD_OUT"
```

### ProductLifecycleData → ListingLifecycleData

```ts
// Existing
'ACTIVE' | 'DELETED'
// Target
"ACTIVE" | "WITHDRAWN"
```

### ProhibitedContentData → ContentPolicyData

```ts
// Existing
'UNKNOWN' | 'NONE' | 'NAZI_GERMANY'
// Target
{ "decision": "ALLOWED"; } | { "decision": "REQUIRES_CONSENT"; "category": "NAZI_GERMANY"; }
```

### ShopTypeData → (absent)

```ts
// Existing
'AUCTION_HOUSE' | 'AUCTION_PLATFORM' | 'COMMERCIAL_DEALER' | 'MARKETPLACE'
// Target
absent
```

### ShopPartnerStatusData → (absent)

```ts
// Existing
'SCRAPED' | 'PARTNERED'
// Target
absent
```

### ProductImageData → ProductListingImageData

| Field | Existing | Target |
|---|---|---|
| url | optional string | required string \| null |
| prohibitedContent | required ProhibitedContentData | absent |

### SortProductFieldData → SortProductListingFieldData

```ts
// Existing
'score' | 'price' | 'updated' | 'created'
// Target
"score" | "updated" | "created"
```

### ProductEventTypeData → ProductListingHistoryEntryTypeData

```ts
// Existing
'CREATED' | 'STATE_CHANGED' | 'PRICE_CHANGED' | 'ESTIMATE_PRICE_CHANGED' | 'URL_CHANGED' | 'IMAGES_CHANGED' | 'AUCTION_TIME_CHANGED'
// Target
"PRODUCT_LISTING_DISCOVERED" | "PRODUCT_LISTING_CHANGED"
```

### ProductEventPayloadData → ProductListingHistoryPayloadData

```ts
// Existing
ProductCreatedEventPayloadData | ProductEventStateChangedPayloadData | ProductEventPriceChangedPayloadData | ProductEventEstimatePriceChangedPayloadData | ProductEventUrlChangedPayloadData | ProductEventImagesChangedPayloadData | ProductEventAuctionTimeChangedPayloadData
// Target
ProductListingDiscoveryHistoryPayloadData | ProductListingChangedHistoryPayloadData
```

### ApiErrorSource → ApiErrorSource

| Field | Existing | Target |
|---|---|---|
| sourceType | required 'query' \| 'path' \| 'header' \| 'body' | absent |
| type | absent | required "QUERY" \| "PATH" \| "HEADER" \| "BODY" |

### ProductSearchData → ProductListingSearchData

| Field | Existing | Target |
|---|---|---|
| shopName | optional Array<string> | absent |
| excludeShopName | optional Array<string> | absent |
| sellerName | optional Array<string> | absent |
| excludeSellerName | optional Array<string> | absent |
| shopSlugId | optional Array<string> | absent |
| excludeShopSlugId | optional Array<string> | absent |
| sellerSlugId | optional Array<string> | absent |
| excludeSellerSlugId | optional Array<string> | absent |
| shopType | optional Array<ShopTypeData> \| null | absent |
| country | optional Array<CountryCodeData> | absent |
| continent | optional Array<ContinentData> | absent |
| geoAddress | optional GeoDistanceQueryData \| null | absent |
| state | optional Array<ProductStateData> \| null | absent |
| listingSourceId | absent | optional Array<string> |
| excludeListingSourceId | absent | optional Array<string> |
| availability | absent | optional Array<ListingAvailabilityData> \| null |
| orderability | absent | optional Array<ListingOrderabilityData> \| null |
| includeUnspecifiedAvailability | absent | optional boolean \| null |

### PostUserSearchFilterData → PostUserSearchFilterData

| Field | Existing | Target |
|---|---|---|
| search | required ProductSearchData | required ProductListingSearchData |

### PatchUserSearchFilterData → PatchUserSearchFilterData

| Field | Existing | Target |
|---|---|---|
| search | optional PatchProductSearchData \| null | optional PatchProductListingSearchData \| null |

### PatchProductSearchData → PatchProductListingSearchData

| Field | Existing | Target |
|---|---|---|
| shopName | optional Array<string> \| null | absent |
| excludeShopName | optional Array<string> \| null | absent |
| sellerName | optional Array<string> \| null | absent |
| excludeSellerName | optional Array<string> \| null | absent |
| shopSlugId | optional Array<string> \| null | absent |
| excludeShopSlugId | optional Array<string> \| null | absent |
| sellerSlugId | optional Array<string> \| null | absent |
| excludeSellerSlugId | optional Array<string> \| null | absent |
| shopType | optional Array<ShopTypeData> \| null | absent |
| country | optional Array<CountryCodeData> \| null | absent |
| continent | optional Array<ContinentData> \| null | absent |
| geoAddress | optional GeoDistanceQueryData \| null | absent |
| state | optional Array<ProductStateData> \| null | absent |
| listingSourceId | absent | optional Array<string> \| null |
| excludeListingSourceId | absent | optional Array<string> \| null |
| availability | absent | optional Array<ListingAvailabilityData> \| null |
| orderability | absent | optional Array<ListingOrderabilityData> \| null |
| includeUnspecifiedAvailability | absent | optional boolean \| null |

### UserSearchFilterData → UserSearchFilterData

| Field | Existing | Target |
|---|---|---|
| search | required ProductSearchData | required ProductListingSearchData |

### SearchFilterProductMatchData → SearchFilterProductMatchData

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| shopsProductId | required string | absent |
| productId | required string | absent |
| createdBy | required ActorData | absent |
| updatedBy | required ActorData | absent |
| userSearchFilterName | absent | optional string |
| productListingId | absent | required string |
| originEventId | absent | required string |
| enhancedMatchReason | absent | optional string |

### RangeQueryInt32 → (absent)

```ts
// Existing
{ min?: number; max?: number; }
// Target
absent
```

### DistanceUnitData → (absent)

```ts
// Existing
'MILES' | 'YARDS' | 'FEET' | 'INCHES' | 'KILOMETERS' | 'METERS' | 'CENTIMETERS' | 'MILLIMETERS' | 'NAUTICAL_MILES'
// Target
absent
```

### DistanceData → (absent)

```ts
// Existing
{ amount: number; unit: DistanceUnitData; }
// Target
absent
```

### GeoDistanceQueryData → (absent)

```ts
// Existing
{ lat: number; lon: number; distance: DistanceData; }
// Target
absent
```

### SortUserSearchFilterFieldData → (absent)

```ts
// Existing
'created'
// Target
absent
```

### CountryCodeData → (absent)

```ts
// Existing
'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 'AQ' | 'AR' | 'AS' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | 'BA' | 'BB' | 'BD' | 'BE' | 'BF' | 'BG' | 'BH' | 'BI' | 'BJ' | 'BL' | 'BM' | 'BN' | 'BO' | 'BQ' | 'BR' | 'BS' | 'BT' | 'BV' | 'BW' | 'BY' | 'BZ' | 'CA' | 'CC' | 'CD' | 'CF' | 'CG' | 'CH' | 'CI' | 'CK' | 'CL' | 'CM' | 'CN' | 'CO' | 'CR' | 'CU' | 'CV' | 'CW' | 'CX' | 'CY' | 'CZ' | 'DE' | 'DJ' | 'DK' | 'DM' | 'DO' | 'DZ' | 'EC' | 'EE' | 'EG' | 'EH' | 'ER' | 'ES' | 'ET' | 'FI' | 'FJ' | 'FK' | 'FM' | 'FO' | 'FR' | 'GA' | 'GB' | 'GD' | 'GE' | 'GF' | 'GG' | 'GH' | 'GI' | 'GL' | 'GM' | 'GN' | 'GP' | 'GQ' | 'GR' | 'GS' | 'GT' | 'GU' | 'GW' | 'GY' | 'HK' | 'HM' | 'HN' | 'HR' | 'HT' | 'HU' | 'ID' | 'IE' | 'IL' | 'IM' | 'IN' | 'IO' | 'IQ' | 'IR' | 'IS' | 'IT' | 'JE' | 'JM' | 'JO' | 'JP' | 'KE' | 'KG' | 'KH' | 'KI' | 'KM' | 'KN' | 'KP' | 'KR' | 'KW' | 'KY' | 'KZ' | 'LA' | 'LB' | 'LC' | 'LI' | 'LK' | 'LR' | 'LS' | 'LT' | 'LU' | 'LV' | 'LY' | 'MA' | 'MC' | 'MD' | 'ME' | 'MF' | 'MG' | 'MH' | 'MK' | 'ML' | 'MM' | 'MN' | 'MO' | 'MP' | 'MQ' | 'MR' | 'MS' | 'MT' | 'MU' | 'MV' | 'MW' | 'MX' | 'MY' | 'MZ' | 'NA' | 'NC' | 'NE' | 'NF' | 'NG' | 'NI' | 'NL' | 'NO' | 'NP' | 'NR' | 'NU' | 'NZ' | 'OM' | 'PA' | 'PE' | 'PF' | 'PG' | 'PH' | 'PK' | 'PL' | 'PM' | 'PN' | 'PR' | 'PS' | 'PT' | 'PW' | 'PY' | 'QA' | 'RE' | 'RO' | 'RS' | 'RU' | 'RW' | 'SA' | 'SB' | 'SC' | 'SD' | 'SE' | 'SG' | 'SH' | 'SI' | 'SJ' | 'SK' | 'SL' | 'SM' | 'SN' | 'SO' | 'SR' | 'SS' | 'ST' | 'SV' | 'SX' | 'SY' | 'SZ' | 'TC' | 'TD' | 'TF' | 'TG' | 'TH' | 'TJ' | 'TK' | 'TL' | 'TM' | 'TN' | 'TO' | 'TR' | 'TT' | 'TV' | 'TW' | 'TZ' | 'UA' | 'UG' | 'UM' | 'US' | 'UY' | 'UZ' | 'VA' | 'VC' | 'VE' | 'VG' | 'VI' | 'VN' | 'VU' | 'WF' | 'WS' | 'YE' | 'YT' | 'ZA' | 'ZM' | 'ZW'
// Target
absent
```

### ContinentData → (absent)

```ts
// Existing
'AFRICA' | 'ANTARCTICA' | 'ASIA' | 'EUROPE' | 'NORTH_AMERICA' | 'OCEANIA' | 'SOUTH_AMERICA'
// Target
absent
```

### StructuredAddressData → (absent)

```ts
// Existing
{ addressline?: string; addresslineExtra?: string; locality?: string; region?: string; postalCode?: string; country?: CountryCodeData; continent?: ContinentData; }
// Target
absent
```

### GeoAddressData → (absent)

```ts
// Existing
{ lat: number; lon: number; }
// Target
absent
```

### GetShopData → ListingSourceData

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| shopSlugId | required string | absent |
| shopType | required ShopTypeData | absent |
| domains | required Array<string> | absent |
| shopifyDomain | optional string \| null | absent |
| shopifyCurrency | optional CurrencyData \| null | absent |
| shopifyLanguage | optional LanguageData \| null | absent |
| woocommerceCurrency | optional CurrencyData \| null | absent |
| woocommerceLanguage | optional LanguageData \| null | absent |
| url | optional string \| null | optional string |
| viewUrl | optional string \| null | absent |
| image | optional string \| null | optional string |
| structuredAddress | optional StructuredAddressData | absent |
| geoAddress | optional GeoAddressData | absent |
| phone | optional string | absent |
| email | optional string | absent |
| partnerStatus | required ShopPartnerStatusData | absent |
| createdBy | required ActorData | absent |
| updatedBy | required ActorData | absent |
| listingSourceId | absent | required string |
| listingSourceSlugId | absent | required string |
| operator | absent | required OperatorPartyData |
| ingestionMethods | absent | required Array<ListingIngestionMethodData> |

### ShopSearchData → (absent)

```ts
// Existing
{ shopNameQuery?: string; shopType?: Array<ShopTypeData> | null; partnerStatus?: Array<ShopPartnerStatusData> | null; countries?: Array<CountryCodeData>; continents?: Array<ContinentData>; created?: RangeQueryDateTime | null; updated?: RangeQueryDateTime | null; }
// Target
absent
```

### PatchShopData → UpdateListingSourceData

| Field | Existing | Target |
|---|---|---|
| shopType | optional ShopTypeData \| null | absent |
| domains | optional Array<string> \| null | absent |
| shopifyDomain | optional string \| null | absent |
| shopifyCurrency | optional CurrencyData \| null | absent |
| shopifyLanguage | optional LanguageData \| null | absent |
| woocommerceCurrency | optional CurrencyData \| null | absent |
| woocommerceLanguage | optional LanguageData \| null | absent |
| structuredAddress | optional StructuredAddressData \| null | absent |
| phone | optional string \| null | absent |
| email | optional string \| null | absent |
| name | absent | optional string |
| ingestionConfiguration | absent | optional Array<ListingIngestionConfigurationData> |
| woocommerceWebhookSecret | absent | optional string \| null |
| referralConfiguration | absent | optional ReferralConfigurationData \| null |

### PostShopData → CreateListingSourceData

| Field | Existing | Target |
|---|---|---|
| shopType | required ShopTypeData | absent |
| domains | required Array<string> | absent |
| shopifyDomain | optional string \| null | absent |
| shopifyCurrency | optional CurrencyData \| null | absent |
| shopifyLanguage | optional LanguageData \| null | absent |
| woocommerceCurrency | optional CurrencyData \| null | absent |
| woocommerceLanguage | optional LanguageData \| null | absent |
| url | optional string \| null | optional string |
| image | optional string \| null | optional string |
| structuredAddress | optional StructuredAddressData \| null | absent |
| phone | optional string \| null | absent |
| email | optional string \| null | absent |
| operator | absent | required ListingSourceOperatorInputData |
| ingestionConfiguration | absent | required Array<ListingIngestionConfigurationData> |
| woocommerceWebhookSecret | absent | optional string |
| referralConfiguration | absent | optional ReferralConfigurationData |

### AccessTokenScopeData → AccessTokenScopeData

```ts
// Existing
'shops:manage' | 'products:write'
// Target
"product-listings:write" | "users:read" | "users:write" | "access-tokens:read" | "access-tokens:write" | "search-filters:write" | "watchlist:read" | "watchlist:write"
```

### PatchAccessTokenData → PatchAccessTokenData

| Field | Existing | Target |
|---|---|---|
| name | optional string \| null | optional string |
| scope | optional Array<AccessTokenScopeData> \| null | absent |
| expiresAt | optional string \| null | absent |
| scopes | absent | optional Array<AccessTokenScopeData> |
| expires | absent | optional string \| null |

### OAuthClientMetadataPatchData → OAuthClientMetadataPatchData

| Field | Existing | Target |
|---|---|---|
| client_name | optional string \| null | optional string |
| tos_uri | optional string \| null | optional string |
| policy_uri | optional string \| null | optional string |
| client_uri | optional string \| null | optional string |
| logo_uri | optional string \| null | optional string |
| redirect_uris | optional Array<string> \| null | optional Array<string> |
| scope | optional Array<AccessTokenScopeData> \| null | optional Array<AccessTokenScopeData> |

### SortShopFieldData → SortListingSourceFieldData

```ts
// Existing
'score' | 'name' | 'updated' | 'created'
// Target
"name" | "slug" | "created" | "updated"
```

### ShopSearchResultData → ListingSourceSearchCollectionData

| Field | Existing | Target |
|---|---|---|
| items | required Array<GetShopData> | required Array<ListingSourceSearchSummaryData> |
| searchAfter | optional Array<unknown> \| null | optional string |
| total | optional number \| null | optional number |

### CategorySearchData → (absent)

```ts
// Existing
{ language?: LanguageData; nameQuery?: string; }
// Target
absent
```

### SortCategoryFieldData → (absent)

```ts
// Existing
'score' | 'name' | 'updated' | 'created'
// Target
absent
```

### GetCategorySummaryData → (absent)

```ts
// Existing
{ categoryId: string; categoryKey: string; name: LocalizedTextData; products: number; created: string; updated: string; }
// Target
absent
```

### GetCategoryData → (absent)

```ts
// Existing
{ categoryId: string; categoryKey: string; name: LocalizedTextData; products: number; created: string; updated: string; }
// Target
absent
```

### PeriodSearchData → (absent)

```ts
// Existing
{ language?: LanguageData; nameQuery?: string; }
// Target
absent
```

### SortPeriodFieldData → (absent)

```ts
// Existing
'score' | 'name' | 'updated' | 'created'
// Target
absent
```

### GetPeriodSummaryData → (absent)

```ts
// Existing
{ periodId: string; periodKey: string; name: LocalizedTextData; products: number; created: string; updated: string; }
// Target
absent
```

### GetPeriodData → (absent)

```ts
// Existing
{ periodId: string; periodKey: string; name: LocalizedTextData; products: number; created: string; updated: string; }
// Target
absent
```

### ProductKeyData → PostWatchlistData

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| shopsProductId | required string | absent |
| productListingId | absent | required string |
| notifications | absent | optional boolean |

### WatchlistCollectionData → (absent)

```ts
// Existing
{ items: Array<PersonalizedGetProductData>; size: number; searchAfter?: string | null; total?: number | null; }
// Target
absent
```

### SortWatchlistProductFieldData → (absent)

```ts
// Existing
'created'
// Target
absent
```

### SortSearchFilterMatchFieldData → (absent)

```ts
// Existing
'created'
// Target
absent
```

### SortUserFieldData → SortUserFieldData

```ts
// Existing
'score' | 'email' | 'firstName' | 'lastName' | 'tier' | 'role' | 'updated' | 'created'
// Target
"name" | "email" | "firstName" | "lastName" | "tier" | "role" | "updated" | "created"
```

### SearchFilterMatchProductCollectionData → SearchFilterMatchProductCollectionData

| Field | Existing | Target |
|---|---|---|
| items | required Array<PersonalizedGetProductData> | required Array<PersonalizedProductListingDetailsData> |
| searchAfter | optional string \| null | optional Array<string> |
| total | optional number \| null | optional number |

### UserCollectionData → UserCollectionData

| Field | Existing | Target |
|---|---|---|
| items | required Array<GetUserAccountData> | required Array<AdminUserSummaryData> |
| searchAfter | optional Array<unknown> \| null | optional string |
| total | optional number \| null | optional number |

### UserSearchData → (absent)

```ts
// Existing
{ query?: string; email?: string; firstName?: string; lastName?: string; tier?: Array<UserTierData>; role?: Array<UserRoleData>; country?: Array<CountryCodeData>; continent?: Array<ContinentData>; geoAddress?: GeoDistanceQueryData | null; created?: { min?: string; max?: string; }; updated?: { min?: string; max?: string; }; }
// Target
absent
```

### GetUserAccountData → OwnUserAccountData

| Field | Existing | Target |
|---|---|---|
| prohibitedContentConsent | required boolean | absent |
| stripeCustomerId | optional string | optional string \| null |
| structuredAddress | optional StructuredAddressData \| null | absent |
| geoAddress | optional GeoAddressData \| null | absent |
| createdBy | required ActorData | absent |
| updatedBy | required ActorData | absent |
| created | required string | absent |
| updated | required string | absent |
| showUnassessedOrSensitiveContent | absent | required boolean |

### PatchAdminUserData → PatchAdminUserData

| Field | Existing | Target |
|---|---|---|
| prohibitedContentConsent | optional boolean \| null | absent |
| tier | optional UserTierData \| null | optional UserTierData |
| role | optional UserRoleData \| null | optional UserRoleData |
| stripeCustomerId | optional string \| null | absent |
| structuredAddress | optional StructuredAddressData \| null | absent |
| email | absent | optional string |
| showUnassessedOrSensitiveContent | absent | optional boolean |

### PatchUserAccountData → PatchUserAccountData

| Field | Existing | Target |
|---|---|---|
| prohibitedContentConsent | optional boolean \| null | absent |
| structuredAddress | optional StructuredAddressData \| null | absent |
| showUnassessedOrSensitiveContent | absent | optional boolean |

### GetNotificationData → NotificationData

| Field | Existing | Target |
|---|---|---|
| originEventId | required string | absent |
| external | required boolean | absent |
| createdBy | required ActorData | absent |
| updatedBy | required ActorData | absent |
| kind | absent | required "WATCHLIST_PRICE_CHANGED" \| "WATCHLIST_AVAILABILITY_CHANGED" \| "SEARCH_FILTER_MATCH" \| "PARTNERSHIP_APPLICATION_APPROVED" \| "PARTNERSHIP_APPLICATION_REJECTED" |

### NotificationPayloadData → NotificationPayloadData

```ts
// Existing
({ type: 'WATCHLIST'; } & WatchlistNotificationPayloadData) | ({ type: 'SEARCH_FILTER'; } & SearchFilterNotificationPayloadData) | ({ type: 'PARTNER_APPLICATION'; } & PartnerApplicationNotificationPayloadData)
// Target
WatchlistNotificationPayloadData | SearchFilterNotificationPayloadData | PartnershipApplicationNotificationPayloadData
```

### WatchlistNotificationPayloadData → WatchlistNotificationPayloadData

| Field | Existing | Target |
|---|---|---|
| type | required 'WATCHLIST' | absent |
| productId | required string | absent |
| shopId | required string | absent |
| shopsProductId | required string | absent |
| shopSlugId | required string | absent |
| productSlugId | required string | absent |
| shopName | required string | absent |
| title | required LocalizedTextData | required LocalizedTextData \| null |
| image | optional ProductImageData \| null | required ProductListingImageData \| null |
| watchlistPayload | required WatchlistPayloadData | absent |
| productListingId | absent | required string |
| listingSourceId | absent | required string |
| sourceListingId | absent | required string |
| listingSourceSlugId | absent | required string |
| productListingTitleSlugId | absent | required string |
| listingSourceName | absent | required string |
| change | absent | required WatchlistNotificationChangeData |

### WatchlistPayloadData → (absent)

```ts
// Existing
({ type: 'PRICE_CHANGE'; } & PriceChangeWatchlistPayloadData) | ({ type: 'STATE_CHANGE'; } & StateChangeWatchlistPayloadData)
// Target
absent
```

### PriceChangeWatchlistPayloadData → (absent)

```ts
// Existing
{ type: 'PRICE_CHANGE'; oldPrice?: PriceData | null; newPrice?: PriceData | null; }
// Target
absent
```

### StateChangeWatchlistPayloadData → (absent)

```ts
// Existing
{ type: 'STATE_CHANGE'; oldState: ProductStateData; newState: ProductStateData; }
// Target
absent
```

### SearchFilterNotificationPayloadData → SearchFilterNotificationPayloadData

| Field | Existing | Target |
|---|---|---|
| type | required 'SEARCH_FILTER' | absent |
| productId | required string | absent |
| shopId | required string | absent |
| shopsProductId | required string | absent |
| shopSlugId | required string | absent |
| productSlugId | required string | absent |
| shopName | required string | absent |
| title | required LocalizedTextData | required LocalizedTextData \| null |
| image | optional ProductImageData \| null | required ProductListingImageData \| null |
| searchFilterPayload | required SearchFilterPayloadData | absent |
| productListingId | absent | required string |
| userSearchFilterId | absent | required string |
| userSearchFilterName | absent | required string |
| listingSourceId | absent | required string |
| sourceListingId | absent | required string |
| listingSourceSlugId | absent | required string |
| productListingTitleSlugId | absent | required string |
| listingSourceName | absent | required string |

### SearchFilterPayloadData → (absent)

```ts
// Existing
{ userSearchFilterId: string; userSearchFilterName: string; }
// Target
absent
```

### PartnerApplicationNotificationPayloadData → PartnershipApplicationNotificationPayloadData

| Field | Existing | Target |
|---|---|---|
| type | required 'PARTNER_APPLICATION' | absent |
| shopName | required string | absent |
| image | optional string \| null | required string \| null |
| partnerApplicationPayload | required PartnerApplicationPayloadData | absent |
| partnershipApplicationId | absent | required string |
| decision | absent | required "APPROVED" \| "REJECTED" |
| listingSourceName | absent | required string |

### PartnerApplicationPayloadData → (absent)

```ts
// Existing
({ type: 'APPROVED'; } & ApprovedPartnerApplicationPayloadData) | ({ type: 'REJECTED'; } & RejectedPartnerApplicationPayloadData)
// Target
absent
```

### ApprovedPartnerApplicationPayloadData → (absent)

```ts
// Existing
{ type: 'APPROVED'; partnerApplicationId: string; }
// Target
absent
```

### RejectedPartnerApplicationPayloadData → (absent)

```ts
// Existing
{ type: 'REJECTED'; partnerApplicationId: string; }
// Target
absent
```

### PatchNotificationData → UpdateNotificationSeenData

| Field | Existing | Target |
|---|---|---|
| seen | optional boolean \| null | required boolean |

### NotificationCollectionData → NotificationCollectionData

| Field | Existing | Target |
|---|---|---|
| items | required Array<GetNotificationData> | required Array<NotificationData> |
| searchAfter | optional string \| null | optional Array<string> \| null |
| total | optional number \| null | absent |

### PostProductData → CreateProductListingData

| Field | Existing | Target |
|---|---|---|
| shopsProductId | required string | absent |
| price | optional PriceData \| null | optional ProductListingPriceData \| null |
| state | required ProductStateData | absent |
| sellerName | optional string \| null | absent |
| structuredAddress | optional StructuredAddressData \| null | absent |
| geoAddress | optional GeoAddressData \| null | absent |
| sourceListingId | absent | required string |
| availability | absent | optional ListingAvailabilityData \| null |

### PartnerProductEnqueueFailuresResponse → PartnerProductListingBatchFailuresResponse

```ts
// Existing
Array<string>
// Target
Array<{ "listingSourceId": string; "sourceListingId": string; "error": string; }>
```

### PatchProductData → UpdateProductListingData

| Field | Existing | Target |
|---|---|---|
| shopsProductId | required string | absent |
| price | optional PriceData \| null | optional ProductListingPriceData \| null |
| state | optional ProductStateData | absent |
| url | optional string \| null | optional string |
| images | optional Array<string> \| null | optional Array<string> |
| sourceListingId | absent | required string |
| availability | absent | optional ListingAvailabilityData \| null |

### PutProductData → UpsertProductListingData

| Field | Existing | Target |
|---|---|---|
| shopsProductId | required string | absent |
| price | optional PriceData \| null | optional ProductListingPriceData \| null |
| state | optional ProductStateData \| null | absent |
| images | optional Array<string> \| null | optional Array<string> |
| sellerName | optional string \| null | absent |
| structuredAddress | optional StructuredAddressData \| null | absent |
| geoAddress | optional GeoAddressData \| null | absent |
| sourceListingId | absent | required string |
| availability | absent | optional ListingAvailabilityData \| null |

### WoocommerceProductWebhookUpsertData → WoocommerceProductWebhookUpsertData

| Field | Existing | Target |
|---|---|---|
| name | required string | optional string |
| permalink | required string | optional string |
| date_modified_gmt | absent | optional string \| null |

### WoocommerceProductWebhookDeleteData → WoocommerceProductWebhookDeleteData

| Field | Existing | Target |
|---|---|---|
| date_modified_gmt | absent | optional string \| null |

### PartnerShopApplicationStateData → PartnershipApplicationStateData

```ts
// Existing
'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'APPROVED'
// Target
"SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN"
```

### ExecutionStateData → (absent)

```ts
// Existing
'PROCESSING' | 'WAITING' | 'COMPLETED'
// Target
absent
```

### GetPartnerShopApplicationPayloadData → (absent)

```ts
// Existing
{ type: 'EXISTING'; shop: GetShopData; } | { type: 'NEW'; shopName: string; shopType: ShopTypeData; shopDomains: Array<string>; shopUrl?: string | null; shopImage?: string | null; shopStructuredAddress?: StructuredAddressData; shopPhone?: string; shopEmail?: string; }
// Target
absent
```

### GetPartnerShopApplicationData → OwnPartnershipApplicationData

| Field | Existing | Target |
|---|---|---|
| applicantUserId | required string | absent |
| businessState | required PartnerShopApplicationStateData | absent |
| executionState | required ExecutionStateData | absent |
| payload | required GetPartnerShopApplicationPayloadData | absent |
| createdBy | required ActorData | absent |
| updatedBy | required ActorData | absent |
| created | required string | absent |
| updated | required string | absent |
| state | absent | required PartnershipApplicationStateData |
| proposal | absent | required PartnershipApplicationProposalData |

### PostPartnerShopApplicationPayloadData → SubmitPartnershipApplicationData

| Field | Existing | Target |
|---|---|---|
| type | required 'EXISTING' | absent |
| shopId | required string | absent |
| } | { type: 'NEW' | required } \| { type: 'NEW' | absent |
| shopName | required string | absent |
| shopType | required ShopTypeData | absent |
| shopDomains | required Array<string> | absent |
| shopUrl | optional string \| null | absent |
| shopImage | optional string \| null | absent |
| shopStructuredAddress | optional StructuredAddressData \| null | absent |
| shopPhone | optional string \| null | absent |
| shopEmail | optional string \| null | absent |
| proposal | absent | required PartnershipApplicationProposalData |

### PatchPartnerShopApplicationData → (absent)

```ts
// Existing
{ shopName?: string; shopType?: ShopTypeData; shopDomains?: Array<string>; shopUrl?: string | null; shopImage?: string | null; shopStructuredAddress?: StructuredAddressData | null; shopPhone?: string | null; shopEmail?: string | null; }
// Target
absent
```

### AdminPatchPartnerShopApplicationData → (absent)

```ts
// Existing
{ shopName?: string; shopType?: ShopTypeData; shopDomains?: Array<string>; shopUrl?: string | null; shopImage?: string | null; shopStructuredAddress?: StructuredAddressData | null; shopPhone?: string | null; shopEmail?: string | null; }
// Target
absent
```

### PartnerShopApplicationDecisionData → (absent)

```ts
// Existing
'APPROVE' | 'REJECT'
// Target
absent
```

### PostPartnerShopApplicationDecisionData → DecidePartnershipApplicationData

| Field | Existing | Target |
|---|---|---|
| decision | required PartnerShopApplicationDecisionData | required "APPROVE" \| "REJECT" |

### PatchShopDataWritable → (absent)

```ts
// Existing
{ shopType?: ShopTypeData | null; domains?: Array<string> | null; shopifyDomain?: string | null; shopifyCurrency?: CurrencyData | null; shopifyLanguage?: LanguageData | null; woocommerceWebhookSecret?: string | null; woocommerceCurrency?: CurrencyData | null; woocommerceLanguage?: LanguageData | null; url?: string | null; image?: string | null; structuredAddress?: StructuredAddressData | null; phone?: string | null; email?: string | null; }
// Target
absent
```

### PostShopDataWritable → (absent)

```ts
// Existing
{ name: string; shopType: ShopTypeData; domains: Array<string>; shopifyDomain?: string | null; shopifyCurrency?: CurrencyData | null; shopifyLanguage?: LanguageData | null; woocommerceWebhookSecret?: string | null; woocommerceCurrency?: CurrencyData | null; woocommerceLanguage?: LanguageData | null; url?: string | null; image?: string | null; structuredAddress?: StructuredAddressData | null; phone?: string | null; email?: string | null; }
// Target
absent
```

### (new) → ProductListingSummaryPriceValuationData

```ts
// Existing
absent
// Target
{ "type": "CURRENT"; "fxRateId": string; "capturedAt": string; } | { "type": "SALE_OBSERVATION"; "fxRateId": string; "observedAt": string; }
```

### (new) → ProductListingPricingData

```ts
// Existing
absent
// Target
{ "price"?: ProductListingPriceData | null; "priceEstimateMin"?: PriceData | null; "priceEstimateMax"?: PriceData | null; }
```

### (new) → ProductListingPricingValuationData

```ts
// Existing
absent
// Target
{ "type": "CURRENT"; "fxRateId": string; "capturedAt": string; } | { "type": "SALE_OBSERVATION"; "fxRateId": string; "capturedAt": string; "observedAt": string; }
```

### (new) → ProductListingSearchCursorData

```ts
// Existing
absent
// Target
{ "fxRateId": string; "searchAfter": Array<unknown>; }
```

### (new) → PersonalizedProductListingSearchResultData

```ts
// Existing
absent
// Target
{ "items": Array<PersonalizedProductListingSummaryData>; "size": number; "total"?: number | null; "searchAfter"?: Array<unknown> | null; }
```

### (new) → ProductListingPriceData

```ts
// Existing
absent
// Target
{ "type": "MONETARY"; "currency": CurrencyData; "amount": number; } | { "type": "ON_REQUEST"; }
```

### (new) → ListingOrderabilityData

```ts
// Existing
absent
// Target
"ORDERABLE_NOW" | "ORDERABLE_CONDITIONALLY" | "NOT_ORDERABLE"
```

### (new) → ProductListingDiscoveryHistoryPayloadData

```ts
// Existing
absent
// Target
{ "listingSourceId": string; "sourceListingId": string; "title"?: LocalizedTextData; "description"?: LocalizedTextData; "pricing": ProductListingPricingData; "availability": ListingAvailabilityData | null; "url": string; "imageCount": number; "auction": AuctionData; }
```

### (new) → ProductListingChangedHistoryPayloadData

```ts
// Existing
absent
// Target
{ "changes": Array<ProductListingHistoryChangeData>; }
```

### (new) → ProductListingHistoryChangeData

```ts
// Existing
absent
// Target
ProductListingMainPriceHistoryChangeData | ProductListingPriceHistoryChangeData | ProductListingAvailabilityHistoryChangeData | ProductListingUrlHistoryChangeData | ProductListingImagesHistoryChangeData | ProductListingAuctionHistoryChangeData | ProductListingWithdrawalHistoryChangeData | ProductListingRestorationHistoryChangeData | ProductListingSaleObservationHistoryChangeData
```

### (new) → ProductListingMainPriceHistoryChangeData

```ts
// Existing
absent
// Target
{ "type": "MAIN_PRICE_CHANGED"; "previous": ProductListingPriceData | null; "current": ProductListingPriceData | null; }
```

### (new) → ProductListingPriceHistoryChangeData

```ts
// Existing
absent
// Target
{ "type": "MINIMUM_ESTIMATE_CHANGED" | "MAXIMUM_ESTIMATE_CHANGED"; "previous": PriceData | null; "current": PriceData | null; }
```

### (new) → ProductListingAvailabilityHistoryChangeData

```ts
// Existing
absent
// Target
{ "type": "AVAILABILITY_CHANGED"; "previous": ListingAvailabilityData | null; "current": ListingAvailabilityData | null; }
```

### (new) → ProductListingUrlHistoryChangeData

```ts
// Existing
absent
// Target
{ "type": "URL_CHANGED"; "previous": string; "current": string; }
```

### (new) → ProductListingImagesHistoryChangeData

```ts
// Existing
absent
// Target
{ "type": "IMAGES_CHANGED"; "previousCount": number; "currentCount": number; }
```

### (new) → ProductListingAuctionHistoryChangeData

```ts
// Existing
absent
// Target
{ "type": "AUCTION_CHANGED"; "previous": AuctionData; "current": AuctionData; }
```

### (new) → ProductListingWithdrawalHistoryChangeData

```ts
// Existing
absent
// Target
{ "type": "WITHDRAWN"; "previousAvailability": ListingAvailabilityData | null; }
```

### (new) → ProductListingRestorationHistoryChangeData

```ts
// Existing
absent
// Target
{ "type": "RESTORED"; }
```

### (new) → ProductListingSaleObservationHistoryChangeData

```ts
// Existing
absent
// Target
{ "type": "SALE_OBSERVED" | "SALE_OBSERVATION_RETRACTED"; "observation": { "observedAt": string; "fxRateId": string; }; }
```

### (new) → AdminAccessTokenCollectionData

```ts
// Existing
absent
// Target
{ "items": Array<AdminAccessTokenData>; "size": number; "searchAfter"?: Array<string> | null; }
```

### (new) → AdminAccessTokenData

```ts
// Existing
absent
// Target
{ "userId": string; "accessTokenId": string; "name": string; "scopes": Array<AccessTokenScopeData>; "origin": string; "expires"?: string | null; }
```

### (new) → OAuthClientAdminCollectionData

```ts
// Existing
absent
// Target
{ "items": Array<OAuthClientAdminData>; "size": number; "searchAfter"?: Array<string> | null; "total"?: number | null; }
```

### (new) → OAuthClientAdminData

```ts
// Existing
absent
// Target
{ "client_id": string; "client_name": string; "tos_uri": string; "policy_uri": string; "client_uri": string; "logo_uri": string; "redirect_uris": Array<string>; "scope": Array<AccessTokenScopeData>; "client_id_issued_at": number; }
```

### (new) → WatchlistEntryData

```ts
// Existing
absent
// Target
{ "userId": string; "productListingId": string; "notifications": boolean; "state": ResourceStateData; "created"?: string; "updated"?: string; }
```

### (new) → SortPartyFieldData

```ts
// Existing
absent
// Target
"name" | "email" | "phone" | "created" | "updated"
```

### (new) → CreatePartyData

```ts
// Existing
absent
// Target
{ "name": string; "phone"?: string; "email"?: string; }
```

### (new) → UpdatePartyData

```ts
// Existing
absent
// Target
{ "name"?: string; "phone"?: string | null; "email"?: string | null; }
```

### (new) → PartyData

```ts
// Existing
absent
// Target
{ "partyId": string; "partySlugId": string; "name": string; "contact": PartyContactData; "created": string; "updated": string; }
```

### (new) → PartyCollectionData

```ts
// Existing
absent
// Target
{ "items": Array<PartySummaryData>; "size": number; "searchAfter"?: string; "total"?: number; }
```

### (new) → PartySummaryData

```ts
// Existing
absent
// Target
{ "partyId": string; "partySlugId": string; "name": string; "contact": PartyContactData; "created": string; "updated": string; }
```

### (new) → PartyContactData

```ts
// Existing
absent
// Target
{ "phone"?: string; "email"?: string; }
```

### (new) → AdminUserSummaryData

```ts
// Existing
absent
// Target
{ "userId": string; "email": string; "firstName"?: string; "lastName"?: string; "tier": UserTierData; "role": UserRoleData; "stripeCustomerId"?: string; }
```

### (new) → AdminUserAccountData

```ts
// Existing
absent
// Target
OwnUserAccountData & { }
```

### (new) → SuspendUserData

```ts
// Existing
absent
// Target
{ "reason": string; }
```

### (new) → SuspendUserResponseData

```ts
// Existing
absent
// Target
{ "userId": string; "suspended": boolean; }
```

### (new) → UnsuspendUserResponseData

```ts
// Existing
absent
// Target
{ "userId": string; "suspended": boolean; }
```

### (new) → WatchlistNotificationChangeData

```ts
// Existing
absent
// Target
WatchlistNotificationPriceChangeData | WatchlistNotificationAvailabilityChangeData
```

### (new) → WatchlistNotificationPriceChangeData

```ts
// Existing
absent
// Target
{ "type": "PRICE_CHANGE"; "oldPrice": ProductListingPriceData | null; "newPrice": ProductListingPriceData | null; }
```

### (new) → WatchlistNotificationAvailabilityChangeData

```ts
// Existing
absent
// Target
{ "type": "AVAILABILITY_CHANGE"; "oldAvailability": ListingAvailabilityData | null; "newAvailability": ListingAvailabilityData | null; }
```

### (new) → UpdateNotificationsSeenData

```ts
// Existing
absent
// Target
{ "notificationIds": Array<string>; "seen": boolean; }
```

### (new) → WithdrawProductListingData

```ts
// Existing
absent
// Target
{ "sourceListingId": string; }
```

### (new) → AdminOverviewData

```ts
// Existing
absent
// Target
{ "schemaVersion": 1; "users": AdminOverviewUsersData; "partnershipApplications": AdminOverviewPartnershipApplicationsData; "parties": AdminOverviewCountData; "listingSources": AdminOverviewListingSourcesData; "partnerships": AdminOverviewCountData; "productListings": AdminOverviewProductListingsData; }
```

### (new) → AdminOverviewCountData

```ts
// Existing
absent
// Target
{ "total": number; }
```

### (new) → AdminOverviewUsersData

```ts
// Existing
absent
// Target
{ "total": number; "byTier": AdminOverviewUserTierCountsData; "byRole": AdminOverviewUserRoleCountsData; }
```

### (new) → AdminOverviewUserTierCountsData

```ts
// Existing
absent
// Target
{ "free": number; "pro": number; "ultimate": number; }
```

### (new) → AdminOverviewUserRoleCountsData

```ts
// Existing
absent
// Target
{ "user": number; "admin": number; }
```

### (new) → AdminOverviewPartnershipApplicationsData

```ts
// Existing
absent
// Target
{ "total": number; "byState": AdminOverviewPartnershipApplicationStateCountsData; }
```

### (new) → AdminOverviewPartnershipApplicationStateCountsData

```ts
// Existing
absent
// Target
{ "submitted": number; "inReview": number; "approved": number; "rejected": number; "withdrawn": number; }
```

### (new) → AdminOverviewListingSourcesData

```ts
// Existing
absent
// Target
{ "total": number; "withoutIngestionMethod": number; "methodAssignments": AdminOverviewListingSourceMethodAssignmentCountsData; }
```

### (new) → AdminOverviewListingSourceMethodAssignmentCountsData

```ts
// Existing
absent
// Target
{ "webCrawl": number; "shopify": number; "woocommerce": number; "partnerApi": number; }
```

### (new) → AdminOverviewProductListingsData

```ts
// Existing
absent
// Target
{ "total": number; "byLifecycle": AdminOverviewProductListingLifecycleCountsData; "activeAvailability": AdminOverviewActiveListingAvailabilityCountsData; "activeWithoutAvailability": number; }
```

### (new) → AdminOverviewProductListingLifecycleCountsData

```ts
// Existing
absent
// Target
{ "active": number; "withdrawn": number; }
```

### (new) → AdminOverviewActiveListingAvailabilityCountsData

```ts
// Existing
absent
// Target
{ "available": number; "inStock": number; "limitedAvailability": number; "backOrder": number; "madeToOrder": number; "preOrder": number; "preSale": number; "unavailable": number; "reserved": number; "outOfStock": number; "soldOut": number; }
```

### (new) → AdminPartnershipCollectionData

```ts
// Existing
absent
// Target
{ "items": Array<AdminPartnershipSummaryData>; "size": number; "searchAfter"?: Array<string>; }
```

### (new) → AdminPartnershipDetailsData

```ts
// Existing
absent
// Target
{ "partnershipId": string; "party": PartnershipPartySummaryData; "memberUserIds": Array<string>; "listingSourceIds": Array<string>; "memberCount": number; "listingSourceGrantCount": number; "created": string; "updated": string; }
```

### (new) → AdminPartnershipSummaryData

```ts
// Existing
absent
// Target
{ "partnershipId": string; "party": PartnershipPartySummaryData; "memberCount": number; "listingSourceGrantCount": number; "created": string; "updated": string; }
```

### (new) → PartnershipPartySummaryData

```ts
// Existing
absent
// Target
{ "partyId": string; "partySlugId": string; "name": string; }
```

### (new) → AdminPartnershipApplicationData

```ts
// Existing
absent
// Target
{ "id": string; "applicantUserId": string; "state": PartnershipApplicationStateData; "proposal": PartnershipApplicationProposalData; "approvedPartnershipId": string | null; "approvedListingSourceId": string | null; }
```

### (new) → PartnershipProposalTypeData

```ts
// Existing
absent
// Target
"EXISTING_LISTING_SOURCE" | "PROPOSED_LISTING_SOURCE"
```

### (new) → AdminPartnershipApplicationSummaryData

```ts
// Existing
absent
// Target
{ "id": string; "applicantUserId": string; "state": PartnershipApplicationStateData; "proposal": PartnershipApplicationProposalData; "approvedPartnershipId": string | null; "approvedListingSourceId": string | null; "created": string; "updated": string; }
```

### (new) → AdminPartnershipApplicationCollectionData

```ts
// Existing
absent
// Target
{ "items": Array<AdminPartnershipApplicationSummaryData>; "size": number; "searchAfter"?: Array<string>; "total"?: number | null; }
```

### (new) → ListingSourceReferenceData

```ts
// Existing
absent
// Target
{ "listingSourceId": string; "listingSourceSlugId": string; }
```

### (new) → AdministeredListingSourceData

```ts
// Existing
absent
// Target
{ "listingSourceId": string; "listingSourceSlugId": string; "name": string; }
```

### (new) → ListingSourceSearchSummaryData

```ts
// Existing
absent
// Target
{ "listingSourceId": string; "listingSourceSlugId": string; "name": string; "operator": OperatorPartyData; "ingestionMethods": Array<ListingIngestionMethodData>; "presentation": ListingSourcePresentationData; "referralConfiguration"?: ReferralConfigurationData | null; "created": string; "updated": string; }
```

### (new) → ListingSourcePresentationData

```ts
// Existing
absent
// Target
{ "url"?: string; "image"?: string; }
```

### (new) → ListingIngestionMethodData

```ts
// Existing
absent
// Target
"WEB_CRAWL" | "SHOPIFY" | "WOOCOMMERCE" | "PARTNER_API"
```

### (new) → ListingIngestionConfigurationData

```ts
// Existing
absent
// Target
{ "type": "UNCONFIGURED"; "ingestionMethod": ListingIngestionMethodData; } | { "type": "WEB_CRAWL"; "fallbackCurrency"?: string; } | { "type": "SHOPIFY"; "domain": string; "currency"?: string; "language"?: string; } | { "type": "WOOCOMMERCE"; "currency"?: string; "language"?: string; } | { "type": "PARTNER_API"; }
```

### (new) → ReferralConfigurationData

```ts
// Existing
absent
// Target
{ "type": "PARTNERIZE"; "camref": string; }
```

### (new) → OperatorPartyData

```ts
// Existing
absent
// Target
{ "partyId": string; "partySlugId": string; "name": string; }
```

### (new) → ListingSourceOperatorInputData

```ts
// Existing
absent
// Target
{ "type": "EXISTING"; "partyId": string; } | { "type": "NEW"; "name": string; "phone"?: string; "email"?: string; }
```

### (new) → PartnershipApplicationProposalData

```ts
// Existing
absent
// Target
{ "type": "EXISTING_LISTING_SOURCE"; "listingSourceId": string; } | { "type": "PROPOSED_LISTING_SOURCE"; "party": ProposedPartyData; "listingSource": ProposedListingSourceData; }
```

### (new) → ProposedPartyData

```ts
// Existing
absent
// Target
{ "name": string; "phone"?: string; "email"?: string; }
```

### (new) → ProposedListingSourceData

```ts
// Existing
absent
// Target
{ "name": string; "url"?: string; "image"?: string; "requestedIngestionMethods": Array<ListingIngestionMethodData>; }
```

### (new) → ProductListingSourceData

```ts
// Existing
absent
// Target
{ "listingSourceId": string; "name": string; "slugId": string; }
```

## Operation requests and response status codes

### patchPartnerProducts → patchPartnerProductListings / request presence and transport

Old: PATCH /api/v1/shops/{shopId}/products. Target: PATCH /api/v1/listing-sources/{listingSourceId}/product-listings.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth, AccessTokenAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### patchPartnerProducts → patchPartnerProductListings / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| listingSourceId | absent | required string |

### patchPartnerProducts → patchPartnerProductListings / body

```ts
// Existing
Array<PatchProductData>
// Target
Array<UpdateProductListingData>
```

### patchPartnerProducts → patchPartnerProductListings / status contracts

```ts
{ 202: PartnerProductEnqueueFailuresResponse; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError; }
```

Target: 200: PartnerProductListingBatchFailuresResponse; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### postPartnerProducts → postPartnerProductListings / request presence and transport

Old: POST /api/v1/shops/{shopId}/products. Target: POST /api/v1/listing-sources/{listingSourceId}/product-listings.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth, AccessTokenAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### postPartnerProducts → postPartnerProductListings / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| listingSourceId | absent | required string |

### postPartnerProducts → postPartnerProductListings / body

```ts
// Existing
Array<PostProductData>
// Target
Array<CreateProductListingData>
```

### postPartnerProducts → postPartnerProductListings / status contracts

```ts
{ 202: PartnerProductEnqueueFailuresResponse; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError; }
```

Target: 200: PartnerProductListingBatchFailuresResponse; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### putPartnerProducts → putPartnerProductListings / request presence and transport

Old: PUT /api/v1/shops/{shopId}/products. Target: PUT /api/v1/listing-sources/{listingSourceId}/product-listings.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth, AccessTokenAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### putPartnerProducts → putPartnerProductListings / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| listingSourceId | absent | required string |

### putPartnerProducts → putPartnerProductListings / body

```ts
// Existing
Array<PutProductData>
// Target
Array<UpsertProductListingData>
```

### putPartnerProducts → putPartnerProductListings / status contracts

```ts
{ 202: PartnerProductEnqueueFailuresResponse; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError; }
```

Target: 200: PartnerProductListingBatchFailuresResponse; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### postWoocommerceWebhook → postWoocommerceWebhook / request presence and transport

Old: POST /api/v1/webhooks/woocommerce/{shopId}. Target: POST /api/v1/webhooks/woocommerce/{listingSourceId}.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth, AccessTokenAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### postWoocommerceWebhook → postWoocommerceWebhook / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| listingSourceId | absent | required string |

### postWoocommerceWebhook → postWoocommerceWebhook / header

| Field | Existing | Target |
|---|---|---|
| x-wc-webhook-delivery-id | absent | optional string |

### postWoocommerceWebhook → postWoocommerceWebhook / status contracts

```ts
{ 202: unknown; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError; }
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### deletePartnerProduct → deletePartnerProductListings / request presence and transport

Old: DELETE /api/v1/shops/{shopId}/products/{shopsProductId}. Target: DELETE /api/v1/listing-sources/{listingSourceId}/product-listings.

Old body: not accepted. Target body: required.

Old SDK security keys: BearerAuth, AccessTokenAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### deletePartnerProduct → deletePartnerProductListings / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| shopsProductId | required string | absent |
| listingSourceId | absent | required string |

### deletePartnerProduct → deletePartnerProductListings / body

```ts
// Existing
never
// Target
Array<WithdrawProductListingData>
```

### deletePartnerProduct → deletePartnerProductListings / status contracts

```ts
{ 204: void; }
{ 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: PartnerProductListingBatchFailuresResponse; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### getProduct → getProductListing / request presence and transport

Old: GET /api/v1/shops/{shopId}/products/{shopsProductId}. Target: GET /api/v1/product-listings/{productListingId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getProduct → getProductListing / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| shopsProductId | required string | absent |
| productListingId | absent | required string |

### getProduct → getProductListing / query

| Field | Existing | Target |
|---|---|---|

### getProduct → getProductListing / status contracts

```ts
{ 200: PersonalizedGetProductData; }
{ 400: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: PersonalizedProductListingDetailsData; 400: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### getProductBySlug → getProductListingByTitleSlug / request presence and transport

Old: GET /api/v1/by-slug/shops/{shopSlugId}/products/{productSlugId}. Target: GET /api/v1/product-listings/by-slug/{productListingTitleSlugId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getProductBySlug → getProductListingByTitleSlug / path

| Field | Existing | Target |
|---|---|---|
| shopSlugId | required string | absent |
| productSlugId | required string | absent |
| productListingTitleSlugId | absent | required string |

### getProductBySlug → getProductListingByTitleSlug / query

| Field | Existing | Target |
|---|---|---|

### getProductBySlug → getProductListingByTitleSlug / status contracts

```ts
{ 200: PersonalizedGetProductData; }
{ 400: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: PersonalizedProductListingDetailsData; 400: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### getProductHistory → getProductListingHistory / request presence and transport

Old: GET /api/v1/shops/{shopId}/products/{shopsProductId}/history. Target: GET /api/v1/product-listings/{productListingId}/history.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getProductHistory → getProductListingHistory / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| shopsProductId | required string | absent |
| productListingId | absent | required string |

### getProductHistory → getProductListingHistory / query

```ts
// Existing
{ currency?: CurrencyData; language?: LanguageData; }
// Target
never
```

### getProductHistory → getProductListingHistory / status contracts

```ts
{ 200: Array<GetProductEventData>; }
{ 400: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: Array<ProductListingHistoryEntryData>; 400: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### getSimilarProducts → getSimilarProductListings / request presence and transport

Old: GET /api/v1/shops/{shopId}/products/{shopsProductId}/similar. Target: GET /api/v1/product-listings/{productListingId}/similar.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getSimilarProducts → getSimilarProductListings / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| shopsProductId | required string | absent |
| productListingId | absent | required string |

### getSimilarProducts → getSimilarProductListings / query

| Field | Existing | Target |
|---|---|---|

### getSimilarProducts → getSimilarProductListings / status contracts

```ts
{ 200: Array<PersonalizedGetProductSummaryData>; 202: unknown; }
{ 400: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: Array<PersonalizedProductListingSummaryData>; 202: no documented response body; 400: ApiError; 404: ApiError; 500: ApiError

### simpleSearchProducts → simpleSearchProductListings / request presence and transport

Old: GET /api/v1/products. Target: GET /api/v1/product-listings.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### simpleSearchProducts → simpleSearchProductListings / query

| Field | Existing | Target |
|---|---|---|
| language | required LanguageData | optional LanguageData |
| currency | required CurrencyData | optional CurrencyData |
| shopName | optional Array<string> | absent |
| excludeShopName | optional Array<string> | absent |
| sellerName | optional Array<string> | absent |
| excludeSellerName | optional Array<string> | absent |
| shopSlugId | optional Array<string> | absent |
| excludeShopSlugId | optional Array<string> | absent |
| sellerSlugId | optional Array<string> | absent |
| excludeSellerSlugId | optional Array<string> | absent |
| shopType | optional Array<ShopTypeData> | absent |
| country | optional Array<CountryCodeData> | absent |
| continent | optional Array<ContinentData> | absent |
| geoAddress | optional GeoDistanceQueryData | absent |
| state | optional Array<ProductStateData> | absent |
| sort | optional SortProductFieldData | optional SortProductListingFieldData |
| searchAfter | optional Array<unknown> | optional ProductListingSearchCursorData |
| enhancedSearchDescription | absent | optional string |
| listingSourceId | absent | optional Array<string> |
| excludeListingSourceId | absent | optional Array<string> |
| availability | absent | optional Array<ListingAvailabilityData> |

### simpleSearchProducts → simpleSearchProductListings / status contracts

```ts
{ 200: PersonalizedProductSearchResultData; }
{ 400: ApiError; 500: ApiError; }
```

Target: 200: ProductListingSearchResultData; 400: ApiError; 500: ApiError; 503: ApiError

### complexSearchProducts → (absent) / request presence and transport

Old: POST /api/v1/products/search. Target: absent.

Old body: required. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### complexSearchProducts → (absent) / status contracts

```ts
{ 200: PersonalizedProductSearchResultData; }
{ 400: ApiError; 500: ApiError; }
```

Target: operation absent

### getUserSearchFilters → getUserSearchFilters / request presence and transport

Old: GET /api/v1/me/search-filters. Target: GET /api/v1/me/search-filters.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getUserSearchFilters → getUserSearchFilters / query

```ts
// Existing
{ sort?: SortUserSearchFilterFieldData; order?: 'asc' | 'desc'; }
// Target
never
```

### getUserSearchFilters → getUserSearchFilters / status contracts

```ts
{ 200: UserSearchFilterCollectionData; }
{ 400: ApiError; 401: ApiError; 500: ApiError; }
```

Target: 200: UserSearchFilterCollectionData; 401: ApiError; 403: ApiError; 500: ApiError

### createUserSearchFilter → createUserSearchFilter / request presence and transport

Old: POST /api/v1/me/search-filters. Target: POST /api/v1/me/search-filters.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### createUserSearchFilter → createUserSearchFilter / status contracts

```ts
{ 201: UserSearchFilterData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 422: ApiError; 500: ApiError; }
```

Target: 201: UserSearchFilterData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 422: ApiError; 500: ApiError

### deleteUserSearchFilter → deleteUserSearchFilter / request presence and transport

Old: DELETE /api/v1/me/search-filters/{userSearchFilterId}. Target: DELETE /api/v1/me/search-filters/{userSearchFilterId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### deleteUserSearchFilter → deleteUserSearchFilter / status contracts

```ts
{ 204: void; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError

### getUserSearchFilter → getUserSearchFilter / request presence and transport

Old: GET /api/v1/me/search-filters/{userSearchFilterId}. Target: GET /api/v1/me/search-filters/{userSearchFilterId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getUserSearchFilter → getUserSearchFilter / status contracts

```ts
{ 200: UserSearchFilterData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: UserSearchFilterData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError

### updateUserSearchFilter → updateUserSearchFilter / request presence and transport

Old: PATCH /api/v1/me/search-filters/{userSearchFilterId}. Target: PATCH /api/v1/me/search-filters/{userSearchFilterId}.

Old body: optional. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### updateUserSearchFilter → updateUserSearchFilter / status contracts

```ts
{ 200: UserSearchFilterData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 422: ApiError; 500: ApiError; }
```

Target: 200: UserSearchFilterData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 422: ApiError; 500: ApiError

### getSearchFilterPreviewProducts → (absent) / request presence and transport

Old: GET /api/v1/me/search-filters/{userSearchFilterId}/products. Target: absent.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getSearchFilterPreviewProducts → (absent) / status contracts

```ts
{ 200: PersonalizedProductSearchResultData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: operation absent

### getSearchFilterMatches → listSearchFilterMatches / request presence and transport

Old: GET /api/v1/me/search-filters/{userSearchFilterId}/matches. Target: GET /api/v1/me/search-filters/{userSearchFilterId}/matches.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getSearchFilterMatches → listSearchFilterMatches / query

| Field | Existing | Target |
|---|---|---|
| sort | optional SortSearchFilterMatchFieldData | absent |
| order | optional 'asc' \| 'desc' | absent |

### getSearchFilterMatches → listSearchFilterMatches / status contracts

```ts
{ 200: SearchFilterMatchProductCollectionData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: SearchFilterMatchProductCollectionData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### updateSearchFilterMatchFeedback → updateSearchFilterMatchFeedback / request presence and transport

Old: PATCH /api/v1/me/search-filters/{userSearchFilterId}/matches/{shopId}/{shopsProductId}. Target: PATCH /api/v1/me/search-filters/{userSearchFilterId}/matches/{productListingId}.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### updateSearchFilterMatchFeedback → updateSearchFilterMatchFeedback / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| shopsProductId | required string | absent |
| productListingId | absent | required string |

### updateSearchFilterMatchFeedback → updateSearchFilterMatchFeedback / status contracts

```ts
{ 200: SearchFilterProductMatchData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: SearchFilterProductMatchData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError

### getWatchlistProducts → getWatchlistProductListings / request presence and transport

Old: GET /api/v1/me/watchlist. Target: GET /api/v1/me/watchlist.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getWatchlistProducts → getWatchlistProductListings / query

| Field | Existing | Target |
|---|---|---|
| sort | optional SortWatchlistProductFieldData | absent |
| order | optional 'asc' \| 'desc' | absent |

### getWatchlistProducts → getWatchlistProductListings / status contracts

```ts
{ 200: WatchlistCollectionData; }
{ 400: ApiError; 401: ApiError; 500: ApiError; }
```

Target: 200: { "items": Array<PersonalizedProductListingDetailsData>; "size": number; "searchAfter"?: Array<string> | null; }; 400: ApiError; 401: ApiError; 500: ApiError; 503: ApiError

### addWatchlistProduct → addWatchlistProduct / request presence and transport

Old: POST /api/v1/me/watchlist. Target: POST /api/v1/me/watchlist.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### addWatchlistProduct → addWatchlistProduct / query

```ts
// Existing
{ language?: LanguageData; currency?: CurrencyData; }
// Target
never
```

### addWatchlistProduct → addWatchlistProduct / body

```ts
// Existing
ProductKeyData
// Target
PostWatchlistData
```

### addWatchlistProduct → addWatchlistProduct / status contracts

```ts
{ 201: PersonalizedGetProductData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 422: ApiError; 500: ApiError; }
```

Target: 201: WatchlistEntryData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 422: ApiError; 500: ApiError

### adminSearchUsers → adminSearchUsers / request presence and transport

Old: GET /api/v1/users. Target: GET /api/v1/admin/users.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### adminSearchUsers → adminSearchUsers / query

| Field | Existing | Target |
|---|---|---|
| country | optional Array<CountryCodeData> | absent |
| continent | optional Array<ContinentData> | absent |
| geoAddress | optional GeoDistanceQueryData | absent |
| searchAfter | optional Array<unknown> | optional string |

### adminSearchUsers → adminSearchUsers / status contracts

```ts
{ 200: UserCollectionData; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: UserCollectionData; 400: ApiError; 401: ApiError; 403: ApiError; 500: ApiError; 503: ApiError

### adminDeleteUser → adminDeleteUser / request presence and transport

Old: DELETE /api/v1/users/{userId}. Target: DELETE /api/v1/admin/users/{userId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### adminDeleteUser → adminDeleteUser / status contracts

```ts
{ 204: void; }
{ 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### adminGetUser → adminGetUser / request presence and transport

Old: GET /api/v1/users/{userId}. Target: GET /api/v1/admin/users/{userId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### adminGetUser → adminGetUser / status contracts

```ts
{ 200: GetUserAccountData; }
{ 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: AdminUserAccountData; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError

### adminPatchUser → adminPatchUser / request presence and transport

Old: PATCH /api/v1/users/{userId}. Target: PATCH /api/v1/admin/users/{userId}.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### adminPatchUser → adminPatchUser / status contracts

```ts
{ 200: GetUserAccountData; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: AdminUserAccountData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError

### deleteUser → deleteUser / request presence and transport

Old: DELETE /api/v1/me. Target: DELETE /api/v1/me.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### deleteUser → deleteUser / status contracts

```ts
{ 204: void; }
{ 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 204: no documented response body; 401: ApiError; 404: ApiError; 409: ApiError; 500: ApiError

### getUserAccount → getUserAccount / request presence and transport

Old: GET /api/v1/me/account. Target: GET /api/v1/me/account.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getUserAccount → getUserAccount / status contracts

```ts
{ 200: GetUserAccountData; }
{ 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: OwnUserAccountData; 401: ApiError; 404: ApiError; 500: ApiError

### updateUserAccount → updateUserAccount / request presence and transport

Old: PATCH /api/v1/me/account. Target: PATCH /api/v1/me/account.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### updateUserAccount → updateUserAccount / status contracts

```ts
{ 200: GetUserAccountData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: OwnUserAccountData; 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError

### getMyAccessTokens → getMyAccessTokens / request presence and transport

Old: GET /api/v1/me/access-tokens. Target: GET /api/v1/me/access-tokens.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getMyAccessTokens → getMyAccessTokens / status contracts

```ts
{ 200: Array<GetAccessTokenData>; }
{ 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: Array<GetAccessTokenData>; 401: ApiError; 404: ApiError; 500: ApiError

### patchMyAccessToken → patchMyAccessToken / request presence and transport

Old: PATCH /api/v1/me/access-tokens. Target: PATCH /api/v1/me/access-tokens.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### patchMyAccessToken → patchMyAccessToken / status contracts

```ts
{ 200: GetAccessTokenData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: GetAccessTokenData; 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError

### postMyAccessToken → postMyAccessToken / request presence and transport

Old: POST /api/v1/me/access-tokens. Target: POST /api/v1/me/access-tokens.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### postMyAccessToken → postMyAccessToken / status contracts

```ts
{ 201: GetAccessTokenData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 201: GetAccessTokenData; 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError

### deleteMyAccessToken → deleteMyAccessToken / request presence and transport

Old: DELETE /api/v1/me/access-tokens/{accessTokenId}. Target: DELETE /api/v1/me/access-tokens/{accessTokenId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### deleteMyAccessToken → deleteMyAccessToken / status contracts

```ts
{ 204: void; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 500: ApiError

### getMyAccessToken → getMyAccessToken / request presence and transport

Old: GET /api/v1/me/access-tokens/{accessTokenId}. Target: GET /api/v1/me/access-tokens/{accessTokenId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getMyAccessToken → getMyAccessToken / status contracts

```ts
{ 200: GetAccessTokenData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: GetAccessTokenData; 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError

### postBillingCheckout → postBillingCheckout / request presence and transport

Old: POST /api/v1/me/billing/checkout. Target: POST /api/v1/me/billing/checkout.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### postBillingCheckout → postBillingCheckout / status contracts

```ts
{ 201: BillingSessionUrlData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; }
```

Target: 201: BillingSessionUrlData; 400: ApiError; 401: ApiError; 404: ApiError; 409: ApiError; 500: ApiError

### postBillingPortal → postBillingPortal / request presence and transport

Old: POST /api/v1/me/billing/portal. Target: POST /api/v1/me/billing/portal.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### postBillingPortal → postBillingPortal / status contracts

```ts
{ 201: BillingSessionUrlData; }
{ 401: ApiError; 404: ApiError; 422: ApiError; 500: ApiError; }
```

Target: 201: BillingSessionUrlData; 401: ApiError; 404: ApiError; 422: ApiError; 500: ApiError

### postBillingManage → postBillingManage / request presence and transport

Old: POST /api/v1/me/billing/manage. Target: POST /api/v1/me/billing/manage.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### postBillingManage → postBillingManage / status contracts

```ts
{ 201: BillingSessionUrlData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 422: ApiError; 500: ApiError; }
```

Target: 201: BillingSessionUrlData; 400: ApiError; 401: ApiError; 404: ApiError; 422: ApiError; 500: ApiError

### deleteWatchlistProduct → deleteWatchlistProduct / request presence and transport

Old: DELETE /api/v1/me/watchlist/{shopId}/{shopsProductId}. Target: DELETE /api/v1/me/watchlist/{productListingId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### deleteWatchlistProduct → deleteWatchlistProduct / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| shopsProductId | required string | absent |
| productListingId | absent | required string |

### deleteWatchlistProduct → deleteWatchlistProduct / status contracts

```ts
{ 204: void; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 404: ApiError; 409: ApiError; 500: ApiError

### patchWatchlistProduct → patchWatchlistProduct / request presence and transport

Old: PATCH /api/v1/me/watchlist/{shopId}/{shopsProductId}. Target: PATCH /api/v1/me/watchlist/{productListingId}.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### patchWatchlistProduct → patchWatchlistProduct / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| shopsProductId | required string | absent |
| productListingId | absent | required string |

### patchWatchlistProduct → patchWatchlistProduct / status contracts

```ts
{ 200: PersonalizedGetProductData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 422: ApiError; 500: ApiError; }
```

Target: 200: PersonalizedProductListingDetailsData; 400: ApiError; 401: ApiError; 404: ApiError; 409: ApiError; 422: ApiError; 500: ApiError

### deleteAllNotifications → deleteNotifications / request presence and transport

Old: DELETE /api/v1/me/notifications. Target: DELETE /api/v1/me/notifications.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### deleteAllNotifications → deleteNotifications / status contracts

```ts
{ 204: void; }
{ 401: ApiError; 500: ApiError; }
```

Target: 204: no documented response body; 401: ApiError; 503: ApiError

### getNotifications → listNotifications / request presence and transport

Old: GET /api/v1/me/notifications. Target: GET /api/v1/me/notifications.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getNotifications → listNotifications / query

| Field | Existing | Target |
|---|---|---|
| currency | optional CurrencyData | absent |

### getNotifications → listNotifications / status contracts

```ts
{ 200: NotificationCollectionData; }
{ 400: ApiError; 401: ApiError; 500: ApiError; }
```

Target: 200: NotificationCollectionData; 400: ApiError; 401: ApiError; 503: ApiError

### patchAllNotifications → updateAllNotificationsSeen / request presence and transport

Old: PATCH /api/v1/me/notifications. Target: PATCH /api/v1/me/notifications/all.

Old body: optional. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### patchAllNotifications → updateAllNotificationsSeen / query

```ts
// Existing
{ language?: LanguageData; currency?: CurrencyData; }
// Target
never
```

### patchAllNotifications → updateAllNotificationsSeen / body

```ts
// Existing
PatchNotificationData
// Target
UpdateNotificationSeenData
```

### patchAllNotifications → updateAllNotificationsSeen / status contracts

```ts
{ 200: NotificationCollectionData; }
{ 400: ApiError; 401: ApiError; 500: ApiError; }
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 503: ApiError

### deleteNotification → deleteNotification / request presence and transport

Old: DELETE /api/v1/me/notifications/{eventId}. Target: DELETE /api/v1/me/notifications/{notificationId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### deleteNotification → deleteNotification / path

| Field | Existing | Target |
|---|---|---|
| eventId | required string | absent |
| notificationId | absent | required string |

### deleteNotification → deleteNotification / status contracts

```ts
{ 204: void; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 404: ApiError; 503: ApiError

### patchNotification → updateNotificationSeen / request presence and transport

Old: PATCH /api/v1/me/notifications/{eventId}. Target: PATCH /api/v1/me/notifications/{notificationId}.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### patchNotification → updateNotificationSeen / path

| Field | Existing | Target |
|---|---|---|
| eventId | required string | absent |
| notificationId | absent | required string |

### patchNotification → updateNotificationSeen / query

```ts
// Existing
{ language?: LanguageData; currency?: CurrencyData; }
// Target
never
```

### patchNotification → updateNotificationSeen / body

```ts
// Existing
PatchNotificationData
// Target
UpdateNotificationSeenData
```

### patchNotification → updateNotificationSeen / status contracts

```ts
{ 200: GetNotificationData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 404: ApiError; 503: ApiError

### putNewsletterSubscription → putNewsletterSubscription / request presence and transport

Old: PUT /api/v1/newsletter-subscriptions. Target: PUT /api/v1/newsletter-subscriptions.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### putNewsletterSubscription → putNewsletterSubscription / status contracts

```ts
{ 204: void; }
{ 400: ApiError; 500: ApiError; }
```

Target: 204: no documented response body; 400: ApiError; 500: ApiError; 503: ApiError

### simpleSearchShops → (absent) / request presence and transport

Old: GET /api/v1/shops. Target: absent.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth, AccessTokenAuth. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### simpleSearchShops → (absent) / status contracts

```ts
{ 200: ShopSearchResultData; }
{ 400: ApiError; 500: ApiError; }
```

Target: operation absent

### postShop → adminCreateListingSource / request presence and transport

Old: POST /api/v1/shops. Target: POST /api/v1/admin/listing-sources.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### postShop → adminCreateListingSource / body

```ts
// Existing
PostShopDataWritable
// Target
CreateListingSourceData
```

### postShop → adminCreateListingSource / status contracts

```ts
{ 201: GetShopData; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 409: ApiError; 500: ApiError; }
```

Target: 201: ListingSourceReferenceData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### getShopById → adminGetListingSource / request presence and transport

Old: GET /api/v1/shops/{shopId}. Target: GET /api/v1/admin/listing-sources/{listingSourceId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth, AccessTokenAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getShopById → adminGetListingSource / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| listingSourceId | absent | required string |

### getShopById → adminGetListingSource / status contracts

```ts
{ 200: GetShopData; }
{ 400: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: ListingSourceData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### patchShopById → adminUpdateListingSource / request presence and transport

Old: PATCH /api/v1/shops/{shopId}. Target: PATCH /api/v1/admin/listing-sources/{listingSourceId}.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth, AccessTokenAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### patchShopById → adminUpdateListingSource / path

| Field | Existing | Target |
|---|---|---|
| shopId | required string | absent |
| listingSourceId | absent | required string |

### patchShopById → adminUpdateListingSource / body

```ts
// Existing
PatchShopDataWritable
// Target
UpdateListingSourceData
```

### patchShopById → adminUpdateListingSource / status contracts

```ts
{ 200: GetShopData; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: ListingSourceReferenceData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### getShopBySlug → getListingSourceBySlug / request presence and transport

Old: GET /api/v1/by-slug/shops/{shopSlugId}. Target: GET /api/v1/listing-sources/by-slug/{listingSourceSlugId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth, AccessTokenAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getShopBySlug → getListingSourceBySlug / path

| Field | Existing | Target |
|---|---|---|
| shopSlugId | required string | absent |
| listingSourceSlugId | absent | required string |

### getShopBySlug → getListingSourceBySlug / status contracts

```ts
{ 200: GetShopData; }
{ 400: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: ListingSourceData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### getShopByDomain → (absent) / request presence and transport

Old: GET /api/v1/by-domain/shops/{shopDomain}. Target: absent.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth, AccessTokenAuth. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getShopByDomain → (absent) / status contracts

```ts
{ 200: GetShopData; }
{ 400: ApiError; 404: ApiError; 500: ApiError; }
```

Target: operation absent

### searchShops → (absent) / request presence and transport

Old: POST /api/v1/shops/search. Target: absent.

Old body: required. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### searchShops → (absent) / status contracts

```ts
{ 200: ShopSearchResultData; }
{ 400: ApiError; 500: ApiError; }
```

Target: operation absent

### getCategories → (absent) / request presence and transport

Old: GET /api/v1/categories. Target: absent.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getCategories → (absent) / status contracts

```ts
{ 200: Array<GetCategorySummaryData>; }
{ 400: ApiError; 500: ApiError; }
```

Target: operation absent

### getCategoryById → (absent) / request presence and transport

Old: GET /api/v1/categories/{categoryId}. Target: absent.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getCategoryById → (absent) / status contracts

```ts
{ 200: GetCategoryData; }
{ 400: ApiError; 404: ApiError; 500: ApiError; }
```

Target: operation absent

### searchCategories → (absent) / request presence and transport

Old: POST /api/v1/categories/search. Target: absent.

Old body: required. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### searchCategories → (absent) / status contracts

```ts
{ 200: Array<GetCategorySummaryData>; }
{ 400: ApiError; 500: ApiError; }
```

Target: operation absent

### getPeriods → (absent) / request presence and transport

Old: GET /api/v1/periods. Target: absent.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getPeriods → (absent) / status contracts

```ts
{ 200: Array<GetPeriodSummaryData>; }
{ 400: ApiError; 500: ApiError; }
```

Target: operation absent

### getPeriodById → (absent) / request presence and transport

Old: GET /api/v1/periods/{periodId}. Target: absent.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getPeriodById → (absent) / status contracts

```ts
{ 200: GetPeriodData; }
{ 400: ApiError; 404: ApiError; 500: ApiError; }
```

Target: operation absent

### searchPeriods → (absent) / request presence and transport

Old: POST /api/v1/periods/search. Target: absent.

Old body: required. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### searchPeriods → (absent) / status contracts

```ts
{ 200: Array<GetPeriodSummaryData>; }
{ 400: ApiError; 500: ApiError; }
```

Target: operation absent

### getMyPartnerShops → getMyListingSources / request presence and transport

Old: GET /api/v1/me/partner-shops. Target: GET /api/v1/me/listing-sources.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getMyPartnerShops → getMyListingSources / status contracts

```ts
{ 200: Array<GetShopData>; }
{ 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: Array<AdministeredListingSourceData>; 401: ApiError; 403: ApiError; 500: ApiError; 503: ApiError

### getPartnerApplications → getMyPartnershipApplications / request presence and transport

Old: GET /api/v1/me/partner-applications. Target: GET /api/v1/me/partnership-applications.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getPartnerApplications → getMyPartnershipApplications / status contracts

```ts
{ 200: Array<GetPartnerShopApplicationData>; }
{ 401: ApiError; 500: ApiError; }
```

Target: 200: Array<OwnPartnershipApplicationData>; 401: ApiError; 403: ApiError; 500: ApiError; 503: ApiError

### postPartnerApplication → postPartnershipApplication / request presence and transport

Old: POST /api/v1/me/partner-applications. Target: POST /api/v1/me/partnership-applications.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### postPartnerApplication → postPartnershipApplication / body

```ts
// Existing
PostPartnerShopApplicationPayloadData
// Target
SubmitPartnershipApplicationData
```

### postPartnerApplication → postPartnershipApplication / status contracts

```ts
{ 201: GetPartnerShopApplicationData; }
{ 400: ApiError; 401: ApiError; 500: ApiError; }
```

Target: 201: OwnPartnershipApplicationData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### deletePartnerApplication → deleteOwnPartnershipApplication / request presence and transport

Old: DELETE /api/v1/me/partner-applications/{partnerApplicationId}. Target: DELETE /api/v1/me/partnership-applications/{partnershipApplicationId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### deletePartnerApplication → deleteOwnPartnershipApplication / path

| Field | Existing | Target |
|---|---|---|
| partnerApplicationId | required string | absent |
| partnershipApplicationId | absent | required string |

### deletePartnerApplication → deleteOwnPartnershipApplication / status contracts

```ts
{ 204: void; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### getPartnerApplication → getOwnPartnershipApplication / request presence and transport

Old: GET /api/v1/me/partner-applications/{partnerApplicationId}. Target: GET /api/v1/me/partnership-applications/{partnershipApplicationId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getPartnerApplication → getOwnPartnershipApplication / path

| Field | Existing | Target |
|---|---|---|
| partnerApplicationId | required string | absent |
| partnershipApplicationId | absent | required string |

### getPartnerApplication → getOwnPartnershipApplication / status contracts

```ts
{ 200: GetPartnerShopApplicationData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: OwnPartnershipApplicationData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### patchPartnerApplication → (absent) / request presence and transport

Old: PATCH /api/v1/me/partner-applications/{partnerApplicationId}. Target: absent.

Old body: required. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### patchPartnerApplication → (absent) / status contracts

```ts
{ 200: GetPartnerShopApplicationData; }
{ 400: ApiError; 401: ApiError; 404: ApiError; 500: ApiError; }
```

Target: operation absent

### adminGetPartnerApplications → adminSearchPartnershipApplications / request presence and transport

Old: GET /api/v1/partner-applications. Target: GET /api/v1/admin/partnership-applications.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### adminGetPartnerApplications → adminSearchPartnershipApplications / query

```ts
// Existing
never
// Target
{ "state"?: Array<PartnershipApplicationStateData>; "applicantUserId"?: string; "proposalType"?: Array<PartnershipProposalTypeData>; "listingSourceId"?: string; "created[min]"?: string; "created[max]"?: string; "updated[min]"?: string; "updated[max]"?: string; "sort"?: "created" | "updated"; "order"?: "asc" | "desc"; "searchAfter"?: string; "size"?: number; }
```

### adminGetPartnerApplications → adminSearchPartnershipApplications / status contracts

```ts
{ 200: Array<GetPartnerShopApplicationData>; }
{ 401: ApiError; 403: ApiError; 500: ApiError; }
```

Target: 200: AdminPartnershipApplicationCollectionData; 400: ApiError; 401: ApiError; 403: ApiError; 500: ApiError; 503: ApiError

### adminGetPartnerApplication → adminGetPartnershipApplication / request presence and transport

Old: GET /api/v1/partner-applications/{partnerApplicationId}. Target: GET /api/v1/admin/partnership-applications/{partnershipApplicationId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### adminGetPartnerApplication → adminGetPartnershipApplication / path

| Field | Existing | Target |
|---|---|---|
| partnerApplicationId | required string | absent |
| partnershipApplicationId | absent | required string |

### adminGetPartnerApplication → adminGetPartnershipApplication / status contracts

```ts
{ 200: GetPartnerShopApplicationData; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: AdminPartnershipApplicationData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### adminPatchPartnerApplication → adminMarkPartnershipApplicationInReview / request presence and transport

Old: PATCH /api/v1/partner-applications/{partnerApplicationId}. Target: PATCH /api/v1/admin/partnership-applications/{partnershipApplicationId}.

Old body: required. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### adminPatchPartnerApplication → adminMarkPartnershipApplicationInReview / path

| Field | Existing | Target |
|---|---|---|
| partnerApplicationId | required string | absent |
| partnershipApplicationId | absent | required string |

### adminPatchPartnerApplication → adminMarkPartnershipApplicationInReview / body

```ts
// Existing
AdminPatchPartnerShopApplicationData
// Target
never
```

### adminPatchPartnerApplication → adminMarkPartnershipApplicationInReview / status contracts

```ts
{ 200: GetPartnerShopApplicationData; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; }
```

Target: 200: AdminPartnershipApplicationData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### adminPostPartnerApplicationDecision → adminDecidePartnershipApplication / request presence and transport

Old: POST /api/v1/partner-applications/{partnerApplicationId}/decision. Target: POST /api/v1/admin/partnership-applications/{partnershipApplicationId}/decision.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### adminPostPartnerApplicationDecision → adminDecidePartnershipApplication / path

| Field | Existing | Target |
|---|---|---|
| partnerApplicationId | required string | absent |
| partnershipApplicationId | absent | required string |

### adminPostPartnerApplicationDecision → adminDecidePartnershipApplication / body

```ts
// Existing
PostPartnerShopApplicationDecisionData
// Target
DecidePartnershipApplicationData
```

### adminPostPartnerApplicationDecision → adminDecidePartnershipApplication / status contracts

```ts
{ 200: GetPartnerShopApplicationData; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; }
```

Target: 200: AdminPartnershipApplicationData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### oauthAuthorize → oauthAuthorize / request presence and transport

Old: GET /api/v1/oauth/authorize. Target: GET /api/v1/oauth/authorize.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### oauthAuthorize → oauthAuthorize / status contracts

```ts
{ 400: ApiError; 401: ApiError; 500: ApiError; }
```

Target: 302: no documented response body; 400: ApiError; 401: ApiError; 500: ApiError

### oauthToken → oauthToken / request presence and transport

Old: POST /api/v1/oauth/token. Target: POST /api/v1/oauth/token.

Old body: required. Target body: required.

Old SDK security keys: none emitted. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### oauthToken → oauthToken / status contracts

```ts
{ 200: OAuthTokenResponseData; }
{ 400: ApiError; 401: ApiError; 500: ApiError; }
```

Target: 200: OAuthTokenResponseData; 400: ApiError; 401: ApiError; 500: ApiError

### oauthTokenByThirdPartyCode → oauthTokenByThirdPartyCode / request presence and transport

Old: GET /api/v1/oauth/tokens/by-third-party-code/{thirdPartyCode}. Target: GET /api/v1/oauth/tokens/by-third-party-code/{thirdPartyCode}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### oauthTokenByThirdPartyCode → oauthTokenByThirdPartyCode / status contracts

```ts
{ 200: OAuthTokenResponseData; }
{ 400: ApiError; 500: ApiError; }
```

Target: 200: OAuthTokenResponseData; 400: ApiError; 500: ApiError

### oauthRevoke → oauthRevoke / request presence and transport

Old: POST /api/v1/oauth/revoke. Target: POST /api/v1/oauth/revoke.

Old body: required. Target body: required.

Old SDK security keys: none emitted. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### oauthRevoke → oauthRevoke / status contracts

```ts
{ 200: unknown; }
{ 400: ApiError; 401: ApiError; 500: ApiError; }
```

Target: 200: no documented response body; 400: ApiError; 401: ApiError; 500: ApiError

### oauthIntrospect → oauthIntrospect / request presence and transport

Old: POST /api/v1/oauth/introspect. Target: POST /api/v1/oauth/introspect.

Old body: required. Target body: required.

Old SDK security keys: none emitted. Target security declaration: []. Generated SDK security keys do not preserve every old anonymous-access alternative.

### oauthIntrospect → oauthIntrospect / status contracts

```ts
{ 200: OAuthIntrospectionResponseData; }
{ 400: ApiError; 401: ApiError; 500: ApiError; }
```

Target: 200: OAuthIntrospectionResponseData; 400: ApiError; 401: ApiError; 500: ApiError

### getOAuthClients → adminListOAuthClients / request presence and transport

Old: GET /api/v1/oauth/clients. Target: GET /api/v1/admin/oauth-clients.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getOAuthClients → adminListOAuthClients / query

```ts
// Existing
never
// Target
{ "clientId"?: string; "name"?: string; "searchAfter"?: string; "size"?: number; }
```

### getOAuthClients → adminListOAuthClients / status contracts

```ts
{ 200: Array<OAuthClientMetadataResponseData>; }
{ 401: ApiError; 500: ApiError; }
```

Target: 200: OAuthClientAdminCollectionData; 400: ApiError; 401: ApiError; 403: ApiError; 500: ApiError; 503: ApiError

### postOAuthClient → adminCreateOAuthClient / request presence and transport

Old: POST /api/v1/oauth/clients. Target: POST /api/v1/admin/oauth-clients.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### postOAuthClient → adminCreateOAuthClient / status contracts

```ts
{ 201: OAuthClientMetadataResponseData; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 500: ApiError; }
```

Target: 201: OAuthClientMetadataResponseData; 400: ApiError; 401: ApiError; 403: ApiError; 500: ApiError; 503: ApiError

### deleteOAuthClient → adminDeleteOAuthClient / request presence and transport

Old: DELETE /api/v1/oauth/clients/{clientId}. Target: DELETE /api/v1/admin/oauth-clients/{clientId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### deleteOAuthClient → adminDeleteOAuthClient / status contracts

```ts
{ 204: void; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 500: ApiError; }
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### getOAuthClient → adminGetOAuthClient / request presence and transport

Old: GET /api/v1/oauth/clients/{clientId}. Target: GET /api/v1/admin/oauth-clients/{clientId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### getOAuthClient → adminGetOAuthClient / status contracts

```ts
{ 200: OAuthClientMetadataResponseData; }
{ 400: ApiError; 401: ApiError; 500: ApiError; }
```

Target: 200: OAuthClientAdminData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### patchOAuthClient → adminPatchOAuthClient / request presence and transport

Old: PATCH /api/v1/oauth/clients/{clientId}. Target: PATCH /api/v1/admin/oauth-clients/{clientId}.

Old body: required. Target body: required.

Old SDK security keys: BearerAuth. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### patchOAuthClient → adminPatchOAuthClient / status contracts

```ts
{ 200: OAuthClientMetadataResponseData; }
{ 400: ApiError; 401: ApiError; 403: ApiError; 500: ApiError; }
```

Target: 200: OAuthClientAdminData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### (new) → adminSearchListingSources / request presence and transport

Old: absent. Target: GET /api/v1/admin/listing-sources.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminSearchListingSources / query

```ts
// Existing
never
// Target
{ "query"?: string; "name"?: string; "listingSourceId"?: string; "listingSourceSlugId"?: string; "operatorPartyId"?: string; "ingestionMethod"?: ListingIngestionMethodData; "sort"?: SortListingSourceFieldData; "order"?: "asc" | "desc"; "searchAfter"?: string; "size"?: number; }
```

### (new) → adminSearchListingSources / status contracts

```ts
// No generated old response/error declarations
```

Target: 200: ListingSourceSearchCollectionData; 400: ApiError; 401: ApiError; 403: ApiError; 500: ApiError; 503: ApiError

### (new) → adminCreateParty / request presence and transport

Old: absent. Target: POST /api/v1/admin/parties.

Old body: not accepted. Target body: required.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminCreateParty / body

```ts
// Existing
never
// Target
CreatePartyData
```

### (new) → adminCreateParty / status contracts

```ts
// No generated old response/error declarations
```

Target: 201: PartyData; 400: ApiError; 401: ApiError; 403: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### (new) → adminSearchParties / request presence and transport

Old: absent. Target: GET /api/v1/admin/parties.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminSearchParties / query

```ts
// Existing
never
// Target
{ "query"?: string; "name"?: string; "phone"?: string; "email"?: string; "created[min]"?: string; "created[max]"?: string; "updated[min]"?: string; "updated[max]"?: string; "sort"?: SortPartyFieldData; "order"?: "asc" | "desc"; "searchAfter"?: string; "size"?: number; }
```

### (new) → adminSearchParties / status contracts

```ts
// No generated old response/error declarations
```

Target: 200: PartyCollectionData; 400: ApiError; 401: ApiError; 403: ApiError; 500: ApiError; 503: ApiError

### (new) → adminDeleteParty / request presence and transport

Old: absent. Target: DELETE /api/v1/admin/parties/{partyId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminDeleteParty / path

```ts
// Existing
never
// Target
{ "partyId": string; }
```

### (new) → adminDeleteParty / status contracts

```ts
// No generated old response/error declarations
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### (new) → adminUpdateParty / request presence and transport

Old: absent. Target: PATCH /api/v1/admin/parties/{partyId}.

Old body: not accepted. Target body: required.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminUpdateParty / path

```ts
// Existing
never
// Target
{ "partyId": string; }
```

### (new) → adminUpdateParty / body

```ts
// Existing
never
// Target
UpdatePartyData
```

### (new) → adminUpdateParty / status contracts

```ts
// No generated old response/error declarations
```

Target: 200: PartyData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### (new) → adminGetParty / request presence and transport

Old: absent. Target: GET /api/v1/admin/parties/{partyId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminGetParty / path

```ts
// Existing
never
// Target
{ "partyId": string; }
```

### (new) → adminGetParty / status contracts

```ts
// No generated old response/error declarations
```

Target: 200: PartyData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### (new) → adminSuspendUser / request presence and transport

Old: absent. Target: PUT /api/v1/admin/users/{userId}/suspension.

Old body: not accepted. Target body: required.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminSuspendUser / path

```ts
// Existing
never
// Target
{ "userId": string; }
```

### (new) → adminSuspendUser / body

```ts
// Existing
never
// Target
SuspendUserData
```

### (new) → adminSuspendUser / status contracts

```ts
// No generated old response/error declarations
```

Target: 200: SuspendUserResponseData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### (new) → adminUnsuspendUser / request presence and transport

Old: absent. Target: DELETE /api/v1/admin/users/{userId}/suspension.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminUnsuspendUser / path

```ts
// Existing
never
// Target
{ "userId": string; }
```

### (new) → adminUnsuspendUser / status contracts

```ts
// No generated old response/error declarations
```

Target: 200: UnsuspendUserResponseData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### (new) → adminRevokeUserSessions / request presence and transport

Old: absent. Target: POST /api/v1/admin/users/{userId}/sessions/revoke.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminRevokeUserSessions / path

```ts
// Existing
never
// Target
{ "userId": string; }
```

### (new) → adminRevokeUserSessions / status contracts

```ts
// No generated old response/error declarations
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### (new) → adminListUserAccessTokens / request presence and transport

Old: absent. Target: GET /api/v1/admin/users/{userId}/access-tokens.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminListUserAccessTokens / path

```ts
// Existing
never
// Target
{ "userId": string; }
```

### (new) → adminListUserAccessTokens / query

```ts
// Existing
never
// Target
{ "size"?: number; "searchAfter"?: string; }
```

### (new) → adminListUserAccessTokens / status contracts

```ts
// No generated old response/error declarations
```

Target: 200: AdminAccessTokenCollectionData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### (new) → adminDeleteUserAccessTokens / request presence and transport

Old: absent. Target: DELETE /api/v1/admin/users/{userId}/access-tokens.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminDeleteUserAccessTokens / path

```ts
// Existing
never
// Target
{ "userId": string; }
```

### (new) → adminDeleteUserAccessTokens / status contracts

```ts
// No generated old response/error declarations
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### (new) → adminDeleteUserAccessToken / request presence and transport

Old: absent. Target: DELETE /api/v1/admin/users/{userId}/access-tokens/{accessTokenId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminDeleteUserAccessToken / path

```ts
// Existing
never
// Target
{ "userId": string; "accessTokenId": string; }
```

### (new) → adminDeleteUserAccessToken / status contracts

```ts
// No generated old response/error declarations
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 500: ApiError; 503: ApiError

### (new) → updateNotificationsSeen / request presence and transport

Old: absent. Target: PATCH /api/v1/me/notifications.

Old body: not accepted. Target body: required.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → updateNotificationsSeen / body

```ts
// Existing
never
// Target
UpdateNotificationsSeenData
```

### (new) → updateNotificationsSeen / status contracts

```ts
// No generated old response/error declarations
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 503: ApiError

### (new) → adminDeleteListingSource / request presence and transport

Old: absent. Target: DELETE /api/v1/admin/listing-sources/{listingSourceId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminDeleteListingSource / path

```ts
// Existing
never
// Target
{ "listingSourceId": string; }
```

### (new) → adminDeleteListingSource / status contracts

```ts
// No generated old response/error declarations
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### (new) → getAdminOverview / request presence and transport

Old: absent. Target: GET /api/v1/admin/overview.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → getAdminOverview / status contracts

```ts
// No generated old response/error declarations
```

Target: 200: AdminOverviewData; 401: ApiError; 403: ApiError; 500: ApiError; 503: ApiError

### (new) → adminSearchPartnerships / request presence and transport

Old: absent. Target: GET /api/v1/admin/partnerships.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminSearchPartnerships / query

```ts
// Existing
never
// Target
{ "partyId"?: string; "memberUserId"?: string; "listingSourceId"?: string; "searchAfter"?: string; "size"?: number; }
```

### (new) → adminSearchPartnerships / status contracts

```ts
// No generated old response/error declarations
```

Target: 200: AdminPartnershipCollectionData; 400: ApiError; 401: ApiError; 403: ApiError; 500: ApiError; 503: ApiError

### (new) → adminGetPartnership / request presence and transport

Old: absent. Target: GET /api/v1/admin/partnerships/{partnershipId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminGetPartnership / path

```ts
// Existing
never
// Target
{ "partnershipId": string; }
```

### (new) → adminGetPartnership / status contracts

```ts
// No generated old response/error declarations
```

Target: 200: AdminPartnershipDetailsData; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### (new) → adminDissolvePartnership / request presence and transport

Old: absent. Target: DELETE /api/v1/admin/partnerships/{partnershipId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminDissolvePartnership / path

```ts
// Existing
never
// Target
{ "partnershipId": string; }
```

### (new) → adminDissolvePartnership / status contracts

```ts
// No generated old response/error declarations
```

Target: 204: no documented response body; 400: no documented response body; 401: no documented response body; 403: no documented response body; 404: ApiError; 409: ApiError; 500: no documented response body; 503: ApiError

### (new) → adminGrantPartnershipListingSource / request presence and transport

Old: absent. Target: PUT /api/v1/admin/partnerships/{partnershipId}/listing-source-grants/{listingSourceId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminGrantPartnershipListingSource / path

```ts
// Existing
never
// Target
{ "partnershipId": string; "listingSourceId": string; }
```

### (new) → adminGrantPartnershipListingSource / status contracts

```ts
// No generated old response/error declarations
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 409: ApiError; 500: ApiError; 503: ApiError

### (new) → adminRevokePartnershipListingSource / request presence and transport

Old: absent. Target: DELETE /api/v1/admin/partnerships/{partnershipId}/listing-source-grants/{listingSourceId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminRevokePartnershipListingSource / path

```ts
// Existing
never
// Target
{ "partnershipId": string; "listingSourceId": string; }
```

### (new) → adminRevokePartnershipListingSource / status contracts

```ts
// No generated old response/error declarations
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### (new) → adminGrantPartnershipMembership / request presence and transport

Old: absent. Target: PUT /api/v1/admin/partnerships/{partnershipId}/members/{userId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminGrantPartnershipMembership / path

```ts
// Existing
never
// Target
{ "partnershipId": string; "userId": string; }
```

### (new) → adminGrantPartnershipMembership / status contracts

```ts
// No generated old response/error declarations
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError

### (new) → adminRevokePartnershipMembership / request presence and transport

Old: absent. Target: DELETE /api/v1/admin/partnerships/{partnershipId}/members/{userId}.

Old body: not accepted. Target body: not accepted.

Old SDK security keys: none emitted. Target security declaration: [{"BearerAuth":[]},{"AccessTokenAuth":[]}]. Generated SDK security keys do not preserve every old anonymous-access alternative.

### (new) → adminRevokePartnershipMembership / path

```ts
// Existing
never
// Target
{ "partnershipId": string; "userId": string; }
```

### (new) → adminRevokePartnershipMembership / status contracts

```ts
// No generated old response/error declarations
```

Target: 204: no documented response body; 400: ApiError; 401: ApiError; 403: ApiError; 404: ApiError; 500: ApiError; 503: ApiError
