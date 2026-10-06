# Complete operation inventory

Baseline: actual `src/client/sdk.gen.ts` and `types.gen.ts`. Target: `swagger.snapshot.yaml`. These are semantic successor mappings, not assertions of backwards compatibility. An absent endpoint is absent from the supplied schema; live backend removal was not tested.

| Existing operation | Existing method/path | Target operation | Target method/path |
|---|---|---|---|
| patchPartnerProducts | PATCH /api/v1/shops/{shopId}/products | patchPartnerProductListings | PATCH /api/v1/listing-sources/{listingSourceId}/product-listings |
| postPartnerProducts | POST /api/v1/shops/{shopId}/products | postPartnerProductListings | POST /api/v1/listing-sources/{listingSourceId}/product-listings |
| putPartnerProducts | PUT /api/v1/shops/{shopId}/products | putPartnerProductListings | PUT /api/v1/listing-sources/{listingSourceId}/product-listings |
| postWoocommerceWebhook | POST /api/v1/webhooks/woocommerce/{shopId} | postWoocommerceWebhook | POST /api/v1/webhooks/woocommerce/{listingSourceId} |
| deletePartnerProduct | DELETE /api/v1/shops/{shopId}/products/{shopsProductId} | deletePartnerProductListings | DELETE /api/v1/listing-sources/{listingSourceId}/product-listings |
| getProduct | GET /api/v1/shops/{shopId}/products/{shopsProductId} | getProductListing | GET /api/v1/product-listings/{productListingId} |
| getProductBySlug | GET /api/v1/by-slug/shops/{shopSlugId}/products/{productSlugId} | getProductListingByTitleSlug | GET /api/v1/product-listings/by-slug/{productListingTitleSlugId} |
| getProductHistory | GET /api/v1/shops/{shopId}/products/{shopsProductId}/history | getProductListingHistory | GET /api/v1/product-listings/{productListingId}/history |
| getSimilarProducts | GET /api/v1/shops/{shopId}/products/{shopsProductId}/similar | getSimilarProductListings | GET /api/v1/product-listings/{productListingId}/similar |
| simpleSearchProducts | GET /api/v1/products | simpleSearchProductListings | GET /api/v1/product-listings |
| complexSearchProducts | POST /api/v1/products/search | Absent; no direct successor | — |
| getUserSearchFilters | GET /api/v1/me/search-filters | getUserSearchFilters | GET /api/v1/me/search-filters |
| createUserSearchFilter | POST /api/v1/me/search-filters | createUserSearchFilter | POST /api/v1/me/search-filters |
| deleteUserSearchFilter | DELETE /api/v1/me/search-filters/{userSearchFilterId} | deleteUserSearchFilter | DELETE /api/v1/me/search-filters/{userSearchFilterId} |
| getUserSearchFilter | GET /api/v1/me/search-filters/{userSearchFilterId} | getUserSearchFilter | GET /api/v1/me/search-filters/{userSearchFilterId} |
| updateUserSearchFilter | PATCH /api/v1/me/search-filters/{userSearchFilterId} | updateUserSearchFilter | PATCH /api/v1/me/search-filters/{userSearchFilterId} |
| getSearchFilterPreviewProducts | GET /api/v1/me/search-filters/{userSearchFilterId}/products | Absent; no direct successor | — |
| getSearchFilterMatches | GET /api/v1/me/search-filters/{userSearchFilterId}/matches | listSearchFilterMatches | GET /api/v1/me/search-filters/{userSearchFilterId}/matches |
| updateSearchFilterMatchFeedback | PATCH /api/v1/me/search-filters/{userSearchFilterId}/matches/{shopId}/{shopsProductId} | updateSearchFilterMatchFeedback | PATCH /api/v1/me/search-filters/{userSearchFilterId}/matches/{productListingId} |
| getWatchlistProducts | GET /api/v1/me/watchlist | getWatchlistProductListings | GET /api/v1/me/watchlist |
| addWatchlistProduct | POST /api/v1/me/watchlist | addWatchlistProduct | POST /api/v1/me/watchlist |
| adminSearchUsers | GET /api/v1/users | adminSearchUsers | GET /api/v1/admin/users |
| adminDeleteUser | DELETE /api/v1/users/{userId} | adminDeleteUser | DELETE /api/v1/admin/users/{userId} |
| adminGetUser | GET /api/v1/users/{userId} | adminGetUser | GET /api/v1/admin/users/{userId} |
| adminPatchUser | PATCH /api/v1/users/{userId} | adminPatchUser | PATCH /api/v1/admin/users/{userId} |
| deleteUser | DELETE /api/v1/me | deleteUser | DELETE /api/v1/me |
| getUserAccount | GET /api/v1/me/account | getUserAccount | GET /api/v1/me/account |
| updateUserAccount | PATCH /api/v1/me/account | updateUserAccount | PATCH /api/v1/me/account |
| getMyAccessTokens | GET /api/v1/me/access-tokens | getMyAccessTokens | GET /api/v1/me/access-tokens |
| patchMyAccessToken | PATCH /api/v1/me/access-tokens | patchMyAccessToken | PATCH /api/v1/me/access-tokens |
| postMyAccessToken | POST /api/v1/me/access-tokens | postMyAccessToken | POST /api/v1/me/access-tokens |
| deleteMyAccessToken | DELETE /api/v1/me/access-tokens/{accessTokenId} | deleteMyAccessToken | DELETE /api/v1/me/access-tokens/{accessTokenId} |
| getMyAccessToken | GET /api/v1/me/access-tokens/{accessTokenId} | getMyAccessToken | GET /api/v1/me/access-tokens/{accessTokenId} |
| postBillingCheckout | POST /api/v1/me/billing/checkout | postBillingCheckout | POST /api/v1/me/billing/checkout |
| postBillingPortal | POST /api/v1/me/billing/portal | postBillingPortal | POST /api/v1/me/billing/portal |
| postBillingManage | POST /api/v1/me/billing/manage | postBillingManage | POST /api/v1/me/billing/manage |
| deleteWatchlistProduct | DELETE /api/v1/me/watchlist/{shopId}/{shopsProductId} | deleteWatchlistProduct | DELETE /api/v1/me/watchlist/{productListingId} |
| patchWatchlistProduct | PATCH /api/v1/me/watchlist/{shopId}/{shopsProductId} | patchWatchlistProduct | PATCH /api/v1/me/watchlist/{productListingId} |
| deleteAllNotifications | DELETE /api/v1/me/notifications | deleteNotifications | DELETE /api/v1/me/notifications |
| getNotifications | GET /api/v1/me/notifications | listNotifications | GET /api/v1/me/notifications |
| patchAllNotifications | PATCH /api/v1/me/notifications | updateAllNotificationsSeen | PATCH /api/v1/me/notifications/all |
| deleteNotification | DELETE /api/v1/me/notifications/{eventId} | deleteNotification | DELETE /api/v1/me/notifications/{notificationId} |
| patchNotification | PATCH /api/v1/me/notifications/{eventId} | updateNotificationSeen | PATCH /api/v1/me/notifications/{notificationId} |
| putNewsletterSubscription | PUT /api/v1/newsletter-subscriptions | putNewsletterSubscription | PUT /api/v1/newsletter-subscriptions |
| simpleSearchShops | GET /api/v1/shops | Absent; no direct successor | — |
| postShop | POST /api/v1/shops | adminCreateListingSource | POST /api/v1/admin/listing-sources |
| getShopById | GET /api/v1/shops/{shopId} | adminGetListingSource | GET /api/v1/admin/listing-sources/{listingSourceId} |
| patchShopById | PATCH /api/v1/shops/{shopId} | adminUpdateListingSource | PATCH /api/v1/admin/listing-sources/{listingSourceId} |
| getShopBySlug | GET /api/v1/by-slug/shops/{shopSlugId} | getListingSourceBySlug | GET /api/v1/listing-sources/by-slug/{listingSourceSlugId} |
| getShopByDomain | GET /api/v1/by-domain/shops/{shopDomain} | Absent; no direct successor | — |
| searchShops | POST /api/v1/shops/search | Absent; no direct successor | — |
| getCategories | GET /api/v1/categories | Absent; no direct successor | — |
| getCategoryById | GET /api/v1/categories/{categoryId} | Absent; no direct successor | — |
| searchCategories | POST /api/v1/categories/search | Absent; no direct successor | — |
| getPeriods | GET /api/v1/periods | Absent; no direct successor | — |
| getPeriodById | GET /api/v1/periods/{periodId} | Absent; no direct successor | — |
| searchPeriods | POST /api/v1/periods/search | Absent; no direct successor | — |
| getMyPartnerShops | GET /api/v1/me/partner-shops | getMyListingSources | GET /api/v1/me/listing-sources |
| getPartnerApplications | GET /api/v1/me/partner-applications | getMyPartnershipApplications | GET /api/v1/me/partnership-applications |
| postPartnerApplication | POST /api/v1/me/partner-applications | postPartnershipApplication | POST /api/v1/me/partnership-applications |
| deletePartnerApplication | DELETE /api/v1/me/partner-applications/{partnerApplicationId} | deleteOwnPartnershipApplication | DELETE /api/v1/me/partnership-applications/{partnershipApplicationId} |
| getPartnerApplication | GET /api/v1/me/partner-applications/{partnerApplicationId} | getOwnPartnershipApplication | GET /api/v1/me/partnership-applications/{partnershipApplicationId} |
| patchPartnerApplication | PATCH /api/v1/me/partner-applications/{partnerApplicationId} | Absent; no direct successor | — |
| adminGetPartnerApplications | GET /api/v1/partner-applications | adminSearchPartnershipApplications | GET /api/v1/admin/partnership-applications |
| adminGetPartnerApplication | GET /api/v1/partner-applications/{partnerApplicationId} | adminGetPartnershipApplication | GET /api/v1/admin/partnership-applications/{partnershipApplicationId} |
| adminPatchPartnerApplication | PATCH /api/v1/partner-applications/{partnerApplicationId} | adminMarkPartnershipApplicationInReview | PATCH /api/v1/admin/partnership-applications/{partnershipApplicationId} |
| adminPostPartnerApplicationDecision | POST /api/v1/partner-applications/{partnerApplicationId}/decision | adminDecidePartnershipApplication | POST /api/v1/admin/partnership-applications/{partnershipApplicationId}/decision |
| oauthAuthorize | GET /api/v1/oauth/authorize | oauthAuthorize | GET /api/v1/oauth/authorize |
| oauthToken | POST /api/v1/oauth/token | oauthToken | POST /api/v1/oauth/token |
| oauthTokenByThirdPartyCode | GET /api/v1/oauth/tokens/by-third-party-code/{thirdPartyCode} | oauthTokenByThirdPartyCode | GET /api/v1/oauth/tokens/by-third-party-code/{thirdPartyCode} |
| oauthRevoke | POST /api/v1/oauth/revoke | oauthRevoke | POST /api/v1/oauth/revoke |
| oauthIntrospect | POST /api/v1/oauth/introspect | oauthIntrospect | POST /api/v1/oauth/introspect |
| getOAuthClients | GET /api/v1/oauth/clients | adminListOAuthClients | GET /api/v1/admin/oauth-clients |
| postOAuthClient | POST /api/v1/oauth/clients | adminCreateOAuthClient | POST /api/v1/admin/oauth-clients |
| deleteOAuthClient | DELETE /api/v1/oauth/clients/{clientId} | adminDeleteOAuthClient | DELETE /api/v1/admin/oauth-clients/{clientId} |
| getOAuthClient | GET /api/v1/oauth/clients/{clientId} | adminGetOAuthClient | GET /api/v1/admin/oauth-clients/{clientId} |
| patchOAuthClient | PATCH /api/v1/oauth/clients/{clientId} | adminPatchOAuthClient | PATCH /api/v1/admin/oauth-clients/{clientId} |
| New capability | — | adminSearchListingSources | GET /api/v1/admin/listing-sources |
| New capability | — | adminCreateParty | POST /api/v1/admin/parties |
| New capability | — | adminSearchParties | GET /api/v1/admin/parties |
| New capability | — | adminDeleteParty | DELETE /api/v1/admin/parties/{partyId} |
| New capability | — | adminUpdateParty | PATCH /api/v1/admin/parties/{partyId} |
| New capability | — | adminGetParty | GET /api/v1/admin/parties/{partyId} |
| New capability | — | adminSuspendUser | PUT /api/v1/admin/users/{userId}/suspension |
| New capability | — | adminUnsuspendUser | DELETE /api/v1/admin/users/{userId}/suspension |
| New capability | — | adminRevokeUserSessions | POST /api/v1/admin/users/{userId}/sessions/revoke |
| New capability | — | adminListUserAccessTokens | GET /api/v1/admin/users/{userId}/access-tokens |
| New capability | — | adminDeleteUserAccessTokens | DELETE /api/v1/admin/users/{userId}/access-tokens |
| New capability | — | adminDeleteUserAccessToken | DELETE /api/v1/admin/users/{userId}/access-tokens/{accessTokenId} |
| New capability | — | updateNotificationsSeen | PATCH /api/v1/me/notifications |
| New capability | — | adminDeleteListingSource | DELETE /api/v1/admin/listing-sources/{listingSourceId} |
| New capability | — | getAdminOverview | GET /api/v1/admin/overview |
| New capability | — | adminSearchPartnerships | GET /api/v1/admin/partnerships |
| New capability | — | adminGetPartnership | GET /api/v1/admin/partnerships/{partnershipId} |
| New capability | — | adminDissolvePartnership | DELETE /api/v1/admin/partnerships/{partnershipId} |
| New capability | — | adminGrantPartnershipListingSource | PUT /api/v1/admin/partnerships/{partnershipId}/listing-source-grants/{listingSourceId} |
| New capability | — | adminRevokePartnershipListingSource | DELETE /api/v1/admin/partnerships/{partnershipId}/listing-source-grants/{listingSourceId} |
| New capability | — | adminGrantPartnershipMembership | PUT /api/v1/admin/partnerships/{partnershipId}/members/{userId} |
| New capability | — | adminRevokePartnershipMembership | DELETE /api/v1/admin/partnerships/{partnershipId}/members/{userId} |

## Exact request/response and security contracts

For each retained/successor operation, the old generated TypeScript is followed by the target OpenAPI operation, including all query/header constraints, required flags, bodies, status codes, response headers, security, and behavioral descriptions. Shared models are in model-inventory.md. Formatting/order changes are not necessarily behavioral changes.

### patchPartnerProducts → patchPartnerProductListings

Old generated operation:

```ts
type PatchPartnerProductsData = {
    /**
     * Array of product updates to apply. Must not be empty.
     */
    body: Array<PatchProductData>;
    path: {
        /**
         * Unique identifier of the partner shop
         */
        shopId: string;
    };
    query?: never;
    url: '/api/v1/shops/{shopId}/products';
};
type PatchPartnerProductsResponses = {
    /**
     * Batch update request accepted for asynchronous processing. Returns an array containing
     * the `shopsProductId` values that failed to be forwarded to the ingestion queue.
     * An empty array means all updates were accepted.
     *
     */
    202: PartnerProductEnqueueFailuresResponse;
};
type PatchPartnerProductsErrors = {
    /**
     * Bad request — request body is missing, empty, or contains invalid JSON
     */
    400: ApiError;
    /**
     * Unauthorized — the bearer token is missing, invalid, expired, or the referenced
     * Aura Historia access token no longer exists.
     *
     */
    401: ApiError;
    /**
     * Forbidden — the authenticated caller is not allowed to ingest products for this shop
     */
    403: ApiError;
    /**
     * Not found — the specified shop does not exist
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
    /**
     * Service unavailable — all product commands failed to be forwarded to the asynchronous ingestion queue
     */
    503: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PatchPartnerProductsData, ThrowOnError>): RequestResult<PatchPartnerProductsResponses, PatchPartnerProductsErrors, ThrowOnError> => (options.client ?? client).patch<PatchPartnerProductsResponses, PatchPartnerProductsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }, {
            key: 'AccessTokenAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/shops/{shopId}/products',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/listing-sources/{listingSourceId}/product-listings
method: patch
id: patchPartnerProductListings
summary: Batch update product-listings (Partner API)
description: >
  Updates one or more existing product-listings for a listing source using
  bearer authentication.

  This endpoint is intended for partnerships and accepts:

  - a Cognito bearer token for the partner user linked to the listing source, or

  - an Aura Historia access token owned by that partner user.


  Aura Historia access tokens on this endpoint must include the
  `product-listings:write` scope.

  Allowed callers are Aura Historia admins and users partnered with the target
  listing source.


  The request body is an array of `UpdateProductListingData` objects. Omitted
  fields are unchanged;

  `null` clears availability, price, and auction fields. `null` for `url` or
  `images` returns

  `400 BAD_BODY_VALUE`; send `[]` to remove all images. The complete batch
  contract is

  validated before any entry is applied synchronously in its own PostgreSQL
  transaction.


  The response returns HTTP 200 with failures as `{ listingSourceId,
  sourceListingId, error }` objects when

  one or more entries succeed. `error` is the stable API error key for that
  entry. If every non-empty entry fails, the first failure is returned

  as a problem response. An empty array is accepted and returns `[]`.
operationId: patchPartnerProductListings
tags:
  - ProductListings
parameters:
  - name: listingSourceId
    in: path
    required: true
    description: Unique identifier of the target ListingSource
    schema:
      type: string
      example: ls_6rd827eqfefsva9teecmwa3ate
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  description: Array of at most 100 product updates to apply synchronously. May be empty.
  content:
    application/json:
      schema:
        type: array
        maxItems: 100
        items:
          $ref: "#/components/schemas/UpdateProductListingData"
      example:
        - sourceListingId: baroque-violin-001
          availability: null
        - sourceListingId: baroque-violin-002
          price:
            currency: EUR
            amount: 5000
          availability: IN_STOCK
responses:
  "200":
    description: >
      Batch update completed synchronously. This response is returned when all
      entries

      succeed or when at least one entry succeeds; it lists only failed entries.
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/PartnerProductListingBatchFailuresResponse"
        examples:
          all_succeeded:
            summary: All product-listings were updated
            value: []
          partial_failure:
            summary: Some product-listings failed while at least one product was updated
            value:
              - listingSourceId: ls_6rd827eqfefsva9teecmwa3ate
                sourceListingId: baroque-violin-002
                error: PRODUCT_LISTING_NOT_FOUND
  "400":
    description: Bad request — request body is missing, empty, or contains invalid JSON
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Request body is absent or empty
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty.
          invalid_json:
            summary: Request body is not valid JSON
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: expected value at line 1 column 1
  "401":
    description: >
      Unauthorized — the bearer token is missing, invalid, expired, or the
      referenced

      Aura Historia access token no longer exists.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_authorization:
            summary: Authorization header is missing
            value:
              status: 401
              title: Unauthorized
              error: INVALID_CREDENTIALS
              source:
                field: Authorization
                type: HEADER
          access_token_not_found:
            summary: Aura Historia access token is unknown or expired
            value:
              status: 401
              title: Unauthorized
              error: ACCESS_TOKEN_NOT_FOUND
  "403":
    description: Forbidden — the authenticated caller is not allowed to ingest
      product-listings for this listing source
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: Not found — the specified listing source does not exist
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: LISTING_SOURCE_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PRODUCT_LISTING_INTERNAL_ERROR
  "503":
    description: Service unavailable — all entries encountered a temporary
      product-write failure
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE

```

### postPartnerProducts → postPartnerProductListings

Old generated operation:

```ts
type PostPartnerProductsData = {
    /**
     * Array of products to create. Must not be empty.
     */
    body: Array<PostProductData>;
    path: {
        /**
         * Unique identifier of the partner shop
         */
        shopId: string;
    };
    query?: never;
    url: '/api/v1/shops/{shopId}/products';
};
type PostPartnerProductsResponses = {
    /**
     * Batch create request accepted for asynchronous processing. Returns an array containing
     * the `shopsProductId` values that failed to be forwarded to the ingestion queue.
     * An empty array means all products were accepted.
     *
     */
    202: PartnerProductEnqueueFailuresResponse;
};
type PostPartnerProductsErrors = {
    /**
     * Bad request — request body is missing, empty, or contains invalid JSON
     */
    400: ApiError;
    /**
     * Unauthorized — the bearer token is missing, invalid, expired, or the referenced
     * Aura Historia access token no longer exists.
     *
     */
    401: ApiError;
    /**
     * Forbidden — the authenticated caller is not allowed to ingest products for this shop
     */
    403: ApiError;
    /**
     * Not found — the specified shop does not exist
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
    /**
     * Service unavailable — all product commands failed to be forwarded to the asynchronous ingestion queue
     */
    503: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PostPartnerProductsData, ThrowOnError>): RequestResult<PostPartnerProductsResponses, PostPartnerProductsErrors, ThrowOnError> => (options.client ?? client).post<PostPartnerProductsResponses, PostPartnerProductsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }, {
            key: 'AccessTokenAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/shops/{shopId}/products',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/listing-sources/{listingSourceId}/product-listings
method: post
id: postPartnerProductListings
summary: Batch create product-listings (Partner API)
description: >
  Creates one or more product-listings for a listing source using bearer
  authentication.

  This endpoint is intended for partnerships and accepts:

  - a Cognito bearer token for the partner user linked to the listing source, or

  - an Aura Historia access token owned by that partner user.


  Aura Historia access tokens on this endpoint must include the
  `product-listings:write` scope.

  Allowed callers are Aura Historia admins and users partnered with the target
  listing source.


  The request body is an array of `CreateProductListingData` objects. Each entry
  is created

  synchronously in its own PostgreSQL transaction.


  The response returns HTTP 200 with failures as `{ listingSourceId,
  sourceListingId, error }` objects when

  one or more entries succeed. `error` is the stable API error key for that
  entry. If every non-empty entry fails, the first failure is returned

  as a problem response. An empty array is accepted and returns `[]`.
operationId: postPartnerProductListings
tags:
  - ProductListings
parameters:
  - name: listingSourceId
    in: path
    required: true
    description: Unique identifier of the target ListingSource
    schema:
      type: string
      example: ls_6rd827eqfefsva9teecmwa3ate
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  description: Array of at most 100 product-listings to create synchronously. May be empty.
  content:
    application/json:
      schema:
        type: array
        maxItems: 100
        items:
          $ref: "#/components/schemas/CreateProductListingData"
      example:
        - sourceListingId: baroque-violin-001
          title:
            text: Baroque Violin
            language: en
          description:
            text: A beautiful 18th-century baroque violin in excellent condition.
            language: en
          price:
            currency: EUR
            amount: 4500
          availability: IN_STOCK
          url: https://my-listing-source.com/product-listings/baroque-violin
          images:
            - https://my-listing-source.com/images/violin-1.jpg
            - https://my-listing-source.com/images/violin-2.jpg
responses:
  "200":
    description: >
      Batch create completed synchronously. This response is returned when all
      entries

      succeed or when at least one entry succeeds; it lists only failed entries.
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/PartnerProductListingBatchFailuresResponse"
        examples:
          all_succeeded:
            summary: All product-listings were created
            value: []
          partial_failure:
            summary: Some product-listings failed while at least one product was created
            value:
              - listingSourceId: ls_6rd827eqfefsva9teecmwa3ate
                sourceListingId: baroque-violin-002
                error: CONFLICT
  "400":
    description: Bad request — request body is missing, empty, or contains invalid JSON
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Request body is absent or empty
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty.
          invalid_json:
            summary: Request body is not valid JSON
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: expected value at line 1 column 1
  "401":
    description: >
      Unauthorized — the bearer token is missing, invalid, expired, or the
      referenced

      Aura Historia access token no longer exists.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_authorization:
            summary: Authorization header is missing
            value:
              status: 401
              title: Unauthorized
              error: INVALID_CREDENTIALS
              source:
                field: Authorization
                type: HEADER
          access_token_not_found:
            summary: Aura Historia access token is unknown or expired
            value:
              status: 401
              title: Unauthorized
              error: ACCESS_TOKEN_NOT_FOUND
  "403":
    description: Forbidden — the authenticated caller is not allowed to ingest
      product-listings for this listing source
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: Not found — the specified listing source does not exist
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: LISTING_SOURCE_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PRODUCT_LISTING_INTERNAL_ERROR
  "503":
    description: Service unavailable — all entries encountered a temporary
      product-write failure
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE

```

### putPartnerProducts → putPartnerProductListings

Old generated operation:

```ts
type PutPartnerProductsData = {
    /**
     * Array of products to upsert. Must not be empty.
     */
    body: Array<PutProductData>;
    path: {
        /**
         * Unique identifier of the partner shop
         */
        shopId: string;
    };
    query?: never;
    url: '/api/v1/shops/{shopId}/products';
};
type PutPartnerProductsResponses = {
    /**
     * Batch upsert request accepted for asynchronous processing. Returns an array containing
     * the `shopsProductId` values that failed to be forwarded to the ingestion queue.
     * An empty array means all upserts were accepted.
     *
     */
    202: PartnerProductEnqueueFailuresResponse;
};
type PutPartnerProductsErrors = {
    /**
     * Bad request — request body is missing, empty, or contains invalid JSON
     */
    400: ApiError;
    /**
     * Unauthorized — the bearer token is missing, invalid, expired, or the referenced
     * Aura Historia access token no longer exists.
     *
     */
    401: ApiError;
    /**
     * Forbidden — the authenticated caller is not allowed to ingest products for this shop
     */
    403: ApiError;
    /**
     * Not found — the specified shop does not exist
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
    /**
     * Service unavailable — all product commands failed to be forwarded to the asynchronous ingestion queue
     */
    503: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PutPartnerProductsData, ThrowOnError>): RequestResult<PutPartnerProductsResponses, PutPartnerProductsErrors, ThrowOnError> => (options.client ?? client).put<PutPartnerProductsResponses, PutPartnerProductsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }, {
            key: 'AccessTokenAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/shops/{shopId}/products',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/listing-sources/{listingSourceId}/product-listings
method: put
id: putPartnerProductListings
summary: Batch upsert product-listings (Partner API)
description: >
  Creates new product-listings or updates existing ones for a listing source in
  a single batch call,

  using bearer authentication. This endpoint is intended for partnerships and
  accepts:

  - a Cognito bearer token for the partner user linked to the listing source, or

  - an Aura Historia access token owned by that partner user.


  Aura Historia access tokens on this endpoint must include the
  `product-listings:write` scope.

  Allowed callers are Aura Historia admins and users partnered with the target
  listing source.


  The request body is an array of `UpsertProductListingData` objects. Each entry
  is upserted

  synchronously in its own PostgreSQL transaction. For each entry:

  - **New listing** — omitted or `null` availability, price, estimates, and
  auction timestamps
    create no value; a concrete value sets it.
  - **Existing listing** — availability, price, each price estimate, and each
  auction timestamp
    are tri-state: omitted preserves, `null` clears, and a concrete value sets. A withdrawn
    listing is restored before current facts apply.
  - `title` and `description` apply only on creation. For an
    existing listing they preserve current state and emit no current-state history event.
  - `images` is separate: omit to preserve, send `[]` to clear, or send an array
  to replace.
    `null` is invalid. `url` is non-clearable: omit or send `null` to preserve it; send a URL
    value to replace it.

  The response returns HTTP 200 with failures as `{ listingSourceId,
  sourceListingId, error }` objects when

  one or more entries succeed. `error` is the stable API error key for that
  entry. If every non-empty entry fails, the first failure is returned

  as a problem response. An empty array is accepted and returns `[]`.
operationId: putPartnerProductListings
tags:
  - ProductListings
parameters:
  - name: listingSourceId
    in: path
    required: true
    description: Unique identifier of the target ListingSource
    schema:
      type: string
      example: ls_6rd827eqfefsva9teecmwa3ate
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  description: Array of at most 100 product-listings to upsert synchronously. May be empty.
  content:
    application/json:
      schema:
        type: array
        maxItems: 100
        items:
          $ref: "#/components/schemas/UpsertProductListingData"
      examples:
        create_new:
          summary: Create a new product
          value:
            - sourceListingId: baroque-violin-001
              title:
                text: Baroque Violin
                language: en
              description:
                text: A beautiful 18th-century baroque violin in excellent condition.
                language: en
              price:
                currency: EUR
                amount: 4500
              availability: IN_STOCK
              url: https://my-listing-source.com/product-listings/baroque-violin
              images:
                - https://my-listing-source.com/images/violin-1.jpg
        update_existing:
          summary: Update an existing product while leaving the current price unchanged
          value:
            - sourceListingId: baroque-violin-001
              availability: SOLD_OUT
              priceEstimateMin:
                currency: EUR
                amount: 4200
              priceEstimateMax:
                currency: EUR
                amount: 4800
              url: https://my-listing-source.com/product-listings/baroque-violin?status=sold
              images:
                - https://my-listing-source.com/images/violin-1.jpg
                - https://my-listing-source.com/images/violin-detail.jpg
              auctionEnd: 2025-05-10T12:30:00Z
        clear_images:
          summary: Clear an existing product's images
          value:
            - sourceListingId: baroque-violin-001
              images: []
responses:
  "200":
    description: >
      Batch upsert completed synchronously. This response is returned when all
      entries

      succeed or when at least one entry succeeds; it lists only failed entries.
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/PartnerProductListingBatchFailuresResponse"
        examples:
          all_succeeded:
            summary: All product-listings were upserted
            value: []
          partial_failure:
            summary: Some product-listings failed while at least one product was upserted
            value:
              - listingSourceId: ls_6rd827eqfefsva9teecmwa3ate
                sourceListingId: baroque-violin-002
                error: BAD_BODY_VALUE
  "400":
    description: Bad request — request body is missing, empty, or contains invalid JSON
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Request body is absent or empty
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty.
          invalid_json:
            summary: Request body is not valid JSON
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: expected value at line 1 column 1
  "401":
    description: >
      Unauthorized — the bearer token is missing, invalid, expired, or the
      referenced

      Aura Historia access token no longer exists.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_authorization:
            summary: Authorization header is missing
            value:
              status: 401
              title: Unauthorized
              error: INVALID_CREDENTIALS
              source:
                field: Authorization
                type: HEADER
          access_token_not_found:
            summary: Aura Historia access token is unknown or expired
            value:
              status: 401
              title: Unauthorized
              error: ACCESS_TOKEN_NOT_FOUND
  "403":
    description: Forbidden — the authenticated caller is not allowed to ingest
      product-listings for this listing source
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: Not found — the specified listing source does not exist
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: LISTING_SOURCE_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PRODUCT_LISTING_INTERNAL_ERROR
  "503":
    description: Service unavailable — all entries encountered a temporary
      product-write failure
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE

```

### postWoocommerceWebhook → postWoocommerceWebhook

Old generated operation:

```ts
type PostWoocommerceWebhookData = {
    /**
     * Topic-specific WooCommerce product payload.
     * For `product.created` and `product.updated`, `id`, `name`, and `permalink` are required.
     * For `product.deleted`, only `id` is required; all other fields are optional and ignored when absent.
     *
     */
    body: WoocommerceProductWebhookUpsertData | WoocommerceProductWebhookDeleteData;
    headers: {
        /**
         * WooCommerce webhook topic that determines how the payload is interpreted.
         * Only the listed topic values are accepted.
         *
         */
        'x-wc-webhook-topic': 'product.created' | 'product.updated' | 'product.deleted';
        /**
         * Base64-encoded HMAC-SHA256 signature of the raw HTTP request body, calculated with the
         * shop's configured `woocommerceWebhookSecret`.
         *
         */
        'x-wc-webhook-signature': string;
    };
    path: {
        /**
         * Unique identifier of the partner shop that should receive the WooCommerce webhook
         */
        shopId: string;
    };
    query?: never;
    url: '/api/v1/webhooks/woocommerce/{shopId}';
};
type PostWoocommerceWebhookResponses = {
    /**
     * Webhook accepted for asynchronous processing.
     * The backend returns no response body on successful queue forwarding.
     *
     */
    202: unknown;
};
type PostWoocommerceWebhookErrors = {
    /**
     * Bad request — invalid or missing shop ID, missing body, malformed JSON, unsupported
     * WooCommerce topic, a payload that does not satisfy the selected topic's requirements,
     * or missing required shop-level WooCommerce configuration (`woocommerceLanguage`,
     * and `woocommerceCurrency` when a non-empty `price` is sent).
     *
     */
    400: ApiError;
    /**
     * Unauthorized — the bearer token is missing or invalid, the Aura Historia access token
     * is unknown, or the WooCommerce signature header is missing/invalid.
     *
     */
    401: ApiError;
    /**
     * Forbidden — the authenticated caller is not linked to the requested partner shop
     */
    403: ApiError;
    /**
     * Not found — the specified shop does not exist
     */
    404: ApiError;
    /**
     * Internal server error — the shop has no configured WooCommerce webhook secret or another unexpected failure occurred
     */
    500: ApiError;
    /**
     * Service unavailable — the webhook event could not be forwarded to the asynchronous ingestion queue
     */
    503: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PostWoocommerceWebhookData, ThrowOnError>): RequestResult<PostWoocommerceWebhookResponses, PostWoocommerceWebhookErrors, ThrowOnError> => (options.client ?? client).post<PostWoocommerceWebhookResponses, PostWoocommerceWebhookErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }, {
            key: 'AccessTokenAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/webhooks/woocommerce/{shopId}',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/webhooks/woocommerce/{listingSourceId}
method: post
id: postWoocommerceWebhook
summary: Ingest a WooCommerce product webhook (Partner API)
description: >
  Accepts a single WooCommerce product webhook event for a partnership using
  bearer authentication.

  This endpoint is intended for partnerships and accepts:

  - a Cognito bearer token for the partner user linked to the listing source, or

  - an Aura Historia access token owned by that partner user.


  The caller must provide:

  - the bearer token in the `Authorization` header,

  - the WooCommerce topic in `x-wc-webhook-topic`, and

  - the base64-encoded HMAC-SHA256 signature of the raw request body in
  `x-wc-webhook-signature`, and

  - optionally, the WooCommerce delivery identifier in
  `x-wc-webhook-delivery-id`.


  A supplied delivery identifier applies only when an event maps to raw capture.
  Its provider receipt retains only a

  canonical semantic source-payload SHA-256 evidence digest for 90 days. A
  captured-observation retry with the same

  digest receives `204`; reuse with different evidence returns `409
  WOOCOMMERCE_PROVIDER_RECEIPT_DIGEST_CONFLICT`.

  Logical receipt expiry permits a new receipt but never removes or rewrites a
  captured raw revision or its provenance.

  A timestamp-free DELETE establishes a restore barrier. A later UPSERT without
  a provably newer `date_modified_gmt`

  returns `409 WOOCOMMERCE_PROVIDER_SOURCE_ORDER_AMBIGUOUS`; it creates neither
  a receipt nor a raw revision, so the

  original request remains recoverable for reconciliation and retry.

  Authorized ignored create/update events persist no receipt, even when they
  include a delivery identifier.


  Topic-specific payload requirements:

  - every topic requires `id`

  - `product.created` and `product.updated` with `status: publish` capture an
  UPSERT and require nonblank

  `name` and `permalink`

  - `product.created` and `product.updated` with `status: trash`, `draft`,
  `pending`, or `private` capture a

  DELETE and require only `id`; missing or unsupported statuses are authorized
  ignored events and also require

  only `id`

  - `product.deleted` captures a DELETE and requires only `id`


  The listing source identified by `listingSourceId` must have a stored
  `woocommerceWebhookSecret`

  and a configured `woocommerceLanguage`.

  A nonblank `price` maps to a `SET` and requires the listing source to have
  `woocommerceCurrency` configured.
operationId: postWoocommerceWebhook
tags:
  - ProductListings
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: listingSourceId
    in: path
    required: true
    description: Unique identifier of the target ListingSource that should receive
      the WooCommerce webhook
    schema:
      type: string
      example: ls_6rd827eqfefsva9teecmwa3ate
  - name: x-wc-webhook-topic
    in: header
    required: true
    description: |
      WooCommerce webhook topic that determines how the payload is interpreted.
      Only the listed topic values are accepted.
    schema:
      type: string
      enum:
        - product.created
        - product.updated
        - product.deleted
    example: product.created
  - name: x-wc-webhook-signature
    in: header
    required: true
    description: >
      Base64-encoded HMAC-SHA256 signature of the raw HTTP request body,
      calculated with the

      listing source's configured `woocommerceWebhookSecret`.
    schema:
      type: string
    example: wqW/6B0S9myGxVQ8l3PPX2f6s4HWtY6q9KAr4m+Jv3E=
  - name: x-wc-webhook-delivery-id
    in: header
    required: false
    description: Optional WooCommerce delivery identifier. For an event that maps to
      raw capture, its receipt retains only a canonical semantic source-payload
      SHA-256 evidence digest for 90 days and deduplicates retries. Reusing the
      identifier with a different digest returns `409
      WOOCOMMERCE_PROVIDER_RECEIPT_DIGEST_CONFLICT`. Logical receipt expiry
      permits a new receipt but never removes or rewrites a captured raw
      revision or its provenance. Authorized ignored create/update status events
      persist no receipt and receive no receipt-based retry-deduplication, even
      when this header is supplied. When absent, no provider receipt or
      receipt-based retry-deduplication guarantee is made.
    schema:
      type: string
      minLength: 1
      maxLength: 512
    example: 4d1f0a18-ec5e-4e97-8cf8-ff4edc8b2e31
requestBody:
  required: true
  description: >
    Topic-specific WooCommerce product payload.

    Every topic requires `id`. For `product.created` and `product.updated`,
    `status: publish` captures an UPSERT and requires nonblank `name` and
    `permalink`; `status: trash`, `draft`, `pending`, or `private` captures a
    DELETE and requires only `id`. Missing or unsupported create/update statuses
    are authorized ignored events and require only `id`. `product.deleted`
    captures a DELETE and requires only `id`; its other fields are optional and
    ignored when absent.

    When present on an event that maps to raw capture, WooCommerce
    `date_modified_gmt` is the source ordering timestamp. It accepts a no-offset
    GMT value interpreted as UTC, RFC3339 `Z`, or RFC3339 `+00:00`; malformed or
    nonzero-offset values return `400 BAD_BODY_VALUE`. `product.created` and
    `product.updated` events with missing or unsupported status are ignored only
    after capability and source authorization, then acknowledge `204` without
    parsing `date_modified_gmt` or constructing a provider receipt; a denied
    ignored event returns `403 FORBIDDEN`. An authorized ignored event persists
    no provider receipt even if a delivery ID is supplied. Omit it when source
    order is unavailable; an omitted timestamp provides no source-ordering
    guarantee.
  content:
    application/json:
      schema:
        anyOf:
          - $ref: "#/components/schemas/WoocommerceProductWebhookUpsertData"
          - $ref: "#/components/schemas/WoocommerceProductWebhookDeleteData"
      examples:
        created:
          summary: Product created webhook
          value:
            id: 17
            name: Test Produkt Titel
            permalink: http://aura-historia-test.local/product/test-produkt-titel/
            description: |
              <p>Hayde yallah test beschreibung</p>
            short_description: |
              <p>Hayde yallah kurze test beschreibung</p>
            price: "42.69"
            status: publish
            stock_status: instock
            images: []
        updated:
          summary: Product updated webhook
          value:
            id: 17
            name: Test Produkt Titel
            permalink: http://aura-historia-test.local/product/test-produkt-titel/
            description: |
              <p>Hayde yallah test beschreibung</p>
            short_description: |
              <p>Hayde yallah kurze test beschreibung</p>
            price: "123.45"
            status: publish
            stock_status: instock
            images: []
        deleted:
          summary: Product deleted webhook
          value:
            id: 17
responses:
  "204":
    description: >
      Webhook capability, signature, and source authorization are validated. A
      `204` acknowledges an authorized ignored create/update event with missing
      or unsupported status, or a durably captured changed, unchanged,
      duplicate, or stale outcome; it does not mean a new raw revision was
      written. Ignored events do not parse `date_modified_gmt` or construct a
      provider receipt. A provider receipt exists only for an event that maps to
      raw capture and carries a delivery ID; authorized ignored events persist
      no receipt even when a delivery ID is supplied. Source ordering is
      evaluated only for an event that maps to raw capture with a valid
      `date_modified_gmt`. When a delivery ID or source timestamp is omitted, no
      corresponding receipt or source-ordering guarantee is made. Canonical
      ProductListing normalization runs asynchronously. The backend returns no
      response body on success.
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
  "400":
    description: >
      Bad request — invalid or missing listing source ID, missing body,
      malformed JSON, unsupported

      WooCommerce topic, an invalid `date_modified_gmt` source timestamp
      (including a nonzero offset) for an event that maps to raw capture, or a
      missing field required by the selected capture operation.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_listing_source_id:
            summary: Missing listing source ID path parameter
            value:
              status: 400
              title: Bad Request
              error: BAD_PATH_PARAMETER_VALUE
              source:
                field: listingSourceId
                type: PATH
              detail: Missing field 'listingSourceId'.
          invalid_listing_source_id:
            summary: Invalid listing source ID format
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: listingSourceId
                type: PATH
              detail: must be a valid ListingSource ID
          missing_body:
            summary: Request body is absent or empty
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty.
          invalid_json:
            summary: Request body is not valid JSON
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: expected value at line 1 column 1
          missing_topic:
            summary: WooCommerce topic header is missing
            value:
              status: 400
              title: Bad Request
              error: BAD_HEADER_VALUE
              source:
                field: x-wc-webhook-topic
                type: HEADER
  "401":
    description: >
      Unauthorized — missing or invalid bearer credentials use
      `INVALID_CREDENTIALS`. A missing or invalid

      WooCommerce signature uses `BAD_HEADER_VALUE`.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_authorization:
            summary: Authorization header is missing
            value:
              status: 401
              title: Unauthorized
              error: INVALID_CREDENTIALS
              source:
                field: Authorization
                type: HEADER
          invalid_access_token:
            summary: Aura Historia access token is unknown or expired
            value:
              status: 401
              title: Unauthorized
              error: INVALID_CREDENTIALS
          missing_signature:
            summary: WooCommerce signature header is missing
            value:
              status: 401
              title: Unauthorized
              error: BAD_HEADER_VALUE
              source:
                field: x-wc-webhook-signature
                type: HEADER
              detail: WooCommerce signature header is required.
          signature_mismatch:
            summary: WooCommerce signature does not match the request body
            value:
              status: 401
              title: Unauthorized
              error: BAD_HEADER_VALUE
              source:
                field: x-wc-webhook-signature
                type: HEADER
              detail: WooCommerce signature is invalid.
  "403":
    description: Forbidden — the caller lacks the required ProductListing write
      capability or exact source partnership grant, including for ignored status
      events
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: Not found — the specified listing source does not exist
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: LISTING_SOURCE_NOT_FOUND
  "409":
    description: Conflict — a delivery receipt conflicts with its retained evidence
      digest (`WOOCOMMERCE_PROVIDER_RECEIPT_DIGEST_CONFLICT`), distinct evidence
      has the same `date_modified_gmt` timestamp
      (`WOOCOMMERCE_PROVIDER_SOURCE_ORDER_CONFLICT`), or an UPSERT cannot safely
      cross a delete ordering boundary
      (`WOOCOMMERCE_PROVIDER_SOURCE_ORDER_AMBIGUOUS`).
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          receipt_digest_conflict:
            summary: Delivery ID conflicts with its retained evidence digest
            value:
              status: 409
              title: Conflict
              error: WOOCOMMERCE_PROVIDER_RECEIPT_DIGEST_CONFLICT
          source_order_conflict:
            summary: Source timestamp conflicts with distinct prior evidence
            value:
              status: 409
              title: Conflict
              error: WOOCOMMERCE_PROVIDER_SOURCE_ORDER_CONFLICT
          source_order_ambiguous:
            summary: Source timestamp cannot prove a post-delete restore is newer
            value:
              status: 409
              title: Conflict
              error: WOOCOMMERCE_PROVIDER_SOURCE_ORDER_AMBIGUOUS
  "500":
    description: Internal server error — this route emits only
      `AUTH_INTERNAL_ERROR`, `LISTING_SOURCE_INTERNAL_ERROR`, or
      `PRODUCT_LISTING_INTERNAL_ERROR`.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          auth_internal_error:
            summary: Authentication failed internally
            value:
              status: 500
              title: Internal Server Error
              error: AUTH_INTERNAL_ERROR
          listing_source_internal_error:
            summary: ListingSource access failed internally
            value:
              status: 500
              title: Internal Server Error
              error: LISTING_SOURCE_INTERNAL_ERROR
          product_listing_internal_error:
            summary: Raw ProductListing capture failed internally
            value:
              status: 500
              title: Internal Server Error
              error: PRODUCT_LISTING_INTERNAL_ERROR
  "503":
    description: Service unavailable — this route emits only
      `AUTH_TEMPORARILY_UNAVAILABLE`, `LISTING_SOURCE_TEMPORARILY_UNAVAILABLE`,
      or `PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE`.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          auth_temporarily_unavailable:
            summary: Authentication is temporarily unavailable
            value:
              status: 503
              title: Service Unavailable
              error: AUTH_TEMPORARILY_UNAVAILABLE
          listing_source_temporarily_unavailable:
            summary: ListingSource access is temporarily unavailable
            value:
              status: 503
              title: Service Unavailable
              error: LISTING_SOURCE_TEMPORARILY_UNAVAILABLE
          product_listing_temporarily_unavailable:
            summary: Raw ProductListing capture is temporarily unavailable
            value:
              status: 503
              title: Service Unavailable
              error: PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE

```

