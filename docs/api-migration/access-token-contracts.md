# Own access-token contracts (MIG-11)

Own-token DTOs are mapped in `src/data/internal/access-tokens` before reaching partner UI. Admin token metadata and endpoints have a separate owner (MIG-21) and must not reuse this secret-bearing read DTO.

The October 1 check was superseded by the pinned October 5 [integration contract](integration-release-gate.md). Client regeneration adds the optional ninth scope, `listing-sources:write`, while own-token create/read/patch fields retain their established contracts.

- Create and read use `scope` and `expiresAt`; patch uses `scopes` and `expires`.
- Patch fields are optional. Omission preserves state, `scopes: []` clears permissions, and `expires: null` clears expiry. Null names/scopes are rejected before sending a request.
- Edit submits only changed fields, preserving the original expiry precision and existing grants when renaming.
- IDs, including `at_` IDs, are opaque strings. Deletion succeeds with 204 even when already absent.
- New tokens default to no scopes. This is a fresh deployment with no existing users or tokens: only the supported scope enum is modeled, with no legacy/unknown-grant compatibility or migration. A name-only edit omits scopes; editing scopes replaces the entire grant set.
- Scope descriptions disclose listing deletion, permanent account deletion, Stripe checkout/billing-portal session creation and provider ingestion configuration in all five locales. Create/edit dialogs scroll within the viewport so expiry and submission controls remain reachable with all supported scopes.
- `listing-sources:write` enables/replaces WooCommerce and Shopify ingestion configuration only for sources where the account has partnership write access. It includes supplying/replacing a write-only WooCommerce webhook secret; it does not grant arbitrary source metadata editing. This permission is opt-in; the product integration guide still preselects only `product-listings:write`.
- `ACCESS_TOKEN_SCOPES`, `AccessTokenScope`, and `ACCESS_TOKEN_SCOPE_METADATA` in `AccessTokenScope.ts` provide the shared scope set and localized label/description keys for token and OAuth owners. Each description exists in de/en/es/fr/it; OAuth integration remains owned by MIG-12/MIG-22.
- Only the create result contains plaintext. List/update results retain the API's masked display value. Plaintext is held for the confirmation dialog, never inserted into the token-list cache or logged, and discarded when the dialog closes. Create mutations have zero cache retention after their observer resets/unmounts.

This changes existing API access administration covered by section 5 of the privacy policy in all five locales. It adds no processor, persistent browser storage, analytics, or data purpose.
