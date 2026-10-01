# Account preferences and content visibility

Issue #982 (MIG-10) uses the generated `OwnUserAccountData` contract through `mapToInternalUserAccount`. Names, language, currency, measurement units and Stripe customer identity retain their nullable or absent values. The account has no audit dates or addresses.

`mapToBackendUserAccountPatch` preserves omitted fields and explicit nulls for clearable profile preferences. Content visibility accepts only a boolean; omitted visibility remains unchanged, and null is rejected before an API call. The account form omits unchanged visibility. Registration sends the chosen boolean explicitly.

`showUnassessedOrSensitiveContent` lives in the authenticated account query cache, separately from browser currency/unit preferences and tracking/map consent. Existing restricted-symbol consent is not promoted to this broader preference. Server and first-client rendering continue using deterministic defaults and server-provided preferences.

Listing assessments distinguish `ALLOWED`, `REQUIRES_CONSENT`, and absent/unassessed content. A returned URL alone is not an allowed assessment. Images with redacted or missing URLs remain hidden with either preference. Notification images have no assessment and therefore require the broader visibility preference.

Account updates cancel and reset viewer-scoped listing, watchlist, saved-search and notification queries while retaining the mapped account. Active queries refetch; inactive caches lose old image data. Account deletion cancels queries before clearing the cache and completing sign-out. Authentication transitions use the same viewer-query classifier to remove personalized data.

Billing management continues sending the selected plan and cycle for both checkout and paid-user portal responses. Newsletter subscription continues to accept optional profile preferences and a successful empty 204 response.