### deletePartnerProduct → deletePartnerProductListings

Old generated operation:

```ts
type DeletePartnerProductData = {
    body?: never;
    path: {
        /**
         * Unique identifier of the partner shop
         */
        shopId: string;
        /**
         * Shop's unique identifier for the product
         */
        shopsProductId: string;
    };
    query?: never;
    url: '/api/v1/shops/{shopId}/products/{shopsProductId}';
};
type DeletePartnerProductResponses = {
    /**
     * Product delete accepted and materialized as a soft delete.
     */
    204: void;
};
type DeletePartnerProductErrors = {
    /**
     * Unauthorized — the bearer token is missing, invalid, expired, or unknown.
     */
    401: ApiError;
    /**
     * Forbidden — caller is neither admin nor partnered with this shop.
     */
    403: ApiError;
    /**
     * Not found — the specified shop or product does not exist.
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<DeletePartnerProductData, ThrowOnError>): RequestResult<DeletePartnerProductResponses, DeletePartnerProductErrors, ThrowOnError> => (options.client ?? client).delete<DeletePartnerProductResponses, DeletePartnerProductErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }, {
            key: 'AccessTokenAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/shops/{shopId}/products/{shopsProductId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/listing-sources/{listingSourceId}/product-listings
method: delete
id: deletePartnerProductListings
summary: Batch delete product-listings (Partner API)
description: >
  Soft-deletes product-listings for a listing source. Each entry writes its
  product lifecycle delete event and

  materialized PostgreSQL state synchronously in its own transaction.


  Allowed callers are Aura Historia admins and users partnered with the target
  listing source. Aura

  Historia access tokens must include the `product-listings:write` scope.


  The request body is an array of product identifiers. The response returns HTTP
  200 with

  failures as `{ listingSourceId, sourceListingId, error }` objects when one or
  more entries succeed.

  `error` is the stable API error key for that entry. If every non-empty entry
  fails, the first

  failure is returned as a problem response. An empty array is accepted and
  returns `[]`.
operationId: deletePartnerProductListings
tags:
  - ProductListings
parameters:
  - name: listingSourceId
    in: path
    required: true
    description: Unique identifier of the target ListingSource
    schema:
      type: string
      example: ls_6rd827eqfefsva9teecmwa3ate
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  description: Array of at most 100 product-listings to delete synchronously. May be empty.
  content:
    application/json:
      schema:
        type: array
        maxItems: 100
        items:
          $ref: "#/components/schemas/WithdrawProductListingData"
      example:
        - sourceListingId: baroque-violin-001
responses:
  "200":
    description: >
      Batch delete completed synchronously. This response is returned when all
      entries

      succeed or when at least one entry succeeds; it lists only failed entries.
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/PartnerProductListingBatchFailuresResponse"
        examples:
          all_succeeded:
            value: []
          partial_failure:
            value:
              - listingSourceId: ls_6rd827eqfefsva9teecmwa3ate
                sourceListingId: baroque-violin-002
                error: PRODUCT_LISTING_NOT_FOUND
  "400":
    description: Bad request — request body is missing, empty, or contains invalid JSON
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Unauthorized — the bearer token is missing, invalid, expired, or unknown.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Forbidden — caller is neither admin nor partnered with this listing
      source, or the access token lacks `product-listings:write`.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: Not found — the specified listing source or product does not exist.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Service unavailable — all entries encountered a temporary
      product-write failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### getProduct → getProductListing

Old generated operation:

```ts
type GetProductData2 = {
    body?: never;
    path: {
        /**
         * Unique identifier of the shop
         */
        shopId: string;
        /**
         * Shop's unique identifier for the product. Can be any arbitrary string.
         */
        shopsProductId: string;
    };
    query?: {
        /**
         * Currency for price display
         */
        currency?: CurrencyData;
        /**
         * Preferred language for localized content.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
    };
    url: '/api/v1/shops/{shopId}/products/{shopsProductId}';
};
type GetProductResponses = {
    /**
     * Product found and returned successfully
     */
    200: PersonalizedGetProductData;
};
type GetProductErrors = {
    /**
     * Bad request - invalid parameters
     */
    400: ApiError;
    /**
     * Product not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetProductData2, ThrowOnError>): RequestResult<GetProductResponses, GetProductErrors, ThrowOnError> => (options.client ?? client).get<GetProductResponses, GetProductErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/shops/{shopId}/products/{shopsProductId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/product-listings/{productListingId}
method: get
id: getProductListing
summary: Get a single product
description: >
  Retrieves a single product by its `productListingId`. Withdrawn listings
  return `404 PRODUCT_LISTING_NOT_FOUND`; this endpoint never returns `410`.


  `pricing.source` preserves seller-supplied source amounts and currencies.
  `pricing.display` contains

  HalfUp-converted amounts in the requested currency, and `pricing.valuation`
  identifies the persisted

  snapshot used. A sold Product may have no main price; then display prices are
  omitted while its immutable

  `SALE` valuation remains present. Currency defaults to `EUR`.


  Anonymous responses use freshness caching only: no `ETag` or `Last-Modified`
  validator is emitted because

  current display pricing may change when the selected persisted FX snapshot
  changes.


  Responses always contain `item`, the product data. A valid user or
  delegated-user bearer token

  adds optional top-level `userState`; authenticated responses are not cached.
operationId: getProductListing
tags:
  - ProductListings
parameters:
  - name: productListingId
    in: path
    required: true
    description: Unique identifier of the ProductListing
    schema:
      type: string
      example: pl_5xdb465tg1enarx2knf04mxbxj
  - name: language
    in: query
    required: false
    description: Requested current title and description language. Defaults to `en`;
      unavailable translations fall back to stored content.
    schema:
      $ref: "#/components/schemas/LanguageData"
  - name: currency
    in: query
    required: false
    description: Display currency. Defaults to `EUR`.
    schema:
      $ref: "#/components/schemas/CurrencyData"
security:
  - BearerAuth: []
  - {}
responses:
  "200":
    description: ProductListing found and returned successfully
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/PersonalizedProductListingDetailsData"
    headers:
      Content-Language:
        description: The language of the returned content
        schema:
          $ref: "#/components/schemas/LanguageData"
        example: de
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
  "400":
    description: Bad request - invalid parameters
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: ProductListing not found, including a withdrawn listing
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: PRODUCT_LISTING_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PRODUCT_LISTING_INTERNAL_ERROR
  "503":
    description: Product detail or notification state is temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE

```

### getProductBySlug → getProductListingByTitleSlug

Old generated operation:

```ts
type GetProductBySlugData = {
    body?: never;
    path: {
        /**
         * Human-readable slug identifier of the shop (kebab-case, derived from shop name)
         */
        shopSlugId: string;
        /**
         * Human-readable slug identifier of the product (kebab-case with 6-character hex suffix).
         * Format: {product-title}-{6-char-hex} where the title is derived from the product name.
         *
         */
        productSlugId: string;
    };
    query?: {
        /**
         * Currency for price display
         */
        currency?: CurrencyData;
        /**
         * Preferred language for localized content.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
    };
    url: '/api/v1/by-slug/shops/{shopSlugId}/products/{productSlugId}';
};
type GetProductBySlugResponses = {
    /**
     * Product found and returned successfully
     */
    200: PersonalizedGetProductData;
};
type GetProductBySlugErrors = {
    /**
     * Bad request - invalid parameters
     */
    400: ApiError;
    /**
     * Product not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetProductBySlugData, ThrowOnError>): RequestResult<GetProductBySlugResponses, GetProductBySlugErrors, ThrowOnError> => (options.client ?? client).get<GetProductBySlugResponses, GetProductBySlugErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/by-slug/shops/{shopSlugId}/products/{productSlugId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/product-listings/by-slug/{productListingTitleSlugId}
method: get
id: getProductListingByTitleSlug
summary: Get a single product by title slug
description: Retrieves an active ProductListing by its immutable Aura-owned
  `productListingTitleSlugId`, derived from its title. Withdrawn listings return
  `404 PRODUCT_LISTING_NOT_FOUND`; this endpoint never returns `410`.
operationId: getProductListingByTitleSlug
tags:
  - ProductListings
parameters:
  - name: productListingTitleSlugId
    in: path
    required: true
    description: Immutable Aura-owned public locator derived from the listing title
    schema:
      type: string
      minLength: 8
      maxLength: 120
      pattern: ^[a-z0-9]+(-[a-z0-9]+)*-[0-9a-f]{6}$
      example: museum-cabinet-18-19-century-a1b2c3
  - name: language
    in: query
    required: false
    schema:
      $ref: "#/components/schemas/LanguageData"
  - name: currency
    in: query
    required: false
    schema:
      $ref: "#/components/schemas/CurrencyData"
security:
  - BearerAuth: []
  - {}
responses:
  "200":
    description: ProductListing found and returned successfully
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/PersonalizedProductListingDetailsData"
  "400":
    description: Invalid path or query parameter
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: ProductListing not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Product detail temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### getProductHistory → getProductListingHistory

Old generated operation:

```ts
type GetProductHistoryData = {
    body?: never;
    path: {
        /**
         * Unique identifier of the shop
         */
        shopId: string;
        /**
         * Shop's unique identifier for the product. Can be any arbitrary string.
         */
        shopsProductId: string;
    };
    query?: {
        /**
         * Currency for price display in event payloads
         */
        currency?: CurrencyData;
        /**
         * Preferred language for localized content.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
    };
    url: '/api/v1/shops/{shopId}/products/{shopsProductId}/history';
};
type GetProductHistoryResponses = {
    /**
     * Product history retrieved successfully
     */
    200: Array<GetProductEventData>;
};
type GetProductHistoryErrors = {
    /**
     * Bad request - Invalid parameters
     */
    400: ApiError;
    /**
     * Product not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetProductHistoryData, ThrowOnError>): RequestResult<GetProductHistoryResponses, GetProductHistoryErrors, ThrowOnError> => (options.client ?? client).get<GetProductHistoryResponses, GetProductHistoryErrors, ThrowOnError>({ url: '/api/v1/shops/{shopId}/products/{shopsProductId}/history', ...options });

```

Target operation:

```yaml
path: /api/v1/product-listings/{productListingId}/history
method: get
id: getProductListingHistory
summary: Get ProductListing history
description: >
  Retrieves immutable domain history for one ProductListing by
  `productListingId`.

  Each array item is one committed `PRODUCT_LISTING_DISCOVERED` or
  `PRODUCT_LISTING_CHANGED` event, ordered by occurrence time and event ID. A
  changed item contains a deterministic ordered `changes` array; it is never
  split into synthetic entries. Discovery exposes image count, never source
  image URLs.

  Price snapshots preserve stored source amounts and currencies. Sale
  observations retain their immutable source provenance. This endpoint performs
  no currency conversion.
operationId: getProductListingHistory
tags:
  - ProductListings
parameters:
  - name: productListingId
    in: path
    required: true
    description: Unique ProductListing identifier
    schema:
      type: string
      example: pl_5xdb465tg1enarx2knf04mxbxj
responses:
  "200":
    description: Product history retrieved successfully
    headers:
      Cache-Control:
        schema:
          type: string
        example: public, max-age=180, s-maxage=900
    content:
      application/json:
        schema:
          type: array
          items:
            $ref: "#/components/schemas/ProductListingHistoryEntryData"
        examples:
          product_history:
            summary: Example ProductListing history
            value:
              - eventType: PRODUCT_LISTING_DISCOVERED
                productListingId: pl_5xdb465tg1enarx2knf04mxbxj
                eventId: evt_7s35w34ftcew1r4cransc55rt4
                payload:
                  listingSourceId: ls_6ckwc632p2e2q86nv92g9eyw9q
                  sourceListingId: source-6ba7b810
                  pricing:
                    price:
                      currency: EUR
                      amount: 3000
                  availability: IN_STOCK
                  url: https://listing-source.example/product-listings/6ba7b810
                  imageCount: 3
                  auction:
                    start: null
                    end: null
                timestamp: 2026-09-01T10:00:00Z
              - eventType: PRODUCT_LISTING_CHANGED
                productListingId: pl_5xdb465tg1enarx2knf04mxbxj
                eventId: evt_2mdmwstjvvfn3rmbakmarshhqg
                payload:
                  changes:
                    - type: MAIN_PRICE_CHANGED
                      previous:
                        currency: EUR
                        amount: 3000
                      current:
                        currency: EUR
                        amount: 2999
                    - type: AVAILABILITY_CHANGED
                      previous: IN_STOCK
                      current: SOLD_OUT
                timestamp: 2026-09-01T10:15:00Z
  "400":
    description: Bad request - Invalid parameters
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: Product not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: PRODUCT_LISTING_NOT_FOUND
  "500":
    description: ProductListing history contains invalid stored event data
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PRODUCT_LISTING_INTERNAL_ERROR
  "503":
    description: ProductListing history is temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE

```

### getSimilarProducts → getSimilarProductListings

Old generated operation:

```ts
type GetSimilarProductsData = {
    body?: never;
    path: {
        /**
         * Unique identifier of the shop
         */
        shopId: string;
        /**
         * Shop's unique identifier for the product
         */
        shopsProductId: string;
    };
    query?: {
        /**
         * Currency for price display
         */
        currency?: CurrencyData;
        /**
         * Preferred language for localized content.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
    };
    url: '/api/v1/shops/{shopId}/products/{shopsProductId}/similar';
};
type GetSimilarProductsResponses = {
    /**
     * Array of similar products, each with optional user state
     */
    200: Array<PersonalizedGetProductSummaryData>;
    /**
     * Accepted - Product embedding not yet computed.
     * The text embedding for this product has not been generated yet (typically for products less than 24 hours old).
     * Embeddings are computed during nightly batch processing.
     * Poll the endpoint again later using the Location header.
     *
     */
    202: unknown;
};
type GetSimilarProductsErrors = {
    /**
     * Bad request - invalid parameters
     */
    400: ApiError;
    /**
     * Product not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetSimilarProductsData, ThrowOnError>): RequestResult<GetSimilarProductsResponses, GetSimilarProductsErrors, ThrowOnError> => (options.client ?? client).get<GetSimilarProductsResponses, GetSimilarProductsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/shops/{shopId}/products/{shopsProductId}/similar',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/product-listings/{productListingId}/similar
method: get
id: getSimilarProductListings
summary: Get similar product-listings
description: >
  Retrieves product-listings similar to the specified product using KNN search
  over text embeddings.

  When the product embedding is ready, the endpoint returns matching
  product-listings. If it is absent,

  the endpoint returns `202 Accepted` with a polling location.


  Ready entries return `displayPrice` in the requested currency and
  `priceValuation` metadata.

  Active ProductListings use one persisted snapshot pinned for the request; sold
  ProductListings use immutable

  sale-time values. Every ready entry contains `item`; a valid user or
  delegated-user bearer token adds

  `userState`. Personalized KNN results use `Cache-Control: no-store`.
operationId: getSimilarProductListings
tags:
  - ProductListings
parameters:
  - name: productListingId
    in: path
    required: true
    description: Unique identifier of the product
    schema:
      type: string
      example: pl_5xdb465tg1enarx2knf04mxbxj
  - name: language
    in: query
    required: false
    description: Language used for localized KNN result titles. Defaults to `en`.
    schema:
      $ref: "#/components/schemas/LanguageData"
  - name: currency
    in: query
    required: false
    description: Display currency for KNN result prices. Defaults to `EUR`.
    schema:
      $ref: "#/components/schemas/CurrencyData"
security:
  - BearerAuth: []
  - {}
responses:
  "200":
    description: Similar product-listings found and returned successfully
    content:
      application/json:
        schema:
          type: array
          items:
            $ref: "#/components/schemas/PersonalizedProductListingSummaryData"
  "202":
    description: Product embedding is not available yet. Poll the Location URL for
      KNN results.
    headers:
      Location:
        description: URL to poll for similar product-listings once the embedding is
          available
        schema:
          type: string
          format: uri
        example: /api/v1/product-listings/pl_5xdb465tg1enarx2knf04mxbxj/similar
  "400":
    description: Bad request - invalid parameters
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: Product not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: PRODUCT_LISTING_NOT_FOUND
          detail: ProductListing with ListingSourceId 'ls_6rd827eqfefsva9teecmwa3ate' and
            SourceListingId '6ba7b810' not found.
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### simpleSearchProducts → simpleSearchProductListings

Old generated operation:

```ts
type SimpleSearchProductsData = {
    body?: never;
    path?: never;
    query: {
        /**
         * Language used for search matching and localized response fields
         */
        language: LanguageData;
        /**
         * Currency used for price normalization in search
         */
        currency: CurrencyData;
        /**
         * Optional text queries for products. Multiple entries are ORed together.
         */
        productQuery?: Array<string>;
        /**
         * Optional product IDs to exclude from results.
         */
        excludeProductId?: Array<string>;
        /**
         * Optional filter by exact shop names (keyword matching).
         * Products are filtered to those from shops whose names exactly match one of the provided values.
         *
         */
        shopName?: Array<string>;
        /**
         * Optional filter to exclude products from specific shops (keyword matching).
         * Products from shops whose names exactly match one of the provided values are excluded from results.
         *
         */
        excludeShopName?: Array<string>;
        /**
         * Optional filter by exact seller names (keyword matching).
         * Products are filtered to those from sellers whose names exactly match one of the provided values.
         *
         */
        sellerName?: Array<string>;
        /**
         * Optional filter to exclude products from specific sellers (keyword matching).
         * Products from sellers whose names exactly match one of the provided values are excluded from results.
         *
         */
        excludeSellerName?: Array<string>;
        /**
         * Optional filter by exact shop slug identifiers.
         * Products are filtered to those whose `shopSlugId` exactly matches one of the provided kebab-case values.
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
         * Products are filtered to those whose seller slug ID exactly matches one of the provided kebab-case values.
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
         * Optional filter by shop types. When provided, only products from shops of the given types are returned.
         */
        shopType?: Array<ShopTypeData>;
        /**
         * Optional filter by one or more structured-address country codes of the selling shop.
         * Uses ISO 3166-1 alpha-2 codes and matches products whose indexed shop address country is one of the provided values.
         *
         */
        country?: Array<CountryCodeData>;
        /**
         * Optional filter by one or more structured-address continents of the selling shop.
         * Matches products whose indexed shop address continent is one of the provided values.
         *
         */
        continent?: Array<ContinentData>;
        /**
         * Optional geospatial proximity filter for the selling shop's indexed coordinates.
         * Use deep-object encoding with `geoAddress[lat]`, `geoAddress[lon]`, `geoAddress[distance][amount]`, and `geoAddress[distance][unit]`.
         *
         */
        geoAddress?: GeoDistanceQueryData;
        /**
         * Optional price range filter in minor currency units (e.g. cents for most supported currencies, whole yen for JPY).
         * Use `price[min]` and/or `price[max]` to specify the range bounds.
         *
         */
        price?: {
            /**
             * Minimum price (inclusive) in minor currency units for the selected/requested currency
             */
            min?: number;
            /**
             * Maximum price (inclusive) in minor currency units for the selected/requested currency
             */
            max?: number;
        };
        /**
         * Optional filter by product states. When provided, only products in the given states are returned.
         */
        state?: Array<ProductStateData>;
        /**
         * Optional filter by product creation date range (RFC3339 format).
         * Use `created[min]` and/or `created[max]` to specify the datetime bounds.
         *
         */
        created?: {
            /**
             * Minimum creation datetime (inclusive, RFC3339 format)
             */
            min?: string;
            /**
             * Maximum creation datetime (inclusive, RFC3339 format)
             */
            max?: string;
        };
        /**
         * Optional filter by product last-updated date range (RFC3339 format).
         * Use `updated[min]` and/or `updated[max]` to specify the datetime bounds.
         *
         */
        updated?: {
            /**
             * Minimum last-updated datetime (inclusive, RFC3339 format)
             */
            min?: string;
            /**
             * Maximum last-updated datetime (inclusive, RFC3339 format)
             */
            max?: string;
        };
        /**
         * Optional filter by auction start datetime range (RFC3339 format).
         * Use `auctionStart[min]` and/or `auctionStart[max]` to specify the bounds.
         * Only matches products that have an auction start time set.
         *
         */
        auctionStart?: {
            /**
             * Minimum auction start datetime (inclusive, RFC3339 format)
             */
            min?: string;
            /**
             * Maximum auction start datetime (inclusive, RFC3339 format)
             */
            max?: string;
        };
        /**
         * Optional filter by auction end datetime range (RFC3339 format).
         * Use `auctionEnd[min]` and/or `auctionEnd[max]` to specify the bounds.
         * Only matches products that have an auction end time set.
         *
         */
        auctionEnd?: {
            /**
             * Minimum auction end datetime (inclusive, RFC3339 format)
             */
            min?: string;
            /**
             * Maximum auction end datetime (inclusive, RFC3339 format)
             */
            max?: string;
        };
        /**
         * Field to sort results by
         */
        sort?: SortProductFieldData;
        /**
         * Sort order (only valid when sort is specified)
         */
        order?: 'asc' | 'desc';
        /**
         * Cursor value for pagination (search-after pattern).
         * This is a JSON value returned as `searchAfter` in the previous response.
         *
         */
        searchAfter?: Array<unknown>;
        /**
         * Number of products to return per page
         */
        size?: number;
    };
    url: '/api/v1/products';
};
type SimpleSearchProductsResponses = {
    /**
     * Simple search results returned successfully
     */
    200: PersonalizedProductSearchResultData;
};
type SimpleSearchProductsErrors = {
    /**
     * Bad request - invalid query parameters
     */
    400: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<SimpleSearchProductsData, ThrowOnError>): RequestResult<SimpleSearchProductsResponses, SimpleSearchProductsErrors, ThrowOnError> => (options.client ?? client).get<SimpleSearchProductsResponses, SimpleSearchProductsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/products',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/product-listings
method: get
id: simpleSearchProductListings
summary: Simple product search via query parameters
description: "Performs canonical ProductListing search with query parameters.
  Text queries combine BM25 and embedding KNN retrieval when embedding
  generation succeeds; otherwise the backend falls back to BM25. Explicit
  non-score sorts use BM25. A valid bearer token adds user state and makes the
  response `Cache-Control: no-store`. `language` defaults to `en` and `currency`
  defaults to `EUR`."
operationId: simpleSearchProductListings
tags:
  - ProductListings
parameters:
  - name: language
    in: query
    required: false
    description: Language used for search matching and localized response fields;
      defaults to `en`
    schema:
      $ref: "#/components/schemas/LanguageData"
    example: de
  - name: currency
    in: query
    required: false
    description: Currency used to select the indexed price field; defaults to `EUR`;
      no request-time currency conversion occurs
    schema:
      $ref: "#/components/schemas/CurrencyData"
    example: EUR
  - name: productQuery
    in: query
    required: false
    description: Optional text queries for product-listings. Multiple entries are
      ORed together.
    style: form
    explode: true
    schema:
      type: array
      items:
        type: string
        minLength: 1
    example:
      - test
      - example
  - name: enhancedSearchDescription
    in: query
    required: false
    description: Optional natural-language description used to refine matching.
    schema:
      type: string
      minLength: 1
      maxLength: 1000
  - name: excludeProductId
    in: query
    required: false
    description: Optional product IDs to exclude from results.
    style: form
    explode: true
    schema:
      type: array
      items:
        type: string
      uniqueItems: true
    example:
      - pl_5xdb465tg1enarx2knf04mxbxj
  - name: listingSourceId
    in: query
    required: false
    description: Optional ListingSource IDs to include. A result must belong to one
      of the supplied sources.
    style: form
    explode: true
    schema:
      type: array
      items:
        type: string
      uniqueItems: true
  - name: excludeListingSourceId
    in: query
    required: false
    description: Optional ListingSource IDs to exclude from results.
    style: form
    explode: true
    schema:
      type: array
      items:
        type: string
      uniqueItems: true
  - name: price
    in: query
    required: false
    description: >
      Optional price range filter in minor currency units (e.g. cents for most
      supported currencies, whole yen for JPY).

      Use `price[min]` and/or `price[max]` to specify the range bounds.
    style: deepObject
    explode: true
    schema:
      type: object
      properties:
        min:
          type: integer
          minimum: 0
          description: Minimum price (inclusive) in minor currency units for the selected
            indexed currency
          example: 1000
        max:
          type: integer
          minimum: 0
          description: Maximum price (inclusive) in minor currency units for the selected
            indexed currency
          example: 50000
  - name: availability
    in: query
    required: false
    description: Optional exact availability assertions. Values are ORed.
    style: form
    explode: true
    schema:
      type: array
      items:
        $ref: "#/components/schemas/ListingAvailabilityData"
      uniqueItems: true
    example:
      - IN_STOCK
      - LIMITED_AVAILABILITY
  - name: created
    in: query
    required: false
    description: |
      Optional filter by product creation date range (RFC3339 format).
      Use `created[min]` and/or `created[max]` to specify the datetime bounds.
    style: deepObject
    explode: true
    schema:
      type: object
      properties:
        min:
          type: string
          format: date-time
          description: Minimum creation datetime (inclusive, RFC3339 format)
          example: 2024-01-01T00:00:00Z
        max:
          type: string
          format: date-time
          description: Maximum creation datetime (inclusive, RFC3339 format)
          example: 2024-12-31T23:59:59Z
  - name: updated
    in: query
    required: false
    description: |
      Optional filter by product last-updated date range (RFC3339 format).
      Use `updated[min]` and/or `updated[max]` to specify the datetime bounds.
    style: deepObject
    explode: true
    schema:
      type: object
      properties:
        min:
          type: string
          format: date-time
          description: Minimum last-updated datetime (inclusive, RFC3339 format)
          example: 2024-01-01T00:00:00Z
        max:
          type: string
          format: date-time
          description: Maximum last-updated datetime (inclusive, RFC3339 format)
          example: 2024-12-31T23:59:59Z
  - name: auctionStart
    in: query
    required: false
    description: |
      Optional filter by auction start datetime range (RFC3339 format).
      Use `auctionStart[min]` and/or `auctionStart[max]` to specify the bounds.
      Only matches product-listings that have an auction start time set.
    style: deepObject
    explode: true
    schema:
      type: object
      properties:
        min:
          type: string
          format: date-time
          description: Minimum auction start datetime (inclusive, RFC3339 format)
          example: 2025-05-01T00:00:00Z
        max:
          type: string
          format: date-time
          description: Maximum auction start datetime (inclusive, RFC3339 format)
          example: 2025-05-31T23:59:59Z
  - name: auctionEnd
    in: query
    required: false
    description: |
      Optional filter by auction end datetime range (RFC3339 format).
      Use `auctionEnd[min]` and/or `auctionEnd[max]` to specify the bounds.
      Only matches product-listings that have an auction end time set.
    style: deepObject
    explode: true
    schema:
      type: object
      properties:
        min:
          type: string
          format: date-time
          description: Minimum auction end datetime (inclusive, RFC3339 format)
          example: 2025-05-01T00:00:00Z
        max:
          type: string
          format: date-time
          description: Maximum auction end datetime (inclusive, RFC3339 format)
          example: 2025-05-31T23:59:59Z
  - name: sort
    in: query
    required: false
    description: Field to sort results by
    schema:
      $ref: "#/components/schemas/SortProductListingFieldData"
    example: created
  - name: order
    in: query
    required: false
    description: Sort order (only valid when sort is specified)
    schema:
      type: string
      enum:
        - asc
        - desc
    example: desc
  - name: searchAfter
    in: query
    required: false
    description: >
      Opaque ProductListing cursor for pagination. Pass the complete JSON object
      returned as

      `searchAfter` in the previous response as one query value. It pins the FX
      snapshot

      for the full cursor chain.
    schema:
      $ref: "#/components/schemas/ProductListingSearchCursorData"
    example: '{"fxRateId":"fx_0cwktgjtwnf4tb6hf2f8zm0x5k","searchAfter":[2999,"pl_5xdb465tg1enarx2knf04mxbxj"]}'
  - name: size
    in: query
    required: false
    description: Number of product-listings to return per page
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 21
    example: 5
security:
  - BearerAuth: []
  - {}
responses:
  "200":
    description: Simple search results returned successfully
    headers:
      Cache-Control:
        description: Shared/public cache directives for GET simple-search responses
        schema:
          type: string
        example: public, max-age=60, s-maxage=300
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ProductListingSearchResultData"
  "400":
    description: Bad request - invalid query parameters
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_query:
            summary: Invalid query parameter payload
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
          invalid_sort_field:
            summary: Invalid sort field
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: sort
                type: QUERY
              detail: "Expected any of: 'score', 'price', 'updated', 'created'. Got:
                'invalid'"
          invalid_order:
            summary: Invalid sort order
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: order
                type: QUERY
              detail: "Expected any of: 'asc' or 'desc'. Got: 'invalid'"
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR
  "503":
    description: Product search or required personalized state is temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE

```

### complexSearchProducts → (absent)

Old generated operation:

```ts
type ComplexSearchProductsData = {
    /**
     * Search filter configuration with all filtering criteria.
     * Unlike the simple text search, this allows filtering by multiple fields,
     * geo filters, price ranges, product states, and date ranges.
     *
     */
    body: ProductSearchData;
    path?: never;
    query?: {
        /**
         * Field to sort results by
         */
        sort?: SortProductFieldData;
        /**
         * Sort order (only valid when sort is specified)
         */
        order?: 'asc' | 'desc';
        /**
         * Cursor value for pagination (search-after pattern).
         * This is a JSON value returned as `searchAfter` in the previous response.
         * Use this to fetch the next page of results.
         * In general you do not have to worry about determining this key. It's given with the `searchAfter` field in the preceding response if more entries are present.
         * This can be ANY heterogeneous array.
         *
         */
        searchAfter?: Array<unknown>;
        /**
         * Number of products to return per page
         */
        size?: number;
    };
    url: '/api/v1/products/search';
};
type ComplexSearchProductsResponses = {
    /**
     * Complex search results returned successfully
     */
    200: PersonalizedProductSearchResultData;
};
type ComplexSearchProductsErrors = {
    /**
     * Bad request - invalid parameters or body
     */
    400: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<ComplexSearchProductsData, ThrowOnError>): RequestResult<ComplexSearchProductsResponses, ComplexSearchProductsErrors, ThrowOnError> => (options.client ?? client).post<ComplexSearchProductsResponses, ComplexSearchProductsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/products/search',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

### getUserSearchFilters → getUserSearchFilters

Old generated operation:

```ts
type GetUserSearchFiltersData = {
    body?: never;
    path?: never;
    query?: {
        /**
         * Field to sort results by
         */
        sort?: SortUserSearchFilterFieldData;
        /**
         * Sort order (only valid when sort is specified)
         */
        order?: 'asc' | 'desc';
    };
    url: '/api/v1/me/search-filters';
};
type GetUserSearchFiltersResponses = {
    /**
     * Search filters retrieved successfully
     */
    200: UserSearchFilterCollectionData;
};
type GetUserSearchFiltersErrors = {
    /**
     * Bad request - invalid parameters
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<GetUserSearchFiltersData, ThrowOnError>): RequestResult<GetUserSearchFiltersResponses, GetUserSearchFiltersErrors, ThrowOnError> => (options?.client ?? client).get<GetUserSearchFiltersResponses, GetUserSearchFiltersErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/search-filters',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/search-filters
method: get
id: getUserSearchFilters
summary: List user search filters
description: |
  Retrieves all search filters for the authenticated user.
  Uses the service's fixed collection ordering.
  Requires a Cognito JWT or an Aura access token with `search-filters:write`.
operationId: getUserSearchFilters
tags:
  - Search Filters
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "200":
    description: Search filters retrieved successfully
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/UserSearchFilterCollectionData"
        example:
          items:
            - userId: usr_5pvhvpxyhve6ts31n9x8c2y513
              userSearchFilterId: sf_4hyqf0gyxveazss7nby5hve5x2
              name: My Tech Store Search
              notifications: true
              state: ACTIVE
              search:
                language: en
                currency: USD
                productQuery:
                  - antique clock
                  - vintage clock
                price:
                  min: 1000
                  max: 5000
                availability:
                  - IN_STOCK
                listingSourceId:
                  - ls_6rd827eqfefsva9teecmwa3ate
              created: 2024-01-01T10:00:00Z
              updated: 2024-01-01T12:00:00Z
          from: 0
          size: 1
          total: 1
  "401":
    description: Unauthorized - missing or invalid Cognito JWT or Aura access token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - Aura access token lacks the required
      `search-filters:write` scope
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### createUserSearchFilter → createUserSearchFilter

Old generated operation:

```ts
type CreateUserSearchFilterData = {
    /**
     * Search filter configuration with name and filter criteria
     */
    body: PostUserSearchFilterData;
    path?: never;
    query?: never;
    url: '/api/v1/me/search-filters';
};
type CreateUserSearchFilterResponses = {
    /**
     * Search filter created successfully
     */
    201: UserSearchFilterData;
};
type CreateUserSearchFilterErrors = {
    /**
     * Bad request - invalid request body
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * User not found
     */
    404: ApiError;
    /**
     * Unprocessable Entity - search filter quota exceeded or restricted feature used
     */
    422: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<CreateUserSearchFilterData, ThrowOnError>): RequestResult<CreateUserSearchFilterResponses, CreateUserSearchFilterErrors, ThrowOnError> => (options.client ?? client).post<CreateUserSearchFilterResponses, CreateUserSearchFilterErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/search-filters',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/search-filters
method: post
id: createUserSearchFilter
summary: Create a new search filter
description: >
  Creates a new search filter for the authenticated user.

  The search filter configuration is provided in the request body.

  Returns the created search filter with generated ID and metadata.

  Requires a Cognito JWT or an Aura access token with `search-filters:write`.


  The number of allowed search filters and the set of usable search filter
  fields depend on the user's tier:

  - `FREE`: Up to 1 search filter. Allowed fields are `productQuery`, `price`,
  `state`, `excludeProductId`, and `lifecycle`. Other fields are forbidden and
  return `SEARCH_FILTER_RESTRICTED_FEATURE`.

  - `PRO`: Up to 5 search filters. All filter fields are allowed.

  - `ULTIMATE`: Unlimited search filters. All filter fields are allowed.
operationId: createUserSearchFilter
tags:
  - Search Filters
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  description: Search filter configuration with name and filter criteria
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/PostUserSearchFilterData"
      example:
        name: My Tech Store Search
        search:
          language: en
          currency: USD
          productQuery:
            - antique clock
            - vintage clock
          price:
            min: 1000
            max: 5000
          availability:
            - IN_STOCK
          created:
            min: 2024-01-01T00:00:00Z
            max: 2024-12-31T23:59:59Z
          listingSourceId:
            - ls_6rd827eqfefsva9teecmwa3ate
responses:
  "201":
    description: Search filter created successfully
    headers:
      Location:
        description: URL of the created search filter
        schema:
          type: string
          format: uri
        example: https://api.aura-historia.com/api/v1/me/search-filters/sf_4hyqf0gyxveazss7nby5hve5x2
      Content-Language:
        description: The language of the returned content
        schema:
          $ref: "#/components/schemas/LanguageData"
        example: en
      Last-Modified:
        description: When the search filter was created/updated
        schema:
          type: string
          format: http-date
        example: Wed, 01 Jan 2024 12:00:00 GMT
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/UserSearchFilterData"
        example:
          userId: usr_5pvhvpxyhve6ts31n9x8c2y513
          userSearchFilterId: sf_4hyqf0gyxveazss7nby5hve5x2
          name: My Tech Store Search
          notifications: true
          state: ACTIVE
          search:
            language: en
            currency: USD
            productQuery:
              - antique clock
              - vintage clock
            price:
              min: 1000
              max: 5000
            availability:
              - IN_STOCK
            listingSourceId:
              - ls_6rd827eqfefsva9teecmwa3ate
          created: 2024-01-01T12:00:00Z
          updated: 2024-01-01T12:00:00Z
  "400":
    description: Bad request - invalid request body
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Missing request body
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty
          invalid_json:
            summary: Invalid JSON format
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Invalid JSON format
  "401":
    description: Unauthorized - missing or invalid Cognito JWT or Aura access token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - Aura access token lacks the required
      `search-filters:write` scope
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: User not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
  "422":
    description: Unprocessable Entity - search filter quota exceeded or restricted
      feature used
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          quota_exceeded:
            summary: Search filter quota exceeded
            value:
              status: 422
              title: Unprocessable Content
              error: SEARCH_FILTER_QUOTA_EXCEEDED
              detail: Exceeded the maximum amount of search filters. There are already 1/1
                search filters occupied.
          restricted_feature:
            summary: Search filter contains a field not available for the user's tier
            value:
              status: 422
              title: Unprocessable Content
              error: SEARCH_FILTER_RESTRICTED_FEATURE
              detail: Search filter contains forbidden search field 'listingSourceName' which
                requires a higher user tier.
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### deleteUserSearchFilter → deleteUserSearchFilter

Old generated operation:

```ts
type DeleteUserSearchFilterData = {
    body?: never;
    path: {
        /**
         * Unique identifier of the search filter to delete
         */
        userSearchFilterId: string;
    };
    query?: never;
    url: '/api/v1/me/search-filters/{userSearchFilterId}';
};
type DeleteUserSearchFilterResponses = {
    /**
     * Search filter deleted successfully
     */
    204: void;
};
type DeleteUserSearchFilterErrors = {
    /**
     * Bad request - invalid parameters
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Search filter not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<DeleteUserSearchFilterData, ThrowOnError>): RequestResult<DeleteUserSearchFilterResponses, DeleteUserSearchFilterErrors, ThrowOnError> => (options.client ?? client).delete<DeleteUserSearchFilterResponses, DeleteUserSearchFilterErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/search-filters/{userSearchFilterId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/search-filters/{userSearchFilterId}
method: delete
id: deleteUserSearchFilter
summary: Delete a search filter
description: |
  Deletes a specific search filter by its ID for the authenticated user.
  The search filter must exist and belong to the authenticated user.
  Requires a Cognito JWT or an Aura access token with `search-filters:write`.
operationId: deleteUserSearchFilter
tags:
  - Search Filters
parameters:
  - name: userSearchFilterId
    in: path
    required: true
    description: Unique identifier of the search filter to delete
    schema:
      type: string
    example: sf_4hyqf0gyxveazss7nby5hve5x2
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "204":
    description: Search filter deleted successfully
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
  "400":
    description: Bad request - invalid parameters
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_search_filter_id:
            summary: Missing search filter ID
            value:
              status: 400
              title: Bad Request
              error: BAD_PATH_PARAMETER_VALUE
              source:
                field: userSearchFilterId
                type: PATH
          invalid_object_id:
            summary: Invalid search filter ID format
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: userSearchFilterId
                type: PATH
              detail: must be a valid UserSearchFilter ID
  "401":
    description: Unauthorized - missing or invalid Cognito JWT or Aura access token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - Aura access token lacks the required
      `search-filters:write` scope
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: Search filter not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: SEARCH_FILTER_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### getUserSearchFilter → getUserSearchFilter

Old generated operation:

```ts
type GetUserSearchFilterData = {
    body?: never;
    path: {
        /**
         * Unique identifier of the search filter
         */
        userSearchFilterId: string;
    };
    query?: never;
    url: '/api/v1/me/search-filters/{userSearchFilterId}';
};
type GetUserSearchFilterResponses = {
    /**
     * Search filter found and returned successfully
     */
    200: UserSearchFilterData;
};
type GetUserSearchFilterErrors = {
    /**
     * Bad request - invalid parameters
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Search filter not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetUserSearchFilterData, ThrowOnError>): RequestResult<GetUserSearchFilterResponses, GetUserSearchFilterErrors, ThrowOnError> => (options.client ?? client).get<GetUserSearchFilterResponses, GetUserSearchFilterErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/search-filters/{userSearchFilterId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/search-filters/{userSearchFilterId}
method: get
id: getUserSearchFilter
summary: Get a specific search filter
description: |
  Retrieves a specific search filter by its ID for the authenticated user.
  Returns the complete search filter configuration and metadata.
  Requires a Cognito JWT or an Aura access token with `search-filters:write`.
operationId: getUserSearchFilter
tags:
  - Search Filters
parameters:
  - name: userSearchFilterId
    in: path
    required: true
    description: Unique identifier of the search filter
    schema:
      type: string
    example: sf_4hyqf0gyxveazss7nby5hve5x2
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "200":
    description: Search filter found and returned successfully
    headers:
      Content-Language:
        description: The language of the returned content
        schema:
          $ref: "#/components/schemas/LanguageData"
        example: en
      Last-Modified:
        description: When the search filter was last updated
        schema:
          type: string
          format: http-date
        example: Wed, 01 Jan 2024 12:00:00 GMT
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/UserSearchFilterData"
        example:
          userId: usr_5pvhvpxyhve6ts31n9x8c2y513
          userSearchFilterId: sf_4hyqf0gyxveazss7nby5hve5x2
          name: My Tech Store Search
          notifications: true
          state: ACTIVE
          search:
            language: en
            currency: USD
            productQuery:
              - antique clock
              - vintage clock
            price:
              min: 1000
              max: 5000
            availability:
              - IN_STOCK
            listingSourceId:
              - ls_6rd827eqfefsva9teecmwa3ate
          created: 2024-01-01T10:00:00Z
          updated: 2024-01-01T12:00:00Z
  "400":
    description: Bad request - invalid parameters
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_search_filter_id:
            summary: Missing search filter ID
            value:
              status: 400
              title: Bad Request
              error: BAD_PATH_PARAMETER_VALUE
              source:
                field: userSearchFilterId
                type: PATH
          invalid_object_id:
            summary: Invalid search filter ID format
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: userSearchFilterId
                type: PATH
              detail: must be a valid UserSearchFilter ID
  "401":
    description: Unauthorized - missing or invalid Cognito JWT or Aura access token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - Aura access token lacks the required
      `search-filters:write` scope
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: Search filter not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: SEARCH_FILTER_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### updateUserSearchFilter → updateUserSearchFilter

Old generated operation:

```ts
type UpdateUserSearchFilterData = {
    /**
     * Partial search filter update data.
     * Only provided fields will be updated. If body is empty, returns existing filter.
     *
     */
    body?: PatchUserSearchFilterData;
    path: {
        /**
         * Unique identifier of the search filter to update
         */
        userSearchFilterId: string;
    };
    query?: never;
    url: '/api/v1/me/search-filters/{userSearchFilterId}';
};
type UpdateUserSearchFilterResponses = {
    /**
     * Search filter updated successfully
     */
    200: UserSearchFilterData;
};
type UpdateUserSearchFilterErrors = {
    /**
     * Bad request - invalid parameters or body
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Search filter or user not found
     */
    404: ApiError;
    /**
     * Unprocessable Entity - restricted feature used for the user's tier or quota exceeded during reactivation
     */
    422: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<UpdateUserSearchFilterData, ThrowOnError>): RequestResult<UpdateUserSearchFilterResponses, UpdateUserSearchFilterErrors, ThrowOnError> => (options.client ?? client).patch<UpdateUserSearchFilterResponses, UpdateUserSearchFilterErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/search-filters/{userSearchFilterId}',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/search-filters/{userSearchFilterId}
method: patch
id: updateUserSearchFilter
summary: Update a search filter
description: >
  Updates a specific search filter by its ID for the authenticated user.

  Allows partial updates: omitted members remain unchanged, documented nullable
  criteria

  accept `null` to clear, and `null` for required scalars or collections returns
  `400 BAD_BODY_VALUE`.

  `{}` returns the existing search filter unchanged; an empty HTTP body is
  invalid.

  Requires a Cognito JWT or an Aura access token with `search-filters:write`.


  The set of usable search filter fields depends on the user's tier:

  - `FREE`: Allowed fields are `productQuery`, `price`, `state`,
  `excludeProductId`, and `lifecycle`. Other fields are forbidden and return
  `SEARCH_FILTER_RESTRICTED_FEATURE`.

  - `PRO`: All filter fields are allowed.

  - `ULTIMATE`: All filter fields are allowed.
operationId: updateUserSearchFilter
tags:
  - Search Filters
parameters:
  - name: userSearchFilterId
    in: path
    required: true
    description: Unique identifier of the search filter to update
    schema:
      type: string
    example: sf_4hyqf0gyxveazss7nby5hve5x2
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  description: >
    Partial search filter update data. `{}` is a no-op; an empty HTTP body is
    invalid.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/PatchUserSearchFilterData"
      examples:
        partial_update:
          summary: Update specific fields
          value:
            name: Updated Filter Name
            search:
              price:
                min: 2000
                max: 8000
              listingSourceId:
                - ls_6rd827eqfefsva9teecmwa3ate
        update_name_only:
          summary: Update only the name
          value:
            name: New Filter Name
        disable_notifications:
          summary: Disable notifications for this search filter
          value:
            notifications: false
        enable_notifications:
          summary: Enable notifications for this search filter
          value:
            notifications: true
        deactivate_filter:
          summary: Deactivate this search filter manually
          value:
            state: INACTIVE_BY_USER
        reactivate_filter:
          summary: Reactivate this search filter
          value:
            state: ACTIVE
        update_filter_only:
          summary: Update only the filter criteria
          value:
            search:
              language: de
              currency: EUR
              listingSourceId:
                - ls_6rd827eqfefsva9teecmwa3ate
        empty_update:
          summary: No changes (returns existing filter)
          value: {}
responses:
  "200":
    description: Search filter updated successfully
    headers:
      Content-Language:
        description: The language of the returned content
        schema:
          $ref: "#/components/schemas/LanguageData"
        example: en
      Last-Modified:
        description: When the search filter was last updated
        schema:
          type: string
          format: http-date
        example: Wed, 01 Jan 2024 12:30:00 GMT
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/UserSearchFilterData"
        example:
          userId: usr_5pvhvpxyhve6ts31n9x8c2y513
          userSearchFilterId: sf_4hyqf0gyxveazss7nby5hve5x2
          name: Updated Filter Name
          notifications: true
          state: ACTIVE
          search:
            language: en
            currency: USD
            productQuery:
              - antique clock
              - vintage clock
            price:
              min: 2000
              max: 8000
            availability:
              - IN_STOCK
            listingSourceId:
              - ls_6rd827eqfefsva9teecmwa3ate
          created: 2024-01-01T10:00:00Z
          updated: 2024-01-01T12:30:00Z
  "400":
    description: Bad request - invalid parameters or body
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_search_filter_id:
            summary: Missing search filter ID
            value:
              status: 400
              title: Bad Request
              error: BAD_PATH_PARAMETER_VALUE
              source:
                field: userSearchFilterId
                type: PATH
          invalid_object_id:
            summary: Invalid search filter ID format
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: userSearchFilterId
                type: PATH
              detail: must be a valid UserSearchFilter ID
          invalid_json:
            summary: Invalid JSON format
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Invalid JSON format
  "401":
    description: Unauthorized - missing or invalid Cognito JWT or Aura access token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - Aura access token lacks the required
      `search-filters:write` scope
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: Search filter or user not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          search_filter_not_found:
            summary: Search filter not found
            value:
              status: 404
              title: Not Found
              error: SEARCH_FILTER_NOT_FOUND
          user_not_found:
            summary: User not found
            value:
              status: 404
              title: Not Found
              error: USER_NOT_FOUND
  "422":
    description: Unprocessable Entity - restricted feature used for the user's tier
      or quota exceeded during reactivation
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          restricted_feature:
            summary: Reactivation blocked by tier-restricted features
            value:
              status: 422
              title: Unprocessable Content
              error: SEARCH_FILTER_RESTRICTED_FEATURE
              detail: Search filter contains forbidden search field 'listingSourceName' which
                requires a higher user tier.
          quota_exceeded:
            summary: Reactivation blocked by search-filter quota
            value:
              status: 422
              title: Unprocessable Content
              error: SEARCH_FILTER_QUOTA_EXCEEDED
              detail: Exceeded the maximum amount of search filters. There are already 1/1
                search filters occupied.
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### getSearchFilterPreviewProducts → (absent)

Old generated operation:

```ts
type GetSearchFilterPreviewProductsData = {
    body?: never;
    path: {
        /**
         * Unique identifier of the search filter
         */
        userSearchFilterId: string;
    };
    query?: {
        /**
         * Currency used for price normalization in the live search response
         */
        currency?: CurrencyData;
        /**
         * Preferred language for localized content.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
    };
    url: '/api/v1/me/search-filters/{userSearchFilterId}/products';
};
type GetSearchFilterPreviewProductsResponses = {
    /**
     * Product match preview retrieved successfully
     */
    200: PersonalizedProductSearchResultData;
};
type GetSearchFilterPreviewProductsErrors = {
    /**
     * Bad request - invalid parameters
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Search filter not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetSearchFilterPreviewProductsData, ThrowOnError>): RequestResult<GetSearchFilterPreviewProductsResponses, GetSearchFilterPreviewProductsErrors, ThrowOnError> => (options.client ?? client).get<GetSearchFilterPreviewProductsResponses, GetSearchFilterPreviewProductsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/search-filters/{userSearchFilterId}/products',
    ...options
});

```

### getSearchFilterMatches → listSearchFilterMatches

Old generated operation:

```ts
type GetSearchFilterMatchesData = {
    body?: never;
    path: {
        /**
         * Unique identifier of the search filter
         */
        userSearchFilterId: string;
    };
    query?: {
        /**
         * Currency for price display
         */
        currency?: CurrencyData;
        /**
         * Field to sort results by
         */
        sort?: SortSearchFilterMatchFieldData;
        /**
         * Sort order (only valid when sort is specified)
         */
        order?: 'asc' | 'desc';
        /**
         * RFC3339 timestamp for cursor-based pagination (search-after).
         * Depending on sort-order, returns matched products created either after this timestamp for asc (oldest first) or before this timestamp for desc (latest first).
         * In general you do not have to worry about determining this key. It's given with `searchAfter` in the preceding response if more entries are present.
         *
         */
        searchAfter?: string;
        /**
         * Number of products to return per page
         */
        size?: number;
        /**
         * Preferred language for localized content.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
    };
    url: '/api/v1/me/search-filters/{userSearchFilterId}/matches';
};
type GetSearchFilterMatchesResponses = {
    /**
     * Matched products retrieved successfully
     */
    200: SearchFilterMatchProductCollectionData;
};
type GetSearchFilterMatchesErrors = {
    /**
     * Bad request - invalid parameters
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Search filter not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetSearchFilterMatchesData, ThrowOnError>): RequestResult<GetSearchFilterMatchesResponses, GetSearchFilterMatchesErrors, ThrowOnError> => (options.client ?? client).get<GetSearchFilterMatchesResponses, GetSearchFilterMatchesErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/search-filters/{userSearchFilterId}/matches',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/search-filters/{userSearchFilterId}/matches
method: get
id: listSearchFilterMatches
summary: List persisted matches for a saved search filter
description: >-
  Returns persisted product-listing matches associated with the authenticated
  user’s saved search filter. Results are read from stored match state and
  returned with cursor-based pagination in ascending persisted match-creation
  order. This endpoint does not execute a live search or preview the filter
  against current product listings.

  Requires a Cognito JWT or an Aura access token with `search-filters:write`.
operationId: listSearchFilterMatches
tags:
  - Search Filters
parameters:
  - name: userSearchFilterId
    in: path
    required: true
    description: Canonical Aura Historia UserSearchFilter ID.
    schema:
      type: string
    example: sf_4hyqf0gyxveazss7nby5hve5x2
  - name: language
    in: query
    required: false
    description: Preferred language for localized product content. Defaults to `en`.
    schema:
      $ref: "#/components/schemas/LanguageData"
    example: de
  - name: currency
    in: query
    required: false
    description: Currency used for the returned product-listing representation.
      Defaults to `EUR`.
    schema:
      $ref: "#/components/schemas/CurrencyData"
    example: EUR
  - name: size
    in: query
    required: false
    description: "Requested page size. The runtime defaults to 21 and clamps
      successfully parsed unsigned values to the inclusive range 1..100: `0`
      becomes 1 and values above 100 become 100. Negative, malformed, and
      non-integer values are rejected with `BAD_QUERY_PARAMETER_VALUE`."
    schema:
      type: integer
      format: int64
      default: 21
    example: 21
  - name: searchAfter
    in: query
    required: false
    description: Cursor returned by the preceding page. It is a JSON string
      containing `[RFC3339 persisted match creation timestamp, canonical
      ProductListing ID]`; send the returned tuple as this query parameter to
      continue. The timestamp and ProductListing ID make the ascending cursor
      tie-safe.
    schema:
      type: string
    example: '["2026-08-05T12:30:00Z","pl_6zydvb8xqqfcntt760grgm41t4"]'
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "200":
    description: Persisted search-filter matches retrieved successfully
    headers:
      Cache-Control:
        description: Cache control directive — always set to `no-store`
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/SearchFilterMatchProductCollectionData"
  "400":
    description: Bad request - invalid path or query parameter
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_search_after:
            summary: Malformed searchAfter cursor
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: searchAfter
                type: QUERY
              detail: searchAfter must contain an RFC3339 timestamp and ProductListing ID.
          invalid_size:
            summary: Malformed page size
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: size
                type: QUERY
          invalid_search_after_product_listing_id:
            summary: Noncanonical ProductListing ID in searchAfter
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: searchAfter
                type: QUERY
              detail: must be a valid ProductListing ID
          invalid_search_filter_id:
            summary: Invalid search filter ID format
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: userSearchFilterId
                type: PATH
              detail: must be a valid UserSearchFilter ID
  "401":
    description: Unauthorized - missing or invalid Cognito JWT or Aura access token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - Aura access token lacks the required
      `search-filters:write` scope
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: Search filter not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: SEARCH_FILTER_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: SEARCH_FILTER_INTERNAL_ERROR
  "503":
    description: Persisted-match details or pricing data are temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: SEARCH_FILTER_TEMPORARILY_UNAVAILABLE

```

### updateSearchFilterMatchFeedback → updateSearchFilterMatchFeedback

Old generated operation:

```ts
type UpdateSearchFilterMatchFeedbackData = {
    /**
     * Feedback patch for an existing search-filter product match.
     * An empty JSON object `{}` is valid.
     * Omitting `feedback` inside the JSON object leaves the stored feedback unchanged.
     *
     */
    body: PatchUserSearchFilterMatchData;
    path: {
        /**
         * Unique identifier of the saved search filter that produced the match
         */
        userSearchFilterId: string;
        /**
         * Unique identifier of the shop that owns the matched product
         */
        shopId: string;
        /**
         * Shop's own identifier of the matched product
         */
        shopsProductId: string;
    };
    query?: never;
    url: '/api/v1/me/search-filters/{userSearchFilterId}/matches/{shopId}/{shopsProductId}';
};
type UpdateSearchFilterMatchFeedbackResponses = {
    /**
     * Search-filter product match updated successfully
     */
    200: SearchFilterProductMatchData;
};
type UpdateSearchFilterMatchFeedbackErrors = {
    /**
     * Bad request - invalid parameters or body
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Search-filter product match not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<UpdateSearchFilterMatchFeedbackData, ThrowOnError>): RequestResult<UpdateSearchFilterMatchFeedbackResponses, UpdateSearchFilterMatchFeedbackErrors, ThrowOnError> => (options.client ?? client).patch<UpdateSearchFilterMatchFeedbackResponses, UpdateSearchFilterMatchFeedbackErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/search-filters/{userSearchFilterId}/matches/{shopId}/{shopsProductId}',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/search-filters/{userSearchFilterId}/matches/{productListingId}
method: patch
id: updateSearchFilterMatchFeedback
summary: Update feedback for a search-filter match
description: >
  Updates the authenticated user's feedback for a specific product match created
  by one of

  their saved search filters.

  The match is addressed by the search filter ID and canonical product ID.

  Requires a Cognito JWT or an Aura access token with `search-filters:write`.


  The request body itself is required and must be a JSON object, but the
  `feedback` field is optional:

  - `{"feedback": true}` marks the match as relevant.

  - `{"feedback": false}` marks the match as not relevant.

  - `{}` performs a no-op update and returns the existing stored match
  unchanged.
operationId: updateSearchFilterMatchFeedback
tags:
  - Search Filters
parameters:
  - name: userSearchFilterId
    in: path
    required: true
    description: Unique identifier of the saved search filter that produced the match
    schema:
      type: string
    example: sf_4hyqf0gyxveazss7nby5hve5x2
  - name: productListingId
    in: path
    required: true
    description: Canonical identifier of the matched product
    schema:
      type: string
    example: pl_6zydvb8xqqfcntt760grgm41t4
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  description: >
    Feedback patch for an existing search-filter product match.

    An empty JSON object `{}` is valid.

    Omitting `feedback` inside the JSON object leaves the stored feedback
    unchanged.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/PatchUserSearchFilterMatchData"
      examples:
        mark_match_as_relevant:
          summary: Mark the match as relevant
          value:
            feedback: true
        mark_match_as_not_relevant:
          summary: Mark the match as not relevant
          value:
            feedback: false
        no_op_patch:
          summary: No-op patch returning the existing match unchanged
          value: {}
responses:
  "200":
    description: Search-filter product match updated successfully
    headers:
      Last-Modified:
        description: When the search-filter product match was last updated
        schema:
          type: string
          format: http-date
        example: Wed, 01 Jan 2024 12:30:00 GMT
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/SearchFilterProductMatchData"
        examples:
          feedback_set_to_true:
            summary: Match feedback stored as relevant
            value:
              userId: usr_5pvhvpxyhve6ts31n9x8c2y513
              userSearchFilterId: sf_4hyqf0gyxveazss7nby5hve5x2
              productListingId: pl_6zydvb8xqqfcntt760grgm41t4
              originEventId: evt_08nrsmex2je2dvsyh01v2kh78a
              feedback: true
              created: 2024-01-01T10:00:00Z
              updated: 2024-01-01T12:30:00Z
          no_op_patch:
            summary: Empty patch returns the existing feedback state
            value:
              userId: usr_5pvhvpxyhve6ts31n9x8c2y513
              userSearchFilterId: sf_4hyqf0gyxveazss7nby5hve5x2
              productListingId: pl_6zydvb8xqqfcntt760grgm41t4
              originEventId: evt_08nrsmex2je2dvsyh01v2kh78a
              feedback: true
              created: 2024-01-01T10:00:00Z
              updated: 2024-01-01T10:00:00Z
  "400":
    description: Bad request - invalid parameters or body
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_search_filter_id:
            summary: Missing search filter ID
            value:
              status: 400
              title: Bad Request
              error: BAD_PATH_PARAMETER_VALUE
              source:
                field: userSearchFilterId
                type: PATH
          missing_product_id:
            summary: Missing product ID
            value:
              status: 400
              title: Bad Request
              error: BAD_PATH_PARAMETER_VALUE
              source:
                field: productListingId
                type: PATH
          invalid_search_filter_id:
            summary: Invalid search filter ID format
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: userSearchFilterId
                type: PATH
              detail: must be a valid UserSearchFilter ID
          invalid_product_id:
            summary: Invalid product ID format
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: productListingId
                type: PATH
              detail: must be a valid ProductListing ID
          missing_body:
            summary: Missing request body
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty
          invalid_body:
            summary: Invalid request body format
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
  "401":
    description: Unauthorized - missing or invalid Cognito JWT or Aura access token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - Aura access token lacks the required
      `search-filters:write` scope
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: Search-filter product match not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: SEARCH_FILTER_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### getWatchlistProducts → getWatchlistProductListings

Old generated operation:

```ts
type GetWatchlistProductsData = {
    body?: never;
    path?: never;
    query?: {
        /**
         * Currency for price display
         */
        currency?: CurrencyData;
        /**
         * Field to sort results by
         */
        sort?: SortWatchlistProductFieldData;
        /**
         * Sort order (only valid when sort is specified)
         */
        order?: 'asc' | 'desc';
        /**
         * RFC3339 timestamp for cursor-based pagination (search-after).
         * Depending on sort-order, returns watchlist-products created, either after this timestamp for asc (oldest first) or before this timestamp for desc (latest first).
         * In general you do not have to worry about determining this key. It's given with `searchAfter` in the preceding response if more entries are present.
         *
         */
        searchAfter?: string;
        /**
         * Number of products to return per page
         */
        size?: number;
        /**
         * Preferred language for localized content.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
    };
    url: '/api/v1/me/watchlist';
};
type GetWatchlistProductsResponses = {
    /**
     * Watchlist products retrieved successfully
     */
    200: WatchlistCollectionData;
};
type GetWatchlistProductsErrors = {
    /**
     * Bad request - invalid parameters
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<GetWatchlistProductsData, ThrowOnError>): RequestResult<GetWatchlistProductsResponses, GetWatchlistProductsErrors, ThrowOnError> => (options?.client ?? client).get<GetWatchlistProductsResponses, GetWatchlistProductsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/watchlist',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/watchlist
method: get
id: getWatchlistProductListings
summary: List user's watchlist product-listings
description: >
  Retrieves all product-listings in the authenticated user's watchlist in
  watchlist creation order.

  Each result contains current product data and complete user-specific state.

  Accepts Cognito JWT authentication or an Aura Historia access token with
  `watchlist:read`.
operationId: getWatchlistProductListings
tags:
  - Watchlist
parameters:
  - name: language
    in: query
    required: false
    description: Preferred language for localized content. Defaults to `en` when omitted.
    schema:
      $ref: "#/components/schemas/LanguageData"
    example: de
  - name: currency
    in: query
    required: false
    description: Display currency. Defaults to `EUR`.
    schema:
      $ref: "#/components/schemas/CurrencyData"
  - name: size
    in: query
    required: false
    description: ProductListings per page. Defaults to 21; values are clamped to 1..100.
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 21
  - name: searchAfter
    in: query
    required: false
    description: "JSON array cursor returned by the preceding page: [RFC3339
      timestamp, ProductListing ID]."
    schema:
      type: string
    example: '["2026-08-04T12:34:56Z", "pl_5xdb465tg1enarx2knf04mxbxj"]'
security:
  - BearerAuth: []
responses:
  "200":
    description: Watchlist product-listings retrieved successfully
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          type: object
          required:
            - items
            - size
          properties:
            items:
              type: array
              items:
                $ref: "#/components/schemas/PersonalizedProductListingDetailsData"
            size:
              type: integer
              minimum: 1
              maximum: 100
            searchAfter:
              type: array
              items:
                type: string
              minItems: 2
              maxItems: 2
              nullable: true
        example:
          items:
            - item:
                productListingId: pl_5xdb465tg1enarx2knf04mxbxj
                productListingTitleSlugId: smartphone-case-a1b2c3
                eventId: evt_69wh1chr82fen9vvyk6n3mh80m
                listingSourceId: ls_6rd827eqfefsva9teecmwa3ate
                sourceListingId: 6ba7b810
                listingSourceName: Tech Store
                title:
                  text: Smartphone Case
                  language: en
                availability: IN_STOCK
                lifecycle: ACTIVE
                url: https://tech-store.com/smartphone-case
                viewUrl: https://tech-store.com/smartphone-case?utm_source=aura_historia&utm_medium=referral
                images:
                  - url: https://tech-store.com/images/case-1.jpg
                contentPolicy:
                  decision: ALLOWED
                created: 2024-01-01T10:00:00Z
                updated: 2024-01-01T12:00:00Z
              userState:
                watchlist:
                  watching: true
                  notifications: false
                contentVisibility:
                  showUnassessedOrSensitiveContent: false
                notification:
                  unseenNotificationIds: []
                searchFilter:
                  matched: false
                  hidden: false
          size: 21
          searchAfter: null
  "400":
    description: Bad request - invalid parameters
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 400
          title: Bad Request
          error: BAD_QUERY_PARAMETER_VALUE
          detail: Query parameters are invalid.
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR
  "503":
    description: Product details, persisted FX snapshots, or notification state are
      temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: WATCHLIST_TEMPORARILY_UNAVAILABLE

```

### addWatchlistProduct → addWatchlistProduct

Old generated operation:

```ts
type AddWatchlistProductData = {
    /**
     * Product identifier to add to watchlist
     */
    body: ProductKeyData;
    path?: never;
    query?: {
        /**
         * Preferred language for localized content in the response.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
        /**
         * Currency for price display in the response.
         */
        currency?: CurrencyData;
    };
    url: '/api/v1/me/watchlist';
};
type AddWatchlistProductResponses = {
    /**
     * Product added to watchlist successfully
     */
    201: PersonalizedGetProductData;
};
type AddWatchlistProductErrors = {
    /**
     * Bad request - invalid request body
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * User not found
     */
    404: ApiError;
    /**
     * Unprocessable Entity - watchlist quota exceeded
     */
    422: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<AddWatchlistProductData, ThrowOnError>): RequestResult<AddWatchlistProductResponses, AddWatchlistProductErrors, ThrowOnError> => (options.client ?? client).post<AddWatchlistProductResponses, AddWatchlistProductErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/watchlist',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/watchlist
method: post
id: addWatchlistProduct
summary: Add product to watchlist
description: >
  Adds a product to the authenticated user's watchlist.

  The request body requires canonical `productListingId` and may set
  `notifications`; notifications default to `true`.

  Active-entry quota depends on the user's tier: Free users may have 20, Pro
  users 100,

  and Ultimate users have no active-entry limit. Adding beyond the active quota
  returns

  a 422 Unprocessable Entity error.

  Returns the created `WatchlistEntryData`.

  Requires a Cognito JWT or an Aura access token with `watchlist:write`.
operationId: addWatchlistProduct
tags:
  - Watchlist
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  description: Canonical product identifier and optional notification preference.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/PostWatchlistData"
      example:
        productListingId: pl_5xdb465tg1enarx2knf04mxbxj
        notifications: true
responses:
  "201":
    description: Watchlist entry created successfully
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/WatchlistEntryData"
        example:
          userId: usr_5pvhvpxyhve6ts31n9x8c2y513
          productListingId: pl_5xdb465tg1enarx2knf04mxbxj
          notifications: true
          state: ACTIVE
  "400":
    description: Bad request - invalid request body
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Missing request body
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty
          invalid_json:
            summary: Invalid JSON format
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Invalid JSON format
  "401":
    description: Unauthorized - missing or invalid Cognito JWT or Aura access token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - Aura access token lacks the required `watchlist:write` scope
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: User or ProductListing not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          user_not_found:
            value:
              status: 404
              title: Not Found
              error: USER_NOT_FOUND
          product_listing_not_found:
            value:
              status: 404
              title: Not Found
              error: PRODUCT_LISTING_NOT_FOUND
  "409":
    description: Watchlist entry already exists, or the ProductListing is withdrawn
      and cannot be watched
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          already_exists:
            value:
              status: 409
              title: Conflict
              error: CONFLICT
              detail: Watchlist entry already exists.
          product_listing_unavailable:
            value:
              status: 409
              title: Conflict
              error: PRODUCT_LISTING_UNAVAILABLE
              detail: ProductListing is unavailable.
  "422":
    description: Unprocessable Entity - watchlist quota exceeded
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 422
          title: Unprocessable Content
          error: WATCHLIST_QUOTA_EXCEEDED
          detail: Exceeded the maximum amount of watchlist entries. There are already
            20/20 active watchlist entries occupied.
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### adminSearchUsers → adminSearchUsers

Old generated operation:

```ts
type AdminSearchUsersData = {
    body?: never;
    path?: never;
    query?: {
        /**
         * Optional fuzzy full-text query across email, first name, last name, and Stripe customer ID.
         */
        query?: string;
        /**
         * Optional fuzzy email-only search term.
         */
        email?: string;
        /**
         * Optional fuzzy first-name search term.
         */
        firstName?: string;
        /**
         * Optional fuzzy last-name search term.
         */
        lastName?: string;
        /**
         * Optional filter by one or more user subscription tiers.
         */
        tier?: Array<UserTierData>;
        /**
         * Optional filter by one or more user roles.
         */
        role?: Array<UserRoleData>;
        /**
         * Optional filter by one or more structured-address country codes (ISO 3166-1 alpha-2).
         */
        country?: Array<CountryCodeData>;
        /**
         * Optional filter by one or more structured-address continents.
         */
        continent?: Array<ContinentData>;
        /**
         * Optional geospatial proximity filter for the user's indexed coordinates.
         * Use deep-object encoding with `geoAddress[lat]`, `geoAddress[lon]`, `geoAddress[distance][amount]`, and `geoAddress[distance][unit]`.
         *
         */
        geoAddress?: GeoDistanceQueryData;
        /**
         * Optional lower bound for the user's `created` timestamp (RFC3339).
         */
        'created[min]'?: string;
        /**
         * Optional upper bound for the user's `created` timestamp (RFC3339).
         */
        'created[max]'?: string;
        /**
         * Optional lower bound for the user's `updated` timestamp (RFC3339).
         */
        'updated[min]'?: string;
        /**
         * Optional upper bound for the user's `updated` timestamp (RFC3339).
         */
        'updated[max]'?: string;
        /**
         * Field used for ordering results.
         * To override the backend default ordering, provide both `sort` and `order`.
         *
         */
        sort?: SortUserFieldData;
        /**
         * Sort direction for `sort`.
         * Ignored unless `sort` is also provided.
         *
         */
        order?: 'asc' | 'desc';
        /**
         * Cursor for keyset pagination.
         * Pass the `searchAfter` array returned by the previous response to fetch the next page.
         *
         */
        searchAfter?: Array<unknown>;
        /**
         * Maximum number of users the backend should request from OpenSearch for the current page.
         */
        size?: number;
    };
    url: '/api/v1/users';
};
type AdminSearchUsersResponses = {
    /**
     * Users returned successfully.
     */
    200: UserCollectionData;
};
type AdminSearchUsersErrors = {
    /**
     * Bad request - invalid query parameters.
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Forbidden - this endpoint requires the `ADMIN` role.
     */
    403: ApiError;
    /**
     * User not found - the authenticated requester does not have a persisted user record.
     */
    404: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<AdminSearchUsersData, ThrowOnError>): RequestResult<AdminSearchUsersResponses, AdminSearchUsersErrors, ThrowOnError> => (options?.client ?? client).get<AdminSearchUsersResponses, AdminSearchUsersErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/users',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/admin/users
method: get
id: adminSearchUsers
summary: Search users as admin
description: >
  Searches users across all accounts for authenticated administrators.

  Text filters use case-insensitive substring matching. `query` searches email,

  first name, and last name; `email`, `firstName`, and `lastName` restrict the

  match to one field. `tier` and `role` filters use exact values.

  Results use deterministic keyset pagination. The default sort is `name`
  ascending;

  override it by providing both `sort` and `order`. Every sort uses `userId` as
  a

  deterministic tie-breaker. This response always uses `Cache-Control:
  no-store`.
operationId: adminSearchUsers
tags:
  - User Account
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: query
    in: query
    required: false
    description: Optional case-insensitive substring query across email, first name,
      and last name.
    schema:
      type: string
    example: ada
  - name: email
    in: query
    required: false
    description: Optional case-insensitive substring filter for the email address.
    schema:
      type: string
    example: ada@example.com
  - name: firstName
    in: query
    required: false
    description: Optional case-insensitive substring filter for the first name.
    schema:
      type: string
    example: Ada
  - name: lastName
    in: query
    required: false
    description: Optional case-insensitive substring filter for the last name.
    schema:
      type: string
    example: Lovelace
  - name: tier
    in: query
    required: false
    description: Optional filter by one or more user subscription tiers.
    style: form
    explode: true
    schema:
      type: array
      items:
        $ref: "#/components/schemas/UserTierData"
      uniqueItems: true
    example:
      - PRO
      - ULTIMATE
  - name: role
    in: query
    required: false
    description: Optional filter by one or more user roles.
    style: form
    explode: true
    schema:
      type: array
      items:
        $ref: "#/components/schemas/UserRoleData"
      uniqueItems: true
    example:
      - ADMIN
  - name: created[min]
    in: query
    required: false
    description: Optional lower bound for the user's `created` timestamp (RFC3339).
    schema:
      type: string
      format: date-time
    example: 2026-01-01T00:00:00Z
  - name: created[max]
    in: query
    required: false
    description: Optional upper bound for the user's `created` timestamp (RFC3339).
    schema:
      type: string
      format: date-time
    example: 2026-12-31T23:59:59Z
  - name: updated[min]
    in: query
    required: false
    description: Optional lower bound for the user's `updated` timestamp (RFC3339).
    schema:
      type: string
      format: date-time
    example: 2026-04-01T00:00:00Z
  - name: updated[max]
    in: query
    required: false
    description: Optional upper bound for the user's `updated` timestamp (RFC3339).
    schema:
      type: string
      format: date-time
    example: 2026-04-25T23:59:59Z
  - name: sort
    in: query
    required: false
    description: >
      Field used for ordering results. Valid fields are `name`, `email`,
      `firstName`, `lastName`, `tier`, `role`, `created`, and `updated`.

      The default is `name` ascending. To override it, provide both `sort` and
      `order`.
    schema:
      $ref: "#/components/schemas/SortUserFieldData"
    example: email
  - name: order
    in: query
    required: false
    description: >
      Sort direction for `sort`. Ignored unless `sort` is also provided; when
      both are absent, results use `name` ascending.
    schema:
      type: string
      enum:
        - asc
        - desc
    example: asc
  - name: searchAfter
    in: query
    required: false
    description: >
      Opaque User ID cursor for keyset pagination. Pass the `searchAfter` string
      returned by the previous response to fetch the next page.

      Requests may also provide the legacy JSON array form when its final
      element is a valid User ID. The cursor is valid only with the same filters
      and sort used for the previous page.
    schema:
      type: string
    example: usr_01jw7j4azge008000000000004
  - name: sort
  - name: size
    in: query
    required: false
    description: Number of users requested per page. The server clamps values to the
      inclusive range 1–100.
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 21
    example: 21
responses:
  "200":
    description: Users returned successfully.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only
          user read.
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/UserCollectionData"
        example:
          items:
            - userId: usr_5pvhvpxyhve6ts31n9x8c2y513
              email: ada.admin@example.com
              firstName: Ada
              lastName: Lovelace
              tier: ULTIMATE
              role: ADMIN
              stripeCustomerId: cus_admin_550e8400e29b41d4a716446655440000
            - userId: usr_681w9znhe8eawrhebxd1046d44
              email: grace.user@example.com
              firstName: Grace
              lastName: Hopper
              tier: PRO
              role: USER
          size: 2
          searchAfter: usr_681w9znhe8eawrhebxd1046d44
  "400":
    description: Bad request - invalid query parameters.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_query:
            summary: Invalid query parameter
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
          invalid_sort_field:
            summary: Invalid sort field
            value:
              status: 400
              title: Bad Request
              error: BAD_SORT_VALUE
              source:
                field: sort
                type: QUERY
              detail: "Expected any of: 'name', 'email', 'firstName', 'lastName', 'tier',
                'role', 'updated', 'created'. Got: 'invalid'"
          invalid_order:
            summary: Invalid sort order
            value:
              status: 400
              title: Bad Request
              error: BAD_ORDER_VALUE
              source:
                field: order
                type: QUERY
              detail: "Expected any of: 'asc', 'desc'. Got: 'invalid'"
          invalid_search_after:
            summary: Invalid searchAfter cursor
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: searchAfter
                type: QUERY
              detail: searchAfter must contain a valid User ID.
          invalid_size:
            summary: Invalid page size
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: size
                type: QUERY
              detail: invalid digit found in string
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role and
      `users:read` capability when delegated.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "500":
    description: Internal authentication or user search failure
      (`AUTH_INTERNAL_ERROR` or `USER_INTERNAL_ERROR`).
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: USER_INTERNAL_ERROR
  "503":
    description: Authentication, authorization, or user search data is temporarily
      unavailable (`AUTH_TEMPORARILY_UNAVAILABLE` or
      `USER_TEMPORARILY_UNAVAILABLE`).
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: USER_TEMPORARILY_UNAVAILABLE

```

### adminDeleteUser → adminDeleteUser

Old generated operation:

```ts
type AdminDeleteUserData = {
    body?: never;
    path: {
        /**
         * Unique identifier (UUID) of the user to delete.
         */
        userId: string;
    };
    query?: never;
    url: '/api/v1/users/{userId}';
};
type AdminDeleteUserResponses = {
    /**
     * User deleted successfully.
     */
    204: void;
};
type AdminDeleteUserErrors = {
    /**
     * Unauthorized - invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Forbidden - this endpoint requires the `ADMIN` role.
     */
    403: ApiError;
    /**
     * User not found.
     */
    404: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<AdminDeleteUserData, ThrowOnError>): RequestResult<AdminDeleteUserResponses, AdminDeleteUserErrors, ThrowOnError> => (options.client ?? client).delete<AdminDeleteUserResponses, AdminDeleteUserErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/users/{userId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/admin/users/{userId}
method: delete
id: adminDeleteUser
summary: Delete a user as admin
description: >
  Deletes a user account for authenticated administrators.

  Cognito JWTs and Aura Historia access tokens are accepted; delegated access
  tokens require `users:write`.

  The caller's persisted user role must be `ADMIN`; this authorization is
  enforced in the User service.

  PostgreSQL synchronously cascades user-owned access tokens, OAuth
  authorization codes, watchlist entries, saved-search filters and matches,
  notifications, partnership memberships, and partnership applications.

  The final active administrator cannot be deleted, including through a
  self-targeted admin request.
operationId: adminDeleteUser
tags:
  - User Account
parameters:
  - name: userId
    in: path
    required: true
    description: Unique User ID for the user to delete.
    schema:
      type: string
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "204":
    description: User deleted successfully.
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
  "400":
    description: Bad request - the user ID is invalid.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 400
          title: Bad Request
          error: INVALID_OBJECT_ID
          source:
            field: userId
            type: PATH
          detail: must be a valid User ID
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role; delegated
      access tokens also require `users:write`.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: User not found.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
          detail: User was not found.
  "409":
    description: Conflict - the target state prevents deletion, including removal of
      the final active administrator.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 409
          title: Conflict
          error: CONFLICT
          detail: At least one active administrator must remain.
  "500":
    description: Internal server error.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: USER_INTERNAL_ERROR
  "503":
    description: User authorization or persistence is temporarily unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: USER_TEMPORARILY_UNAVAILABLE

```

### adminGetUser → adminGetUser

Old generated operation:

```ts
type AdminGetUserData = {
    body?: never;
    path: {
        /**
         * Unique identifier (UUID) of the user to retrieve.
         */
        userId: string;
    };
    query?: never;
    url: '/api/v1/users/{userId}';
};
type AdminGetUserResponses = {
    /**
     * User returned successfully.
     */
    200: GetUserAccountData;
};
type AdminGetUserErrors = {
    /**
     * Unauthorized - invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Forbidden - this endpoint requires the `ADMIN` role.
     */
    403: ApiError;
    /**
     * User not found.
     */
    404: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<AdminGetUserData, ThrowOnError>): RequestResult<AdminGetUserResponses, AdminGetUserErrors, ThrowOnError> => (options.client ?? client).get<AdminGetUserResponses, AdminGetUserErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/users/{userId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/admin/users/{userId}
method: get
id: adminGetUser
summary: Get a user as admin
description: >
  Retrieves a single user account by user ID for authenticated administrators.

  Cognito JWTs and Aura Historia access tokens are accepted; delegated access
  tokens require `users:read`.

  The response always sends `Cache-Control: no-store`.
operationId: adminGetUser
tags:
  - User Account
parameters:
  - name: userId
    in: path
    required: true
    description: Unique User ID for the user to retrieve.
    schema:
      type: string
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "200":
    description: User returned successfully.
    headers:
      Cache-Control:
        description: Caching directive. Always set to `no-store`.
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/AdminUserAccountData"
        example:
          userId: usr_5pvhvpxyhve6ts31n9x8c2y513
          email: ada.admin@example.com
          firstName: Ada
          lastName: Lovelace
          language: en
          currency: EUR
          showUnassessedOrSensitiveContent: true
          tier: ULTIMATE
          role: ADMIN
          stripeCustomerId: cus_admin_550e8400e29b41d4a716446655440000
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role and
      `users:read` capability when delegated.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: User not found.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
          detail: User was not found.
  "500":
    description: Internal server error.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: USER_INTERNAL_ERROR

```

### adminPatchUser → adminPatchUser

Old generated operation:

```ts
type AdminPatchUserData = {
    /**
     * Partial admin-only user update payload.
     */
    body: PatchAdminUserData;
    path: {
        /**
         * Unique identifier (UUID) of the user to update.
         */
        userId: string;
    };
    query?: never;
    url: '/api/v1/users/{userId}';
};
type AdminPatchUserResponses = {
    /**
     * User updated successfully.
     */
    200: GetUserAccountData;
};
type AdminPatchUserErrors = {
    /**
     * Bad request - missing or invalid request body.
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Forbidden - this endpoint requires the `ADMIN` role.
     */
    403: ApiError;
    /**
     * User not found.
     */
    404: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<AdminPatchUserData, ThrowOnError>): RequestResult<AdminPatchUserResponses, AdminPatchUserErrors, ThrowOnError> => (options.client ?? client).patch<AdminPatchUserResponses, AdminPatchUserErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/users/{userId}',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/admin/users/{userId}
method: patch
id: adminPatchUser
summary: Update a user as admin
description: >
  Partially updates a user account for authenticated administrators.

  Cognito JWTs and Aura Historia access tokens are accepted; delegated access
  tokens require `users:write`.

  The caller's persisted user role must be `ADMIN`; this authorization is
  enforced in the service layer.

  All request fields are optional, but the request body itself must be present
  and non-empty.

  Send only one logical change category per request: profile/preferences fields,
  `role`, or `tier`.

  An empty JSON object (`{}`) is accepted and returns the existing user
  unchanged.

  Demoting the last active administrator is rejected with `409 CONFLICT`.
operationId: adminPatchUser
tags:
  - User Account
parameters:
  - name: userId
    in: path
    required: true
    description: Unique User ID for the user to update.
    schema:
      type: string
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  description: Partial admin-only user update payload.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/PatchAdminUserData"
      examples:
        update_role:
          summary: Promote a user
          value:
            role: ADMIN
        update_tier:
          summary: Upgrade the tier
          value:
            tier: ULTIMATE
        update_profile:
          summary: Update profile settings
          value:
            firstName: Ada
            lastName: Lovelace
            language: en
            currency: EUR
            showUnassessedOrSensitiveContent: true
responses:
  "200":
    description: User updated successfully.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only
          user mutation.
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/AdminUserAccountData"
        example:
          userId: usr_5pvhvpxyhve6ts31n9x8c2y513
          email: ada.admin@example.com
          firstName: Ada
          lastName: Lovelace
          language: en
          currency: EUR
          showUnassessedOrSensitiveContent: true
          tier: ULTIMATE
          role: ADMIN
          stripeCustomerId: cus_admin_550e8400e29b41d4a716446655440000
  "400":
    description: Bad request - missing or invalid request body.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Missing request body
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty
          invalid_body:
            summary: Invalid request body
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role; delegated
      access tokens also require `users:write`.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: This action requires the 'ADMIN' role.
  "404":
    description: User not found.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
          detail: User with UserId 'usr_5pvhvpxyhve6ts31n9x8c2y513' not found.
  "409":
    description: Conflict - the last active administrator cannot be demoted.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 409
          title: Conflict
          error: CONFLICT
          detail: At least one active administrator must remain.
  "500":
    description: Internal server error.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### deleteUser → deleteUser

Old generated operation:

```ts
type DeleteUserData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/v1/me';
};
type DeleteUserResponses = {
    /**
     * User deleted successfully
     */
    204: void;
};
type DeleteUserErrors = {
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * User not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<DeleteUserData, ThrowOnError>): RequestResult<DeleteUserResponses, DeleteUserErrors, ThrowOnError> => (options?.client ?? client).delete<DeleteUserResponses, DeleteUserErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me
method: delete
id: deleteUser
summary: Delete authenticated user
description: >
  Permanently deletes the authenticated user's account.

  The deletion is performed synchronously and the access token is immediately
  invalidated upon success.

  Cognito JWTs and Aura Historia access tokens are accepted; delegated access
  tokens require `users:write`.

  The last active administrator cannot be deleted.
operationId: deleteUser
tags:
  - User Account
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "204":
    description: User deleted successfully
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
  "401":
    description: Unauthorized - invalid or missing bearer credentials
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "404":
    description: User not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
  "409":
    description: Conflict - the last active administrator cannot be deleted
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 409
          title: Conflict
          error: CONFLICT
          detail: At least one active administrator must remain.
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### getUserAccount → getUserAccount

Old generated operation:

```ts
type GetUserAccountData2 = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/v1/me/account';
};
type GetUserAccountResponses = {
    /**
     * User account data retrieved successfully
     */
    200: GetUserAccountData;
};
type GetUserAccountErrors = {
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * User not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<GetUserAccountData2, ThrowOnError>): RequestResult<GetUserAccountResponses, GetUserAccountErrors, ThrowOnError> => (options?.client ?? client).get<GetUserAccountResponses, GetUserAccountErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/account',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/account
method: get
id: getUserAccount
summary: Get user account data
description: >
  Retrieves the authenticated user's account information including email, name,
  language and currency preferences,

  the `showUnassessedOrSensitiveContent` preference, the user's subscription
  tier, and the user's role.

  Requires valid Cognito JWT authentication.
operationId: getUserAccount
tags:
  - User Account
security:
  - BearerAuth: []
responses:
  "200":
    description: User account data retrieved successfully
    headers:
      Last-Modified:
        description: When the user account was last updated
        schema:
          type: string
          format: http-date
        example: Wed, 01 Jan 2024 12:00:00 GMT
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/OwnUserAccountData"
        example:
          userId: usr_5pvhvpxyhve6ts31n9x8c2y513
          email: user@example.com
          firstName: John
          lastName: Doe
          language: en
          currency: EUR
          showUnassessedOrSensitiveContent: false
          tier: FREE
          role: USER
          created: 2024-01-01T10:00:00Z
          updated: 2024-01-01T12:00:00Z
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "404":
    description: User not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### updateUserAccount → updateUserAccount

Old generated operation:

```ts
type UpdateUserAccountData = {
    /**
     * Partial user account update data.
     * All fields are optional - only provided fields will be updated.
     *
     */
    body: PatchUserAccountData;
    path?: never;
    query?: never;
    url: '/api/v1/me/account';
};
type UpdateUserAccountResponses = {
    /**
     * User account updated successfully
     */
    200: GetUserAccountData;
};
type UpdateUserAccountErrors = {
    /**
     * Bad request - invalid request body
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * User not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<UpdateUserAccountData, ThrowOnError>): RequestResult<UpdateUserAccountResponses, UpdateUserAccountErrors, ThrowOnError> => (options.client ?? client).patch<UpdateUserAccountResponses, UpdateUserAccountErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/account',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/account
method: patch
id: updateUserAccount
summary: Update user account data
description: >
  Updates the authenticated user's account information.

  All fields in the request body are optional - only provided fields will be
  updated.

  The user's `role` is returned in the response but cannot be updated through
  this endpoint.

  Returns the updated user account data.

  Requires valid Cognito JWT authentication.
operationId: updateUserAccount
tags:
  - User Account
security:
  - BearerAuth: []
requestBody:
  required: true
  description: |
    Partial user account update data.
    All fields are optional - only provided fields will be updated.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/PatchUserAccountData"
      examples:
        update_all:
          summary: Update all fields
          value:
            firstName: Jane
            lastName: Smith
            language: de
            currency: USD
            showUnassessedOrSensitiveContent: true
        update_name_only:
          summary: Update name only
          value:
            firstName: Jane
            lastName: Smith
        update_preferences_only:
          summary: Update language and currency only
          value:
            language: fr
            currency: GBP
        update_content_visibility_preference_only:
          summary: Update content visibility preference only
          value:
            showUnassessedOrSensitiveContent: true
responses:
  "200":
    description: User account updated successfully
    headers:
      Last-Modified:
        description: When the user account was last updated
        schema:
          type: string
          format: http-date
        example: Wed, 01 Jan 2024 12:30:00 GMT
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/OwnUserAccountData"
        example:
          userId: usr_5pvhvpxyhve6ts31n9x8c2y513
          email: jane.smith@example.com
          firstName: Jane
          lastName: Smith
          language: de
          currency: USD
          showUnassessedOrSensitiveContent: true
          tier: FREE
          role: USER
          created: 2024-01-01T10:00:00Z
          updated: 2024-01-01T12:30:00Z
  "400":
    description: Bad request - invalid request body
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Missing request body
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty
          invalid_json:
            summary: Invalid JSON format
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Invalid JSON format
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "404":
    description: User not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### getMyAccessTokens → getMyAccessTokens

Old generated operation:

```ts
type GetMyAccessTokensData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/v1/me/access-tokens';
};
type GetMyAccessTokensResponses = {
    /**
     * Access tokens retrieved successfully
     */
    200: Array<GetAccessTokenData>;
};
type GetMyAccessTokensErrors = {
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * User not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<GetMyAccessTokensData, ThrowOnError>): RequestResult<GetMyAccessTokensResponses, GetMyAccessTokensErrors, ThrowOnError> => (options?.client ?? client).get<GetMyAccessTokensResponses, GetMyAccessTokensErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/access-tokens',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/access-tokens
method: get
id: getMyAccessTokens
summary: List Aura Historia access tokens
description: >
  Lists the authenticated user's non-expired Aura Historia access tokens.

  The `token` field is masked on this endpoint and does not reveal the plaintext
  bearer token again.

  Requires valid Cognito JWT authentication.
operationId: getMyAccessTokens
tags:
  - User Account
security:
  - BearerAuth: []
responses:
  "200":
    description: Access tokens retrieved successfully
    headers:
      Cache-Control:
        description: Caching directive. Always set to `no-store`.
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          type: array
          items:
            $ref: "#/components/schemas/GetAccessTokenData"
        examples:
          one_token:
            summary: One non-expired access token
            value:
              - accessTokenId: at_4ck23tcv0meqqrbyjaka24ra6g
                name: Partner product sync
                scope:
                  - product-listings:write
                token: aurahistoria_abcdefghijk_****
                tokenType: BEARER
                expiresAt: 2026-06-30T00:00:00Z
                expiresIn: 2851200
                created: 2026-05-28T06:30:00Z
                updated: 2026-05-28T06:30:00Z
          no_tokens:
            summary: No non-expired access tokens exist
            value: []
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "404":
    description: User not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### patchMyAccessToken → patchMyAccessToken

Old generated operation:

```ts
type PatchMyAccessTokenData = {
    /**
     * Partial access-token update payload.
     */
    body: PatchAccessTokenData;
    path?: never;
    query?: never;
    url: '/api/v1/me/access-tokens';
};
type PatchMyAccessTokenResponses = {
    /**
     * Access token updated successfully
     */
    200: GetAccessTokenData;
};
type PatchMyAccessTokenErrors = {
    /**
     * Bad request - missing, empty, or invalid JSON body
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Access token not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PatchMyAccessTokenData, ThrowOnError>): RequestResult<PatchMyAccessTokenResponses, PatchMyAccessTokenErrors, ThrowOnError> => (options.client ?? client).patch<PatchMyAccessTokenResponses, PatchMyAccessTokenErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/access-tokens',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/access-tokens
method: patch
id: patchMyAccessToken
summary: Update an Aura Historia access token
description: >
  Updates metadata for one access token owned by the authenticated user. Omitted
  properties

  remain unchanged; `expires: null` clears expiry. `name` and `scopes` reject
  `null`; use

  `scopes: []` to clear scopes.

  Requires valid Cognito JWT authentication.
operationId: patchMyAccessToken
tags:
  - User Account
security:
  - BearerAuth: []
requestBody:
  required: true
  description: Partial access-token update payload.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/PatchAccessTokenData"
      example:
        accessTokenId: at_4ck23tcv0meqqrbyjaka24ra6g
        name: Renamed partner sync token
        scopes:
          - product-listings:write
        expires: 2026-07-31T00:00:00Z
responses:
  "200":
    description: Access token updated successfully
    headers:
      Cache-Control:
        description: Caching directive. Always set to `no-store`.
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/GetAccessTokenData"
        example:
          accessTokenId: at_4ck23tcv0meqqrbyjaka24ra6g
          name: Renamed partner sync token
          scope:
            - product-listings:write
          token: aurahistoria_abcdefghijk_****
          tokenType: BEARER
          expiresAt: 2026-07-31T00:00:00Z
          expiresIn: 5529600
          created: 2026-05-28T06:30:00Z
          updated: 2026-05-28T07:00:00Z
  "400":
    description: Bad request - missing, empty, or invalid JSON body
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Missing request body
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty
          invalid_access_token_id:
            summary: Invalid access token identifier in request body
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: accessTokenId
                type: BODY
              detail: must be a valid AccessToken ID
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "404":
    description: Access token not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: ACCESS_TOKEN_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### postMyAccessToken → postMyAccessToken

Old generated operation:

```ts
type PostMyAccessTokenData = {
    /**
     * Access-token creation payload.
     */
    body: PostAccessTokenData;
    path?: never;
    query?: never;
    url: '/api/v1/me/access-tokens';
};
type PostMyAccessTokenResponses = {
    /**
     * Access token created successfully
     */
    201: GetAccessTokenData;
};
type PostMyAccessTokenErrors = {
    /**
     * Bad request - missing, empty, or invalid JSON body
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * User not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PostMyAccessTokenData, ThrowOnError>): RequestResult<PostMyAccessTokenResponses, PostMyAccessTokenErrors, ThrowOnError> => (options.client ?? client).post<PostMyAccessTokenResponses, PostMyAccessTokenErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/access-tokens',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/access-tokens
method: post
id: postMyAccessToken
summary: Create an Aura Historia access token
description: >
  Creates a new Aura Historia access token for the authenticated user.

  The plaintext bearer token is returned only in this create response; later
  reads return a masked token value.

  Requires valid Cognito JWT authentication.
operationId: postMyAccessToken
tags:
  - User Account
security:
  - BearerAuth: []
requestBody:
  required: true
  description: Access-token creation payload.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/PostAccessTokenData"
      example:
        name: Partner product sync
        scope:
          - product-listings:write
        expiresAt: 2026-06-30T00:00:00Z
responses:
  "201":
    description: Access token created successfully
    headers:
      Cache-Control:
        description: Caching directive. Always set to `no-store`.
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/GetAccessTokenData"
        example:
          accessTokenId: at_4ck23tcv0meqqrbyjaka24ra6g
          name: Partner product sync
          scope:
            - product-listings:write
          token: aurahistoria_abcdefghijk_abcdefghijklmnopqrstuvwxyz1234567
          tokenType: BEARER
          expiresAt: 2026-06-30T00:00:00Z
          expiresIn: 2851200
          created: 2026-05-28T06:30:00Z
          updated: 2026-05-28T06:30:00Z
  "400":
    description: Bad request - missing, empty, or invalid JSON body
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Missing request body
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty
          invalid_scope:
            summary: Unsupported access-token scope value
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: "unknown scope `product-listings_write`, expected one of:
                product-listings:write, users:read, users:write,
                access-tokens:read, access-tokens:write, search-filters:write,
                watchlist:read, watchlist:write"
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "404":
    description: User not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### deleteMyAccessToken → deleteMyAccessToken

Old generated operation:

```ts
type DeleteMyAccessTokenData = {
    body?: never;
    path: {
        /**
         * Unique identifier of the access token to delete
         */
        accessTokenId: string;
    };
    query?: never;
    url: '/api/v1/me/access-tokens/{accessTokenId}';
};
type DeleteMyAccessTokenResponses = {
    /**
     * Access token deleted successfully
     */
    204: void;
};
type DeleteMyAccessTokenErrors = {
    /**
     * Bad request - invalid or missing access-token path parameter
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Access token not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<DeleteMyAccessTokenData, ThrowOnError>): RequestResult<DeleteMyAccessTokenResponses, DeleteMyAccessTokenErrors, ThrowOnError> => (options.client ?? client).delete<DeleteMyAccessTokenResponses, DeleteMyAccessTokenErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/access-tokens/{accessTokenId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/access-tokens/{accessTokenId}
method: delete
id: deleteMyAccessToken
summary: Delete an Aura Historia access token
description: >
  Deletes one access token owned by the authenticated user.

  The token to delete is identified by the required `{accessTokenId}` path
  parameter.

  Cognito JWTs and Aura Historia access tokens are accepted; delegated access
  tokens require `access-tokens:write`.

  The operation is idempotent: an already-revoked or missing token is a
  successful no-op and returns `204 No Content`.
operationId: deleteMyAccessToken
tags:
  - User Account
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: accessTokenId
    in: path
    required: true
    description: Unique identifier of the access token to delete
    schema:
      type: string
      example: at_4ck23tcv0meqqrbyjaka24ra6g
responses:
  "204":
    description: Access token deleted successfully, or already absent for the
      authenticated user
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
  "400":
    description: Bad request - invalid or missing access-token path parameter
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_access_token_id:
            summary: Missing access-token path parameter
            value:
              status: 400
              title: Bad Request
              error: BAD_PATH_PARAMETER_VALUE
              source:
                field: accessTokenId
                type: PATH
              detail: Missing field 'accessTokenId'.
          invalid_access_token_id:
            summary: Invalid access-token identifier
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: accessTokenId
                type: PATH
              detail: must be a valid AccessToken ID
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### getMyAccessToken → getMyAccessToken

Old generated operation:

```ts
type GetMyAccessTokenData = {
    body?: never;
    path: {
        /**
         * Unique identifier of the access token
         */
        accessTokenId: string;
    };
    query?: never;
    url: '/api/v1/me/access-tokens/{accessTokenId}';
};
type GetMyAccessTokenResponses = {
    /**
     * Access token retrieved successfully
     */
    200: GetAccessTokenData;
};
type GetMyAccessTokenErrors = {
    /**
     * Bad request - invalid or missing access-token path parameter
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Access token not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetMyAccessTokenData, ThrowOnError>): RequestResult<GetMyAccessTokenResponses, GetMyAccessTokenErrors, ThrowOnError> => (options.client ?? client).get<GetMyAccessTokenResponses, GetMyAccessTokenErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/access-tokens/{accessTokenId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/access-tokens/{accessTokenId}
method: get
id: getMyAccessToken
summary: Get one Aura Historia access token
description: >
  Retrieves one non-expired Aura Historia access token owned by the
  authenticated user.

  The `token` field is masked on this endpoint and does not reveal the plaintext
  bearer token again.

  Requires valid Cognito JWT authentication.
operationId: getMyAccessToken
tags:
  - User Account
security:
  - BearerAuth: []
parameters:
  - name: accessTokenId
    in: path
    required: true
    description: Unique identifier of the access token
    schema:
      type: string
      example: at_4ck23tcv0meqqrbyjaka24ra6g
responses:
  "200":
    description: Access token retrieved successfully
    headers:
      Cache-Control:
        description: Caching directive. Always set to `no-store`.
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/GetAccessTokenData"
        example:
          accessTokenId: at_4ck23tcv0meqqrbyjaka24ra6g
          name: Partner product sync
          scope:
            - product-listings:write
          token: aurahistoria_abcdefghijk_****
          tokenType: BEARER
          expiresAt: 2026-06-30T00:00:00Z
          expiresIn: 2851200
          created: 2026-05-28T06:30:00Z
          updated: 2026-05-28T06:30:00Z
  "400":
    description: Bad request - invalid or missing access-token path parameter
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_access_token_id:
            summary: Missing access-token path parameter
            value:
              status: 400
              title: Bad Request
              error: BAD_PATH_PARAMETER_VALUE
              source:
                field: accessTokenId
                type: PATH
              detail: Missing field 'accessTokenId'.
          invalid_access_token_id:
            summary: Invalid access-token identifier
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: accessTokenId
                type: PATH
              detail: must be a valid AccessToken ID
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "404":
    description: Access token not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: ACCESS_TOKEN_NOT_FOUND
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### postBillingCheckout → postBillingCheckout

Old generated operation:

```ts
type PostBillingCheckoutData2 = {
    /**
     * Desired subscription plan and billing cycle for the new Stripe checkout session.
     */
    body: PostBillingCheckoutData;
    path?: never;
    query?: never;
    url: '/api/v1/me/billing/checkout';
};
type PostBillingCheckoutResponses = {
    /**
     * Checkout session created successfully
     */
    201: BillingSessionUrlData;
};
type PostBillingCheckoutErrors = {
    /**
     * Bad request - request body is missing, empty, malformed JSON, or contains unsupported enum values
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * User not found
     */
    404: ApiError;
    /**
     * Conflict - the authenticated user already has a Stripe customer record
     */
    409: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PostBillingCheckoutData2, ThrowOnError>): RequestResult<PostBillingCheckoutResponses, PostBillingCheckoutErrors, ThrowOnError> => (options.client ?? client).post<PostBillingCheckoutResponses, PostBillingCheckoutErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/billing/checkout',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/billing/checkout
method: post
id: postBillingCheckout
summary: Create Stripe checkout session
description: >
  Creates a hosted Stripe Checkout session for the authenticated user to start a
  subscription.

  The request body selects the desired subscription plan and billing cycle.

  The backend first creates and persists a Stripe customer for the user, then
  creates a

  subscription-mode Checkout session for that customer. Stripe and PostgreSQL
  are separate

  systems; an association remains persisted if later session creation fails.

  This endpoint can only be used when the user does not already have a
  `stripe_customer_id`.

  Requires Cognito JWT or Aura Historia access-token authentication. Delegated
  access tokens require `users:read`.
operationId: postBillingCheckout
tags:
  - Billing
security:
  - BearerAuth: []
requestBody:
  required: true
  description: Desired subscription plan and billing cycle for the new Stripe
    checkout session.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/PostBillingCheckoutData"
      examples:
        pro_monthly:
          summary: Create a monthly Pro checkout session
          value:
            plan: PRO
            cycle: MONTHLY
        ultimate_yearly:
          summary: Create a yearly Ultimate checkout session
          value:
            plan: ULTIMATE
            cycle: YEARLY
responses:
  "201":
    description: Checkout session created successfully
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/BillingSessionUrlData"
        example:
          url: https://checkout.stripe.com/c/pay/cs_test_123
  "400":
    description: Bad request - request body is missing, empty, malformed JSON, or
      contains unsupported enum values
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Request body is absent or empty
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty
          invalid_plan:
            summary: Unsupported billing plan
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: unknown variant `ENTERPRISE`, expected `PRO` or `ULTIMATE` at line 1
                column 20
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "404":
    description: User not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
  "409":
    description: Conflict - the authenticated user already has a Stripe customer record
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 409
          title: Conflict
          error: STRIPE_CUSTOMER_ALREADY_EXISTS
          detail: User has already created a Stripe customer; use the customer-portal
            endpoint instead
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### postBillingPortal → postBillingPortal

Old generated operation:

```ts
type PostBillingPortalData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/v1/me/billing/portal';
};
type PostBillingPortalResponses = {
    /**
     * Billing portal session created successfully
     */
    201: BillingSessionUrlData;
};
type PostBillingPortalErrors = {
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * User not found
     */
    404: ApiError;
    /**
     * Unprocessable Content - the authenticated user has no Stripe customer record yet
     */
    422: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<PostBillingPortalData, ThrowOnError>): RequestResult<PostBillingPortalResponses, PostBillingPortalErrors, ThrowOnError> => (options?.client ?? client).post<PostBillingPortalResponses, PostBillingPortalErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/billing/portal',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/billing/portal
method: post
id: postBillingPortal
summary: Create Stripe billing portal session
description: >
  Creates a hosted Stripe customer-portal session for the authenticated user.

  This endpoint does not accept a request body.

  It can only be used when the user already has a persisted
  `stripe_customer_id`.

  Requires Cognito JWT or Aura Historia access-token authentication. Delegated
  access tokens require `users:read`.
operationId: postBillingPortal
tags:
  - Billing
security:
  - BearerAuth: []
responses:
  "201":
    description: Billing portal session created successfully
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/BillingSessionUrlData"
        example:
          url: https://billing.stripe.com/p/session/test_123
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "404":
    description: User not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
  "422":
    description: Unprocessable Content - the authenticated user has no Stripe
      customer record yet
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 422
          title: Unprocessable Content
          error: STRIPE_CUSTOMER_DOES_NOT_EXIST
          detail: User has never had a Stripe subscription; no customer-portal session can
            be created
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### postBillingManage → postBillingManage

Old generated operation:

```ts
type PostBillingManageData = {
    /**
     * Desired subscription plan and billing cycle. Required for all callers.
     */
    body: PostBillingCheckoutData;
    path?: never;
    query?: never;
    url: '/api/v1/me/billing/manage';
};
type PostBillingManageResponses = {
    /**
     * Billing management session created successfully
     */
    201: BillingSessionUrlData;
};
type PostBillingManageErrors = {
    /**
     * Bad request - request body is missing, empty, malformed JSON, or contains unsupported enum values
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * User not found
     */
    404: ApiError;
    /**
     * Unprocessable Content - the authenticated paid user has no Stripe customer record yet
     */
    422: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PostBillingManageData, ThrowOnError>): RequestResult<PostBillingManageResponses, PostBillingManageErrors, ThrowOnError> => (options.client ?? client).post<PostBillingManageResponses, PostBillingManageErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/billing/manage',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/billing/manage
method: post
id: postBillingManage
summary: Create Stripe billing management session
description: >
  Creates a hosted Stripe billing session for the authenticated user through a
  single entrypoint.

  - Users with tier `FREE` receive a Stripe Checkout session for the requested
  `plan` and `cycle`.

  - Users with tier `PRO` or `ULTIMATE` receive a Stripe customer-portal session
  instead.


  The request body is required for all callers and must contain supported
  billing enum values.

  For free users, the backend uses the provided `plan` and `cycle` to select the
  configured Stripe

  price and creates a Stripe customer first when none exists yet. For paid
  users, the backend still

  validates that the body is present and well-formed, but returns a portal
  session based on the

  stored Stripe customer rather than purchasing a new plan.


  Requires Cognito JWT or Aura Historia access-token authentication. Delegated
  access tokens require `users:read`.
operationId: postBillingManage
tags:
  - Billing
security:
  - BearerAuth: []
requestBody:
  required: true
  description: Desired subscription plan and billing cycle. Required for all callers.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/PostBillingCheckoutData"
      examples:
        pro_monthly:
          summary: Valid request body for a free user upgrading to Pro monthly
          value:
            plan: PRO
            cycle: MONTHLY
        ultimate_yearly:
          summary: Valid request body for a free user upgrading to Ultimate yearly
          value:
            plan: ULTIMATE
            cycle: YEARLY
responses:
  "201":
    description: Billing management session created successfully
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/BillingSessionUrlData"
        examples:
          checkout_session:
            summary: Free user receives a Stripe Checkout session URL
            value:
              url: https://checkout.stripe.com/c/pay/cs_test_manage_free
          portal_session:
            summary: Paid user receives a Stripe customer-portal session URL
            value:
              url: https://billing.stripe.com/p/session/manage_paid
  "400":
    description: Bad request - request body is missing, empty, malformed JSON, or
      contains unsupported enum values
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Request body is absent or empty
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty
          invalid_plan:
            summary: Unsupported billing plan
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: unknown variant `ENTERPRISE`, expected `PRO` or `ULTIMATE` at line 1
                column 20
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "404":
    description: User not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
  "422":
    description: Unprocessable Content - the authenticated paid user has no Stripe
      customer record yet
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 422
          title: Unprocessable Content
          error: STRIPE_CUSTOMER_DOES_NOT_EXIST
          detail: User has never had a Stripe subscription; no customer-portal session can
            be created
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### deleteWatchlistProduct → deleteWatchlistProduct

Old generated operation:

```ts
type DeleteWatchlistProductData = {
    body?: never;
    path: {
        /**
         * Unique identifier of the shop
         */
        shopId: string;
        /**
         * Shop's unique identifier for the product
         */
        shopsProductId: string;
    };
    query?: never;
    url: '/api/v1/me/watchlist/{shopId}/{shopsProductId}';
};
type DeleteWatchlistProductResponses = {
    /**
     * Product removed from watchlist successfully
     */
    204: void;
};
type DeleteWatchlistProductErrors = {
    /**
     * Bad request - invalid parameters
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Watchlist entry not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<DeleteWatchlistProductData, ThrowOnError>): RequestResult<DeleteWatchlistProductResponses, DeleteWatchlistProductErrors, ThrowOnError> => (options.client ?? client).delete<DeleteWatchlistProductResponses, DeleteWatchlistProductErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/watchlist/{shopId}/{shopsProductId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/watchlist/{productListingId}
method: delete
id: deleteWatchlistProduct
summary: Remove product from watchlist
description: |
  Removes a specific product from the authenticated user's watchlist.
  Returns a 204 No Content response on success.
  Requires valid Cognito JWT authentication.
operationId: deleteWatchlistProduct
tags:
  - Watchlist
parameters:
  - name: productListingId
    in: path
    required: true
    description: Unique identifier of the product
    schema:
      type: string
    example: pl_5xdb465tg1enarx2knf04mxbxj
security:
  - BearerAuth: []
responses:
  "204":
    description: Product removed from watchlist successfully
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
  "400":
    description: Bad request - invalid parameters
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_product_id:
            summary: Missing product ID
            value:
              status: 400
              title: Bad Request
              error: BAD_PATH_PARAMETER_VALUE
              source:
                field: productListingId
                type: PATH
          invalid_object_id:
            summary: Invalid product ID format
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: productListingId
                type: PATH
              detail: must be a valid ProductListing ID
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "404":
    description: Watchlist entry not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: WATCHLIST_ENTRY_NOT_FOUND
  "409":
    description: Watchlist entry was changed concurrently
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 409
          title: Conflict
          error: CONFLICT
          detail: Watchlist entry was changed concurrently.
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### patchWatchlistProduct → patchWatchlistProduct

Old generated operation:

```ts
type PatchWatchlistProductData = {
    /**
     * Patch object containing fields to update
     */
    body: WatchlistProductPatch;
    path: {
        /**
         * Unique identifier of the shop
         */
        shopId: string;
        /**
         * Shop's unique identifier for the product
         */
        shopsProductId: string;
    };
    query?: {
        /**
         * Preferred language for localized content in the response.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
        /**
         * Currency for price display in the response.
         */
        currency?: CurrencyData;
    };
    url: '/api/v1/me/watchlist/{shopId}/{shopsProductId}';
};
type PatchWatchlistProductResponses = {
    /**
     * Watchlist product updated successfully
     */
    200: PersonalizedGetProductData;
};
type PatchWatchlistProductErrors = {
    /**
     * Bad request - invalid parameters or body
     */
    400: ApiError;
    /**
     * Unauthorized - invalid or missing JWT token
     */
    401: ApiError;
    /**
     * Watchlist entry not found
     */
    404: ApiError;
    /**
     * Unprocessable Entity - watchlist quota exceeded during reactivation
     */
    422: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PatchWatchlistProductData, ThrowOnError>): RequestResult<PatchWatchlistProductResponses, PatchWatchlistProductErrors, ThrowOnError> => (options.client ?? client).patch<PatchWatchlistProductResponses, PatchWatchlistProductErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/watchlist/{shopId}/{shopsProductId}',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/watchlist/{productListingId}
method: patch
id: patchWatchlistProduct
summary: Update watchlist product settings
description: >
  Updates settings for a specific watchlist product (e.g., toggle notifications
  or manually activate/deactivate the watchlist entry).

  Returns the full personalized product data after applying the update.

  Requires valid Cognito JWT authentication.
operationId: patchWatchlistProduct
tags:
  - Watchlist
parameters:
  - name: productListingId
    in: path
    required: true
    description: Unique identifier of the product
    schema:
      type: string
    example: pl_5xdb465tg1enarx2knf04mxbxj
  - name: language
    in: query
    required: false
    description: |
      Preferred language for localized content in the response.
      Defaults to `en` when omitted.
    schema:
      $ref: "#/components/schemas/LanguageData"
    example: de
  - name: currency
    in: query
    required: false
    description: Currency for price display in the response.
    schema:
      $ref: "#/components/schemas/CurrencyData"
    example: EUR
security:
  - BearerAuth: []
requestBody:
  required: true
  description: Patch object containing fields to update
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/WatchlistProductPatch"
      examples:
        enable_notifications:
          summary: Enable notifications
          value:
            notifications: true
        disable_notifications:
          summary: Disable notifications
          value:
            notifications: false
        deactivate_watchlist_entry:
          summary: Deactivate this watchlist entry manually
          value:
            state: INACTIVE_BY_USER
        reactivate_watchlist_entry:
          summary: Reactivate this watchlist entry
          value:
            state: ACTIVE
responses:
  "200":
    description: Watchlist product updated successfully
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/PersonalizedProductListingDetailsData"
        example:
          item:
            productListingId: pl_5xdb465tg1enarx2knf04mxbxj
            productListingTitleSlugId: smartphone-case-a1b2c3
            eventId: evt_69wh1chr82fen9vvyk6n3mh80m
            source:
              listingSourceId: ls_6rd827eqfefsva9teecmwa3ate
              name: Tech Store
              slugId: tech-store
            sourceListingId: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
            title:
              text: Smartphone Case
              language: en
            price:
              offer:
                currency: EUR
                amount: 2999
              estimate:
                min:
                  currency: EUR
                  amount: 2700
                max:
                  currency: EUR
                  amount: 3300
            availability: IN_STOCK
            url: https://tech-store.com/smartphone-case
            viewUrl: https://tech-store.com/smartphone-case?utm_source=aura_historia&utm_medium=referral
            images:
              - url: https://tech-store.com/images/case-1.jpg
            contentPolicy:
              decision: ALLOWED
            created: 2024-01-01T10:00:00Z
            updated: 2024-01-01T12:00:00Z
          userState:
            watchlist:
              watching: true
              notifications: true
            contentVisibility:
              showUnassessedOrSensitiveContent: false
            notification:
              unseenNotificationIds: []
  "400":
    description: Bad request - invalid parameters or body
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_product_id:
            summary: Missing product ID
            value:
              status: 400
              title: Bad Request
              error: BAD_PATH_PARAMETER_VALUE
              source:
                field: productListingId
                type: PATH
          invalid_object_id:
            summary: Invalid product ID format
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: productListingId
                type: PATH
              detail: must be a valid ProductListing ID
          missing_body:
            summary: Missing request body
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty
          invalid_body:
            summary: Invalid request body format
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Invalid JSON format
  "401":
    description: Unauthorized - invalid or missing JWT token
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: UNAUTHORIZED
  "404":
    description: Watchlist entry or ProductListing not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          watchlist_entry_not_found:
            value:
              status: 404
              title: Not Found
              error: WATCHLIST_ENTRY_NOT_FOUND
          product_listing_not_found:
            value:
              status: 404
              title: Not Found
              error: PRODUCT_LISTING_NOT_FOUND
  "409":
    description: Watchlist entry was changed concurrently, or a withdrawn
      ProductListing cannot be reactivated
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          concurrency_conflict:
            value:
              status: 409
              title: Conflict
              error: CONFLICT
              detail: Watchlist entry was changed concurrently.
          product_listing_unavailable:
            value:
              status: 409
              title: Conflict
              error: PRODUCT_LISTING_UNAVAILABLE
  "422":
    description: Unprocessable Entity - watchlist quota exceeded during reactivation
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 422
          title: Unprocessable Content
          error: WATCHLIST_QUOTA_EXCEEDED
          detail: Exceeded the maximum amount of watchlist entries. There are already
            20/20 active watchlist entries occupied.
  "500":
    description: Internal server error
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### deleteAllNotifications → deleteNotifications

Old generated operation:

```ts
type DeleteAllNotificationsData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/v1/me/notifications';
};
type DeleteAllNotificationsResponses = {
    /**
     * All notifications deleted successfully.
     */
    204: void;
};
type DeleteAllNotificationsErrors = {
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<DeleteAllNotificationsData, ThrowOnError>): RequestResult<DeleteAllNotificationsResponses, DeleteAllNotificationsErrors, ThrowOnError> => (options?.client ?? client).delete<DeleteAllNotificationsResponses, DeleteAllNotificationsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/notifications',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/notifications
method: delete
id: deleteNotifications
summary: Delete all notifications
operationId: deleteNotifications
tags:
  - Notifications
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "204":
    description: Notifications deleted.
  "401":
    description: Invalid or missing bearer credential
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Notifications are temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### getNotifications → listNotifications

Old generated operation:

```ts
type GetNotificationsData = {
    body?: never;
    path?: never;
    query?: {
        /**
         * Preferred language for localized content.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
        /**
         * Currency for price display in notification payloads.
         */
        currency?: CurrencyData;
        /**
         * Event ID cursor for pagination (UUID string).
         * Pass the `searchAfter` value from the previous response to retrieve the next page.
         *
         */
        searchAfter?: string;
        /**
         * Maximum number of notifications to return per page (capped at 100).
         */
        size?: number;
    };
    url: '/api/v1/me/notifications';
};
type GetNotificationsResponses = {
    /**
     * Notifications retrieved successfully.
     */
    200: NotificationCollectionData;
};
type GetNotificationsErrors = {
    /**
     * Bad request – invalid query parameters.
     */
    400: ApiError;
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<GetNotificationsData, ThrowOnError>): RequestResult<GetNotificationsResponses, GetNotificationsErrors, ThrowOnError> => (options?.client ?? client).get<GetNotificationsResponses, GetNotificationsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/notifications',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/notifications
method: get
id: listNotifications
summary: List user notifications
description: >
  Retrieves the authenticated user’s canonical notifications in newest-first
  order.

  Watchlist price-change notifications preserve each event’s immutable source
  currency; no FX conversion

  is applied from the user’s preferences. Product image URLs are presented
  according to the authenticated

  user’s `showUnassessedOrSensitiveContent` preference.
operationId: listNotifications
tags:
  - Notifications
parameters:
  - name: language
    in: query
    required: false
    schema:
      $ref: "#/components/schemas/LanguageData"
  - name: size
    in: query
    required: false
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 21
  - name: searchAfter
    in: query
    required: false
    description: Opaque JSON `[created RFC3339 timestamp, Notification ID]` cursor
      returned by the prior page.
    schema:
      type: string
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "200":
    description: Notifications retrieved successfully.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/NotificationCollectionData"
  "400":
    description: Bad request
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Invalid or missing bearer credential
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Notifications are temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### patchAllNotifications → updateAllNotificationsSeen

Old generated operation:

```ts
type PatchAllNotificationsData = {
    /**
     * Optional patch fields to apply to all notifications.
     * If the body is omitted entirely, all fields default to their zero/null values
     * (for `seen`: no change is applied).
     *
     */
    body?: PatchNotificationData;
    path?: never;
    query?: {
        /**
         * Preferred language for localized content in the response.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
        /**
         * Currency for price display in notification payloads of the response.
         */
        currency?: CurrencyData;
    };
    url: '/api/v1/me/notifications';
};
type PatchAllNotificationsResponses = {
    /**
     * Notifications updated successfully. Returns the first page of updated notifications.
     */
    200: NotificationCollectionData;
};
type PatchAllNotificationsErrors = {
    /**
     * Bad request – malformed request body or invalid query parameters.
     */
    400: ApiError;
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<PatchAllNotificationsData, ThrowOnError>): RequestResult<PatchAllNotificationsResponses, PatchAllNotificationsErrors, ThrowOnError> => (options?.client ?? client).patch<PatchAllNotificationsResponses, PatchAllNotificationsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/notifications',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options?.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/notifications/all
method: patch
id: updateAllNotificationsSeen
summary: Update all notification seen states
operationId: updateAllNotificationsSeen
tags:
  - Notifications
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/UpdateNotificationSeenData"
responses:
  "204":
    description: Notifications updated.
  "400":
    description: Bad request
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Invalid or missing bearer credential
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Notifications are temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### deleteNotification → deleteNotification

Old generated operation:

```ts
type DeleteNotificationData = {
    body?: never;
    path: {
        /**
         * The event ID (UUID) of the notification to delete.
         */
        eventId: string;
    };
    query?: never;
    url: '/api/v1/me/notifications/{eventId}';
};
type DeleteNotificationResponses = {
    /**
     * Notification deleted successfully.
     */
    204: void;
};
type DeleteNotificationErrors = {
    /**
     * Bad request – missing or invalid path parameter.
     */
    400: ApiError;
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Not found – no notification with the given event ID exists for this user.
     */
    404: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<DeleteNotificationData, ThrowOnError>): RequestResult<DeleteNotificationResponses, DeleteNotificationErrors, ThrowOnError> => (options.client ?? client).delete<DeleteNotificationResponses, DeleteNotificationErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/notifications/{eventId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/notifications/{notificationId}
method: delete
id: deleteNotification
summary: Delete one notification
operationId: deleteNotification
tags:
  - Notifications
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: notificationId
    in: path
    required: true
    schema:
      type: string
responses:
  "204":
    description: Notification deleted.
  "400":
    description: Bad request
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Invalid or missing bearer credential
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: Notification not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Notifications are temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### patchNotification → updateNotificationSeen

Old generated operation:

```ts
type PatchNotificationData2 = {
    /**
     * Patch fields to apply to the notification.
     */
    body: PatchNotificationData;
    path: {
        /**
         * The event ID (UUID) of the notification to update.
         */
        eventId: string;
    };
    query?: {
        /**
         * Preferred language for localized content in the response.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
        /**
         * Currency for price display in notification payloads of the response.
         */
        currency?: CurrencyData;
    };
    url: '/api/v1/me/notifications/{eventId}';
};
type PatchNotificationResponses = {
    /**
     * Notification updated successfully. Returns the updated notification.
     */
    200: GetNotificationData;
};
type PatchNotificationErrors = {
    /**
     * Bad request – missing or invalid path parameter or request body.
     */
    400: ApiError;
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Not found – no notification with the given event ID exists for this user.
     */
    404: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PatchNotificationData2, ThrowOnError>): RequestResult<PatchNotificationResponses, PatchNotificationErrors, ThrowOnError> => (options.client ?? client).patch<PatchNotificationResponses, PatchNotificationErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/notifications/{eventId}',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/notifications/{notificationId}
method: patch
id: updateNotificationSeen
summary: Update one notification seen state
operationId: updateNotificationSeen
tags:
  - Notifications
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: notificationId
    in: path
    required: true
    schema:
      type: string
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/UpdateNotificationSeenData"
responses:
  "204":
    description: Notification updated.
  "400":
    description: Bad request
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Invalid or missing bearer credential
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: Notification not found
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Notifications are temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### putNewsletterSubscription → putNewsletterSubscription

Old generated operation:

```ts
type PutNewsletterSubscriptionData2 = {
    /**
     * Newsletter subscription data.
     */
    body: PutNewsletterSubscriptionData;
    path?: never;
    query?: never;
    url: '/api/v1/newsletter-subscriptions';
};
type PutNewsletterSubscriptionResponses = {
    /**
     * Newsletter subscription synced successfully
     */
    204: void;
};
type PutNewsletterSubscriptionErrors = {
    /**
     * Bad request — the request body is missing, malformed, contains invalid field values,
     * or the newsletter provider rejects the submitted email address as invalid.
     *
     */
    400: ApiError;
    /**
     * Internal server error while syncing the newsletter subscription after an unexpected upstream failure
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PutNewsletterSubscriptionData2, ThrowOnError>): RequestResult<PutNewsletterSubscriptionResponses, PutNewsletterSubscriptionErrors, ThrowOnError> => (options.client ?? client).put<PutNewsletterSubscriptionResponses, PutNewsletterSubscriptionErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/newsletter-subscriptions',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/newsletter-subscriptions
method: put
id: putNewsletterSubscription
summary: Upsert newsletter subscription
description: >
  Subscribes an email address to the Aura Historia newsletter mailing list.


  The endpoint accepts anonymous requests.

  An optional Cognito JWT or Aura Historia access-token bearer credential may be
  supplied for authenticated calls.

  When authenticated, omitted optional profile fields (`firstName`, `lastName`,
  `language`, `currency`)

  fall back to the authenticated user's stored account values; explicitly
  provided request values take precedence.
operationId: putNewsletterSubscription
tags:
  - Newsletter
security:
  - BearerAuth: []
  - {}
requestBody:
  required: true
  description: Newsletter subscription data.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/PutNewsletterSubscriptionData"
      examples:
        minimal:
          summary: Subscribe with email only
          value:
            email: collector@example.com
        complete:
          summary: Subscribe with explicit profile values
          value:
            email: collector@example.com
            firstName: Ada
            lastName: Lovelace
            language: en
            currency: EUR
responses:
  "204":
    description: Newsletter subscription synced successfully
    headers:
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
  "400":
    description: >
      Bad request — the request body is missing, malformed, contains invalid
      field values,

      or the newsletter provider rejects the submitted email address as invalid.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Missing request body
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty
          invalid_body:
            summary: Invalid request body
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
          invalid_email:
            summary: Newsletter provider rejected the email address
            value:
              status: 400
              title: Bad Request
              error: INVALID_EMAIL
  "500":
    description: Internal newsletter subscription failure
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: NEWSLETTER_INTERNAL_ERROR
  "503":
    description: Newsletter provider temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: NEWSLETTER_TEMPORARILY_UNAVAILABLE

```

### simpleSearchShops → (absent)

Old generated operation:

```ts
type SimpleSearchShopsData = {
    body?: never;
    path?: never;
    query?: {
        /**
         * Optional text query for searching shops by name
         */
        shopNameQuery?: string;
        /**
         * Optional filter by shop type
         */
        shopType?: Array<ShopTypeData>;
        /**
         * Optional filter by shop partner relationship status
         */
        partnerStatus?: Array<ShopPartnerStatusData>;
        /**
         * Optional repeated ISO 3166-1 alpha-2 country-code filter.
         */
        countries?: Array<CountryCodeData>;
        /**
         * Optional repeated continent filter.
         */
        continents?: Array<ContinentData>;
        /**
         * Field to sort results by
         */
        sort?: SortShopFieldData;
        /**
         * Sort order (only valid when sort is specified)
         */
        order?: 'asc' | 'desc';
        /**
         * Cursor value for keyset pagination (search-after pattern).
         * This is a JSON array value returned as `searchAfter` in the previous response.
         *
         */
        searchAfter?: Array<unknown>;
        /**
         * Number of shops to return per page
         */
        size?: number;
    };
    url: '/api/v1/shops';
};
type SimpleSearchShopsResponses = {
    /**
     * Shop search results returned successfully
     */
    200: ShopSearchResultData;
};
type SimpleSearchShopsErrors = {
    /**
     * Bad request - invalid query parameters
     */
    400: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<SimpleSearchShopsData, ThrowOnError>): RequestResult<SimpleSearchShopsResponses, SimpleSearchShopsErrors, ThrowOnError> => (options?.client ?? client).get<SimpleSearchShopsResponses, SimpleSearchShopsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }, {
            key: 'AccessTokenAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/shops',
    ...options
});

```

### postShop → adminCreateListingSource

Old generated operation:

```ts
type PostShopData2 = {
    /**
     * Complete payload for creating a new shop.
     */
    body: PostShopDataWritable;
    path?: never;
    query?: never;
    url: '/api/v1/shops';
};
type PostShopResponses = {
    /**
     * Shop created successfully
     */
    201: GetShopData;
};
type PostShopErrors = {
    /**
     * Bad request - body is missing, empty, malformed JSON, or contains invalid field values
     */
    400: ApiError;
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Forbidden – this endpoint requires the `ADMIN` role.
     */
    403: ApiError;
    /**
     * Conflict – a shop with the same derived slug already exists.
     */
    409: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PostShopData2, ThrowOnError>): RequestResult<PostShopResponses, PostShopErrors, ThrowOnError> => (options.client ?? client).post<PostShopResponses, PostShopErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/shops',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/admin/listing-sources
method: post
id: adminCreateListingSource
summary: Create a ListingSource as admin
description: >
  Creates a ListingSource for an authenticated administrator.


  `operator` accepts either an existing Party reference (`EXISTING` with
  `partyId`) or a

  new Party with name and optional contact details (`NEW`). Ingestion
  configuration,

  provider uniqueness, presentation, and referral validation remain
  service-owned.

  `woocommerceWebhookSecret` is accepted only when WooCommerce ingestion is
  configured and

  is never returned or logged.
operationId: adminCreateListingSource
tags:
  - ListingSources
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  description: ListingSource creation payload.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/CreateListingSourceData"
responses:
  "201":
    description: ListingSource created successfully.
    headers:
      Location:
        description: URL of the created admin ListingSource detail resource.
        schema:
          type: string
          format: uri
        example: /api/v1/admin/listing-sources/ls_6rd827eqfefsva9teecmwa3ate
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ListingSourceReferenceData"
  "400":
    description: Bad request - missing, malformed, or invalid ListingSource body.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Unauthorized - missing or invalid bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Forbidden - this endpoint requires the ADMIN role.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: Referenced operator Party was not found.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "409":
    description: ListingSource or provider configuration conflicts with current state.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Internal ListingSource creation failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: ListingSource creation is temporarily unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### getShopById → adminGetListingSource

Old generated operation:

```ts
type GetShopByIdData = {
    body?: never;
    path: {
        /**
         * Unique identifier of the shop (UUID format)
         */
        shopId: string;
    };
    query?: never;
    url: '/api/v1/shops/{shopId}';
};
type GetShopByIdResponses = {
    /**
     * Shop found and returned successfully
     */
    200: GetShopData;
};
type GetShopByIdErrors = {
    /**
     * Bad request - invalid or missing shop ID
     */
    400: ApiError;
    /**
     * Shop not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetShopByIdData, ThrowOnError>): RequestResult<GetShopByIdResponses, GetShopByIdErrors, ThrowOnError> => (options.client ?? client).get<GetShopByIdResponses, GetShopByIdErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }, {
            key: 'AccessTokenAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/shops/{shopId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/admin/listing-sources/{listingSourceId}
method: get
id: adminGetListingSource
summary: Get a ListingSource as admin
description: >
  Gets one ListingSource for an authenticated administrator.


  `listingSourceId` must be a valid ListingSource ID. The response uses the
  canonical ListingSource detail

  representation and never exposes provider credentials, webhook secrets, or
  crawler-local

  configuration.
operationId: adminGetListingSource
tags:
  - ListingSources
parameters:
  - name: listingSourceId
    in: path
    required: true
    schema:
      type: string
responses:
  "200":
    description: ListingSource returned successfully.
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ListingSourceData"
  "400":
    description: Bad request - invalid ListingSource ID.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Unauthorized - missing or invalid bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Forbidden - this endpoint requires the ADMIN role.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: ListingSource was not found.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Internal authentication or ListingSource detail failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Authentication, authorization, or ListingSource detail is
      temporarily unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
security:
  - BearerAuth: []
  - AccessTokenAuth: []

```

### patchShopById → adminUpdateListingSource

Old generated operation:

```ts
type PatchShopByIdData = {
    /**
     * Partial shop update payload. Send only the fields that should change.
     */
    body: PatchShopDataWritable;
    path: {
        /**
         * Unique identifier of the shop (UUID format)
         */
        shopId: string;
    };
    query?: never;
    url: '/api/v1/shops/{shopId}';
};
type PatchShopByIdResponses = {
    /**
     * Shop updated successfully
     */
    200: GetShopData;
};
type PatchShopByIdErrors = {
    /**
     * Bad request - invalid or missing shop ID, empty body, or invalid JSON
     */
    400: ApiError;
    /**
     * Unauthorized – the bearer token is missing or invalid.
     */
    401: ApiError;
    /**
     * Forbidden – caller is not allowed to update this shop.
     */
    403: ApiError;
    /**
     * Shop not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PatchShopByIdData, ThrowOnError>): RequestResult<PatchShopByIdResponses, PatchShopByIdErrors, ThrowOnError> => (options.client ?? client).patch<PatchShopByIdResponses, PatchShopByIdErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }, {
            key: 'AccessTokenAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/shops/{shopId}',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/admin/listing-sources/{listingSourceId}
method: patch
id: adminUpdateListingSource
summary: Update a ListingSource as admin
description: >
  Updates one ListingSource for an authenticated administrator.


  `listingSourceId` must be a valid ListingSource ID. Omitted members remain
  unchanged; `null` clears only

  `woocommerceWebhookSecret`, `url`, `image`, and `referralConfiguration`.
  `name` and

  `ingestionConfiguration` are non-nullable and cannot be cleared. The ingestion

  configuration methods must match the ListingSource ingestion methods. An empty
  object is a

  valid no-op PATCH; an empty HTTP body is invalid.


  Renaming a ListingSource never changes its immutable slug. The response
  contains only the

  stable ListingSource ID and slug. WooCommerce webhook secrets are write-only:
  they are

  never returned or logged.
operationId: adminUpdateListingSource
tags:
  - ListingSources
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: listingSourceId
    in: path
    required: true
    description: Stable ListingSource identifier.
    schema:
      type: string
    example: ls_6rd827eqfefsva9teecmwa3ate
requestBody:
  required: true
  description: ListingSource patch. Omit unchanged members; null clears only
    documented nullable members.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/UpdateListingSourceData"
      examples:
        update:
          summary: Update name, ingestion configuration, and presentation
          value:
            name: Antiques and More
            ingestionConfiguration:
              - type: WOOCOMMERCE
                currency: EUR
                language: en
            url: https://antiques.example/
            image: https://antiques.example/image.jpg
            referralConfiguration:
              type: PARTNERIZE
              camref: campaign123
        set_webhook_secret:
          summary: Set the WooCommerce webhook secret
          value:
            woocommerceWebhookSecret: provider-secret
        clear_values:
          summary: Clear nullable ListingSource values
          value:
            woocommerceWebhookSecret: null
            url: null
            image: null
            referralConfiguration: null
        no_op_patch:
          summary: Leave the ListingSource unchanged
          value: {}
responses:
  "200":
    description: ListingSource updated successfully.
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ListingSourceReferenceData"
        example:
          listingSourceId: ls_6rd827eqfefsva9teecmwa3ate
          listingSourceSlugId: antiques-and-more-550e8400-e29b-41d4-a716-446655440000
  "400":
    description: Bad request - invalid ListingSource ID, empty/malformed body,
      invalid values, or ingestion configuration mismatch.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_listing_source_id:
            summary: Invalid ListingSource ID
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: listingSourceId
                type: PATH
              detail: must be a valid ListingSource ID
          invalid_patch:
            summary: Invalid patch value
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: ListingSource ingestion configuration is invalid.
  "401":
    description: Unauthorized - missing or invalid bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the ADMIN role.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: ListingSource was not found.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: LISTING_SOURCE_NOT_FOUND
          detail: Listing source was not found.
  "409":
    description: Conflict - the ListingSource was changed concurrently or conflicts
      with current provider state.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 409
          title: Conflict
          error: CONFLICT
          detail: Listing source conflicts with current state.
  "500":
    description: Internal authentication or ListingSource update failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: LISTING_SOURCE_INTERNAL_ERROR
  "503":
    description: Authentication, authorization, or ListingSource persistence is
      temporarily unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: LISTING_SOURCE_TEMPORARILY_UNAVAILABLE

```

### getShopBySlug → getListingSourceBySlug

Old generated operation:

```ts
type GetShopBySlugData = {
    body?: never;
    path: {
        /**
         * Human-readable slug identifier of the shop (kebab-case, derived from shop name)
         */
        shopSlugId: string;
    };
    query?: never;
    url: '/api/v1/by-slug/shops/{shopSlugId}';
};
type GetShopBySlugResponses = {
    /**
     * Shop found and returned successfully
     */
    200: GetShopData;
};
type GetShopBySlugErrors = {
    /**
     * Bad request - invalid or missing shop slug identifier
     */
    400: ApiError;
    /**
     * Shop not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetShopBySlugData, ThrowOnError>): RequestResult<GetShopBySlugResponses, GetShopBySlugErrors, ThrowOnError> => (options.client ?? client).get<GetShopBySlugResponses, GetShopBySlugErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }, {
            key: 'AccessTokenAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/by-slug/shops/{shopSlugId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/listing-sources/by-slug/{listingSourceSlugId}
method: get
id: getListingSourceBySlug
summary: Get a ListingSource by slug
operationId: getListingSourceBySlug
tags:
  - ListingSources
parameters:
  - name: listingSourceSlugId
    in: path
    required: true
    schema:
      type: string
responses:
  "200":
    description: Success
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ListingSourceData"
  "400":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
security:
  - BearerAuth: []
  - AccessTokenAuth: []

```

### getShopByDomain → (absent)

Old generated operation:

```ts
type GetShopByDomainData = {
    body?: never;
    path: {
        /**
         * Configured shop domain
         */
        shopDomain: string;
    };
    query?: never;
    url: '/api/v1/by-domain/shops/{shopDomain}';
};
type GetShopByDomainResponses = {
    /**
     * Shop found and returned successfully
     */
    200: GetShopData;
};
type GetShopByDomainErrors = {
    /**
     * Bad request - invalid or missing shop domain
     */
    400: ApiError;
    /**
     * Shop not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetShopByDomainData, ThrowOnError>): RequestResult<GetShopByDomainResponses, GetShopByDomainErrors, ThrowOnError> => (options.client ?? client).get<GetShopByDomainResponses, GetShopByDomainErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }, {
            key: 'AccessTokenAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/by-domain/shops/{shopDomain}',
    ...options
});

```

### searchShops → (absent)

Old generated operation:

```ts
type SearchShopsData = {
    /**
     * Shop search filter configuration with all filtering criteria.
     * Allows filtering by shop name, shop type, partner status,
     * countries, continents, and creation/update date ranges.
     * If you do not want to restrict the search, supply an empty JSON-Object '{}' as body.
     *
     */
    body: ShopSearchData;
    path?: never;
    query?: {
        /**
         * Field to sort results by
         */
        sort?: SortShopFieldData;
        /**
         * Sort order (only valid when sort is specified)
         */
        order?: 'asc' | 'desc';
        /**
         * Cursor value for keyset pagination (search-after pattern).
         * This is a JSON array value returned as `searchAfter` in the previous response.
         * Use this to fetch the next page of results.
         * In general you do not have to worry about determining this key. It's given with the `searchAfter` field in the preceding response if more entries are present.
         * The array contains the sort field value and the shop ID as a tie-breaker: `[sortValue, shopId]`.
         *
         */
        searchAfter?: Array<unknown>;
        /**
         * Number of shops to return per page
         */
        size?: number;
    };
    url: '/api/v1/shops/search';
};
type SearchShopsResponses = {
    /**
     * Shop search results returned successfully
     */
    200: ShopSearchResultData;
};
type SearchShopsErrors = {
    /**
     * Bad request - invalid parameters or body
     */
    400: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<SearchShopsData, ThrowOnError>): RequestResult<SearchShopsResponses, SearchShopsErrors, ThrowOnError> => (options.client ?? client).post<SearchShopsResponses, SearchShopsErrors, ThrowOnError>({
    url: '/api/v1/shops/search',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

### getCategories → (absent)

Old generated operation:

```ts
type GetCategoriesData = {
    body?: never;
    path?: never;
    query?: {
        /**
         * Optional language for localization and simple-search matching (defaults to `en`)
         */
        language?: LanguageData;
        /**
         * Optional localized name query (simple-search mode)
         */
        nameQuery?: string;
        /**
         * Field to sort results by in simple-search mode
         */
        sort?: SortCategoryFieldData;
        /**
         * Sort order (only valid when sort is specified)
         */
        order?: 'asc' | 'desc';
    };
    url: '/api/v1/categories';
};
type GetCategoriesResponses = {
    /**
     * Categories returned successfully
     */
    200: Array<GetCategorySummaryData>;
};
type GetCategoriesErrors = {
    /**
     * Bad request - invalid query parameters in simple-search mode
     */
    400: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<GetCategoriesData, ThrowOnError>): RequestResult<GetCategoriesResponses, GetCategoriesErrors, ThrowOnError> => (options?.client ?? client).get<GetCategoriesResponses, GetCategoriesErrors, ThrowOnError>({ url: '/api/v1/categories', ...options });

```

### getCategoryById → (absent)

Old generated operation:

```ts
type GetCategoryByIdData = {
    body?: never;
    path: {
        /**
         * Kebab-case identifier of the category
         */
        categoryId: string;
    };
    query?: {
        /**
         * Preferred language for localized content.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
    };
    url: '/api/v1/categories/{categoryId}';
};
type GetCategoryByIdResponses = {
    /**
     * Category found and returned successfully
     */
    200: GetCategoryData;
};
type GetCategoryByIdErrors = {
    /**
     * Bad request - missing category ID
     */
    400: ApiError;
    /**
     * Category not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetCategoryByIdData, ThrowOnError>): RequestResult<GetCategoryByIdResponses, GetCategoryByIdErrors, ThrowOnError> => (options.client ?? client).get<GetCategoryByIdResponses, GetCategoryByIdErrors, ThrowOnError>({ url: '/api/v1/categories/{categoryId}', ...options });

```

### searchCategories → (absent)

Old generated operation:

```ts
type SearchCategoriesData = {
    /**
     * Category search configuration.
     * Omit `language` to default to `en`. Omit `nameQuery` to return all categories.
     *
     */
    body: CategorySearchData;
    path?: never;
    query?: {
        /**
         * Field to sort results by
         */
        sort?: SortCategoryFieldData;
        /**
         * Sort order (only valid when sort is specified)
         */
        order?: 'asc' | 'desc';
    };
    url: '/api/v1/categories/search';
};
type SearchCategoriesResponses = {
    /**
     * Category search results returned successfully
     */
    200: Array<GetCategorySummaryData>;
};
type SearchCategoriesErrors = {
    /**
     * Bad request - invalid parameters or body
     */
    400: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<SearchCategoriesData, ThrowOnError>): RequestResult<SearchCategoriesResponses, SearchCategoriesErrors, ThrowOnError> => (options.client ?? client).post<SearchCategoriesResponses, SearchCategoriesErrors, ThrowOnError>({
    url: '/api/v1/categories/search',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

### getPeriods → (absent)

Old generated operation:

```ts
type GetPeriodsData = {
    body?: never;
    path?: never;
    query?: {
        /**
         * Optional language for localization and simple-search matching (defaults to `en`)
         */
        language?: LanguageData;
        /**
         * Optional localized name query (simple-search mode)
         */
        nameQuery?: string;
        /**
         * Field to sort results by in simple-search mode
         */
        sort?: SortPeriodFieldData;
        /**
         * Sort order (only valid when sort is specified)
         */
        order?: 'asc' | 'desc';
    };
    url: '/api/v1/periods';
};
type GetPeriodsResponses = {
    /**
     * Periods returned successfully
     */
    200: Array<GetPeriodSummaryData>;
};
type GetPeriodsErrors = {
    /**
     * Bad request - invalid query parameters in simple-search mode
     */
    400: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<GetPeriodsData, ThrowOnError>): RequestResult<GetPeriodsResponses, GetPeriodsErrors, ThrowOnError> => (options?.client ?? client).get<GetPeriodsResponses, GetPeriodsErrors, ThrowOnError>({ url: '/api/v1/periods', ...options });

```

### getPeriodById → (absent)

Old generated operation:

```ts
type GetPeriodByIdData = {
    body?: never;
    path: {
        /**
         * Kebab-case identifier of the period
         */
        periodId: string;
    };
    query?: {
        /**
         * Preferred language for localized content.
         * Defaults to `en` when omitted.
         *
         */
        language?: LanguageData;
    };
    url: '/api/v1/periods/{periodId}';
};
type GetPeriodByIdResponses = {
    /**
     * Period found and returned successfully
     */
    200: GetPeriodData;
};
type GetPeriodByIdErrors = {
    /**
     * Bad request - missing period ID
     */
    400: ApiError;
    /**
     * Period not found
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetPeriodByIdData, ThrowOnError>): RequestResult<GetPeriodByIdResponses, GetPeriodByIdErrors, ThrowOnError> => (options.client ?? client).get<GetPeriodByIdResponses, GetPeriodByIdErrors, ThrowOnError>({ url: '/api/v1/periods/{periodId}', ...options });

```

### searchPeriods → (absent)

Old generated operation:

```ts
type SearchPeriodsData = {
    /**
     * Period search configuration.
     * Omit `language` to default to `en`. Omit `nameQuery` to return all periods.
     *
     */
    body: PeriodSearchData;
    path?: never;
    query?: {
        /**
         * Field to sort results by
         */
        sort?: SortPeriodFieldData;
        /**
         * Sort order (only valid when sort is specified)
         */
        order?: 'asc' | 'desc';
    };
    url: '/api/v1/periods/search';
};
type SearchPeriodsResponses = {
    /**
     * Period search results returned successfully
     */
    200: Array<GetPeriodSummaryData>;
};
type SearchPeriodsErrors = {
    /**
     * Bad request - invalid parameters or body
     */
    400: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<SearchPeriodsData, ThrowOnError>): RequestResult<SearchPeriodsResponses, SearchPeriodsErrors, ThrowOnError> => (options.client ?? client).post<SearchPeriodsResponses, SearchPeriodsErrors, ThrowOnError>({
    url: '/api/v1/periods/search',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

### getMyPartnerShops → getMyListingSources

Old generated operation:

```ts
type GetMyPartnerShopsData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/v1/me/partner-shops';
};
type GetMyPartnerShopsResponses = {
    /**
     * Partner shops retrieved successfully
     */
    200: Array<GetShopData>;
};
type GetMyPartnerShopsErrors = {
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * User not found – the authenticated requester does not have a persisted user record.
     */
    404: ApiError;
    /**
     * Internal server error
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<GetMyPartnerShopsData, ThrowOnError>): RequestResult<GetMyPartnerShopsResponses, GetMyPartnerShopsErrors, ThrowOnError> => (options?.client ?? client).get<GetMyPartnerShopsResponses, GetMyPartnerShopsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/partner-shops',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/listing-sources
method: get
id: getMyListingSources
summary: List caller-administered ListingSources
operationId: getMyListingSources
tags:
  - ListingSources
responses:
  "200":
    description: Success
    content:
      application/json:
        schema:
          type: array
          items:
            $ref: "#/components/schemas/AdministeredListingSourceData"
  "401":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
security:
  - BearerAuth: []
  - AccessTokenAuth: []

```

### getPartnerApplications → getMyPartnershipApplications

Old generated operation:

```ts
type GetPartnerApplicationsData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/v1/me/partner-applications';
};
type GetPartnerApplicationsResponses = {
    /**
     * Partner shop applications retrieved successfully.
     */
    200: Array<GetPartnerShopApplicationData>;
};
type GetPartnerApplicationsErrors = {
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<GetPartnerApplicationsData, ThrowOnError>): RequestResult<GetPartnerApplicationsResponses, GetPartnerApplicationsErrors, ThrowOnError> => (options?.client ?? client).get<GetPartnerApplicationsResponses, GetPartnerApplicationsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/partner-applications',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/partnership-applications
method: get
id: getMyPartnershipApplications
summary: List caller PartnershipApplications
operationId: getMyPartnershipApplications
tags:
  - PartnershipApplications
responses:
  "200":
    description: Success
    content:
      application/json:
        schema:
          type: array
          items:
            $ref: "#/components/schemas/OwnPartnershipApplicationData"
  "401":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
security:
  - BearerAuth: []
  - AccessTokenAuth: []

```

### postPartnerApplication → postPartnershipApplication

Old generated operation:

```ts
type PostPartnerApplicationData = {
    /**
     * The partner shop application payload. Must specify either an existing shop (`type: "EXISTING"`)
     * or a new shop (`type: "NEW"`).
     *
     */
    body: PostPartnerShopApplicationPayloadData;
    path?: never;
    query?: never;
    url: '/api/v1/me/partner-applications';
};
type PostPartnerApplicationResponses = {
    /**
     * Partner shop application created successfully.
     */
    201: GetPartnerShopApplicationData;
};
type PostPartnerApplicationErrors = {
    /**
     * Bad request – missing or invalid request body.
     */
    400: ApiError;
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PostPartnerApplicationData, ThrowOnError>): RequestResult<PostPartnerApplicationResponses, PostPartnerApplicationErrors, ThrowOnError> => (options.client ?? client).post<PostPartnerApplicationResponses, PostPartnerApplicationErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/partner-applications',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/me/partnership-applications
method: post
id: postPartnershipApplication
summary: Submit a PartnershipApplication
operationId: postPartnershipApplication
tags:
  - PartnershipApplications
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/SubmitPartnershipApplicationData"
responses:
  "201":
    description: PartnershipApplication submitted
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/OwnPartnershipApplicationData"
  "400":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: PARTNERSHIP_APPLICATION_LISTING_SOURCE_NOT_FOUND when an existing
      ListingSource proposal references a missing source
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
security:
  - BearerAuth: []
  - AccessTokenAuth: []

```

### deletePartnerApplication → deleteOwnPartnershipApplication

Old generated operation:

```ts
type DeletePartnerApplicationData = {
    body?: never;
    path: {
        /**
         * Unique identifier (UUID) of the partner shop application to delete.
         */
        partnerApplicationId: string;
    };
    query?: never;
    url: '/api/v1/me/partner-applications/{partnerApplicationId}';
};
type DeletePartnerApplicationResponses = {
    /**
     * Partner shop application deleted successfully.
     */
    204: void;
};
type DeletePartnerApplicationErrors = {
    /**
     * Bad request – missing or invalid path parameter.
     */
    400: ApiError;
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Not found – no partner shop application with the given ID exists for this user.
     */
    404: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<DeletePartnerApplicationData, ThrowOnError>): RequestResult<DeletePartnerApplicationResponses, DeletePartnerApplicationErrors, ThrowOnError> => (options.client ?? client).delete<DeletePartnerApplicationResponses, DeletePartnerApplicationErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/partner-applications/{partnerApplicationId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/partnership-applications/{partnershipApplicationId}
method: delete
id: deleteOwnPartnershipApplication
summary: Withdraw a PartnershipApplication
operationId: deleteOwnPartnershipApplication
tags:
  - PartnershipApplications
parameters:
  - name: partnershipApplicationId
    in: path
    required: true
    schema:
      type: string
responses:
  "204":
    description: PartnershipApplication withdrawn
  "400":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "409":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
security:
  - BearerAuth: []
  - AccessTokenAuth: []

```

### getPartnerApplication → getOwnPartnershipApplication

Old generated operation:

```ts
type GetPartnerApplicationData = {
    body?: never;
    path: {
        /**
         * Unique identifier (UUID) of the partner shop application.
         */
        partnerApplicationId: string;
    };
    query?: never;
    url: '/api/v1/me/partner-applications/{partnerApplicationId}';
};
type GetPartnerApplicationResponses = {
    /**
     * Partner shop application found and returned successfully.
     */
    200: GetPartnerShopApplicationData;
};
type GetPartnerApplicationErrors = {
    /**
     * Bad request – missing or invalid path parameter.
     */
    400: ApiError;
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Not found – no partner shop application with the given ID exists for this user.
     */
    404: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetPartnerApplicationData, ThrowOnError>): RequestResult<GetPartnerApplicationResponses, GetPartnerApplicationErrors, ThrowOnError> => (options.client ?? client).get<GetPartnerApplicationResponses, GetPartnerApplicationErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/partner-applications/{partnerApplicationId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/me/partnership-applications/{partnershipApplicationId}
method: get
id: getOwnPartnershipApplication
summary: Get a caller PartnershipApplication
operationId: getOwnPartnershipApplication
tags:
  - PartnershipApplications
parameters:
  - name: partnershipApplicationId
    in: path
    required: true
    schema:
      type: string
responses:
  "200":
    description: Success
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/OwnPartnershipApplicationData"
  "400":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Problem response
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ApiError"
security:
  - BearerAuth: []
  - AccessTokenAuth: []

```

### patchPartnerApplication → (absent)

Old generated operation:

```ts
type PatchPartnerApplicationData = {
    /**
     * Partial update for a partner shop application.
     * Only the provided fields are updated. All fields are optional.
     * Note: `businessState` and `executionState` are managed by the backend workflow and cannot be set by the client.
     *
     */
    body: PatchPartnerShopApplicationData;
    path: {
        /**
         * Unique identifier (UUID) of the partner shop application to update.
         */
        partnerApplicationId: string;
    };
    query?: never;
    url: '/api/v1/me/partner-applications/{partnerApplicationId}';
};
type PatchPartnerApplicationResponses = {
    /**
     * Partner shop application updated successfully. Returns the updated application.
     */
    200: GetPartnerShopApplicationData;
};
type PatchPartnerApplicationErrors = {
    /**
     * Bad request – missing or invalid path parameter or request body.
     */
    400: ApiError;
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Not found – no partner shop application with the given ID exists for this user.
     */
    404: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PatchPartnerApplicationData, ThrowOnError>): RequestResult<PatchPartnerApplicationResponses, PatchPartnerApplicationErrors, ThrowOnError> => (options.client ?? client).patch<PatchPartnerApplicationResponses, PatchPartnerApplicationErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/me/partner-applications/{partnerApplicationId}',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

### adminGetPartnerApplications → adminSearchPartnershipApplications

Old generated operation:

```ts
type AdminGetPartnerApplicationsData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/v1/partner-applications';
};
type AdminGetPartnerApplicationsResponses = {
    /**
     * Partner shop applications retrieved successfully.
     */
    200: Array<GetPartnerShopApplicationData>;
};
type AdminGetPartnerApplicationsErrors = {
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Forbidden – this endpoint requires the `ADMIN` role.
     */
    403: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<AdminGetPartnerApplicationsData, ThrowOnError>): RequestResult<AdminGetPartnerApplicationsResponses, AdminGetPartnerApplicationsErrors, ThrowOnError> => (options?.client ?? client).get<AdminGetPartnerApplicationsResponses, AdminGetPartnerApplicationsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/partner-applications',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/admin/partnership-applications
method: get
id: adminSearchPartnershipApplications
summary: Search PartnershipApplications for administration
description: >
  Searches PartnershipApplications for authenticated administrators.


  `state` and `proposalType` accept repeated exact canonical values.
  `applicantUserId`

  restricts the applicant. `listingSourceId` matches the approved ListingSource
  or an

  existing ListingSource proposed by the application. `created` and `updated`
  accept

  inclusive RFC3339 ranges using `min` and `max` query members.


  Results use deterministic keyset cursor pagination. The default sort is
  `created` descending;

  override it by providing both `sort` and `order`. Valid sort fields are
  `created` and `updated`;

  PartnershipApplication ID is always the final deterministic tie-breaker. Page
  sizes are clamped

  to 1–100, with a default of 21. The returned JSON `[timestamp,
  PartnershipApplication ID]` `searchAfter`

  cursor is omitted on the terminal page and must be sent with the same filters
  and sort.

  Results contain review-queue summary data only and never expose persistence
  version values.

  Responses always use `Cache-Control: no-store`.
operationId: adminSearchPartnershipApplications
tags:
  - PartnershipApplications
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: state
    in: query
    required: false
    description: Repeated exact application state filters. Matching any supplied
      state is allowed.
    style: form
    explode: true
    schema:
      type: array
      items:
        $ref: "#/components/schemas/PartnershipApplicationStateData"
    example:
      - SUBMITTED
      - IN_REVIEW
  - name: applicantUserId
    in: query
    required: false
    description: Optional applicant User ID filter.
    schema:
      type: string
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
  - name: proposalType
    in: query
    required: false
    description: Repeated exact proposal type filters. Matching any supplied type is
      allowed.
    style: form
    explode: true
    schema:
      type: array
      items:
        $ref: "#/components/schemas/PartnershipProposalTypeData"
    example:
      - EXISTING_LISTING_SOURCE
  - name: listingSourceId
    in: query
    required: false
    description: Optional approved or existing-proposal ListingSource ID filter.
    schema:
      type: string
    example: ls_7h03ebvas3fhj9qb5pr5s22029
  - name: created[min]
    in: query
    required: false
    description: Optional inclusive lower bound for application creation time (RFC3339).
    schema:
      type: string
      format: date-time
    example: 2026-01-01T00:00:00Z
  - name: created[max]
    in: query
    required: false
    description: Optional inclusive upper bound for application creation time (RFC3339).
    schema:
      type: string
      format: date-time
    example: 2026-12-31T23:59:59Z
  - name: updated[min]
    in: query
    required: false
    description: Optional inclusive lower bound for application update time (RFC3339).
    schema:
      type: string
      format: date-time
    example: 2026-01-01T00:00:00Z
  - name: updated[max]
    in: query
    required: false
    description: Optional inclusive upper bound for application update time (RFC3339).
    schema:
      type: string
      format: date-time
    example: 2026-12-31T23:59:59Z
  - name: sort
    in: query
    required: false
    description: Sort field. Valid values are `created` and `updated`. The default
      is `created` descending.
    schema:
      type: string
      enum:
        - created
        - updated
    example: created
  - name: order
    in: query
    required: false
    description: Sort direction for `sort`. Provide both `sort` and `order` to
      override the default.
    schema:
      type: string
      enum:
        - asc
        - desc
    example: desc
  - name: searchAfter
    in: query
    required: false
    description: Opaque JSON-encoded `[timestamp, PartnershipApplication ID]` cursor
      returned by the previous page.
    schema:
      type: string
    example: '["2026-09-04T12:00:00Z","pa_0ckcsff4zne3qr4dsrvqk7fckd"]'
  - name: size
    in: query
    required: false
    description: Number of application summaries requested per page. The server
      clamps values to 1–100.
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 21
    example: 21
responses:
  "200":
    description: PartnershipApplication summaries returned successfully.
    headers:
      Cache-Control:
        description: Responses are never stored because administrator review data is
          returned.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/AdminPartnershipApplicationCollectionData"
        example:
          items:
            - id: pa_0ckcsff4zne3qr4dsrvqk7fckd
              applicantUserId: usr_5pvhvpxyhve6ts31n9x8c2y513
              state: SUBMITTED
              proposal:
                type: EXISTING_LISTING_SOURCE
                listingSourceId: ls_7h03ebvas3fhj9qb5pr5s22029
              approvedPartnershipId: null
              approvedListingSourceId: null
              created: 2026-09-04T12:00:00Z
              updated: 2026-09-04T12:00:00Z
          size: 21
          searchAfter:
            - 2026-09-04T12:00:00Z
            - pa_0ckcsff4zne3qr4dsrvqk7fckd
  "400":
    description: Bad request - invalid query parameters.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_state:
            summary: Invalid state
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: state
                type: QUERY
          invalid_proposal_type:
            summary: Invalid proposal type
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: proposalType
                type: QUERY
          invalid_sort:
            summary: Invalid sort field
            value:
              status: 400
              title: Bad Request
              error: BAD_SORT_VALUE
              source:
                field: sort
                type: QUERY
          invalid_order:
            summary: Invalid sort order
            value:
              status: 400
              title: Bad Request
              error: BAD_ORDER_VALUE
              source:
                field: order
                type: QUERY
          invalid_cursor:
            summary: Invalid searchAfter cursor
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: searchAfter
                type: QUERY
          invalid_size:
            summary: Invalid page size
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: size
                type: QUERY
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Forbidden - this endpoint requires the ADMIN role.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Internal authentication or PartnershipApplication search failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Authentication, authorization, or PartnershipApplication data is
      temporarily unavailable.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### adminGetPartnerApplication → adminGetPartnershipApplication

Old generated operation:

```ts
type AdminGetPartnerApplicationData = {
    body?: never;
    path: {
        /**
         * Unique identifier (UUID) of the partner shop application.
         */
        partnerApplicationId: string;
    };
    query?: never;
    url: '/api/v1/partner-applications/{partnerApplicationId}';
};
type AdminGetPartnerApplicationResponses = {
    /**
     * Partner shop application found and returned successfully.
     */
    200: GetPartnerShopApplicationData;
};
type AdminGetPartnerApplicationErrors = {
    /**
     * Bad request – missing or invalid path parameter.
     */
    400: ApiError;
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Forbidden – this endpoint requires the `ADMIN` role.
     */
    403: ApiError;
    /**
     * Not found – no partner shop application with the given ID exists.
     */
    404: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<AdminGetPartnerApplicationData, ThrowOnError>): RequestResult<AdminGetPartnerApplicationResponses, AdminGetPartnerApplicationErrors, ThrowOnError> => (options.client ?? client).get<AdminGetPartnerApplicationResponses, AdminGetPartnerApplicationErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/partner-applications/{partnerApplicationId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/admin/partnership-applications/{partnershipApplicationId}
method: get
id: adminGetPartnershipApplication
summary: Get a PartnershipApplication for administration
description: >
  Retrieves a single PartnershipApplication for authenticated administrators.

  The response includes the applicant, state, proposal, and nullable approval
  references. All responses send `Cache-Control: no-store`.
operationId: adminGetPartnershipApplication
tags:
  - PartnershipApplications
parameters:
  - name: partnershipApplicationId
    in: path
    required: true
    description: Unique PartnershipApplication ID for the PartnershipApplication to
      retrieve.
    schema:
      type: string
    example: pa_0ckcsff4zne3qr4dsrvqk7fckd
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "200":
    description: PartnershipApplication returned successfully.
    headers:
      Cache-Control:
        description: Caching directive. Always set to `no-store`.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/AdminPartnershipApplicationData"
        example:
          id: pa_0ckcsff4zne3qr4dsrvqk7fckd
          applicantUserId: usr_5pvhvpxyhve6ts31n9x8c2y513
          state: APPROVED
          proposal:
            type: EXISTING_LISTING_SOURCE
            listingSourceId: ls_7h03ebvas3fhj9qb5pr5s22029
          approvedPartnershipId: psh_4a5zxcsd5tf9wb5mgc4vreb3q7
          approvedListingSourceId: ls_7h03ebvas3fhj9qb5pr5s22029
  "400":
    description: Bad request - invalid PartnershipApplication ID.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: PartnershipApplication not found.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Internal server error.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: PartnershipApplication data is temporarily unavailable.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### adminPatchPartnerApplication → adminMarkPartnershipApplicationInReview

Old generated operation:

```ts
type AdminPatchPartnerApplicationData = {
    /**
     * Partial update for a partner shop application.
     * All fields are optional, but the request body itself must be present and non-empty.
     * Admins may update payload fields only. `businessState` and `executionState`
     * remain workflow-controlled.
     *
     */
    body: AdminPatchPartnerShopApplicationData;
    path: {
        /**
         * Unique identifier (UUID) of the partner shop application to update.
         */
        partnerApplicationId: string;
    };
    query?: never;
    url: '/api/v1/partner-applications/{partnerApplicationId}';
};
type AdminPatchPartnerApplicationResponses = {
    /**
     * Partner shop application updated successfully. Returns the updated application.
     */
    200: GetPartnerShopApplicationData;
};
type AdminPatchPartnerApplicationErrors = {
    /**
     * Bad request – missing or invalid path parameter or request body.
     */
    400: ApiError;
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Forbidden – this endpoint requires the `ADMIN` role.
     */
    403: ApiError;
    /**
     * Not found – no partner shop application with the given ID exists.
     */
    404: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<AdminPatchPartnerApplicationData, ThrowOnError>): RequestResult<AdminPatchPartnerApplicationResponses, AdminPatchPartnerApplicationErrors, ThrowOnError> => (options.client ?? client).patch<AdminPatchPartnerApplicationResponses, AdminPatchPartnerApplicationErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/partner-applications/{partnerApplicationId}',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/admin/partnership-applications/{partnershipApplicationId}
method: patch
id: adminMarkPartnershipApplicationInReview
summary: Mark a PartnershipApplication in review as admin
description: >
  Marks a PartnershipApplication in review for an authenticated administrator.


  This operation accepts no request body and only performs the
  domain-authoritative

  `SUBMITTED` to `IN_REVIEW` transition. It does not accept arbitrary state
  assignment.

  The response contains the resulting admin PartnershipApplication
  representation and

  responses always use `Cache-Control: no-store`.
operationId: adminMarkPartnershipApplicationInReview
tags:
  - PartnershipApplications
parameters:
  - name: partnershipApplicationId
    in: path
    required: true
    description: Unique PartnershipApplication ID for the PartnershipApplication to
      mark in review.
    schema:
      type: string
    example: pa_0ckcsff4zne3qr4dsrvqk7fckd
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "200":
    description: PartnershipApplication marked in review successfully.
    headers:
      Cache-Control:
        description: Caching directive. Always set to `no-store`.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/AdminPartnershipApplicationData"
  "400":
    description: Bad request - invalid PartnershipApplication ID.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: PartnershipApplication not found.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "409":
    description: Conflict - the PartnershipApplication is not in the Submitted state
      or was changed concurrently.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Internal authentication or PartnershipApplication transition failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Authentication, authorization, or PartnershipApplication data is
      temporarily unavailable.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### adminPostPartnerApplicationDecision → adminDecidePartnershipApplication

Old generated operation:

```ts
type AdminPostPartnerApplicationDecisionData = {
    /**
     * Decision payload indicating whether the application should be approved or rejected.
     */
    body: PostPartnerShopApplicationDecisionData;
    path: {
        /**
         * Unique identifier (UUID) of the partner shop application to decide.
         */
        partnerApplicationId: string;
    };
    query?: never;
    url: '/api/v1/partner-applications/{partnerApplicationId}/decision';
};
type AdminPostPartnerApplicationDecisionResponses = {
    /**
     * Decision accepted successfully. Returns the application while the workflow continues processing.
     */
    200: GetPartnerShopApplicationData;
};
type AdminPostPartnerApplicationDecisionErrors = {
    /**
     * Bad request – missing or invalid path parameter or request body.
     */
    400: ApiError;
    /**
     * Unauthorized – invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Forbidden – this endpoint requires the `ADMIN` role.
     */
    403: ApiError;
    /**
     * Not found – no partner shop application with the given ID exists.
     */
    404: ApiError;
    /**
     * Conflict – the application is not currently in review and cannot accept a decision.
     */
    409: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<AdminPostPartnerApplicationDecisionData, ThrowOnError>): RequestResult<AdminPostPartnerApplicationDecisionResponses, AdminPostPartnerApplicationDecisionErrors, ThrowOnError> => (options.client ?? client).post<AdminPostPartnerApplicationDecisionResponses, AdminPostPartnerApplicationDecisionErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/partner-applications/{partnerApplicationId}/decision',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/admin/partnership-applications/{partnershipApplicationId}/decision
method: post
id: adminDecidePartnershipApplication
summary: Decide a PartnershipApplication as admin
description: >
  Approves or rejects a PartnershipApplication for an authenticated
  administrator.


  The request accepts only `APPROVE` or `REJECT`; arbitrary state assignment is
  not supported.

  State-changing decisions follow the domain lifecycle and are accepted only
  from `IN_REVIEW`;

  terminal replays retain their existing idempotent behavior. Approval
  atomically creates or finds

  the Party and Partnership, grants membership and

  ListingSource access, updates the application, and creates the applicant
  notification.

  Rejection preserves the existing application and notification semantics.
  Responses always

  use `Cache-Control: no-store`.
operationId: adminDecidePartnershipApplication
tags:
  - PartnershipApplications
parameters:
  - name: partnershipApplicationId
    in: path
    required: true
    description: Unique PartnershipApplication ID for the PartnershipApplication to decide.
    schema:
      type: string
    example: pa_0ckcsff4zne3qr4dsrvqk7fckd
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/DecidePartnershipApplicationData"
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "200":
    description: PartnershipApplication decided successfully.
    headers:
      Cache-Control:
        description: Caching directive. Always set to `no-store`.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/AdminPartnershipApplicationData"
  "400":
    description: Bad request - invalid PartnershipApplication ID or decision body.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: PartnershipApplication or referenced ListingSource not found.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "409":
    description: Conflict - the PartnershipApplication is not in a decisionable
      state or was changed concurrently.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Internal authentication or PartnershipApplication decision failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Authentication, authorization, or PartnershipApplication data is
      temporarily unavailable.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### oauthAuthorize → oauthAuthorize

Old generated operation:

```ts
type OauthAuthorizeData = {
    body?: never;
    path?: never;
    query: {
        /**
         * OAuth response type. Must be `code`.
         */
        response_type: 'code';
        /**
         * UUIDv7 identifier of the registered OAuth client.
         */
        client_id: string;
        /**
         * Redirect URI registered for the OAuth client. Must exactly match one of the client's registered redirect URIs.
         */
        redirect_uri: string;
        /**
         * Space-separated list of requested scopes. Must be a subset of the client's allowed scopes.
         */
        scope?: string;
        /**
         * Opaque client state value. Returned unchanged in the redirect to prevent CSRF attacks.
         */
        state?: string;
        /**
         * PKCE code challenge. Must be the base64url-encoded SHA256 hash of the `code_verifier` (S256 method).
         */
        code_challenge: string;
        /**
         * PKCE challenge method. Must be `S256`.
         */
        code_challenge_method: 'S256';
    };
    url: '/api/v1/oauth/authorize';
};
type OauthAuthorizeErrors = {
    /**
     * Bad request — a required query parameter is missing, malformed, or has an unsupported value.
     */
    400: ApiError;
    /**
     * Unauthorized — the Cognito bearer token is missing, invalid, or the OAuth client was not found / credentials are invalid.
     */
    401: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<OauthAuthorizeData, ThrowOnError>): RequestResult<unknown, OauthAuthorizeErrors, ThrowOnError> => (options.client ?? client).get<unknown, OauthAuthorizeErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/oauth/authorize',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/oauth/authorize
method: get
id: oauthAuthorize
summary: OAuth2 authorization endpoint
description: >
  Starts the OAuth2 authorization code flow (RFC 6749 §4.1).

  The authenticated user (resource owner) grants the requesting OAuth client
  access to their

  Aura Historia account. PKCE (RFC 7636) with `S256` is required for all
  requests.


  On success the endpoint redirects (302) to the `redirect_uri` appending `code`
  and, if

  supplied, `state` as query parameters. The single-use authorization code must
  be exchanged

  for an access token via `POST /api/v1/oauth/token` before it expires. A
  delegated caller

  must have `access-tokens:write` and every requested OAuth scope.
operationId: oauthAuthorize
tags:
  - OAuth
security:
  - BearerAuth: []
parameters:
  - name: response_type
    in: query
    required: true
    description: OAuth response type. Must be `code`.
    schema:
      type: string
      enum:
        - code
    example: code
  - name: client_id
    in: query
    required: true
    description: Canonical OAuthClient ID.
    schema:
      type: string
    example: oc_7b0gwc1x49e0mvbt3tfexfqgb5
  - name: redirect_uri
    in: query
    required: true
    description: Redirect URI registered for the OAuth client. Must exactly match
      one of the client's registered redirect URIs.
    schema:
      type: string
      format: uri
    example: https://client.example/callback
  - name: scope
    in: query
    required: false
    description: Space-separated list of requested scopes. Must be a subset of the
      client's allowed scopes.
    schema:
      type: string
    example: product-listings:write
  - name: state
    in: query
    required: false
    description: Opaque client state value. Returned unchanged in the redirect to
      prevent CSRF attacks.
    schema:
      type: string
    example: xyz
  - name: code_challenge
    in: query
    required: true
    description: PKCE code challenge. Must be the base64url-encoded SHA256 hash of
      the `code_verifier` (S256 method).
    schema:
      type: string
    example: E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
  - name: code_challenge_method
    in: query
    required: true
    description: PKCE challenge method. Must be `S256`.
    schema:
      type: string
      enum:
        - S256
    example: S256
responses:
  "302":
    description: >
      Authorization successful. The user-agent is redirected to `redirect_uri`
      with the

      one-time authorization `code` and the original `state` (if supplied)
      appended as

      query parameters, e.g.

      `https://client.example/callback?code=<code>&state=<state>`.
    headers:
      Location:
        description: Redirect URL containing the authorization `code` and optional `state`.
        schema:
          type: string
          format: uri
        example: https://client.example/callback?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz
      Cache-Control:
        description: Always set to `no-store`.
        schema:
          type: string
        example: no-store
  "400":
    description: Bad request — a required query parameter is missing, malformed, or
      has an unsupported value.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_response_type:
            summary: Missing response_type query parameter
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: response_type
                type: QUERY
              detail: Missing query parameter response_type
          unsupported_response_type:
            summary: Unsupported response_type value
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: response_type
                type: QUERY
              detail: Unsupported response_type 'token'
          missing_code_challenge:
            summary: Missing code_challenge query parameter
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: code_challenge
                type: QUERY
              detail: Missing query parameter code_challenge
          unsupported_code_challenge_method:
            summary: Unsupported code_challenge_method
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: code_challenge_method
                type: QUERY
              detail: Unsupported code_challenge_method 'plain'
          invalid_scope:
            summary: Requested scope not allowed for client
            value:
              status: 400
              title: Bad Request
              error: OAUTH_INVALID_SCOPE
              source:
                field: scope
                type: QUERY
              detail: Requested scope is not allowed for client.
          invalid_redirect_uri:
            summary: Redirect URI not registered for client
            value:
              status: 400
              title: Bad Request
              error: OAUTH_INVALID_REDIRECT_URI
              source:
                field: redirect_uri
                type: QUERY
              detail: Redirect URI is not registered for client.
          malformed_redirect_uri:
            summary: Redirect URI is not a valid absolute URI
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: redirect_uri
                type: QUERY
              detail: relative URL without a base
          invalid_client_id:
            summary: Invalid OAuth client identifier
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: client_id
                type: QUERY
              detail: must be a valid OAuthClient ID
  "401":
    description: Unauthorized — the Cognito bearer token is missing, invalid, or the
      OAuth client was not found / credentials are invalid.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_bearer:
            summary: Missing or invalid bearer token
            value:
              status: 401
              title: Unauthorized
              error: UNAUTHORIZED
          client_not_found:
            summary: OAuth client not found
            value:
              status: 401
              title: Unauthorized
              error: OAUTH_CLIENT_NOT_FOUND
              detail: OAuth client not found.
  "500":
    description: Internal server error.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### oauthToken → oauthToken

Old generated operation:

```ts
type OauthTokenData = {
    /**
     * Authorization code exchange payload (form-urlencoded).
     */
    body: {
        /**
         * OAuth grant type. Must be `authorization_code`.
         */
        grant_type: 'authorization_code';
        /**
         * Single-use authorization code received from the authorize redirect.
         */
        code: string;
        /**
         * Must exactly match the `redirect_uri` used in the corresponding authorization request.
         */
        redirect_uri: string;
        /**
         * UUIDv7 OAuth client identifier.
         */
        client_id: string;
        /**
         * OAuth client secret.
         */
        client_secret: string;
        /**
         * PKCE code verifier. The SHA256 hash of this value must match the `code_challenge` from the authorization request.
         */
        code_verifier: string;
    };
    path?: never;
    query?: never;
    url: '/api/v1/oauth/token';
};
type OauthTokenResponses = {
    /**
     * Access token issued successfully.
     */
    200: OAuthTokenResponseData;
};
type OauthTokenErrors = {
    /**
     * Bad request — a required form field is missing, `client_id` is not a valid UUID, `redirect_uri` is malformed, or an authorization code error occurred (code not found, expired, mismatched client or redirect URI, or invalid PKCE verifier).
     */
    400: ApiError;
    /**
     * Unauthorized — invalid OAuth client credentials or unknown OAuth client.
     */
    401: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<OauthTokenData, ThrowOnError>): RequestResult<OauthTokenResponses, OauthTokenErrors, ThrowOnError> => (options.client ?? client).post<OauthTokenResponses, OauthTokenErrors, ThrowOnError>({
    ...urlSearchParamsBodySerializer,
    url: '/api/v1/oauth/token',
    ...options,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/oauth/token
method: post
id: oauthToken
summary: OAuth2 token endpoint
description: >
  Exchanges a single-use authorization code for an Aura Historia access token
  (RFC 6749 §4.1.3).

  The request body must be `application/x-www-form-urlencoded`. Client
  authentication is

  performed via `client_id` / `client_secret` form fields. PKCE code
  verification (RFC 7636)

  is mandatory: `code_verifier` must produce the `code_challenge` supplied to
  the authorize

  endpoint.


  The issued access token is non-expiring by default (same lifetime as tokens
  created via

  `POST /api/v1/me/access-tokens`). Successful responses also include a
  short-lived

  `third_party_exchange_code` that can be redeemed once via

  `GET /api/v1/oauth/tokens/by-third-party-code/{thirdPartyCode}`. The exchange
  code expires

  after 60 seconds and is deleted on first use.
operationId: oauthToken
tags:
  - OAuth
requestBody:
  required: true
  description: Authorization code exchange payload (form-urlencoded).
  content:
    application/x-www-form-urlencoded:
      schema:
        type: object
        required:
          - grant_type
          - code
          - redirect_uri
          - client_id
          - client_secret
          - code_verifier
        properties:
          grant_type:
            type: string
            enum:
              - authorization_code
            description: OAuth grant type. Must be `authorization_code`.
            example: authorization_code
          code:
            type: string
            description: Single-use authorization code received from the authorize redirect.
            example: SplxlOBeZQQYbYS6WxSbIA
          redirect_uri:
            type: string
            format: uri
            description: Must exactly match the `redirect_uri` used in the corresponding
              authorization request.
            example: https://client.example/callback
          client_id:
            type: string
            description: Canonical OAuthClient ID.
            example: oc_7b0gwc1x49e0mvbt3tfexfqgb5
          client_secret:
            type: string
            description: OAuth client secret.
            example: aurahistoria_abcdefghijk_verylongsecretvalue
          code_verifier:
            type: string
            description: PKCE code verifier. The SHA256 hash of this value must match the
              `code_challenge` from the authorization request.
            example: dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
responses:
  "200":
    description: Access token issued successfully.
    headers:
      Cache-Control:
        description: Always set to `no-store`.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/OAuthTokenResponseData"
        example:
          access_token: aurahistoria_abcdefghijk_verylongtokenvalue
          token_type: BEARER
          expires_in: null
          scope: product-listings:write
          third_party_exchange_code: 01970f22-2bf0-7000-8000-000000000099
  "400":
    description: Bad request — a required form field is missing, `client_id` is not
      a valid OAuthClient ID, `redirect_uri` is malformed, or an authorization
      code error occurred (code not found, expired, mismatched client or
      redirect URI, or invalid PKCE verifier).
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_grant_type:
            summary: Missing grant_type form field
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              source:
                field: grant_type
                type: BODY
              detail: Missing form field grant_type
          unsupported_grant_type:
            summary: Unsupported grant_type
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              source:
                field: grant_type
                type: BODY
              detail: Unsupported grant_type 'client_credentials'
          code_not_found:
            summary: Authorization code not found or already used
            value:
              status: 400
              title: Bad Request
              error: OAUTH_AUTHORIZATION_CODE_NOT_FOUND
              detail: Authorization code not found.
          code_expired:
            summary: Authorization code expired
            value:
              status: 400
              title: Bad Request
              error: OAUTH_AUTHORIZATION_CODE_EXPIRED
              detail: Authorization code expired.
          code_client_mismatch:
            summary: Authorization code belongs to a different OAuth client
            value:
              status: 400
              title: Bad Request
              error: OAUTH_AUTHORIZATION_CODE_CLIENT_MISMATCH
              detail: Authorization code does not belong to client.
          redirect_uri_mismatch:
            summary: Redirect URI does not match the authorization request
            value:
              status: 400
              title: Bad Request
              error: OAUTH_AUTHORIZATION_REDIRECT_URI_MISMATCH
              detail: Authorization code redirect_uri mismatch.
          invalid_code_verifier:
            summary: PKCE code verifier does not match
            value:
              status: 400
              title: Bad Request
              error: OAUTH_INVALID_CODE_VERIFIER
              detail: PKCE code_verifier did not match code_challenge.
          malformed_redirect_uri:
            summary: Redirect URI is not a valid absolute URI
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              source:
                field: redirect_uri
                type: BODY
              detail: relative URL without a base
          invalid_client_id:
            summary: Invalid OAuth client identifier
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: client_id
                type: BODY
              detail: must be a valid OAuthClient ID
  "401":
    description: Unauthorized — invalid OAuth client credentials or unknown OAuth client.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_client_secret:
            summary: Invalid client secret
            value:
              status: 401
              title: Unauthorized
              error: INVALID_OAUTH_CLIENT_SECRET
              detail: Invalid OAuth client secret.
          client_not_found:
            summary: OAuth client not found
            value:
              status: 401
              title: Unauthorized
              error: OAUTH_CLIENT_NOT_FOUND
              detail: OAuth client not found.
  "500":
    description: Internal server error.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### oauthTokenByThirdPartyCode → oauthTokenByThirdPartyCode

Old generated operation:

```ts
type OauthTokenByThirdPartyCodeData = {
    body?: never;
    path: {
        /**
         * UUIDv7 one-time exchange code returned by the OAuth token endpoint.
         */
        thirdPartyCode: string;
    };
    query?: never;
    url: '/api/v1/oauth/tokens/by-third-party-code/{thirdPartyCode}';
};
type OauthTokenByThirdPartyCodeResponses = {
    /**
     * Access token returned successfully for a valid third-party exchange code.
     */
    200: OAuthTokenResponseData;
};
type OauthTokenByThirdPartyCodeErrors = {
    /**
     * Bad request — the path parameter is missing/invalid, or the exchange code was not found
     * or already expired. The backend currently uses the same
     * `OAUTH_THIRD_PARTY_EXCHANGE_CODE_NOT_FOUND` error code for both unknown and expired
     * exchange codes; the `detail` text distinguishes the two cases.
     *
     */
    400: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<OauthTokenByThirdPartyCodeData, ThrowOnError>): RequestResult<OauthTokenByThirdPartyCodeResponses, OauthTokenByThirdPartyCodeErrors, ThrowOnError> => (options.client ?? client).get<OauthTokenByThirdPartyCodeResponses, OauthTokenByThirdPartyCodeErrors, ThrowOnError>({ url: '/api/v1/oauth/tokens/by-third-party-code/{thirdPartyCode}', ...options });

```

Target operation:

```yaml
path: /api/v1/oauth/tokens/by-third-party-code/{thirdPartyCode}
method: get
id: oauthTokenByThirdPartyCode
summary: Exchange OAuth token by third-party code
description: >
  Exchanges a one-time `third_party_exchange_code` returned by `POST
  /api/v1/oauth/token`

  for the same Aura Historia access token. No client credentials or bearer token
  are required.


  The exchange code expires after 60 seconds and is deleted whether the exchange
  succeeds or

  fails due to expiry.
operationId: oauthTokenByThirdPartyCode
tags:
  - OAuth
parameters:
  - name: thirdPartyCode
    in: path
    required: true
    description: UUIDv7 one-time exchange code returned by the OAuth token endpoint.
    schema:
      type: string
      format: uuid
    example: 01970f22-2bf0-7000-8000-000000000099
responses:
  "200":
    description: Access token returned successfully for a valid third-party exchange code.
    headers:
      Cache-Control:
        description: Always set to `no-store`.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/OAuthTokenResponseData"
        example:
          access_token: aurahistoria_abcdefghijk_verylongtokenvalue
          token_type: BEARER
          expires_in: null
          scope: product-listings:write
  "400":
    description: >
      Bad request — the path parameter is missing/invalid, or the exchange code
      was not found

      or already expired. The backend currently uses the same

      `OAUTH_THIRD_PARTY_EXCHANGE_CODE_NOT_FOUND` error code for both unknown
      and expired

      exchange codes; the `detail` text distinguishes the two cases.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_third_party_code:
            summary: Missing third-party exchange code path parameter
            value:
              status: 400
              title: Bad Request
              error: BAD_PATH_PARAMETER_VALUE
              source:
                field: thirdPartyCode
                type: PATH
              detail: Missing path parameter thirdPartyCode
          invalid_third_party_code:
            summary: Invalid third-party exchange code
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: thirdPartyCode
                type: PATH
              detail: Path parameter 'thirdPartyCode' is invalid.
          exchange_code_not_found:
            summary: Third-party exchange code not found
            value:
              status: 400
              title: Bad Request
              error: OAUTH_THIRD_PARTY_EXCHANGE_CODE_NOT_FOUND
              detail: Third-party exchange code not found.
          exchange_code_expired:
            summary: Third-party exchange code expired
            value:
              status: 400
              title: Bad Request
              error: OAUTH_THIRD_PARTY_EXCHANGE_CODE_NOT_FOUND
              detail: Third-party exchange code expired.
  "500":
    description: Internal server error.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### oauthRevoke → oauthRevoke

Old generated operation:

```ts
type OauthRevokeData = {
    /**
     * Token revocation payload (form-urlencoded).
     */
    body: {
        /**
         * The access token to revoke.
         */
        token: string;
        /**
         * UUIDv7 OAuth client identifier.
         */
        client_id: string;
        /**
         * OAuth client secret.
         */
        client_secret: string;
    };
    path?: never;
    query?: never;
    url: '/api/v1/oauth/revoke';
};
type OauthRevokeResponses = {
    /**
     * Token revoked successfully (or token was unknown/already inactive). Empty response body.
     */
    200: unknown;
};
type OauthRevokeErrors = {
    /**
     * Bad request — a required form field is missing, `client_id` is not a valid UUID, or the token value is invalid.
     */
    400: ApiError;
    /**
     * Unauthorized — invalid OAuth client credentials or unknown OAuth client.
     */
    401: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<OauthRevokeData, ThrowOnError>): RequestResult<OauthRevokeResponses, OauthRevokeErrors, ThrowOnError> => (options.client ?? client).post<OauthRevokeResponses, OauthRevokeErrors, ThrowOnError>({
    ...urlSearchParamsBodySerializer,
    url: '/api/v1/oauth/revoke',
    ...options,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/oauth/revoke
method: post
id: oauthRevoke
summary: OAuth2 token revocation endpoint
description: >
  Revokes an Aura Historia access token that was issued through the OAuth
  authorization code

  flow (RFC 7009). The request body must be `application/x-www-form-urlencoded`.
  Client

  authentication is performed via `client_id` / `client_secret` form fields.


  After revocation the token is immediately inactive and introspection will
  return

  `active: false`. Attempting to revoke an unknown or already-revoked token is
  not an error.
operationId: oauthRevoke
tags:
  - OAuth
requestBody:
  required: true
  description: Token revocation payload (form-urlencoded).
  content:
    application/x-www-form-urlencoded:
      schema:
        type: object
        required:
          - token
          - client_id
          - client_secret
        properties:
          token:
            type: string
            description: The access token to revoke.
            example: aurahistoria_abcdefghijk_verylongtokenvalue
          client_id:
            type: string
            description: Canonical OAuthClient ID.
            example: oc_7b0gwc1x49e0mvbt3tfexfqgb5
          client_secret:
            type: string
            description: OAuth client secret.
            example: aurahistoria_abcdefghijk_verylongsecretvalue
responses:
  "200":
    description: Token revoked successfully (or token was unknown/already inactive).
      Empty response body.
    headers:
      Cache-Control:
        description: Always set to `no-store`.
        schema:
          type: string
        example: no-store
  "400":
    description: Bad request — a required form field is missing, `client_id` is not
      a valid OAuthClient ID, or the token value is invalid.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_token:
            summary: Missing token form field
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              source:
                field: token
                type: BODY
              detail: Missing form field token
          invalid_client_id:
            summary: Invalid OAuth client identifier
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: client_id
                type: BODY
              detail: must be a valid OAuthClient ID
  "401":
    description: Unauthorized — invalid OAuth client credentials or unknown OAuth client.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_client_secret:
            summary: Invalid client secret
            value:
              status: 401
              title: Unauthorized
              error: INVALID_OAUTH_CLIENT_SECRET
              detail: Invalid OAuth client secret.
          client_not_found:
            summary: OAuth client not found
            value:
              status: 401
              title: Unauthorized
              error: OAUTH_CLIENT_NOT_FOUND
              detail: OAuth client not found.
  "500":
    description: Internal server error.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### oauthIntrospect → oauthIntrospect

Old generated operation:

```ts
type OauthIntrospectData = {
    /**
     * Token introspection payload (form-urlencoded).
     */
    body: {
        /**
         * The access token to introspect.
         */
        token: string;
        /**
         * UUIDv7 OAuth client identifier.
         */
        client_id: string;
        /**
         * OAuth client secret.
         */
        client_secret: string;
    };
    path?: never;
    query?: never;
    url: '/api/v1/oauth/introspect';
};
type OauthIntrospectResponses = {
    /**
     * Introspection result. `active: false` means the token is unknown, expired, or revoked.
     */
    200: OAuthIntrospectionResponseData;
};
type OauthIntrospectErrors = {
    /**
     * Bad request — a required form field is missing, `client_id` is not a valid UUID, or the token value is invalid.
     */
    400: ApiError;
    /**
     * Unauthorized — invalid OAuth client credentials or unknown OAuth client.
     */
    401: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<OauthIntrospectData, ThrowOnError>): RequestResult<OauthIntrospectResponses, OauthIntrospectErrors, ThrowOnError> => (options.client ?? client).post<OauthIntrospectResponses, OauthIntrospectErrors, ThrowOnError>({
    ...urlSearchParamsBodySerializer,
    url: '/api/v1/oauth/introspect',
    ...options,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/oauth/introspect
method: post
id: oauthIntrospect
summary: OAuth2 token introspection endpoint
description: >
  Returns metadata about an Aura Historia access token (RFC 7662). The request
  body must be

  `application/x-www-form-urlencoded`. Client authentication is performed via
  `client_id` /

  `client_secret` form fields.


  If the token is unknown, expired, or revoked, `active` is `false` and all
  other fields are

  omitted. Otherwise `active` is `true` and the available token metadata is
  populated.
operationId: oauthIntrospect
tags:
  - OAuth
requestBody:
  required: true
  description: Token introspection payload (form-urlencoded).
  content:
    application/x-www-form-urlencoded:
      schema:
        type: object
        required:
          - token
          - client_id
          - client_secret
        properties:
          token:
            type: string
            description: The access token to introspect.
            example: aurahistoria_abcdefghijk_verylongtokenvalue
          client_id:
            type: string
            description: Canonical OAuthClient ID.
            example: oc_7b0gwc1x49e0mvbt3tfexfqgb5
          client_secret:
            type: string
            description: OAuth client secret.
            example: aurahistoria_abcdefghijk_verylongsecretvalue
responses:
  "200":
    description: "Introspection result. `active: false` means the token is unknown,
      expired, or revoked."
    headers:
      Cache-Control:
        description: Always set to `no-store`.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/OAuthIntrospectionResponseData"
        examples:
          active:
            summary: Active token
            value:
              active: true
              scope: product-listings:write
              client_id: oc_7b0gwc1x49e0mvbt3tfexfqgb5
              sub: usr_4hzreqwxgvef69j056bszwwm17
              token_type: Bearer
              exp: 1780000000
              iat: 1748400000
          inactive:
            summary: Inactive / unknown token
            value:
              active: false
  "400":
    description: Bad request — a required form field is missing, `client_id` is not
      a valid OAuthClient ID, or the token value is invalid.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_token:
            summary: Missing token form field
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              source:
                field: token
                type: BODY
              detail: Missing form field token
          invalid_client_id:
            summary: Invalid OAuth client identifier
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: client_id
                type: BODY
              detail: must be a valid OAuthClient ID
  "401":
    description: Unauthorized — invalid OAuth client credentials or unknown OAuth client.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_client_secret:
            summary: Invalid client secret
            value:
              status: 401
              title: Unauthorized
              error: INVALID_OAUTH_CLIENT_SECRET
              detail: Invalid OAuth client secret.
          client_not_found:
            summary: OAuth client not found
            value:
              status: 401
              title: Unauthorized
              error: OAUTH_CLIENT_NOT_FOUND
              detail: OAuth client not found.
  "500":
    description: Internal server error.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: INTERNAL_SERVER_ERROR

```

### getOAuthClients → adminListOAuthClients

Old generated operation:

```ts
type GetOAuthClientsData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/v1/oauth/clients';
};
type GetOAuthClientsResponses = {
    /**
     * OAuth client metadata retrieved successfully.
     */
    200: Array<OAuthClientMetadataResponseData>;
};
type GetOAuthClientsErrors = {
    /**
     * Unauthorized — invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options?: Options<GetOAuthClientsData, ThrowOnError>): RequestResult<GetOAuthClientsResponses, GetOAuthClientsErrors, ThrowOnError> => (options?.client ?? client).get<GetOAuthClientsResponses, GetOAuthClientsErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/oauth/clients',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/admin/oauth-clients
method: get
id: adminListOAuthClients
summary: List OAuth client metadata for administration
description: >
  Lists registered OAuth client metadata for authenticated administrators.


  User and delegated-user principals must have the persisted `ADMIN` business
  role.

  Delegated Aura Historia access-token callers must also have the
  `access-tokens:read`

  capability. The OAuth protocol routes remain under `/api/v1/oauth`.


  Results use bounded keyset pagination in fixed `created` ascending, then
  OAuthClient ID ascending order. Page sizes are clamped to 1–100, with a
  default of 21. The

  `searchAfter` value is a JSON-encoded `[created RFC3339 timestamp, OAuthClient
  ID]`

  cursor; it is omitted on the terminal page and must be sent with the same
  filters.


  `clientId` is an exact OAuthClient ID filter. `name` is a case-insensitive
  substring filter.

  The response contains no plaintext client secret, secret hash, or masked
  secret value.

  Every success and error response uses `Cache-Control: no-store`.
operationId: adminListOAuthClients
tags:
  - OAuth
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: clientId
    in: query
    required: false
    description: Optional exact OAuthClient ID filter.
    schema:
      type: string
    example: oc_7b0gwc1x49e0mvbt3tfexfqgb5
  - name: name
    in: query
    required: false
    description: Optional case-insensitive substring filter for the OAuth client
      display name.
    schema:
      type: string
    example: dashboard
  - name: searchAfter
    in: query
    required: false
    description: JSON-encoded `[created RFC3339 timestamp, OAuthClient ID]` cursor
      returned by the previous page.
    schema:
      type: string
    example: '["2026-09-04T12:00:00Z","oc_7b0gwc1x49e0mvbt3tfexfqgb5"]'
  - name: size
    in: query
    required: false
    description: Number of OAuth client summaries requested per page. The server
      clamps values to 1–100.
    schema:
      type: integer
      format: int64
      minimum: 1
      maximum: 100
      default: 21
    example: 21
responses:
  "200":
    description: OAuth client summaries returned successfully.
    headers:
      Cache-Control:
        description: Responses are never stored because administrator OAuth data is
          returned.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/OAuthClientAdminCollectionData"
        example:
          items:
            - client_id: oc_7b0gwc1x49e0mvbt3tfexfqgb5
              client_name: Dashboard integration
              tos_uri: https://client.example/tos
              policy_uri: https://client.example/policy
              client_uri: https://client.example
              logo_uri: https://client.example/logo.png
              redirect_uris:
                - https://client.example/callback
              scope:
                - access-tokens:read
              client_id_issued_at: 1748539200
          size: 21
          searchAfter:
            - 2026-09-04T12:00:00Z
            - oc_7b0gwc1x49e0mvbt3tfexfqgb5
  "400":
    description: Bad request — an OAuth client filter, page size, or cursor is invalid.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 400
          title: Bad Request
          error: BAD_QUERY_PARAMETER_VALUE
          source:
            field: searchAfter
            type: QUERY
  "401":
    description: Unauthorized — invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden — the caller is not an administrator or a delegated
      caller lacks `access-tokens:read`.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: OAuth client administration requires the ADMIN role; delegated callers
            also require access-tokens:read.
  "500":
    description: Internal authentication, authorization, or OAuth client read failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: OAUTH_INTERNAL_ERROR
  "503":
    description: Temporary authentication, authorization, or OAuth client read failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: OAUTH_TEMPORARILY_UNAVAILABLE

```

### postOAuthClient → adminCreateOAuthClient

Old generated operation:

```ts
type PostOAuthClientData = {
    /**
     * OAuth client metadata creation payload.
     */
    body: OAuthClientMetadataRequestData;
    path?: never;
    query?: never;
    url: '/api/v1/oauth/clients';
};
type PostOAuthClientResponses = {
    /**
     * OAuth client metadata created successfully.
     */
    201: OAuthClientMetadataResponseData;
};
type PostOAuthClientErrors = {
    /**
     * Bad request — missing, empty, malformed JSON body, or invalid OAuth client metadata.
     */
    400: ApiError;
    /**
     * Unauthorized — invalid or missing JWT token.
     */
    401: ApiError;
    /**
     * Forbidden — the authenticated user is not an admin.
     */
    403: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PostOAuthClientData, ThrowOnError>): RequestResult<PostOAuthClientResponses, PostOAuthClientErrors, ThrowOnError> => (options.client ?? client).post<PostOAuthClientResponses, PostOAuthClientErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/oauth/clients',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/admin/oauth-clients
method: post
id: adminCreateOAuthClient
summary: Create OAuth client metadata for administration
description: >
  Creates a new OAuth client metadata record for an authenticated administrator.


  User and delegated-user principals must have the persisted `ADMIN` business
  role.

  Delegated Aura Historia access-token callers must also have the
  `access-tokens:write`

  capability. The plaintext `client_secret` is returned only in this create
  response and

  is never logged or returned by later reads.


  Redirect URIs must be non-empty HTTPS URLs without fragments. Requested scopes
  must be

  supported OAuth scopes.
operationId: adminCreateOAuthClient
tags:
  - OAuth
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  description: OAuth client metadata creation payload.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/OAuthClientMetadataRequestData"
      example:
        client_name: Acceptance OAuth client
        tos_uri: https://client.example/tos
        policy_uri: https://client.example/policy
        client_uri: https://client.example
        logo_uri: https://client.example/logo.png
        redirect_uris:
          - https://client.example/callback
        scope:
          - product-listings:write
responses:
  "201":
    description: OAuth client metadata created successfully.
    headers:
      Location:
        description: URL of the created admin OAuth client detail resource.
        schema:
          type: string
          format: uri
        example: /api/v1/admin/oauth-clients/oc_7b0gwc1x49e0mvbt3tfexfqgb5
      Cache-Control:
        description: Always set to `no-store` because the response contains the raw secret.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/OAuthClientMetadataResponseData"
        example:
          client_id: oc_7b0gwc1x49e0mvbt3tfexfqgb5
          client_secret: aurahistoria_oauth_client_secret_abcdefghijk_abcdefghijklmnopqrstuvwxyz1234567
          client_name: Acceptance OAuth client
          tos_uri: https://client.example/tos
          policy_uri: https://client.example/policy
          client_uri: https://client.example
          logo_uri: https://client.example/logo.png
          redirect_uris:
            - https://client.example/callback
          scope:
            - product-listings:write
          client_id_issued_at: 1748539200
  "400":
    description: Bad request — missing, empty, malformed JSON body, invalid redirect
      URI, or unsupported scope.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          missing_body:
            summary: Missing request body
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body cannot be empty
          empty_redirect_uris:
            summary: Redirect URIs are required
            value:
              status: 400
              title: Bad Request
              error: OAUTH_INVALID_CLIENT_METADATA
              detail: "OAuth client metadata is invalid: OAuth client must have at least one
                redirect URI"
          insecure_redirect_uri:
            summary: Redirect URI must use HTTPS
            value:
              status: 400
              title: Bad Request
              error: OAUTH_INVALID_CLIENT_METADATA
              detail: "OAuth client metadata is invalid: OAuth redirect URI must use HTTPS:
                http://client.example/callback"
  "401":
    description: Unauthorized — invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden — the caller is not an administrator or a delegated
      caller lacks `access-tokens:write`.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: OAuth client creation requires the ADMIN role; delegated callers also
            require access-tokens:write.
  "500":
    description: Internal authentication or OAuth client creation failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: OAUTH_INTERNAL_ERROR
  "503":
    description: Temporary authentication, authorization, or OAuth client
      persistence failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: OAUTH_TEMPORARILY_UNAVAILABLE

```

### deleteOAuthClient → adminDeleteOAuthClient

Old generated operation:

```ts
type DeleteOAuthClientData = {
    body?: never;
    path: {
        /**
         * UUIDv7 identifier of the OAuth client.
         */
        clientId: string;
    };
    query?: never;
    url: '/api/v1/oauth/clients/{clientId}';
};
type DeleteOAuthClientResponses = {
    /**
     * OAuth client metadata deleted successfully. Empty response body.
     */
    204: void;
};
type DeleteOAuthClientErrors = {
    /**
     * Bad request — invalid or missing OAuth client path parameter.
     */
    400: ApiError;
    /**
     * Unauthorized — invalid or missing JWT token, or the OAuth client does not exist.
     */
    401: ApiError;
    /**
     * Forbidden — the authenticated user is not an admin.
     */
    403: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<DeleteOAuthClientData, ThrowOnError>): RequestResult<DeleteOAuthClientResponses, DeleteOAuthClientErrors, ThrowOnError> => (options.client ?? client).delete<DeleteOAuthClientResponses, DeleteOAuthClientErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/oauth/clients/{clientId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/admin/oauth-clients/{clientId}
method: delete
id: adminDeleteOAuthClient
summary: Delete OAuth client metadata for administration
description: >
  Deletes one OAuth client metadata record for an authenticated administrator.


  User and delegated-user principals must have the persisted `ADMIN` business
  role.

  Delegated Aura Historia access-token callers must also have the
  `access-tokens:write`

  capability. Deletion atomically invalidates pending authorization codes,
  OAuth-issued

  Aura access tokens, and their one-time third-party exchange codes. The OAuth
  protocol

  routes remain under `/api/v1/oauth`; this administrative mutation is not a
  protocol route.
operationId: adminDeleteOAuthClient
tags:
  - OAuth
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: clientId
    in: path
    required: true
    description: Canonical OAuthClient ID.
    schema:
      type: string
    example: oc_7b0gwc1x49e0mvbt3tfexfqgb5
responses:
  "204":
    description: OAuth client and all client-issued credentials were deleted successfully.
    headers:
      Cache-Control:
        description: Responses are never stored.
        schema:
          type: string
        example: no-store
  "400":
    description: Bad request — the OAuth client path parameter is not a valid
      OAuthClient ID.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 400
          title: Bad Request
          error: INVALID_OBJECT_ID
          source:
            field: clientId
            type: PATH
          detail: must be a valid OAuthClient ID
  "401":
    description: Unauthorized — invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden — the caller is not an administrator or a delegated
      caller lacks `access-tokens:write`.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: OAuth client administration requires the ADMIN role; delegated callers
            also require access-tokens:write.
  "404":
    description: OAuth client was not found, including repeated deletion.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: OAUTH_CLIENT_NOT_FOUND
  "500":
    description: Internal authentication, authorization, or OAuth client deletion failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: OAUTH_INTERNAL_ERROR
  "503":
    description: Temporary authentication, authorization, or OAuth client deletion failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: OAUTH_TEMPORARILY_UNAVAILABLE

```

### getOAuthClient → adminGetOAuthClient

Old generated operation:

```ts
type GetOAuthClientData = {
    body?: never;
    path: {
        /**
         * UUIDv7 identifier of the OAuth client.
         */
        clientId: string;
    };
    query?: never;
    url: '/api/v1/oauth/clients/{clientId}';
};
type GetOAuthClientResponses = {
    /**
     * OAuth client metadata retrieved successfully.
     */
    200: OAuthClientMetadataResponseData;
};
type GetOAuthClientErrors = {
    /**
     * Bad request — invalid or missing OAuth client path parameter.
     */
    400: ApiError;
    /**
     * Unauthorized — invalid or missing JWT token, or the OAuth client does not exist.
     */
    401: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<GetOAuthClientData, ThrowOnError>): RequestResult<GetOAuthClientResponses, GetOAuthClientErrors, ThrowOnError> => (options.client ?? client).get<GetOAuthClientResponses, GetOAuthClientErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/oauth/clients/{clientId}',
    ...options
});

```

Target operation:

```yaml
path: /api/v1/admin/oauth-clients/{clientId}
method: get
id: adminGetOAuthClient
summary: Get OAuth client metadata for administration
description: >
  Retrieves one OAuth client metadata record for an authenticated administrator.


  User and delegated-user principals must have the persisted `ADMIN` business
  role.

  Delegated Aura Historia access-token callers must also have the
  `access-tokens:read`

  capability. The response contains client metadata, redirect URIs, and scopes,
  but never

  a plaintext client secret, secret hash, or masked secret value. Every success
  and error

  response uses `Cache-Control: no-store`.
operationId: adminGetOAuthClient
tags:
  - OAuth
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: clientId
    in: path
    required: true
    description: Canonical OAuthClient ID.
    schema:
      type: string
    example: oc_7b0gwc1x49e0mvbt3tfexfqgb5
responses:
  "200":
    description: OAuth client metadata retrieved successfully.
    headers:
      Cache-Control:
        description: Responses are never stored because administrator OAuth data is
          returned.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/OAuthClientAdminData"
        example:
          client_id: oc_7b0gwc1x49e0mvbt3tfexfqgb5
          client_name: Acceptance OAuth client
          tos_uri: https://client.example/tos
          policy_uri: https://client.example/policy
          client_uri: https://client.example
          logo_uri: https://client.example/logo.png
          redirect_uris:
            - https://client.example/callback
          scope:
            - product-listings:write
          client_id_issued_at: 1748539200
  "400":
    description: Bad request — the OAuth client path parameter is not a valid
      OAuthClient ID.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 400
          title: Bad Request
          error: INVALID_OBJECT_ID
          source:
            field: clientId
            type: PATH
          detail: must be a valid OAuthClient ID
  "401":
    description: Unauthorized — invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden — the caller is not an administrator or a delegated
      caller lacks `access-tokens:read`.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: OAuth client administration requires the ADMIN role; delegated callers
            also require access-tokens:read.
  "404":
    description: OAuth client was not found.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: OAUTH_CLIENT_NOT_FOUND
          detail: OAuth client not found.
  "500":
    description: Internal authentication, authorization, or OAuth client read failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: OAUTH_INTERNAL_ERROR
  "503":
    description: Temporary authentication, authorization, or OAuth client read failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: OAUTH_TEMPORARILY_UNAVAILABLE

```

### patchOAuthClient → adminPatchOAuthClient

Old generated operation:

```ts
type PatchOAuthClientData = {
    /**
     * Partial OAuth client metadata update payload.
     */
    body: OAuthClientMetadataPatchData;
    path: {
        /**
         * UUIDv7 identifier of the OAuth client.
         */
        clientId: string;
    };
    query?: never;
    url: '/api/v1/oauth/clients/{clientId}';
};
type PatchOAuthClientResponses = {
    /**
     * OAuth client metadata updated successfully.
     */
    200: OAuthClientMetadataResponseData;
};
type PatchOAuthClientErrors = {
    /**
     * Bad request — invalid or missing OAuth client path parameter, empty body, malformed JSON body, or invalid OAuth client metadata.
     */
    400: ApiError;
    /**
     * Unauthorized — invalid or missing JWT token, or the OAuth client does not exist.
     */
    401: ApiError;
    /**
     * Forbidden — the authenticated user is not an admin.
     */
    403: ApiError;
    /**
     * Internal server error.
     */
    500: ApiError;
};
```

Old generated transport/security:

```ts
<ThrowOnError extends boolean = false>(options: Options<PatchOAuthClientData, ThrowOnError>): RequestResult<PatchOAuthClientResponses, PatchOAuthClientErrors, ThrowOnError> => (options.client ?? client).patch<PatchOAuthClientResponses, PatchOAuthClientErrors, ThrowOnError>({
    security: [{
            key: 'BearerAuth',
            scheme: 'bearer',
            type: 'http'
        }],
    url: '/api/v1/oauth/clients/{clientId}',
    ...options,
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    }
});

```

Target operation:

```yaml
path: /api/v1/admin/oauth-clients/{clientId}
method: patch
id: adminPatchOAuthClient
summary: Update OAuth client metadata for administration
description: >
  Updates one OAuth client metadata record for an authenticated administrator.


  Omitted properties leave existing values unchanged; every explicit `null` is
  invalid

  because OAuth metadata is non-nullable; and `{}` is a valid no-op.


  User and delegated-user principals must have the persisted `ADMIN` business
  role.

  Delegated Aura Historia access-token callers must also have the
  `access-tokens:write`

  capability. Redirect URIs remain non-empty HTTPS URLs without fragments, and
  requested

  scopes must be supported OAuth scopes.


  The response is secret-free. This operation never exposes or rotates the
  client secret.

  Every success and error response uses `Cache-Control: no-store`.
operationId: adminPatchOAuthClient
tags:
  - OAuth
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: clientId
    in: path
    required: true
    description: Canonical OAuthClient ID.
    schema:
      type: string
    example: oc_7b0gwc1x49e0mvbt3tfexfqgb5
requestBody:
  required: true
  description: Partial OAuth client metadata update payload.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/OAuthClientMetadataPatchData"
      example:
        client_name: Updated acceptance OAuth client
        tos_uri: https://client.example/updated-tos
        policy_uri: https://client.example/updated-policy
        client_uri: https://updated-client.example
        logo_uri: https://updated-client.example/logo.png
        redirect_uris:
          - https://client.example/updated
        scope:
          - access-tokens:read
responses:
  "200":
    description: OAuth client metadata updated successfully without exposing a secret.
    headers:
      Cache-Control:
        description: Always set to `no-store`.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/OAuthClientAdminData"
        example:
          client_id: oc_7b0gwc1x49e0mvbt3tfexfqgb5
          client_name: Updated acceptance OAuth client
          tos_uri: https://client.example/updated-tos
          policy_uri: https://client.example/updated-policy
          client_uri: https://updated-client.example
          logo_uri: https://updated-client.example/logo.png
          redirect_uris:
            - https://client.example/updated
          scope:
            - access-tokens:read
          client_id_issued_at: 1748539200
  "400":
    description: Bad request — invalid client ID, empty/malformed body, null patch
      member, invalid redirect URI, or unsupported scope.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_client_id:
            summary: Invalid OAuth client identifier
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: clientId
                type: PATH
              detail: must be a valid OAuthClient ID
          insecure_redirect_uri:
            summary: Redirect URI must use HTTPS
            value:
              status: 400
              title: Bad Request
              error: OAUTH_INVALID_CLIENT_METADATA
              detail: "OAuth client metadata is invalid: OAuth redirect URI must use HTTPS:
                http://client.example/updated"
  "401":
    description: Unauthorized — invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden — the caller is not an administrator or a delegated
      caller lacks `access-tokens:write`.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: OAuth client administration requires the ADMIN role; delegated callers
            also require access-tokens:write.
  "404":
    description: OAuth client was not found.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: OAUTH_CLIENT_NOT_FOUND
  "500":
    description: Internal authentication, authorization, or OAuth client update failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: OAUTH_INTERNAL_ERROR
  "503":
    description: Temporary authentication, authorization, or OAuth client update failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: OAUTH_TEMPORARILY_UNAVAILABLE

```

### (new) → adminSearchListingSources

Target operation:

```yaml
path: /api/v1/admin/listing-sources
method: get
id: adminSearchListingSources
summary: Search ListingSources as admin
description: >
  Searches ListingSource records for authenticated administrators.


  `query` performs a case-insensitive substring search across the ListingSource
  name and

  stable slug, and also the operator Party name and slug. `name` restricts the
  substring

  match to the ListingSource name. `listingSourceId` and `listingSourceSlugId`
  are exact

  identity filters. `operatorPartyId` and `ingestionMethod` are exact filters.


  Results use deterministic cursor pagination. The default sort is `name`
  ascending;

  override it by providing both `sort` and `order`. Valid sort fields are
  `name`, `slug`,

  `created`, and `updated`; ListingSource ID is always the final deterministic
  tie-breaker.

  Page sizes are clamped to 1–100, with a default of 21. The returned
  ListingSource ID `searchAfter`

  cursor is omitted on the terminal page and should be sent with the same
  filters and sort.

  Responses always use `Cache-Control: no-store`.


  The result contains only safe business-resource fields: ListingSource identity
  and name,

  operator Party reference, active ingestion methods, presentation URLs, and
  referral summary.

  Provider credentials, webhook secrets, and crawler-local configuration are
  never returned.
operationId: adminSearchListingSources
tags:
  - ListingSources
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: query
    in: query
    required: false
    description: Optional case-insensitive substring query across source and
      operator Party text.
    schema:
      type: string
    example: antiques
  - name: name
    in: query
    required: false
    description: Optional case-insensitive substring filter for the ListingSource name.
    schema:
      type: string
    example: antiques
  - name: listingSourceId
    in: query
    required: false
    description: Optional exact ListingSource ID filter.
    schema:
      type: string
    example: ls_6rd827eqfefsva9teecmwa3ate
  - name: listingSourceSlugId
    in: query
    required: false
    description: Optional exact immutable ListingSource slug filter.
    schema:
      type: string
    example: antiques-and-more-550e8400-e29b-41d4-a716-446655440000
  - name: operatorPartyId
    in: query
    required: false
    description: Optional exact operator Party ID filter.
    schema:
      type: string
    example: pty_11bczr8va9ek4abckdkrqda538
  - name: ingestionMethod
    in: query
    required: false
    description: Optional exact active ingestion-method filter.
    schema:
      $ref: "#/components/schemas/ListingIngestionMethodData"
    example: PARTNER_API
  - name: sort
    in: query
    required: false
    description: Sort field. Valid values are `name`, `slug`, `created`, and
      `updated`. The default is `name` ascending.
    schema:
      $ref: "#/components/schemas/SortListingSourceFieldData"
    example: name
  - name: order
    in: query
    required: false
    description: Sort direction for `sort`. Provide both `sort` and `order` to
      override the default.
    schema:
      type: string
      enum:
        - asc
        - desc
    example: asc
  - name: searchAfter
    in: query
    required: false
    description: Opaque ListingSource ID cursor returned by the previous page. It is
      omitted when no next page exists.
    schema:
      type: string
    example: ls_01jw7j4azge008000000000003
  - name: size
    in: query
    required: false
    description: Number of ListingSource summaries requested per page. The server
      clamps values to the inclusive range 1–100.
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 21
    example: 21
responses:
  "200":
    description: ListingSource summaries returned successfully.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator read.
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header.
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ListingSourceSearchCollectionData"
        example:
          items:
            - listingSourceId: ls_6rd827eqfefsva9teecmwa3ate
              listingSourceSlugId: antiques-and-more-550e8400-e29b-41d4-a716-446655440000
              name: Antiques and More
              operator:
                partyId: pty_11bczr8va9ek4abckdkrqda538
                partySlugId: antiques-operator-550e8400-e29b-41d4-a716-446655440001
                name: Antiques Operator
              ingestionMethods:
                - PARTNER_API
              presentation:
                url: https://antiques.example/
                image: https://antiques.example/logo.png
              referralConfiguration:
                type: PARTNERIZE
                camref: campaign123
              created: 2026-01-01T10:00:00Z
              updated: 2026-01-02T10:00:00Z
          size: 21
          searchAfter: ls_6rd827eqfefsva9teecmwa3ate
  "400":
    description: Bad request - invalid ListingSource search parameters.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_sort:
            summary: Invalid sort field
            value:
              status: 400
              title: Bad Request
              error: BAD_SORT_VALUE
              source:
                field: sort
                type: QUERY
          invalid_object_id:
            summary: Invalid ListingSource ID
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: listingSourceId
                type: QUERY
              detail: Query parameter 'listingSourceId' must be a valid ListingSource ID
          invalid_query:
            summary: Invalid ingestion method, page size, or cursor
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: searchAfter
                type: QUERY
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the ADMIN role.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "500":
    description: Internal authentication or ListingSource search failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: LISTING_SOURCE_INTERNAL_ERROR
  "503":
    description: Authentication, authorization, or ListingSource search data is
      temporarily unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: LISTING_SOURCE_TEMPORARILY_UNAVAILABLE

```

### (new) → adminCreateParty

Target operation:

```yaml
path: /api/v1/admin/parties
method: post
id: adminCreateParty
summary: Create a Party as admin
description: >
  Creates a Party for an authenticated administrator.


  The request accepts only the Party name and optional phone/email contact
  information.

  Party names trim outer Unicode whitespace, reject blank values, and reject
  values over 255

  UTF-8 bytes. The Party slug is generated once from the canonical name and
  stable Party ID;

  it remains immutable if the Party is renamed later.
operationId: adminCreateParty
tags:
  - Party
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  description: Party creation payload.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/CreatePartyData"
      example:
        name: Antiques and More
        phone: +49 30 123456
        email: contact@example.com
responses:
  "201":
    description: Party created successfully.
    headers:
      Location:
        description: URL of the created admin Party detail resource.
        schema:
          type: string
          format: uri
        example: /api/v1/admin/parties/pty_4k4snxc3pkecc9yw66heemzyp0
      Cache-Control:
        description: Responses are never stored because contact data is returned.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/PartyData"
        example:
          partyId: pty_4k4snxc3pkecc9yw66heemzyp0
          partySlugId: antiques-and-more-550e8400-e29b-41d4-a716-446655440000
          name: Antiques and More
          contact:
            phone: +49 30 123456
            email: contact@example.com
          created: 2026-01-01T10:00:00Z
          updated: 2026-01-01T10:00:00Z
  "400":
    description: Bad request - missing, empty, malformed, or invalid Party body.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_name:
            summary: Invalid Party name
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: name must be nonblank and at most 255 UTF-8 bytes.
          invalid_contact_email:
            summary: Invalid Party email
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
  "401":
    description: Unauthorized - missing or invalid bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the ADMIN role.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "409":
    description: Conflict - the generated Party slug conflicts with current state.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 409
          title: Conflict
          error: CONFLICT
          detail: Party conflicts with current state.
  "500":
    description: Internal authentication or Party persistence failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PARTY_INTERNAL_ERROR
  "503":
    description: Authentication, authorization, or Party persistence is temporarily
      unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PARTY_TEMPORARILY_UNAVAILABLE

```

### (new) → adminSearchParties

Target operation:

```yaml
path: /api/v1/admin/parties
method: get
id: adminSearchParties
summary: Search parties as admin
description: >
  Searches Party records for authenticated administrators.


  `query` performs a case-insensitive substring search across Party name, phone,
  and email.

  `name`, `phone`, and `email` restrict the substring match to one contact/name
  field.

  `created` and `updated` accept inclusive RFC3339 ranges using `min` and `max`
  query members.


  Results use deterministic cursor pagination. The default sort is `name`
  ascending;

  override it by providing both `sort` and `order`. Valid sort fields are
  `name`, `email`,

  `phone`, `created`, and `updated`; Party ID is always the final deterministic
  tie-breaker.

  Page sizes are clamped to 1–100, with a default of 21. The returned
  ListingSource ID `searchAfter`

  cursor is omitted on the terminal page and should be sent with the same
  filters and sort.

  Responses always use `Cache-Control: no-store` because contact data is
  returned.
operationId: adminSearchParties
tags:
  - Party
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: query
    in: query
    required: false
    description: Optional case-insensitive substring query across Party name, phone,
      and email.
    schema:
      type: string
    example: antiques
  - name: name
    in: query
    required: false
    description: Optional case-insensitive substring filter for the Party name.
    schema:
      type: string
    example: antiques
  - name: phone
    in: query
    required: false
    description: Optional case-insensitive substring filter for the Party phone number.
    schema:
      type: string
    example: +49 30
  - name: email
    in: query
    required: false
    description: Optional case-insensitive substring filter for the Party email address.
    schema:
      type: string
    example: contact@example.com
  - name: created[min]
    in: query
    required: false
    description: Optional inclusive lower bound for the Party creation timestamp (RFC3339).
    schema:
      type: string
      format: date-time
    example: 2026-01-01T00:00:00Z
  - name: created[max]
    in: query
    required: false
    description: Optional inclusive upper bound for the Party creation timestamp (RFC3339).
    schema:
      type: string
      format: date-time
    example: 2026-12-31T23:59:59Z
  - name: updated[min]
    in: query
    required: false
    description: Optional inclusive lower bound for the Party update timestamp (RFC3339).
    schema:
      type: string
      format: date-time
    example: 2026-01-01T00:00:00Z
  - name: updated[max]
    in: query
    required: false
    description: Optional inclusive upper bound for the Party update timestamp (RFC3339).
    schema:
      type: string
      format: date-time
    example: 2026-12-31T23:59:59Z
  - name: sort
    in: query
    required: false
    description: Sort field. Valid values are `name`, `email`, `phone`, `created`,
      and `updated`. The default is `name` ascending.
    schema:
      $ref: "#/components/schemas/SortPartyFieldData"
    example: name
  - name: order
    in: query
    required: false
    description: Sort direction for `sort`. Provide both `sort` and `order` to
      override the default.
    schema:
      type: string
      enum:
        - asc
        - desc
    example: asc
  - name: searchAfter
    in: query
    required: false
    description: Opaque Party ID cursor returned by the previous page. It is omitted
      when no next page exists.
    schema:
      type: string
    example: pty_01jw7j4azge008000000000002
  - name: size
    in: query
    required: false
    description: Number of Party summaries requested per page. The server clamps
      values to the inclusive range 1–100.
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 21
    example: 21
responses:
  "200":
    description: Party summaries returned successfully.
    headers:
      Cache-Control:
        description: Responses are never stored because this administrator read contains
          contact data.
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/PartyCollectionData"
        example:
          items:
            - partyId: pty_4k4snxc3pkecc9yw66heemzyp0
              partySlugId: antiques-and-more-550e8400-e29b-41d4-a716-446655440000
              name: Antiques and More
              contact:
                phone: +49 30 123456
                email: contact@example.com
              created: 2026-01-01T10:00:00Z
              updated: 2026-01-02T10:00:00Z
          size: 21
          searchAfter: pty_4k4snxc3pkecc9yw66heemzyp0
  "400":
    description: Bad request - invalid query parameters.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_sort_field:
            summary: Invalid sort field
            value:
              status: 400
              title: Bad Request
              error: BAD_SORT_VALUE
              source:
                field: sort
                type: QUERY
          invalid_order:
            summary: Invalid sort order
            value:
              status: 400
              title: Bad Request
              error: BAD_ORDER_VALUE
              source:
                field: order
                type: QUERY
          invalid_search_after:
            summary: Invalid searchAfter cursor
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: searchAfter
                type: QUERY
              detail: searchAfter must contain a valid Party ID.
          invalid_size:
            summary: Invalid page size
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: size
                type: QUERY
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the ADMIN role.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "500":
    description: Internal authentication or Party search failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PARTY_INTERNAL_ERROR
  "503":
    description: Authentication, authorization, or Party search data is temporarily
      unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PARTY_TEMPORARILY_UNAVAILABLE

```

### (new) → adminDeleteParty

Target operation:

```yaml
path: /api/v1/admin/parties/{partyId}
method: delete
id: adminDeleteParty
summary: Hard-delete an unused Party as admin
description: >
  Deletes only an unused Party after commit. A Party with any ListingSource or
  retained

  Partnership, including `DISSOLVED`, returns `409 CONFLICT`; no dependent
  business or

  historical row is cascaded, detached, rewritten, or archived. Responses use

  `Cache-Control: no-store` and this operation accepts no request body.
operationId: adminDeleteParty
tags:
  - Party
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: partyId
    in: path
    required: true
    description: Stable Party identifier.
    schema:
      type: string
    example: pty_4k4snxc3pkecc9yw66heemzyp0
responses:
  "204":
    description: Party deleted successfully.
    headers:
      Cache-Control:
        description: Response is never stored.
        schema:
          type: string
        example: no-store
  "400":
    description: Invalid Party ID.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Missing or invalid bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Administrator authority is required.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: Party was not found, including after a successful prior delete.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "409":
    description: Party has a ListingSource or retained Partnership, or changed concurrently.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Party persistence failed internally.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Party persistence is temporarily unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### (new) → adminUpdateParty

Target operation:

```yaml
path: /api/v1/admin/parties/{partyId}
method: patch
id: adminUpdateParty
summary: Update a Party as admin
description: >
  Updates the name and/or contact information for a Party for an authenticated
  administrator.


  Only `name`, `phone`, and `email` are supported. Omitted members remain
  unchanged;

  `null` clears `phone` or `email`; `name` is not nullable and `name: null` is
  rejected.

  Party names trim outer Unicode whitespace, reject blank values, and reject
  values over 255

  UTF-8 bytes. Renaming a Party never changes its immutable slug.


  The response is the resulting Party representation and uses `Cache-Control:
  no-store`

  because contact data is returned. An empty object is a valid no-op PATCH; an
  empty HTTP

  body is invalid.
operationId: adminUpdateParty
tags:
  - Party
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: partyId
    in: path
    required: true
    description: Stable Party identifier.
    schema:
      type: string
    example: pty_4k4snxc3pkecc9yw66heemzyp0
requestBody:
  required: true
  description: Party name/contact patch. Omit unchanged members; null clears
    phone/email only.
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/UpdatePartyData"
      examples:
        rename:
          summary: Rename without changing the Party slug
          value:
            name: Antiques and More
        set_contact:
          summary: Set optional contact values
          value:
            phone: +49 30 123456
            email: contact@example.com
        clear_contact:
          summary: Clear optional contact values
          value:
            phone: null
            email: null
        no_op_patch:
          summary: Leave the Party unchanged
          value: {}
responses:
  "200":
    description: Party updated successfully.
    headers:
      Cache-Control:
        description: Responses are never stored because contact data is returned.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/PartyData"
        example:
          partyId: pty_4k4snxc3pkecc9yw66heemzyp0
          partySlugId: antiques-and-more-550e8400-e29b-41d4-a716-446655440000
          name: Antiques and More
          contact:
            phone: +49 30 123456
            email: contact@example.com
          created: 2026-01-01T10:00:00Z
          updated: 2026-01-02T10:00:00Z
  "400":
    description: Bad request - invalid Party ID, empty/malformed body, or invalid
      Party value.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_party_id:
            summary: Invalid Party ID
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: partyId
                type: PATH
              detail: must be a valid Party ID
          invalid_name:
            summary: Invalid Party name
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: name must be nonblank and at most 255 UTF-8 bytes.
          invalid_email:
            summary: Invalid Party email
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
          nullable_name:
            summary: Required Party name cannot be cleared
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Body field 'name' must not be null.
  "401":
    description: Unauthorized - missing or invalid bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the ADMIN role.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: Party was not found.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: PARTY_NOT_FOUND
          detail: Party was not found.
  "409":
    description: Conflict - the Party was changed concurrently.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 409
          title: Conflict
          error: CONFLICT
          detail: Party conflicts with current state.
  "500":
    description: Internal authentication or Party persistence failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PARTY_INTERNAL_ERROR
  "503":
    description: Authentication, authorization, or Party persistence is temporarily
      unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PARTY_TEMPORARILY_UNAVAILABLE

```

### (new) → adminGetParty

Target operation:

```yaml
path: /api/v1/admin/parties/{partyId}
method: get
id: adminGetParty
summary: Get a Party as admin
description: >
  Gets one Party for an authenticated administrator.


  `partyId` must be a valid Party ID. The response contains the Party identity,
  immutable slug,

  name, optional phone/email contact information, and creation/update
  timestamps.

  Responses always use `Cache-Control: no-store` because contact data is
  returned.
operationId: adminGetParty
tags:
  - Party
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: partyId
    in: path
    required: true
    description: Stable Party identifier.
    schema:
      type: string
    example: pty_4k4snxc3pkecc9yw66heemzyp0
responses:
  "200":
    description: Party returned successfully.
    headers:
      Cache-Control:
        description: Responses are never stored because contact data is returned.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/PartyData"
        example:
          partyId: pty_4k4snxc3pkecc9yw66heemzyp0
          partySlugId: antiques-and-more-550e8400-e29b-41d4-a716-446655440000
          name: Antiques and More
          contact:
            phone: +49 30 123456
            email: contact@example.com
          created: 2026-01-01T10:00:00Z
          updated: 2026-01-02T10:00:00Z
  "400":
    description: Bad request - invalid Party ID.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 400
          title: Bad Request
          error: INVALID_OBJECT_ID
          source:
            field: partyId
            type: PATH
          detail: must be a valid Party ID
  "401":
    description: Unauthorized - missing or invalid bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the ADMIN role.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: Party was not found.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: PARTY_NOT_FOUND
          detail: Party was not found.
  "500":
    description: Internal authentication or Party persistence failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PARTY_INTERNAL_ERROR
  "503":
    description: Authentication or Party persistence is temporarily unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PARTY_TEMPORARILY_UNAVAILABLE

```

### (new) → adminSuspendUser

Target operation:

```yaml
path: /api/v1/admin/users/{userId}/suspension
method: put
id: adminSuspendUser
summary: Suspend a user as admin
description: >
  Suspends the explicit target user with an administrator-supplied reason.


  Cognito JWTs and Aura Historia access tokens are accepted. The caller's
  persisted user role

  must be `ADMIN`; delegated Aura Historia access tokens must also have
  `users:write`.

  Authorization is enforced in the User service, not only at the HTTP route.


  `userId` must be a valid User ID. `reason` is required, must not be empty or
  whitespace-only, and

  is limited to 1,000 bytes. It is emitted to structured operational logs, so it
  must not

  contain tokens, passwords, credentials, or other secrets. Common credential
  markers are

  rejected.

  Suspension is idempotent: a repeated request returns the target's suspended
  state. The final

  active administrator cannot be suspended. Once committed, a suspended user is
  rejected as

  `401 INVALID_CREDENTIALS` by all later Cognito JWT and Aura access-token
  authentication.

  Every response sends `Cache-Control: no-store`.
operationId: adminSuspendUser
tags:
  - User Account
parameters:
  - name: userId
    in: path
    required: true
    description: Unique User ID for the user to suspend.
    schema:
      type: string
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/SuspendUserData"
      example:
        reason: Repeated policy violations
responses:
  "200":
    description: User is suspended, including after an idempotent repeat.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only
          user mutation.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/SuspendUserResponseData"
        example:
          userId: usr_5pvhvpxyhve6ts31n9x8c2y513
          suspended: true
  "400":
    description: Invalid target User ID or missing, empty, oversized, or
      secret-bearing suspension reason.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_user_id:
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: userId
                type: PATH
              detail: must be a valid User ID
          missing_reason:
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Suspension reason is required.
          invalid_reason:
            value:
              status: 400
              title: Bad Request
              error: BAD_BODY_VALUE
              detail: Suspension reason is invalid.
  "401":
    description: Invalid or missing bearer credentials, including a credential for a
      suspended user.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: The caller is not an administrator or a delegated credential lacks
      users:write.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: Target user was not found.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
  "409":
    description: The target is the final active administrator.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 409
          title: Conflict
          error: CONFLICT
          detail: At least one active administrator must remain.
  "500":
    description: Internal authentication or user persistence failure.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          authentication:
            value:
              status: 500
              title: Internal Server Error
              error: AUTH_INTERNAL_ERROR
          suspension:
            value:
              status: 500
              title: Internal Server Error
              error: USER_INTERNAL_ERROR
  "503":
    description: Authentication, authorization, or user persistence is temporarily
      unavailable.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          authentication:
            value:
              status: 503
              title: Service Unavailable
              error: AUTH_TEMPORARILY_UNAVAILABLE
          suspension:
            value:
              status: 503
              title: Service Unavailable
              error: USER_TEMPORARILY_UNAVAILABLE

```

### (new) → adminUnsuspendUser

Target operation:

```yaml
path: /api/v1/admin/users/{userId}/suspension
method: delete
id: adminUnsuspendUser
summary: Reactivate a user as admin
description: >
  Removes the durable suspension state for the explicit target user. No request
  body is accepted.


  Cognito JWTs and Aura Historia access tokens are accepted. The caller's
  persisted user role

  must be `ADMIN`; delegated Aura Historia access tokens must also have
  `users:write`.

  Authorization is enforced in the User service, not only at the HTTP route.


  `userId` must be a valid User ID and the target user must exist. Reactivation
  is idempotent: a

  repeated request for an active user returns its active state without another
  write. The

  operation changes only suspension state; it preserves the user's profile,
  tier, role,

  credentials, and partnership relationships. Once committed, valid existing
  credentials can

  authenticate normally again. Every response sends `Cache-Control: no-store`.
operationId: adminUnsuspendUser
tags:
  - User Account
parameters:
  - name: userId
    in: path
    required: true
    description: Unique User ID for the user to reactivate.
    schema:
      type: string
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "200":
    description: User is active, including after an idempotent repeat.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only
          user mutation.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/UnsuspendUserResponseData"
        example:
          userId: usr_5pvhvpxyhve6ts31n9x8c2y513
          suspended: false
  "400":
    description: Invalid target User ID or a nonempty request body.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 400
          title: Bad Request
          error: INVALID_OBJECT_ID
          source:
            field: userId
            type: PATH
          detail: must be a valid User ID
  "401":
    description: Invalid or missing bearer credentials, including a credential for a
      suspended user.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: The caller is not an administrator or a delegated credential lacks
      users:write.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: Target user was not found.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
  "409":
    description: User reactivation conflicts with concurrent state.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 409
          title: Conflict
          error: CONFLICT
  "500":
    description: Internal authentication or user persistence failure.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: USER_INTERNAL_ERROR
  "503":
    description: Authentication, authorization, or user persistence is temporarily
      unavailable.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: USER_TEMPORARILY_UNAVAILABLE

```

### (new) → adminRevokeUserSessions

Target operation:

```yaml
path: /api/v1/admin/users/{userId}/sessions/revoke
method: post
id: adminRevokeUserSessions
summary: Revoke a user's Cognito sessions as admin
description: >
  Invalidates the explicit target user's Cognito sessions with Cognito global
  sign-out. No request body is accepted.


  Cognito JWTs and Aura Historia access tokens are accepted. The caller's
  persisted user role

  must be `ADMIN`; delegated Aura Historia access tokens must also have
  `users:write`.

  Authorization and the target-user check are enforced in the User service, not
  only at the

  HTTP route. The PostgreSQL authorization check completes before the external
  Cognito call.


  `userId` must be a valid User ID and the target user must exist. Cognito
  global sign-out is safe to

  retry: it succeeds when there are no active sessions. The operation does not
  change the

  Aura user's profile, tier, role, suspension state, Aura access tokens, or
  partnerships.

  Every response sends `Cache-Control: no-store`.
operationId: adminRevokeUserSessions
tags:
  - User Account
parameters:
  - name: userId
    in: path
    required: true
    description: Unique User ID for the user whose Cognito sessions are revoked.
    schema:
      type: string
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "204":
    description: Cognito sessions were invalidated, including after a retry with no
      active sessions.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only
          security operation.
        schema:
          type: string
        example: no-store
  "400":
    description: Invalid target User ID.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 400
          title: Bad Request
          error: INVALID_OBJECT_ID
          source:
            field: userId
            type: PATH
          detail: must be a valid User ID
  "401":
    description: Invalid or missing bearer credentials.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: The caller is not an administrator or a delegated credential lacks
      users:write.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: The target user or corresponding Cognito identity was not found.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
  "500":
    description: Internal user-session revocation failure.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: USER_INTERNAL_ERROR
  "503":
    description: User authorization, persistence, or Cognito is temporarily unavailable.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: USER_TEMPORARILY_UNAVAILABLE

```

### (new) → adminListUserAccessTokens

Target operation:

```yaml
path: /api/v1/admin/users/{userId}/access-tokens
method: get
id: adminListUserAccessTokens
summary: List a user's Aura Historia access-token metadata as admin
description: >
  Lists non-secret Aura Historia access-token metadata for the explicit target
  user.


  Cognito JWTs and Aura Historia access tokens are accepted. The caller's
  persisted user role

  must be `ADMIN`; delegated Aura Historia access tokens must also have
  `access-tokens:read`.

  Authorization is enforced in the User service, not only at the HTTP route.


  `userId` must be a valid User ID and the target user must exist. Expired and
  current tokens are included.

  Results use bounded keyset pagination in fixed `created ASC, AccessToken ID
  ASC` order.

  Page sizes are clamped to 1–100, with a default of 21. `searchAfter` is a
  JSON-encoded

  `[created RFC3339 timestamp, AccessToken ID]` cursor and is omitted on the
  terminal page.

  The cursor's creation timestamp is used only for continuation and is not
  returned as item metadata.

  Raw token values, token hashes, and masked token values are never returned.
operationId: adminListUserAccessTokens
tags:
  - User Account
parameters:
  - name: userId
    in: path
    required: true
    description: Unique User ID for the user whose token metadata is listed.
    schema:
      type: string
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
  - name: size
    in: query
    required: false
    description: Requested page size. The server clamps it to 1–100; the default is 21.
    schema:
      type: integer
      format: int64
      minimum: 1
      maximum: 100
    example: 21
  - name: searchAfter
    in: query
    required: false
    description: JSON-encoded `[created RFC3339 timestamp, AccessToken ID]` cursor
      from the previous page.
    schema:
      type: string
    example: '["2026-09-04T12:00:00Z","at_4ck23tcv0meqqrbyjaka24ra6g"]'
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "200":
    description: Secret-free access-token metadata for the target user.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only
          credential read.
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/AdminAccessTokenCollectionData"
        example:
          items:
            - userId: usr_5pvhvpxyhve6ts31n9x8c2y513
              accessTokenId: at_4ck23tcv0meqqrbyjaka24ra6g
              name: Incident review token
              scopes:
                - users:read
              origin: User
              expires: 2026-09-30T00:00:00Z
          size: 21
          searchAfter:
            - 2026-09-04T12:00:00Z
            - at_4ck23tcv0meqqrbyjaka24ra6g
  "400":
    description: Bad request - invalid target User ID, page size, or search-after cursor.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_user_id:
            summary: Invalid target user identifier
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: userId
                type: PATH
              detail: must be a valid User ID
          invalid_query:
            summary: Invalid page query
            value:
              status: 400
              title: Bad Request
              error: BAD_QUERY_PARAMETER_VALUE
              source:
                field: searchAfter
                type: QUERY
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - the caller is not an administrator or a delegated
      credential lacks access-tokens:read.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: The target user does not exist.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
          detail: User was not found.
  "500":
    description: Internal access-token operation failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: ACCESS_TOKEN_INTERNAL_ERROR
  "503":
    description: Access-token authorization or persistence is temporarily unavailable.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: ACCESS_TOKEN_TEMPORARILY_UNAVAILABLE

```

### (new) → adminDeleteUserAccessTokens

Target operation:

```yaml
path: /api/v1/admin/users/{userId}/access-tokens
method: delete
id: adminDeleteUserAccessTokens
summary: Revoke all of a user's Aura Historia access tokens as admin
description: >
  Revokes all Aura Historia access tokens owned by the target user in one atomic
  PostgreSQL transaction.


  Cognito JWTs and Aura Historia access tokens are accepted. The caller's
  persisted user role

  must be `ADMIN`; delegated Aura Historia access tokens must also have
  `access-tokens:write`.

  Authorization is enforced in the User service, not only at the HTTP route.


  `userId` must be a valid User ID and the target user must exist. An existing
  user with no tokens and

  a repeated request both return `204 No Content`; a missing target user returns
  `404 USER_NOT_FOUND`.

  Deletion is scoped to the target user, leaves unrelated users' tokens
  untouched, and committed

  deletion makes the revoked credentials fail authentication. It never reveals
  raw token values or hashes.
operationId: adminDeleteUserAccessTokens
tags:
  - User Account
parameters:
  - name: userId
    in: path
    required: true
    description: Unique User ID for the user whose tokens are revoked.
    schema:
      type: string
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "204":
    description: All access tokens revoked, or no tokens were present for the
      existing target user.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only
          credential mutation.
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
  "400":
    description: Bad request - the user ID is invalid.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 400
          title: Bad Request
          error: INVALID_OBJECT_ID
          source:
            field: userId
            type: PATH
          detail: must be a valid User ID
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - the caller is not an administrator or a delegated
      credential lacks access-tokens:write.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: The target user does not exist.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: USER_NOT_FOUND
          detail: User was not found.
  "500":
    description: Internal access-token operation failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: ACCESS_TOKEN_INTERNAL_ERROR
  "503":
    description: Access-token authorization or persistence is temporarily unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: ACCESS_TOKEN_TEMPORARILY_UNAVAILABLE

```

### (new) → adminDeleteUserAccessToken

Target operation:

```yaml
path: /api/v1/admin/users/{userId}/access-tokens/{accessTokenId}
method: delete
id: adminDeleteUserAccessToken
summary: Revoke a user's Aura Historia access token as admin
description: >
  Revokes one Aura Historia access token for the target user.


  Cognito JWTs and Aura Historia access tokens are accepted. The caller's
  persisted user role

  must be `ADMIN`; delegated Aura Historia access tokens must also have
  `access-tokens:write`.

  Authorization is enforced in the User service, not only at the HTTP route.


  Both `userId` and `accessTokenId` must be valid User and AccessToken IDs,
  respectively. The database deletion is scoped by both

  identifiers, so an access-token ID belonging to another user cannot revoke
  that user's

  credential. The operation is idempotent: it returns `204 No Content` when the
  token was

  deleted, was already absent, or belongs to another user. It never reveals raw
  token values

  or hashes.
operationId: adminDeleteUserAccessToken
tags:
  - User Account
parameters:
  - name: userId
    in: path
    required: true
    description: Unique User ID for the user whose token is revoked.
    schema:
      type: string
    example: usr_5pvhvpxyhve6ts31n9x8c2y513
  - name: accessTokenId
    in: path
    required: true
    description: Unique AccessToken ID for the access token to revoke.
    schema:
      type: string
    example: at_4ck23tcv0meqqrbyjaka24ra6g
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "204":
    description: Access token revoked, or already absent for the target user.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only
          credential mutation.
        schema:
          type: string
        example: no-store
      Access-Control-Allow-Origin:
        description: CORS header
        schema:
          type: string
        example: "*"
  "400":
    description: Bad request - the user ID or access-token ID is invalid.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalid_user_id:
            summary: Invalid target user identifier
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: userId
                type: PATH
              detail: must be a valid User ID
          invalid_access_token_id:
            summary: Invalid access-token identifier
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: accessTokenId
                type: PATH
              detail: must be a valid AccessToken ID
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - the caller is not an administrator or a delegated
      credential lacks access-tokens:write.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "500":
    description: Internal access-token operation failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: ACCESS_TOKEN_INTERNAL_ERROR
  "503":
    description: Access-token authorization or persistence is temporarily unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: ACCESS_TOKEN_TEMPORARILY_UNAVAILABLE

```

### (new) → updateNotificationsSeen

Target operation:

```yaml
path: /api/v1/me/notifications
method: patch
id: updateNotificationsSeen
summary: Update selected notification seen states
description: Updates the seen state for the explicit canonical notification IDs
  in the request body.
operationId: updateNotificationsSeen
tags:
  - Notifications
security:
  - BearerAuth: []
  - AccessTokenAuth: []
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/UpdateNotificationsSeenData"
responses:
  "204":
    description: Selected notifications updated.
  "400":
    description: Bad request
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Invalid or missing bearer credential
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Notifications are temporarily unavailable
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### (new) → adminDeleteListingSource

Target operation:

```yaml
path: /api/v1/admin/listing-sources/{listingSourceId}
method: delete
id: adminDeleteListingSource
summary: Delete an unused ListingSource as admin
description: >
  Physically removes a ListingSource only when it has no ProductListings,
  raw-ingestion

  streams, approved PartnershipApplication reference, or retained
  existing-source proposal.

  The committed transaction explicitly removes its Partnership grants and owned
  ingestion

  configuration, including provider/webhook secrets. Enabled `WEB_CRAWL` is not
  a blocker:

  every new spider or scraper pass refreshes authoritative ListingSource scope
  before candidate

  selection, and a failed refresh skips that pass. Already-running work can race
  with deletion;

  the business raw-capture fence discards that missing-source result without
  recreating state.

  This operation does not retire or purge a used source. A repeated delete
  returns `404`.
operationId: adminDeleteListingSource
tags:
  - ListingSources
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: listingSourceId
    in: path
    required: true
    schema:
      type: string
responses:
  "204":
    description: ListingSource removed. The response body is empty.
    headers:
      Cache-Control:
        schema:
          type: string
        example: no-store
  "400":
    description: Invalid ListingSource ID (`INVALID_OBJECT_ID`).
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "401":
    description: Missing or invalid bearer credentials.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "403":
    description: Administrator authority is required (`FORBIDDEN`).
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "404":
    description: ListingSource was not found (`LISTING_SOURCE_NOT_FOUND`).
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "409":
    description: A protected dependency or concurrent mutation blocks deletion (`CONFLICT`).
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "500":
    description: Invalid persisted state or internal deletion failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
  "503":
    description: Temporary authorization or persistence failure.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"

```

### (new) → getAdminOverview

Target operation:

```yaml
path: /api/v1/admin/overview
method: get
id: getAdminOverview
summary: Get the administrator operational overview
description: >
  Returns a bounded landing-page summary for authenticated administrators.
  `schemaVersion` is

  required so clients can select a compatible response decoder. Every counter is
  read from

  authoritative PostgreSQL by one aggregate statement; OpenSearch and other
  rebuildable

  projections are not used.


  `listingSources.methodAssignments` counts source-method assignments, not
  distinct sources,

  so its values may sum to more than `listingSources.total`. ProductListing
  availability

  counts include only `ACTIVE` listings; `activeWithoutAvailability` identifies
  active rows

  without a current source availability assertion. Responses contain no PII,
  secrets, or

  embedded collections and always use `Cache-Control: no-store`.
operationId: getAdminOverview
tags:
  - Administration
security:
  - BearerAuth: []
  - AccessTokenAuth: []
responses:
  "200":
    description: Authoritative operational counters returned successfully.
    headers:
      Cache-Control:
        description: Administrator overview responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/AdminOverviewData"
  "401":
    description: Missing or invalid bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: The caller does not have the persisted ADMIN role.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "500":
    description: An invalid authoritative read model or internal overview failure occurred.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: ADMIN_OVERVIEW_INTERNAL_ERROR
  "503":
    description: PostgreSQL or persisted administrator authorization is temporarily
      unavailable.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: ADMIN_OVERVIEW_TEMPORARILY_UNAVAILABLE

```

### (new) → adminSearchPartnerships

Target operation:

```yaml
path: /api/v1/admin/partnerships
method: get
id: adminSearchPartnerships
summary: List Partnerships for administration
description: >
  Lists active Partnerships for authenticated administrators.


  Results use bounded keyset cursor pagination in fixed `created` descending,
  then

  Partnership ID descending order. Page sizes are clamped to 1–100, with a
  default

  of 21. The returned `searchAfter` value is a JSON-encoded

  `[created RFC3339 timestamp, Partnership ID]` cursor; it is omitted on the
  terminal

  page and should be sent with the same filters for the next page.


  Optional `partyId`, `memberUserId`, and `listingSourceId` filters are exact
  object-ID

  matches and are combined when supplied. Each result is a safe summary
  containing

  the Partnership ID, Party ID/immutable slug/name, member count,
  ListingSource-grant

  count, and creation/update timestamps. Member identities, grant identities,
  Party

  contact data, persistence versions, provider credentials, webhook secrets, and

  crawler-local configuration are never returned. Responses always use

  `Cache-Control: no-store`.
operationId: adminSearchPartnerships
tags:
  - Partnerships
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: partyId
    in: query
    required: false
    description: Optional exact Party ID filter.
    schema:
      type: string
    example: pty_4k4snxc3pkecc9yw66heemzyp0
  - name: memberUserId
    in: query
    required: false
    description: Optional exact member User ID filter.
    schema:
      type: string
    example: usr_5kgk59yyskf6fb0gyc9fxn5gwk
  - name: listingSourceId
    in: query
    required: false
    description: Optional exact ListingSource grant ID filter.
    schema:
      type: string
    example: ls_0geqhfpd80f6ga8zv98d2vcd1v
  - name: searchAfter
    in: query
    required: false
    description: JSON-encoded `[created RFC3339 timestamp, Partnership ID]` cursor
      returned by the previous page.
    schema:
      type: string
    example: '["2026-09-04T12:00:00Z","psh_3q65ndcw7wfxqswjtrv1kfhwd1"]'
  - name: size
    in: query
    required: false
    description: Number of Partnership summaries requested per page. The server
      clamps values to 1–100.
    schema:
      type: integer
      format: int64
      minimum: 1
      maximum: 100
      default: 21
    example: 21
responses:
  "200":
    description: Partnership summaries returned successfully.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only read.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/AdminPartnershipCollectionData"
        example:
          items:
            - partnershipId: psh_3q65ndcw7wfxqswjtrv1kfhwd1
              party:
                partyId: pty_4k4snxc3pkecc9yw66heemzyp0
                partySlugId: safe-party
                name: Safe Party
              memberCount: 2
              listingSourceGrantCount: 3
              created: 2026-09-04T12:00:00Z
              updated: 2026-09-04T13:00:00Z
          size: 21
          searchAfter:
            - 2026-09-04T12:00:00Z
            - psh_3q65ndcw7wfxqswjtrv1kfhwd1
  "400":
    description: Bad request - invalid Partnership query parameter.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 400
          title: Bad Request
          error: BAD_QUERY_PARAMETER_VALUE
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "500":
    description: Internal authentication or Partnership search failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PARTNERSHIP_INTERNAL_ERROR
  "503":
    description: Authentication, admin authorization, or Partnership search is
      temporarily unavailable.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PARTNERSHIP_TEMPORARILY_UNAVAILABLE

```

### (new) → adminGetPartnership

Target operation:

```yaml
path: /api/v1/admin/partnerships/{partnershipId}
method: get
id: adminGetPartnership
summary: Get a Partnership for administration
description: >
  Returns one established Partnership for an authenticated administrator.


  The response includes the Partnership identity, its Party reference, current
  member user

  references, and current ListingSource grant references. Member and grant
  references are

  ordered by ID and each array is bounded to at most 100 entries. `memberCount`
  and

  `listingSourceGrantCount` are complete counts, including references beyond the
  bounded arrays.


  Missing Partnerships return `PARTNERSHIP_NOT_FOUND`. All success and error
  responses use

  `Cache-Control: no-store` because member user identifiers are returned.
operationId: adminGetPartnership
tags:
  - Partnerships
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: partnershipId
    in: path
    required: true
    description: Stable Partnership ID.
    schema:
      type: string
    example: psh_3q65ndcw7wfxqswjtrv1kfhwd1
responses:
  "200":
    description: Partnership details returned successfully.
    headers:
      Cache-Control:
        description: Responses are never stored because member user identifiers are
          returned.
        schema:
          type: string
        example: no-store
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/AdminPartnershipDetailsData"
        example:
          partnershipId: psh_3q65ndcw7wfxqswjtrv1kfhwd1
          party:
            partyId: pty_4k4snxc3pkecc9yw66heemzyp0
            partySlugId: safe-party
            name: Safe Party
          memberUserIds:
            - usr_5kgk59yyskf6fb0gyc9fxn5gwk
            - usr_7hqr3y7dfze74sfm30pg9t3nvp
          listingSourceIds:
            - ls_1jy6kc0gpnecws80wddqee2rtq
            - ls_25b9fry680eh9txe84nex6vk2a
          memberCount: 2
          listingSourceGrantCount: 2
          created: 2026-09-04T12:00:00Z
          updated: 2026-09-04T13:00:00Z
  "400":
    description: Bad request - invalid Partnership ID.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 400
          title: Bad Request
          error: INVALID_OBJECT_ID
          source:
            field: partnershipId
            type: PATH
          detail: must be a valid Partnership ID
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
  "404":
    description: Partnership not found.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: PARTNERSHIP_NOT_FOUND
  "500":
    description: Internal authentication or Partnership detail failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PARTNERSHIP_INTERNAL_ERROR
  "503":
    description: Authentication, admin authorization, or Partnership detail is
      temporarily unavailable.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PARTNERSHIP_TEMPORARILY_UNAVAILABLE

```

### (new) → adminDissolvePartnership

Target operation:

```yaml
path: /api/v1/admin/partnerships/{partnershipId}
method: delete
id: adminDissolvePartnership
summary: Dissolve a Partnership
description: >
  Semantically deletes a Partnership for an authenticated administrator. The
  Partnership row

  remains as a `DISSOLVED` historical reference for approved
  PartnershipApplications, while

  all current membership and ListingSource-grant rows are removed in the same
  PostgreSQL

  transaction. ListingSources, Parties, users, ProductListings, and applications
  are not

  deleted. Repeating a successful dissolution is an idempotent `204` no-op. No
  user can

  retain Partnership authorization after the transaction commits. All responses
  use

  `Cache-Control: no-store`.
operationId: adminDissolvePartnership
tags:
  - Partnerships
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: partnershipId
    in: path
    required: true
    description: Stable Partnership ID.
    schema:
      type: string
responses:
  "204":
    description: Partnership dissolved, or already dissolved.
    headers:
      Cache-Control:
        description: Responses are never stored.
        schema:
          type: string
        example: no-store
  "400":
    description: Bad request - invalid Partnership ID (`INVALID_OBJECT_ID`).
  "401":
    description: Unauthorized - invalid or missing bearer credentials
      (`INVALID_CREDENTIALS`).
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role (`FORBIDDEN`).
  "404":
    description: Partnership not found.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 404
          title: Not Found
          error: PARTNERSHIP_NOT_FOUND
  "409":
    description: Partnership was changed concurrently.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 409
          title: Conflict
          error: CONFLICT
  "500":
    description: Internal Partnership dissolution failure (`PARTNERSHIP_INTERNAL_ERROR`).
  "503":
    description: Authentication, admin authorization, or Partnership dissolution is
      temporarily unavailable.
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PARTNERSHIP_TEMPORARILY_UNAVAILABLE

```

### (new) → adminGrantPartnershipListingSource

Target operation:

```yaml
path: /api/v1/admin/partnerships/{partnershipId}/listing-source-grants/{listingSourceId}
method: put
id: adminGrantPartnershipListingSource
summary: Grant a ListingSource to a Partnership
description: >
  Idempotently grants an existing ListingSource to an existing Partnership for
  an

  authenticated administrator. The Partnership and ListingSource must belong to
  the same

  Party; a mismatched Party is rejected with `409 CONFLICT`. An existing grant
  is a

  successful no-op. The operation is committed in one PostgreSQL transaction and
  returns no

  response body. All success and error responses use `Cache-Control: no-store`.
operationId: adminGrantPartnershipListingSource
tags:
  - Partnerships
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: partnershipId
    in: path
    required: true
    description: Stable Partnership ID.
    schema:
      type: string
    example: psh_3q65ndcw7wfxqswjtrv1kfhwd1
  - name: listingSourceId
    in: path
    required: true
    description: Existing ListingSource ID to grant to the Partnership.
    schema:
      type: string
    example: ls_1jy6kc0gpnecws80wddqee2rtq
responses:
  "204":
    description: ListingSource grant created, or ListingSource grant already existed.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only
          mutation.
        schema:
          type: string
        example: no-store
  "400":
    description: Bad request - invalid Partnership or ListingSource ID.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalidPartnershipId:
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: partnershipId
                type: PATH
              detail: must be a valid Partnership ID
          invalidListingSourceId:
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: listingSourceId
                type: PATH
              detail: must be a valid ListingSource ID
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: Partnership or ListingSource not found.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          partnershipNotFound:
            value:
              status: 404
              title: Not Found
              error: PARTNERSHIP_NOT_FOUND
              detail: Partnership was not found.
          listingSourceNotFound:
            value:
              status: 404
              title: Not Found
              error: LISTING_SOURCE_NOT_FOUND
              detail: Listing source was not found.
  "409":
    description: Partnership and ListingSource belong to different Parties.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 409
          title: Conflict
          error: CONFLICT
          detail: Partnership and ListingSource belong to different Parties.
  "500":
    description: Internal Partnership ListingSource grant failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PARTNERSHIP_INTERNAL_ERROR
  "503":
    description: Authentication, admin authorization, transaction, or Partnership
      ListingSource grant persistence is temporarily unavailable.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PARTNERSHIP_TEMPORARILY_UNAVAILABLE

```

### (new) → adminRevokePartnershipListingSource

Target operation:

```yaml
path: /api/v1/admin/partnerships/{partnershipId}/listing-source-grants/{listingSourceId}
method: delete
id: adminRevokePartnershipListingSource
summary: Revoke a ListingSource from a Partnership
description: >
  Idempotently removes an existing ListingSource grant from an existing
  Partnership for an

  authenticated administrator. Only the targeted Partnership/ListingSource join
  row is

  removed; the Partnership, ListingSource, members, and historical
  PartnershipApplications

  are preserved. An absent grant is a successful no-op. The operation is
  committed in one

  PostgreSQL transaction and returns no response body. All success and error
  responses use

  `Cache-Control: no-store`.
operationId: adminRevokePartnershipListingSource
tags:
  - Partnerships
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: partnershipId
    in: path
    required: true
    description: Stable Partnership ID.
    schema:
      type: string
    example: psh_3q65ndcw7wfxqswjtrv1kfhwd1
  - name: listingSourceId
    in: path
    required: true
    description: Existing ListingSource ID whose Partnership grant should be revoked.
    schema:
      type: string
    example: ls_1jy6kc0gpnecws80wddqee2rtq
responses:
  "204":
    description: ListingSource grant removed, or ListingSource grant was already absent.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only
          mutation.
        schema:
          type: string
        example: no-store
  "400":
    description: Bad request - invalid Partnership or ListingSource ID.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalidPartnershipId:
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: partnershipId
                type: PATH
              detail: must be a valid Partnership ID
          invalidListingSourceId:
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: listingSourceId
                type: PATH
              detail: must be a valid ListingSource ID
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: Partnership or ListingSource not found.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          partnershipNotFound:
            value:
              status: 404
              title: Not Found
              error: PARTNERSHIP_NOT_FOUND
              detail: Partnership was not found.
          listingSourceNotFound:
            value:
              status: 404
              title: Not Found
              error: LISTING_SOURCE_NOT_FOUND
              detail: Listing source was not found.
  "500":
    description: Internal Partnership ListingSource grant revocation failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PARTNERSHIP_INTERNAL_ERROR
  "503":
    description: Authentication, admin authorization, transaction, or Partnership
      ListingSource grant revocation persistence is temporarily unavailable.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PARTNERSHIP_TEMPORARILY_UNAVAILABLE

```

### (new) → adminGrantPartnershipMembership

Target operation:

```yaml
path: /api/v1/admin/partnerships/{partnershipId}/members/{userId}
method: put
id: adminGrantPartnershipMembership
summary: Grant a user membership in a Partnership
description: >
  Idempotently grants the target user membership in the specified Partnership
  for an

  authenticated administrator. The target user and Partnership must already
  exist. An

  existing membership is a successful no-op. The operation is committed in one
  PostgreSQL

  transaction and returns no response body. All success and error responses use

  `Cache-Control: no-store`.
operationId: adminGrantPartnershipMembership
tags:
  - Partnerships
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: partnershipId
    in: path
    required: true
    description: Stable Partnership ID.
    schema:
      type: string
    example: psh_3q65ndcw7wfxqswjtrv1kfhwd1
  - name: userId
    in: path
    required: true
    description: Existing User ID to add as a Partnership member.
    schema:
      type: string
    example: usr_5kgk59yyskf6fb0gyc9fxn5gwk
responses:
  "204":
    description: Membership granted, or membership already existed.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only
          mutation.
        schema:
          type: string
        example: no-store
  "400":
    description: Bad request - invalid Partnership or User ID.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalidPartnershipId:
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: partnershipId
                type: PATH
              detail: must be a valid Partnership ID
          invalidUserId:
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: userId
                type: PATH
              detail: must be a valid User ID
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: Partnership or target user not found.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          partnershipNotFound:
            value:
              status: 404
              title: Not Found
              error: PARTNERSHIP_NOT_FOUND
              detail: Partnership was not found.
          userNotFound:
            value:
              status: 404
              title: Not Found
              error: USER_NOT_FOUND
              detail: User was not found.
  "500":
    description: Internal Partnership membership failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PARTNERSHIP_INTERNAL_ERROR
  "503":
    description: Authentication, admin authorization, transaction, or Partnership
      membership persistence is temporarily unavailable.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PARTNERSHIP_TEMPORARILY_UNAVAILABLE

```

### (new) → adminRevokePartnershipMembership

Target operation:

```yaml
path: /api/v1/admin/partnerships/{partnershipId}/members/{userId}
method: delete
id: adminRevokePartnershipMembership
summary: Revoke a user membership in a Partnership
description: >
  Idempotently removes the target user membership from the specified Partnership
  for an

  authenticated administrator. The target user and Partnership must already
  exist. A missing

  membership is a successful no-op. Only the membership row is removed; the
  user, Partnership,

  ListingSource, and historical PartnershipApplication records are preserved.
  The operation is

  committed in one PostgreSQL transaction and returns no response body. All
  success and error

  responses use `Cache-Control: no-store`.
operationId: adminRevokePartnershipMembership
tags:
  - Partnerships
security:
  - BearerAuth: []
  - AccessTokenAuth: []
parameters:
  - name: partnershipId
    in: path
    required: true
    description: Stable Partnership ID.
    schema:
      type: string
    example: psh_3q65ndcw7wfxqswjtrv1kfhwd1
  - name: userId
    in: path
    required: true
    description: Existing User ID to remove from the Partnership.
    schema:
      type: string
    example: usr_5kgk59yyskf6fb0gyc9fxn5gwk
responses:
  "204":
    description: Membership removed, or membership was already absent.
    headers:
      Cache-Control:
        description: Responses are never stored because this is an administrator-only
          mutation.
        schema:
          type: string
        example: no-store
  "400":
    description: Bad request - invalid Partnership or User ID.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          invalidPartnershipId:
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: partnershipId
                type: PATH
              detail: must be a valid Partnership ID
          invalidUserId:
            value:
              status: 400
              title: Bad Request
              error: INVALID_OBJECT_ID
              source:
                field: userId
                type: PATH
              detail: must be a valid User ID
  "401":
    description: Unauthorized - invalid or missing bearer credentials.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 401
          title: Unauthorized
          error: INVALID_CREDENTIALS
  "403":
    description: Forbidden - this endpoint requires the `ADMIN` role.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 403
          title: Forbidden
          error: FORBIDDEN
          detail: Operation is not permitted.
  "404":
    description: Partnership or target user not found.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        examples:
          partnershipNotFound:
            value:
              status: 404
              title: Not Found
              error: PARTNERSHIP_NOT_FOUND
              detail: Partnership was not found.
          userNotFound:
            value:
              status: 404
              title: Not Found
              error: USER_NOT_FOUND
              detail: User was not found.
  "500":
    description: Internal Partnership membership failure.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 500
          title: Internal Server Error
          error: PARTNERSHIP_INTERNAL_ERROR
  "503":
    description: Authentication, admin authorization, transaction, or Partnership
      membership persistence is temporarily unavailable.
    headers:
      Cache-Control:
        description: Error responses are never stored.
        schema:
          type: string
        example: no-store
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ApiError"
        example:
          status: 503
          title: Service Unavailable
          error: PARTNERSHIP_TEMPORARILY_UNAVAILABLE

```
